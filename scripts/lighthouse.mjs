/**
 * Lighthouse sobre o BUILD (nunca sobre o dev server — o dev server tem HMR,
 * source maps e CSS não purgado, e o número não significa nada).
 *
 *   node scripts/lighthouse.mjs [--url http://localhost:4321] [--preset mobile|desktop|ambos]
 *                               [--out docs/review] [--rota /]
 *
 * Sem --url: sobe `npm run preview` sozinho e derruba no fim.
 * Saída: JSON completo + resumo com scores, oportunidades e diagnósticos.
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};

const outDir = flag('out', 'docs/review');
const rota = flag('rota', '/');
const preset = flag('preset', 'ambos');
const presets = preset === 'ambos' ? ['mobile', 'desktop'] : [preset];
let urlBase = flag('url', null);

/** Targets do playbook (08-entrega.md) */
const TARGETS = { performance: 95, accessibility: 95, 'best-practices': 100, seo: 100 };

const CONFIG = {
  mobile: {
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
    throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
  },
  desktop: {
    formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
    throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
  },
};

mkdirSync(outDir, { recursive: true });

let preview = null;
async function subirPreview() {
  process.stderr.write('→ npm run build\n');
  await new Promise((res, rej) => {
    const b = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
    b.on('exit', (c) => (c === 0 ? res() : rej(new Error(`build falhou (código ${c})`))));
  });

  process.stderr.write('→ npm run preview\n');
  preview = spawn('npm', ['run', 'preview', '--', '--port', '4322'], { stdio: 'pipe' });
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const r = await fetch('http://localhost:4322/');
      if (r.ok) return 'http://localhost:4322';
    } catch {
      /* ainda subindo */
    }
  }
  throw new Error('preview não subiu em 20s');
}

try {
  if (!urlBase) urlBase = await subirPreview();
  const alvo = new URL(rota, urlBase).href;

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });

  const resumos = [];
  for (const p of presets) {
    process.stderr.write(`→ lighthouse ${p} em ${alvo}\n`);
    const { lhr } = await lighthouse(
      alvo,
      { port: chrome.port, output: 'json', logLevel: 'error' },
      { extends: 'lighthouse:default', settings: CONFIG[p] }
    );

    const scores = Object.fromEntries(
      Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)])
    );

    const audit = (id) => lhr.audits[id];
    const metricas = {
      LCP: audit('largest-contentful-paint')?.displayValue,
      CLS: audit('cumulative-layout-shift')?.displayValue,
      TBT: audit('total-blocking-time')?.displayValue,
      FCP: audit('first-contentful-paint')?.displayValue,
      SpeedIndex: audit('speed-index')?.displayValue,
      elementoLCP: audit('largest-contentful-paint-element')?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 140),
    };

    const relevantes = Object.values(lhr.audits).filter(
      (a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'notApplicable'
    );

    const oportunidades = relevantes
      .filter((a) => a.details?.overallSavingsMs > 0 || a.details?.overallSavingsBytes > 0)
      .sort((a, b) => (b.details.overallSavingsMs ?? 0) - (a.details.overallSavingsMs ?? 0))
      .map((a) => ({
        id: a.id,
        titulo: a.title,
        economiaMs: Math.round(a.details.overallSavingsMs ?? 0),
        economiaKb: Math.round((a.details.overallSavingsBytes ?? 0) / 1024),
        itens: (a.details.items ?? []).slice(0, 5).map((i) => ({
          url: (i.url ?? i.node?.snippet ?? '').toString().slice(0, 120),
          economiaKb: i.wastedBytes ? Math.round(i.wastedBytes / 1024) : undefined,
          economiaMs: i.wastedMs ? Math.round(i.wastedMs) : undefined,
        })),
      }));

    const falhas = relevantes
      .filter((a) => !oportunidades.some((o) => o.id === a.id))
      .map((a) => ({
        id: a.id,
        categoria:
          Object.entries(lhr.categories).find(([, c]) =>
            c.auditRefs.some((r) => r.id === a.id)
          )?.[0] ?? '?',
        titulo: a.title,
        score: a.score,
        detalhe: (a.displayValue ?? '').slice(0, 100),
        exemplos: (a.details?.items ?? [])
          .slice(0, 3)
          .map((i) => (i.node?.snippet ?? i.url ?? '').toString().slice(0, 120))
          .filter(Boolean),
      }));

    const abaixoDoTarget = Object.entries(TARGETS)
      .filter(([k, alvo]) => scores[k] !== undefined && scores[k] < alvo)
      .map(([k, alvo]) => `${k}: ${scores[k]} (target ${alvo})`);

    const resumo = { preset: p, url: alvo, scores, targets: TARGETS, abaixoDoTarget, metricas, oportunidades, falhas };
    writeFileSync(`${outDir}/lighthouse-${p}.json`, JSON.stringify(lhr, null, 2));
    writeFileSync(`${outDir}/lighthouse-${p}-resumo.json`, JSON.stringify(resumo, null, 2));
    resumos.push(resumo);
  }

  await chrome.kill();

  for (const r of resumos) {
    console.log(`\n=== LIGHTHOUSE ${r.preset.toUpperCase()} — ${r.url} ===`);
    for (const [k, v] of Object.entries(r.scores)) {
      const alvo = TARGETS[k];
      const marca = alvo === undefined ? ' ' : v >= alvo ? '✓' : '✗';
      console.log(`  ${marca} ${k.padEnd(16)} ${v}${alvo ? `  (target ${alvo})` : ''}`);
    }
    console.log(`  LCP ${r.metricas.LCP} · CLS ${r.metricas.CLS} · TBT ${r.metricas.TBT} · FCP ${r.metricas.FCP}`);
    if (r.metricas.elementoLCP) console.log(`  elemento LCP: ${r.metricas.elementoLCP}`);
    if (r.oportunidades.length) {
      console.log('  oportunidades:');
      for (const o of r.oportunidades.slice(0, 6))
        console.log(`    · ${o.titulo} — ${o.economiaMs}ms / ${o.economiaKb}KB`);
    }
    if (r.falhas.length) {
      console.log(`  auditorias falhando: ${r.falhas.length}`);
      for (const f of r.falhas.slice(0, 8)) console.log(`    · [${f.categoria}] ${f.titulo}`);
    }
    console.log(`  → ${outDir}/lighthouse-${r.preset}-resumo.json`);
  }

  const reprovado = resumos.some((r) => r.abaixoDoTarget.length);
  console.log(reprovado ? '\n✗ abaixo do target do playbook' : '\n✓ todos os targets batidos');
} finally {
  preview?.kill();
}
