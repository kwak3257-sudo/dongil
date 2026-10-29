// 돈길 웹 빌드 E2E 점검: node run.mjs <dist 경로> <스크린샷 폴더>
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const [dist, shots] = process.argv.slice(2);
mkdirSync(shots, { recursive: true });
const server = spawn('npx', ['serve', '-s', dist, '-l', '8099'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'ko-KR' });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' - ' + detail : ''}`);
};
const shot = (n) => page.screenshot({ path: `${shots}/${n}.png`, fullPage: true });
const tid = (id) => page.locator(`[data-testid="${id}"]`).filter({ visible: true }).first();
const text = (t) => page.getByText(t, { exact: false }).filter({ visible: true }).first();

try {
  await page.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  await text('첫 수익까지').waitFor({ timeout: 15000 });
  check('첫 실행 시 온보딩으로 이동', page.url().includes('onboarding'), page.url());
  await shot('01-welcome');

  await tid('start').click();
  const next = tid('next');
  check('선택 전에는 다음 버튼 비활성', (await next.getAttribute('aria-disabled')) === 'true');
  await text('없음 (0원)').click();
  await next.click();
  await text('주 4~10시간').click();
  await next.click();
  await text('디자인').click();
  await shot('02-skills');
  await next.click();
  await text('직장인 (근로소득)').click();
  await next.click();
  await text('50만 원').click();
  check('목표 칩이 입력값을 채움', (await tid('goal').inputValue()) === '500000');
  await next.click();
  await text('원금 손실은 싫어요').click();
  await next.click();
  await text('지금 시작하기 좋은 순서').waitFor();
  await shot('03-result');
  const resultText = await page.locator('body').innerText();
  check('결과에 1순위 표시', resultText.includes('1순위'));

  await tid('finish').click();
  await text('오늘의 미션').waitFor({ timeout: 10000 });
  check('온보딩 후 홈으로 이동', !page.url().includes('onboarding'), page.url());
  await shot('04-home');
  const before = await page.locator('body').innerText();
  const firstTitle = before.split('\n').find((l, i, a) => a[i - 1]?.startsWith('오늘의 미션'));

  await tid('mission-done').click();
  await page.waitForTimeout(400);
  const after = await page.locator('body').innerText();
  const secondTitle = after.split('\n').find((l, i, a) => a[i - 1]?.startsWith('오늘의 미션'));
  check('미션 완료 시 다음 미션으로 넘어감', !!firstTitle && firstTitle !== secondTitle, `${firstTitle} → ${secondTitle}`);
  check('첫 수익 지도 진행 반영', after.includes('단계 중 1단계'));
  await shot('05-home-after');

  // 돈길 지도
  await text('돈길 지도').click();
  await text('나에게 맞는 순서').waitFor();
  await shot('06-map');
  const mapText = await page.locator('body').innerText();
  check('지도에 11개 방법 표시', ['새는 돈 막기', '세금 아끼기', '프리랜서 시작하기', '배달·단기 알바'].every((n) => mapText.includes(n)));
  check('준비 중 배지 표시', mapText.includes('준비 중'));

  // 세금 모듈 열기 + 시작 + 계산기
  await text('세금 아끼기').click();
  await text('연금저축·IRP·ISA로').waitFor();
  await tid('start-module').click();
  await text('예상 세액공제 금액 계산하기').click();
  await page.getByPlaceholder('예: 40000000').filter({ visible: true }).fill('40000000');
  await page.locator('input').filter({ visible: true }).nth(1).fill('6000000');
  await page.locator('input').filter({ visible: true }).nth(2).fill('3000000');
  await page.waitForTimeout(200);
  const taxText = await page.locator('body').innerText();
  check('세액공제 계산 결과 (9백만 × 16.5% = 1,485,000원)', taxText.includes('1,485,000원'));
  await shot('07-tax-module');
  await page.goBack();
  await page.waitForTimeout(300);

  // 기록
  await page.getByRole('tab', { name: /기록/ }).click();
  await text('번 돈과 아낀 돈').waitFor();
  await tid('amount').fill('13500');
  await tid('save-record').click();
  await page.waitForTimeout(300);
  const recText = await page.locator('body').innerText();
  check('기록 저장 후 합계 반영', recText.includes('13,500원'));
  check('차례가 아닌 증빙 단계는 건너뛰지 않음', recText.includes('기록했어요.') && !recText.includes('단계도 완료했어요'));
  await shot('08-records');

  // 코치
  await page.getByRole('tab', { name: /코치/ }).click();
  await tid('chat-input').fill('막혔어요');
  await tid('chat-send').click();
  await page.waitForTimeout(500);
  const chatText = await page.locator('body').innerText();
  check('코치가 막힘에 작은 단계로 답함', chatText.includes('5분'));
  await tid('chat-input').fill('리딩방에서 고수익 보장한대요');
  await tid('chat-send').click();
  await page.waitForTimeout(500);
  check('사기 위험 경고', (await page.locator('body').innerText()).includes('사기'));
  await shot('09-coach');

  // 새로고침 후 유지
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  check('새로고침 후 온보딩으로 돌아가지 않음', !page.url().includes('onboarding'), page.url());
  await page.getByRole('tab', { name: /오늘/ }).click();
  await page.waitForTimeout(300);
  const homeAgain = await page.locator('body').innerText();
  check('새로고침 후 이번 달 성과 유지', homeAgain.includes('13,500원'));

  // 내 정보 + 초기화
  await page.getByRole('tab', { name: /내 정보/ }).click();
  await text('내 상황').waitFor();
  await shot('10-profile');
  const profText = await page.locator('body').innerText();
  check('프로필에 답변 표시', profText.includes('디자인') && profText.includes('500,000원'));
  check('웹에서는 알림 대신 안내 문구', profText.includes('휴대폰 앱에서만') && !profText.includes('알림 받기'));
  await text('처음부터 다시 하기').click();
  await tid('confirm-reset').click();
  await text('첫 수익까지').waitFor({ timeout: 10000 });
  check('초기화 후 온보딩으로 돌아감', page.url().includes('onboarding'));

  // 시나리오 2: 기술·소득 없는 초보 → 새는 돈 막기, 기록으로 첫 절약 인증
  await tid('start').click();
  await text('없음 (0원)').click(); await tid('next').click();
  await text('주 3시간 이하').click(); await tid('next').click();
  await tid('next').click();
  await text('현재 소득 없음').click(); await tid('next').click();
  await text('30만 원').click(); await tid('next').click();
  await text('원금 손실은 싫어요').click(); await tid('next').click();
  const res2 = await page.locator('body').innerText();
  check('초보자 1순위는 새는 돈 막기', /1순위\s*\n?\s*새는 돈 막기/.test(res2), res2.slice(0, 120).replace(/\n/g, ' / '));
  await tid('finish').click();
  await text('최근 3개월 카드').waitFor();
  await tid('mission-done').click();
  await page.waitForTimeout(300);
  await tid('mission-done').click();
  await page.waitForTimeout(300);
  check('세 번째 미션은 기록이 필요한 해지 단계', (await page.locator('body').innerText()).includes('안 쓰는 구독 1개 이상 해지하기'));
  await shot('11-home-proof');
  await page.getByRole('tab', { name: /기록/ }).click();
  await tid('amount').fill('17000');
  await tid('save-record').click();
  await page.waitForTimeout(300);
  check('아낀 돈 기록이 해지 단계를 완료 처리', (await page.locator('body').innerText()).includes('단계도 완료했어요'));
  await page.getByRole('tab', { name: /오늘/ }).click();
  await page.waitForTimeout(300);
  const home2 = await page.locator('body').innerText();
  check('첫 절약 지도 도착 표시', home2.includes('첫 절약 단계에 도착했어요'));
  await shot('12-home-reached');

  // 시나리오 3: 체크만 눌러서는 끝낼 수 없음 (순서 잠금, 기록 단계, 완주 화면)
  const checked = async (id) => (await tid(`check-${id}`).getAttribute('aria-checked')) === 'true';
  await page.goto('http://localhost:8099/module/freelance', { waitUntil: 'networkidle' });
  await tid('start-module').click();
  await tid('check-fr-3').click();
  await page.waitForTimeout(200);
  check('잠긴 단계는 체크되지 않음', !(await checked('fr-3')) && (await text('앞 단계를 끝내면 열려요').isVisible()));
  for (const n of [1, 2, 3, 4, 5, 6, 7]) await tid(`check-fr-${n}`).click();
  await tid('check-fr-9').click();
  await tid('check-fr-8').click();
  await page.waitForTimeout(200);
  const attrs = await Promise.all(['fr-7', 'fr-8', 'fr-9'].map((id) => tid(`check-${id}`).getAttribute('aria-checked')));
  check('기록 단계는 체크로 완료되지 않음', attrs.join() === 'true,false,false', attrs.join());
  check('기록 단계 안내 표시', await text('이 단계는 체크로 끝나지 않아요').isVisible());
  await shot('13-module-proof');
  await tid('record-fr-8').click();
  await tid('amount').waitFor();
  await tid('amount').fill('150000');
  await tid('save-record').click();
  await page.waitForTimeout(300);
  check('번 돈 기록이 첫 의뢰 단계를 완료', (await page.locator('body').innerText()).includes('첫 의뢰 완료하고 수익 기록'));
  await page.goto('http://localhost:8099/module/freelance', { waitUntil: 'networkidle' });
  await tid('check-fr-9').click();
  await tid('check-fr-10').click();
  await text('완주했어요').waitFor({ timeout: 5000 });
  const doneText = await page.locator('body').innerText();
  check('완주 화면에 이 길의 기록 합계', doneText.includes('번 돈 150,000원'));
  await shot('14-module-finished');
  await tid('start-next').click();
  await page.waitForTimeout(500);
  check('다음 길로 이동', page.url().includes('/module/') && !page.url().includes('freelance'), page.url());
} catch (e) {
  check('시나리오 실행', false, String(e).slice(0, 300));
  await shot('99-error');
} finally {
  check('콘솔 오류 없음', errors.length === 0, errors.slice(0, 5).join(' | '));
  await browser.close();
  server.kill();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}
