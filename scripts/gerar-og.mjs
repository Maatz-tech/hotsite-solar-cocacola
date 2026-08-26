/**
 * Gera a imagem de compartilhamento (Open Graph) a partir dos assets da marca.
 *
 *   node scripts/gerar-og.mjs           # precisa do dev server no ar
 *
 * Monta um HTML temporário em public/, fotografa em 1200x630 e apaga. Vive em
 * public/ de propósito: assim as URLs relativas dos assets e a @font-face da
 * VAG Rounded resolvem igual ao site.
 */
import { chromium } from 'playwright';
import { writeFileSync, unlinkSync } from 'node:fs';

const URL_BASE = process.argv[2] ?? 'http://localhost:4321';
const TEMP = 'public/_og.html';

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
  @font-face { font-family:"VAG Rounded Std"; src:url("/fonts/vag-rounded-light.woff2") format("woff2"); font-weight:300; }
  @font-face { font-family:"VAG Rounded Std"; src:url("/fonts/vag-rounded-bold.woff2") format("woff2"); font-weight:700; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; overflow:hidden; font-family:"VAG Rounded Std",sans-serif; }
  .palco { position:relative; width:1200px; height:630px; background:#f1f1f1; overflow:hidden; }
  .curvas { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .anel { position:absolute; right:-70px; top:78px; width:660px; height:660px;
          border:95px solid #ff0000; border-radius:50%; box-sizing:border-box; }
  .foto { position:absolute; right:14px; bottom:-46px; width:590px; height:auto; }
  .texto { position:absolute; left:72px; top:50%; transform:translateY(-50%); width:520px; }
  .badge { display:inline-flex; align-items:center; gap:10px; height:48px; padding:0 16px;
           border-radius:12px; background:#282828; color:#fff; font-weight:700; font-size:22px; }
  .badge img { height:17px; }
  .trainee { font-weight:700; font-size:116px; line-height:.91; color:#ff0000; margin:28px 0 24px; }
  .logo { display:block; height:41px; width:auto; margin-bottom:26px; }
  .tag { font-size:22px; line-height:1.35; color:#ff0000; font-weight:300; }
  .tag b { font-weight:700; }
  .selo { position:absolute; left:72px; bottom:44px; display:inline-flex; align-items:center;
          height:44px; padding:0 20px; border-radius:12px; background:#fff;
          border:1px solid #282828; box-shadow:-3px 3px 0 #282828;
          font-size:19px; font-weight:700; color:#282828; }
</style></head>
<body><div class="palco">
  <img class="curvas" src="/images/hero/stripes.svg" alt="">
  <div class="anel"></div>
  <img class="foto" src="/images/hero/pessoas.webp" alt="">
  <div class="texto">
    <span class="badge"><img src="/images/hero/setas.webp" alt="">Supply Chain</span>
    <div class="trainee">Trainee</div>
    <img class="logo" src="/images/brand/logo.svg" alt="">
    <p class="tag"><b>Paixão</b> que transforma. <b>Sede</b> que impulsiona.</p>
  </div>
  <span class="selo">Inscrições até 28 de setembro</span>
</div></body></html>`;

writeFileSync(TEMP, html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto(`${URL_BASE}/_og.html`, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(400);
await p.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 88 });
await b.close();
unlinkSync(TEMP);
console.log('✓ public/og.jpg');
