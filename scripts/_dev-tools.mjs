/**
 * Utilitários de desenvolvimento — medir caixas e rasterizar SVG.
 * Não faz parte da entrega; some antes do build final.
 *
 *   node scripts/_dev-tools.mjs medir <url> <width> <seletor...>
 *   node scripts/_dev-tools.mjs raster <url> <out.png> <w> <h> [scale]
 */
import { chromium } from 'playwright';
const [modo, ...rest] = process.argv.slice(2);
const b = await chromium.launch();

if (modo === 'medir') {
  const [url, width, ...sels] = rest;
  const p = await b.newPage({ viewport: { width: Number(width), height: 900 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const s of sels) {
    const loc = p.locator(s).first();
    if (await loc.count()) {
      const bb = await loc.boundingBox();
      if (bb) console.log(s, `x=${bb.x.toFixed(1)} y=${bb.y.toFixed(1)} w=${bb.width.toFixed(1)} h=${bb.height.toFixed(1)}`);
    } else console.log(s, 'nao encontrado');
  }
} else {
  const [url, out, w, h, scale] = rest;
  const p = await b.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: Number(scale || 1) });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: out });
}
await b.close();
