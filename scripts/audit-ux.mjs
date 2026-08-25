/**
 * Auditoria de usabilidade — dirige o browser de verdade: navega, passa o mouse,
 * tabula, clica no que é seguro clicar, e mede o que mudou.
 *
 *   node scripts/audit-ux.mjs [url] [--viewport desktop|mobile|ambos] [--out docs/review]
 *
 * Não julga design: coleta evidência. A leitura é do agente website-reviewer.
 * Saída: JSON em docs/review/ux-<viewport>.json + screenshots.
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const args = process.argv.slice(2);
const url = args.find((a) => a.startsWith('http')) ?? 'http://localhost:4321';
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const outDir = flag('out', 'docs/review');
const quais =
  flag('viewport', 'ambos') === 'ambos'
    ? ['desktop', 'mobile']
    : [flag('viewport', 'desktop')];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

/** Propriedades que tornam um hover perceptível. `opacity` sozinha não conta. */
const PROPS_HOVER = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderBottomColor',
  'transform',
  'boxShadow',
  'textDecorationLine',
  'filter',
  'outlineColor',
  'scale',
];

const SEL_INTERATIVO =
  'a[href], button, summary, [role="button"], [role="tab"], input, select, textarea, [onclick], [data-carousel-dot], [data-dot]';

const PLACEHOLDERS = [
  'Lorem',
  'lorem ipsum',
  '<Marca>',
  'Seção 1',
  'exemplo.com.br',
  'TODO',
];

mkdirSync(outDir, { recursive: true });

async function limparToolbar(page) {
  await page.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());
}

async function auditar(viewport) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
    hasTouch: viewport === 'mobile',
    isMobile: viewport === 'mobile',
  });
  const page = await ctx.newPage();

  const consoleErros = [];
  const requisicoesFalhas = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning')
      consoleErros.push({ tipo: m.type(), texto: m.text().slice(0, 300) });
  });
  page.on('requestfailed', (r) =>
    requisicoesFalhas.push({ url: r.url(), erro: r.failure()?.errorText })
  );
  page.on('response', (r) => {
    if (r.status() >= 400)
      requisicoesFalhas.push({ url: r.url(), erro: `HTTP ${r.status()}` });
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await limparToolbar(page);

  const rel = { viewport, url, gerado: new Date().toISOString() };

  // ---------- Estrutura e conteúdo ----------
  rel.estrutura = await page.evaluate((PH) => {
    const t = (el) => (el?.textContent ?? '').trim();
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
      nivel: +h.tagName[1],
      texto: t(h).slice(0, 80),
    }));
    const pulos = [];
    for (let i = 1; i < headings.length; i++)
      if (headings[i].nivel - headings[i - 1].nivel > 1)
        pulos.push(`h${headings[i - 1].nivel} → h${headings[i].nivel}: "${headings[i].texto}"`);

    const corpo = document.body.innerText;
    return {
      lang: document.documentElement.lang || null,
      title: document.title,
      metaDescription:
        document.querySelector('meta[name="description"]')?.content ?? null,
      h1: headings.filter((h) => h.nivel === 1).map((h) => h.texto),
      pulosDeHeading: pulos,
      landmarks: {
        header: !!document.querySelector('header'),
        nav: !!document.querySelector('nav'),
        main: !!document.querySelector('main'),
        footer: !!document.querySelector('footer'),
      },
      skipLink: !!document.querySelector('a[href^="#"][class*="sr-only"], a[href="#main"]'),
      imagensSemAlt: [...document.querySelectorAll('img:not([alt])')].map(
        (i) => i.getAttribute('src') ?? '(sem src)'
      ),
      imagensSemDimensao: [...document.querySelectorAll('img')]
        .filter((i) => !i.getAttribute('width') || !i.getAttribute('height'))
        .map((i) => i.getAttribute('src') ?? '(sem src)'),
      linksPlaceholder: [...document.querySelectorAll('a[href="#"], a[href=""]')].map(
        (a) => t(a).slice(0, 60) || '(sem texto)'
      ),
      linksExternosSemRel: [...document.querySelectorAll('a[target="_blank"]')]
        .filter((a) => !(a.rel || '').includes('noopener'))
        .map((a) => a.href),
      ancorasQuebradas: [...document.querySelectorAll('a[href^="#"]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && h !== '#' && !document.querySelector(h)),
      idsDuplicados: (() => {
        const vistos = new Set(), dup = new Set();
        for (const el of document.querySelectorAll('[id]'))
          vistos.has(el.id) ? dup.add(el.id) : vistos.add(el.id);
        return [...dup];
      })(),
      textoPlaceholder: PH.filter((p) => corpo.includes(p)),
      formulariosSemLabel: [...document.querySelectorAll('input, select, textarea')]
        .filter(
          (f) =>
            f.type !== 'hidden' &&
            !f.labels?.length &&
            !f.getAttribute('aria-label') &&
            !f.getAttribute('aria-labelledby')
        )
        .map((f) => f.name || f.type),
      formulariosSemDestino: [...document.querySelectorAll('form')]
        .filter((f) => !f.action || f.action.endsWith('#'))
        .map((f) => f.id || '(form sem id)'),
    };
  }, PLACEHOLDERS);

  // ---------- Layout ----------
  rel.layout = await page.evaluate(() => {
    const larg = document.documentElement.clientWidth;
    const estouram = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > larg + 1 || r.left < -1);
      })
      .slice(0, 15)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        classe: (el.className?.toString?.() ?? '').slice(0, 70),
        direita: Math.round(el.getBoundingClientRect().right),
      }));
    const textoMinusculo = [...document.querySelectorAll('p, li, span, a, small')]
      .filter((el) => el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 12)
      .slice(0, 10)
      .map((el) => ({
        texto: el.textContent.trim().slice(0, 40),
        tamanho: getComputedStyle(el).fontSize,
      }));
    return {
      scrollHorizontal: document.documentElement.scrollWidth > larg + 1,
      larguraDocumento: document.documentElement.scrollWidth,
      larguraViewport: larg,
      elementosEstourando: estouram,
      textoAbaixoDe12px: textoMinusculo,
      alturaPagina: document.documentElement.scrollHeight,
    };
  });

  // ---------- Interativos: hover, cursor, alvo de toque ----------
  const interativos = await page.$$(SEL_INTERATIVO);
  rel.interativos = { total: interativos.length, problemas: [] };

  for (const el of interativos.slice(0, 120)) {
    let info;
    try {
      if (!(await el.isVisible())) continue;
      info = await el.evaluate((n, props) => {
        const cs = getComputedStyle(n);
        const r = n.getBoundingClientRect();
        return {
          tag: n.tagName.toLowerCase(),
          texto: (n.innerText || n.getAttribute('aria-label') || '').trim().slice(0, 50),
          classe: (n.className?.toString?.() ?? '').slice(0, 60),
          href: n.getAttribute('href'),
          cursor: cs.cursor,
          largura: Math.round(r.width),
          altura: Math.round(r.height),
          nomeAcessivel:
            (n.innerText || '').trim() ||
            n.getAttribute('aria-label') ||
            n.getAttribute('title') ||
            n.querySelector('img')?.getAttribute('alt') ||
            null,
          antes: Object.fromEntries(props.map((p) => [p, cs[p]])),
        };
      }, PROPS_HOVER);

      await el.hover({ timeout: 1500 });
      await page.waitForTimeout(260); // deixa a transição terminar

      const depois = await el.evaluate((n, props) => {
        const cs = getComputedStyle(n);
        return Object.fromEntries(props.map((p) => [p, cs[p]]));
      }, PROPS_HOVER);

      const mudou = PROPS_HOVER.filter((p) => info.antes[p] !== depois[p]);
      const problemas = [];
      if (!mudou.length) problemas.push('hover-sem-efeito');
      if (info.cursor !== 'pointer' && info.tag !== 'input' && info.tag !== 'textarea')
        problemas.push(`cursor-${info.cursor}`);
      if (!info.nomeAcessivel) problemas.push('sem-nome-acessivel');
      if (viewport === 'mobile' && (info.largura < 44 || info.altura < 44))
        problemas.push(`alvo-pequeno-${info.largura}x${info.altura}`);
      if (info.tag === 'a' && (info.href === '#' || info.href === ''))
        problemas.push('link-placeholder');

      if (problemas.length)
        rel.interativos.problemas.push({
          elemento: `${info.tag}${info.classe ? '.' + info.classe.split(' ')[0] : ''}`,
          texto: info.texto,
          problemas,
          mudouNoHover: mudou,
        });
    } catch {
      /* elemento saiu do DOM ou está coberto — ignora */
    }
  }

  // ---------- Teclado ----------
  rel.teclado = await (async () => {
    const ordem = [];
    let semFoco = 0;
    await page.evaluate(() => window.scrollTo(0, 0));
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          texto: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40),
          outline: cs.outlineStyle === 'none' ? null : `${cs.outlineWidth} ${cs.outlineColor}`,
          boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow.slice(0, 40) : null,
          visivel: r.width > 0 && r.height > 0,
        };
      });
      if (!f) break;
      if (!f.outline && !f.boxShadow) semFoco++;
      ordem.push(f);
    }
    return {
      elementosTabulaveis: ordem.length,
      semIndicadorDeFoco: semFoco,
      ordem: ordem.map((o) => `${o.tag}: ${o.texto}`),
      focoInvisivel: ordem.filter((o) => !o.visivel).map((o) => o.tag),
    };
  })();

  // ---------- Acordeão / details ----------
  rel.acordeoes = await (async () => {
    const detalhes = await page.$$('details');
    const abertosNoLoad = await page.$$eval('details[open]', (ds) => ds.length);
    const resultados = [];
    for (const d of detalhes.slice(0, 6)) {
      try {
        const sum = await d.$('summary');
        if (!sum) continue;
        const h0 = await d.evaluate((n) => n.getBoundingClientRect().height);
        await sum.click();
        await page.waitForTimeout(60);
        const hMeio = await d.evaluate((n) => n.getBoundingClientRect().height);
        await page.waitForTimeout(500);
        const hAberto = await d.evaluate((n) => n.getBoundingClientRect().height);
        await sum.click();
        await page.waitForTimeout(60);
        const hFechando = await d.evaluate((n) => n.getBoundingClientRect().height);
        await page.waitForTimeout(500);
        resultados.push({
          rotulo: (await sum.innerText()).trim().slice(0, 40),
          abreAnimado: hMeio > h0 && hMeio < hAberto,
          fechaAnimado: hFechando > h0 && hFechando < hAberto,
          setaGira: await d.evaluate((n) => {
            const svg = n.querySelector('summary svg, summary [class*="icon"]');
            return svg ? getComputedStyle(svg).transitionProperty.includes('transform') : null;
          }),
        });
      } catch {
        /* ignora */
      }
    }
    return { total: detalhes.length, abertosNoLoad, itens: resultados };
  })();

  // ---------- Toggles ARIA (menu mobile, tabs) ----------
  rel.toggles = await (async () => {
    const alvos = await page.$$('[aria-expanded]');
    const out = [];
    for (const t of alvos.slice(0, 6)) {
      try {
        const antes = await t.getAttribute('aria-expanded');
        await t.click({ timeout: 1500 });
        await page.waitForTimeout(400);
        const depois = await t.getAttribute('aria-expanded');
        out.push({
          rotulo: (await t.getAttribute('aria-label')) ?? (await t.innerText()).slice(0, 30),
          alternaEstado: antes !== depois,
          temAriaControls: !!(await t.getAttribute('aria-controls')),
        });
        await t.click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(300);
      } catch {
        /* ignora */
      }
    }
    return out;
  })();

  // ---------- axe-core ----------
  await page.addScriptTag({ content: AXE });
  rel.axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    });
    return r.violations.map((v) => ({
      id: v.id,
      impacto: v.impact,
      descricao: v.help,
      ocorrencias: v.nodes.length,
      exemplos: v.nodes.slice(0, 3).map((n) => n.html.slice(0, 140)),
    }));
  });

  // ---------- Screenshots ----------
  const shots = {};
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  shots.pagina = `${outDir}/ux-${viewport}-full.png`;
  await page.screenshot({ path: shots.pagina, fullPage: true });
  rel.screenshots = shots;

  rel.console = { erros: consoleErros.slice(0, 20), requisicoesFalhas: requisicoesFalhas.slice(0, 20) };

  await browser.close();

  // ---------- Passes de degradação ----------
  rel.degradacao = await degradacao(viewport);

  return rel;
}

/** Sem JS e com prefers-reduced-motion: nada pode ficar invisível. */
async function degradacao(viewport) {
  const invisiveis = async (ctxOpts) => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: VIEWPORTS[viewport], ...ctxOpts });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() =>
      [...document.querySelectorAll('body *')]
        .filter((el) => {
          const cs = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (
            rect.height > 0 &&
            parseFloat(cs.opacity) < 0.05 &&
            (el.innerText || '').trim().length > 0
          );
        })
        .slice(0, 10)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          texto: el.innerText.trim().slice(0, 50),
        }))
    );
    await browser.close();
    return r;
  };

  return {
    semJs: {
      elementosInvisiveis: await invisiveis({ javaScriptEnabled: false }),
    },
    reducedMotion: {
      elementosInvisiveis: await invisiveis({ reducedMotion: 'reduce' }),
    },
  };
}

// ---------- Execução ----------
const saidas = [];
for (const v of quais) {
  process.stderr.write(`→ auditando ${v}…\n`);
  const rel = await auditar(v);
  const arquivo = `${outDir}/ux-${v}.json`;
  writeFileSync(arquivo, JSON.stringify(rel, null, 2));
  saidas.push({ viewport: v, arquivo, rel });
}

// Resumo legível no stdout — o JSON completo fica no arquivo.
for (const { viewport, arquivo, rel } of saidas) {
  const e = rel.estrutura;
  console.log(`\n=== ${viewport.toUpperCase()} — ${rel.url} ===`);
  console.log(`interativos: ${rel.interativos.total} · com problema: ${rel.interativos.problemas.length}`);
  console.log(`  sem hover: ${rel.interativos.problemas.filter((p) => p.problemas.includes('hover-sem-efeito')).length}`);
  console.log(`  cursor errado: ${rel.interativos.problemas.filter((p) => p.problemas.some((x) => x.startsWith('cursor-'))).length}`);
  if (viewport === 'mobile')
    console.log(`  alvo < 44px: ${rel.interativos.problemas.filter((p) => p.problemas.some((x) => x.startsWith('alvo-pequeno'))).length}`);
  console.log(`teclado: ${rel.teclado.elementosTabulaveis} tabuláveis · ${rel.teclado.semIndicadorDeFoco} sem foco visível`);
  console.log(`axe: ${rel.axe.length} violações (${rel.axe.filter((v) => v.impacto === 'critical' || v.impacto === 'serious').length} sérias/críticas)`);
  console.log(`acordeões: ${rel.acordeoes.total} · abertos no load: ${rel.acordeoes.abertosNoLoad}`);
  console.log(`layout: scroll horizontal ${rel.layout.scrollHorizontal ? 'SIM ⚠' : 'não'} · ${rel.layout.elementosEstourando.length} estourando`);
  console.log(`conteúdo: ${e.linksPlaceholder.length} link "#" · ${e.imagensSemAlt.length} img sem alt · placeholders: ${e.textoPlaceholder.join(', ') || 'nenhum'}`);
  console.log(`degradação: sem JS ${rel.degradacao.semJs.elementosInvisiveis.length} invisíveis · reduced-motion ${rel.degradacao.reducedMotion.elementosInvisiveis.length} invisíveis`);
  console.log(`console: ${rel.console.erros.length} erros/warnings · ${rel.console.requisicoesFalhas.length} requisições falhas`);
  console.log(`→ ${arquivo}`);
}
