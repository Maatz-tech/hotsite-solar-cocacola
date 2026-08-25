/**
 * Screenshot local para comparação pixel-perfect com o Figma (Fase 4.3).
 *
 *   node scripts/shot.mjs <url> <width> <out.png> [selector]
 *
 * Sem selector: captura a página inteira.
 * Com selector: captura só aquele elemento (ex.: "header", "footer").
 */
import { chromium } from 'playwright';

const [url, width, out, selector] = process.argv.slice(2);

if (!url || !width || !out) {
  console.error('uso: node scripts/shot.mjs <url> <width> <out.png> [selector]');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 2,
  // Comparação pixel-perfect não pode fotografar reveal pela metade: com
  // reduced-motion o motion.ts revela tudo de imediato (fallback que revela).
  reducedMotion: 'reduce',
});

await page.goto(url, { waitUntil: 'networkidle' });
// deixa a fonte assentar antes de fotografar
await page.evaluate(() => document.fonts.ready);
// o dev toolbar do Astro injeta <header>/<footer> próprios — fora daqui
await page.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());

// Imagem com loading="lazy" fora da viewport não carrega sozinha. Rolar num
// laço síncrono não resolve: o browser só avalia o IntersectionObserver entre
// tarefas, então é preciso ceder o controle a cada passo.
await page.evaluate(async () => {
  const pausa = () => new Promise((r) => setTimeout(r, 80));
  for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
    window.scrollTo(0, y);
    await pausa();
  }
  window.scrollTo(0, 0);
  await pausa();

  // decode() de uma imagem que nunca carrega não resolve nunca — corre contra
  // um timeout para o screenshot não travar por causa de um asset quebrado.
  await Promise.race([
    Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => img.decode().catch(() => {}))
    ),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
});

// Header sticky se sobrepõe ao topo da seção no screenshot de elemento —
// esconde para a comparação medir a seção, não a sobreposição.
if (selector && !selector.includes('header')) {
  await page.addStyleTag({ content: 'header { visibility: hidden !important; }' });
}

// Screenshot de elemento rola a página por conta própria e às vezes fotografa
// antes das imagens pintarem. Tirar a página inteira e recortar pela caixa do
// elemento é determinístico.
if (selector) {
  const caixa = await page.locator(selector).first().boundingBox();
  if (!caixa) {
    console.error(`erro: seletor '${selector}' não encontrado`);
    process.exit(1);
  }
  await page.screenshot({ path: out, fullPage: true, clip: caixa });
} else {
  await page.screenshot({ path: out, fullPage: true });
}

await browser.close();
console.log(`✓ ${out}`);
