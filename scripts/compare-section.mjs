/**
 * Comparação Figma × projeto, seção por seção, nos dois viewports.
 *
 *   node scripts/compare-section.mjs <slug> [--seletor "#slug"] [--url http://localhost:4321]
 *                                           [--viewport desktop|mobile|ambos] [--out docs/review]
 *
 * Espera a referência do Figma em docs/reference/<slug>-<viewport>.png
 * (salva na Fase 4.1 com get_screenshot).
 *
 * Gera, por viewport, um PNG único com três painéis lado a lado:
 *   FIGMA | PROJETO | DIFERENÇA (overlay em mix-blend-mode: difference)
 * O painel de diferença mostra preto onde bate e brilho onde desalinha.
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--') && !a.startsWith('http'));
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};

if (!slug) {
  console.error('uso: node scripts/compare-section.mjs <slug> [--seletor "#slug"] [--viewport ambos]');
  process.exit(1);
}

const url = flag('url', 'http://localhost:4321');
const seletor = flag('seletor', `#${slug}`);
const outDir = flag('out', 'docs/review');
const localDir = 'docs/local';
const refDir = 'docs/reference';
const quais =
  flag('viewport', 'ambos') === 'ambos' ? ['desktop', 'mobile'] : [flag('viewport', 'desktop')];

const VIEWPORTS = { desktop: 1440, mobile: 390 };

mkdirSync(outDir, { recursive: true });
mkdirSync(localDir, { recursive: true });

const dataUri = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;

/** Lê largura/altura do cabeçalho IHDR do PNG — sem dependência de imagem. */
function dimensoesPng(p) {
  const b = readFileSync(p);
  return { largura: b.readUInt32BE(16), altura: b.readUInt32BE(20) };
}

/**
 * O composto é a visão geral + o painel de diferença (alinhamento).
 * Para auditar detalhe fino, abrir os PNGs individuais em docs/reference e
 * docs/local — o composto perde resolução ao ser reduzido para leitura.
 */
const LARGURA_MAX_PAINEL = 640;

const browser = await chromium.launch();
const resultados = [];

for (const vp of quais) {
  const largura = VIEWPORTS[vp];

  // --- 1. captura o estado atual do projeto ---
  const page = await browser.newPage({
    viewport: { width: largura, height: 900 },
    deviceScaleFactor: 2,
    isMobile: vp === 'mobile',
    hasTouch: vp === 'mobile',
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());
  // rola a página inteira para disparar os reveals antes de fotografar
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);

  const localPath = path.join(localDir, `${slug}-${vp}.png`);
  const alvo = await page.$(seletor);
  if (alvo) {
    await alvo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await alvo.screenshot({ path: localPath });
  } else {
    console.error(`⚠ seletor "${seletor}" não encontrado — capturando a página inteira`);
    await page.screenshot({ path: localPath, fullPage: true });
  }
  const dimLocal = await page
    .$eval(seletor, (el) => {
      const r = el.getBoundingClientRect();
      return { largura: Math.round(r.width), altura: Math.round(r.height) };
    })
    .catch(() => null);
  await page.close();

  // --- 2. referência do Figma ---
  const refPath = path.join(refDir, `${slug}-${vp}.png`);
  const temRef = existsSync(refPath);
  if (!temRef)
    console.error(`⚠ sem referência do Figma em ${refPath} — gerando só o print do projeto`);

  // --- 3. composição dos painéis ---
  const cmpPath = path.join(outDir, `cmp-${slug}-${vp}.png`);

  // Os prints saem em deviceScaleFactor 2: metade da largura nativa é 1:1.
  const nativo = dimensoesPng(localPath);
  const painel = Math.min(Math.round(nativo.largura / 2), LARGURA_MAX_PAINEL);
  const larguraComp = painel * 3 + 32 * 2 + 32; // 3 painéis + gaps + padding

  const comp = await browser.newPage({
    viewport: { width: larguraComp, height: 900 },
    deviceScaleFactor: 1,
  });
  await comp.setContent(`
    <style>
      * { margin: 0; box-sizing: border-box; }
      body { background: #14161a; font: 13px/1.3 ui-monospace, monospace; color: #9aa3ad; padding: 16px; width: max-content; }
      .linha { display: flex; gap: 32px; align-items: flex-start; }
      .painel { width: ${painel}px; }
      .rotulo { padding: 6px 0 8px; letter-spacing: .08em; text-transform: uppercase; }
      .quadro { background: #fff; border: 1px solid #2a2f37; }
      .quadro img { display: block; width: 100%; }
      .sobrepor { position: relative; background: #000; }
      .sobrepor img { display: block; width: 100%; }
      .sobrepor img + img { position: absolute; inset: 0; mix-blend-mode: difference; }
      .vazio { padding: 40px 12px; text-align: center; border: 1px dashed #2a2f37; }
    </style>
    <div class="linha">
      <div class="painel">
        <div class="rotulo">Figma — ${slug} · ${vp}</div>
        ${temRef ? `<div class="quadro"><img src="${dataUri(refPath)}"></div>` : '<div class="vazio">sem referência</div>'}
      </div>
      <div class="painel">
        <div class="rotulo">Projeto — ${largura}px${dimLocal ? ` · ${dimLocal.largura}×${dimLocal.altura}` : ''}</div>
        <div class="quadro"><img src="${dataUri(localPath)}"></div>
      </div>
      <div class="painel">
        <div class="rotulo">Diferença</div>
        ${
          temRef
            ? `<div class="sobrepor"><img src="${dataUri(refPath)}"><img src="${dataUri(localPath)}"></div>`
            : '<div class="vazio">precisa da referência</div>'
        }
      </div>
    </div>
  `);
  await comp.waitForTimeout(400);
  const linha = await comp.$('.linha');
  await linha.screenshot({ path: cmpPath });
  await comp.close();

  resultados.push({ viewport: vp, comparacao: cmpPath, local: localPath, referencia: temRef ? refPath : null, dimLocal });
}

await browser.close();

console.log(`\n=== ${slug} ===`);
for (const r of resultados) {
  console.log(`${r.viewport}: ${r.comparacao}`);
  console.log(`  projeto:   ${r.local}${r.dimLocal ? ` (${r.dimLocal.largura}×${r.dimLocal.altura})` : ''}`);
  console.log(`  referência: ${r.referencia ?? '— FALTANDO, rodar get_screenshot no node do Figma'}`);
}
console.log('\nAbrir os PNGs de comparação e auditar na ordem: layout/spacing → tipografia → cores → radius/sombra → imagens → estados.');
