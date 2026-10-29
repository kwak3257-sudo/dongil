// 돈길 아이콘·로고 이미지 생성: node icons.mjs <fonts 경로 접두> <출력 폴더>
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [nm, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b64 = (f) => `data:font/ttf;base64,${readFileSync(f).toString('base64')}`;
const en = b64(`${nm}/@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf`);
const ko = b64(`${nm}/@expo-google-fonts/noto-serif-kr/700Bold/NotoSerifKR_700Bold.ttf`);
const NAVY = '#0F1E3D', GOLD = '#C9A24B', CREAM = '#F8F5EE';

const css = `@font-face{font-family:En;src:url(${en})}@font-face{font-family:Ko;src:url(${ko})}
*{margin:0;padding:0;box-sizing:border-box}body{background:transparent}
.c{display:flex;flex-direction:column;align-items:center;justify-content:center}`;

// 앱 아이콘: 네이비 바탕, 금색 '돈길', 아래 DONGIL
const icon = (bg, scale) => `<div class="c" style="width:1024px;height:1024px;background:${bg}">
  <div class="c" style="transform:scale(${scale})">
    <div style="font-family:Ko;font-size:330px;color:${GOLD};line-height:1;letter-spacing:-8px">돈길</div>
    <div style="width:420px;height:4px;background:${GOLD};margin:56px 0 44px;opacity:.9"></div>
    <div style="font-family:En;font-size:110px;color:${CREAM};letter-spacing:34px;margin-right:-34px">DONGIL</div>
  </div></div>`;

// 가로 워드마크
const wordmark = (bg, ink) => `<div style="display:flex;align-items:center;padding:80px 96px;background:${bg};width:max-content">
  <span style="font-family:En;font-size:140px;color:${ink};letter-spacing:26px">DONGIL</span>
  <span style="width:4px;height:120px;background:${GOLD};margin:0 44px 0 20px"></span>
  <span style="display:flex;flex-direction:column">
    <span style="font-family:Ko;font-size:92px;color:${GOLD};line-height:1.1">돈길</span>
    <span style="font-family:En;font-size:34px;color:${ink === CREAM ? '#E9D9AE' : '#5F6675'};letter-spacing:4px">The Money Path</span>
  </span></div>`;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
async function render(html, file, opts = {}) {
  await page.setContent(`<style>${css}</style>${html}`);
  await page.evaluate(async () => { await document.fonts.load('10px En'); await document.fonts.load('10px Ko', '돈길'); await document.fonts.ready; });
  const el = page.locator('body > div').first();
  await el.screenshot({ path: `${out}/${file}`, omitBackground: true, ...opts });
}
await render(icon(NAVY, 1), 'icon.png');
await render(icon('transparent', 0.62), 'android-icon-foreground.png');
await render(`<div style="width:1024px;height:1024px;background:${NAVY}"></div>`, 'android-icon-background.png');
await render(icon('transparent', 0.8), 'splash-icon.png');
await page.setViewportSize({ width: 1600, height: 400 });
await render(wordmark(CREAM, NAVY), 'logo-light.png');
await render(wordmark(NAVY, CREAM), 'logo-dark.png');
await browser.close();
