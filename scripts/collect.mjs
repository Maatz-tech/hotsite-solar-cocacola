/**
 * Coleta mecânica para os revisores. Faz tudo o que é determinístico:
 * sobe o dev server, enumera as seções da página, roda as auditorias e os
 * comparativos, roda o Lighthouse, e escreve um manifesto do que foi produzido.
 *
 *   node scripts/collect.mjs [--tudo] [--ux] [--perf] [--cmp]
 *                            [--secao <id>] [--rota /] [--url http://…]
 *
 * NÃO analisa nada. A leitura é dos agentes de análise.
 * Saída: docs/review/coleta.json + os artefatos referenciados por ele.
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const args = process.argv.slice(2);
const tem = (n) => args.includes(`--${n}`);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};

const tudo = tem('tudo') || (!tem('ux') && !tem('perf') && !tem('cmp'));
const fazerUx = tudo || tem('ux');
const fazerPerf = tudo || tem('perf');
const fazerCmp = tudo || tem('cmp');
const rota = flag('rota', '/');
const secaoUnica = flag('secao', null);
const outDir = 'docs/review';

mkdirSync(outDir, { recursive: true });

const manifesto = {
  gerado: new Date().toISOString(),
  rota,
  etapas: {},
  refsFaltando: [],
  erros: [],
};

/** Roda um comando e devolve {codigo, saida}. Nunca lança. */
function rodar(cmd, argv, opts = {}) {
  return new Promise((res) => {
    const p = spawn(cmd, argv, { ...opts });
    let saida = '';
    p.stdout?.on('data', (d) => (saida += d));
    p.stderr?.on('data', (d) => (saida += d));
    p.on('exit', (codigo) => res({ codigo, saida }));
    p.on('error', (e) => res({ codigo: -1, saida: String(e) }));
  });
}

// ---------- dev server ----------
let dev = null;
let urlBase = flag('url', null);

async function subirDev() {
  process.stderr.write('→ npm run dev\n');
  dev = spawn('npm', ['run', 'dev', '--', '--port', '4321'], { stdio: 'pipe' });
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const r = await fetch('http://localhost:4321' + rota);
      if (r.ok) return 'http://localhost:4321';
    } catch {
      /* subindo */
    }
  }
  throw new Error('dev server não subiu em 20s — ver se a porta 4321 está ocupada');
}

try {
  if ((fazerUx || fazerCmp) && !urlBase) urlBase = await subirDev();
  const alvo = urlBase ? new URL(rota, urlBase).href : null;

  // ---------- 1. inventário de seções (direto do DOM) ----------
  if (fazerCmp) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(alvo, { waitUntil: 'networkidle', timeout: 30000 });
    const secoes = await page.evaluate(() =>
      [...document.querySelectorAll('header[id], main section[id], main [id][data-secao], footer[id]')].map(
        (el) => ({
          id: el.id,
          tag: el.tagName.toLowerCase(),
          altura: Math.round(el.getBoundingClientRect().height),
        })
      )
    );
    // header/footer sem id também entram — são componentes globais
    const globais = await page.evaluate(() =>
      ['header', 'footer']
        .filter((t) => document.querySelector(t) && !document.querySelector(`${t}[id]`))
        .map((t) => ({ id: t, tag: t, seletor: t }))
    );
    await browser.close();

    const lista = [...globais, ...secoes]
      .map((s) => ({ ...s, seletor: s.seletor ?? `#${s.id}` }))
      .filter((s) => !secaoUnica || s.id === secaoUnica);

    manifesto.secoes = lista;
    process.stderr.write(`→ ${lista.length} seções: ${lista.map((s) => s.id).join(', ')}\n`);

    // ---------- 2. comparativos ----------
    manifesto.etapas.comparativos = [];
    for (const s of lista) {
      const r = await rodar('node', [
        'scripts/compare-section.mjs',
        s.id,
        '--seletor',
        s.seletor,
        '--url',
        alvo,
        '--viewport',
        'ambos',
      ]);
      for (const vp of ['desktop', 'mobile']) {
        const ref = `docs/reference/${s.id}-${vp}.png`;
        const item = {
          secao: s.id,
          viewport: vp,
          comparativo: `${outDir}/cmp-${s.id}-${vp}.png`,
          projeto: `docs/local/${s.id}-${vp}.png`,
          referencia: existsSync(ref) ? ref : null,
        };
        if (!item.referencia) manifesto.refsFaltando.push({ secao: s.id, viewport: vp, esperado: ref });
        manifesto.etapas.comparativos.push(item);
      }
      if (r.codigo !== 0) manifesto.erros.push({ etapa: `cmp:${s.id}`, saida: r.saida.slice(-400) });
    }
  }

  // ---------- 3. auditoria de usabilidade ----------
  if (fazerUx) {
    process.stderr.write('→ auditoria de usabilidade\n');
    const r = await rodar('node', ['scripts/audit-ux.mjs', alvo, '--viewport', 'ambos']);
    manifesto.etapas.ux = {
      relatorios: ['desktop', 'mobile'].map((v) => `${outDir}/ux-${v}.json`),
      screenshots: ['desktop', 'mobile'].map((v) => `${outDir}/ux-${v}-full.png`),
      resumoStdout: r.saida.slice(-2500),
    };
    if (r.codigo !== 0) manifesto.erros.push({ etapa: 'ux', saida: r.saida.slice(-400) });
  }

  // ---------- 4. lighthouse (build próprio, porta própria) ----------
  if (fazerPerf) {
    process.stderr.write('→ lighthouse\n');
    dev?.kill(); // libera CPU: medição concorrente com dev server distorce o número
    dev = null;
    const r = await rodar('node', ['scripts/lighthouse.mjs', '--preset', 'ambos', '--rota', rota]);
    manifesto.etapas.perf = {
      resumos: ['mobile', 'desktop'].map((p) => `${outDir}/lighthouse-${p}-resumo.json`),
      completos: ['mobile', 'desktop'].map((p) => `${outDir}/lighthouse-${p}.json`),
      resumoStdout: r.saida.slice(-2500),
    };
    if (r.codigo !== 0) manifesto.erros.push({ etapa: 'perf', saida: r.saida.slice(-400) });
  }
} catch (e) {
  manifesto.erros.push({ etapa: 'geral', saida: String(e) });
} finally {
  dev?.kill();
}

writeFileSync(`${outDir}/coleta.json`, JSON.stringify(manifesto, null, 2));

console.log(`\n=== COLETA ===`);
if (manifesto.secoes) console.log(`seções: ${manifesto.secoes.map((s) => s.id).join(', ')}`);
console.log(`comparativos: ${manifesto.etapas.comparativos?.length ?? 0}`);
console.log(`usabilidade: ${manifesto.etapas.ux ? 'ok' : '—'}`);
console.log(`lighthouse: ${manifesto.etapas.perf ? 'ok' : '—'}`);
if (manifesto.refsFaltando.length) {
  console.log(`\n⚠ referências do Figma faltando (${manifesto.refsFaltando.length}):`);
  for (const f of manifesto.refsFaltando) console.log(`  ${f.secao} · ${f.viewport} → ${f.esperado}`);
}
if (manifesto.erros.length) {
  console.log(`\n✗ erros:`);
  for (const e of manifesto.erros) console.log(`  [${e.etapa}] ${e.saida.split('\n').slice(-3).join(' ')}`);
}
console.log(`\n→ ${outDir}/coleta.json`);
process.exit(manifesto.erros.length ? 1 : 0);
