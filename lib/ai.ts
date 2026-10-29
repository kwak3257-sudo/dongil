import { methodById } from './methods';
import { moduleFor } from './modules';
import type { ChatMessage, Profile } from './types';

// 서버(Supabase Edge Function `coach`) 주소. 비어 있으면 기기 안의 기본 코치를 씁니다.
const ENDPOINT = process.env.EXPO_PUBLIC_AI_ENDPOINT ?? '';
export const aiConnected = ENDPOINT.length > 0;

const CAPITAL_LABEL = { none: '0원', small: '100만 원 이하', mid: '1,000만 원 이하', large: '1,000만 원 초과' };

export function describeContext(profile: Profile | null, activeModules: string[], nextStep?: string) {
  if (!profile) return '온보딩 전';
  const mods = activeModules.map((id) => methodById(id)?.name ?? id).join(', ');
  return [
    `시작 자금: ${CAPITAL_LABEL[profile.capital]}`,
    `주당 시간: ${profile.hoursPerWeek}시간`,
    `기술: ${profile.skills.length ? profile.skills.join(', ') : '없음'}`,
    `목표: 월 ${profile.goalMonthly.toLocaleString('ko-KR')}원`,
    `진행 중 모듈: ${mods || '없음'}`,
    nextStep ? `오늘의 미션: ${nextStep}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function post<T>(body: unknown): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI ${res.status}`);
  return (await res.json()) as T;
}

// 서버가 없을 때 쓰는 규칙 기반 코치
export function localCoachReply(text: string, nextStep?: string): string {
  const t = text.replace(/\s/g, '');
  if (/리딩방|고수익|보장|코인추천|통장대여|다단계/.test(t)) {
    return '수익을 보장한다거나 통장·신분증을 빌려 달라는 제안은 사기일 가능성이 아주 높아요. 돈을 보내기 전에 꼭 멈추고, 의심되면 금융감독원(1332)에 상담해 보세요.';
  }
  if (/막혀|막혔|막힘|모르겠|어려워|어렵|귀찮|못하겠|포기/.test(t)) {
    return nextStep
      ? `괜찮아요, 누구나 한 번은 멈춰요. "${nextStep}"을(를) 통째로 하지 말고, 오늘은 5분 동안 첫 화면만 열어 보세요. 거기까지 하면 오늘은 성공이에요.`
      : '괜찮아요. 모듈 탭에서 지금 할 수 있는 가장 작은 단계 하나만 골라 5분만 해 봐요.';
  }
  if (/다음|뭐해|뭘해|오늘/.test(t)) {
    return nextStep ? `오늘의 미션은 "${nextStep}"이에요. 끝나면 체크해 주세요. 제가 다음 걸 바로 준비해 둘게요.` : '모든 단계를 마쳤어요! 모듈 탭에서 다음 방법을 시작해 보세요.';
  }
  if (/가격|얼마|견적/.test(t)) {
    return '처음엔 리뷰를 모으는 게 우선이라 경쟁 상품보다 10~20% 낮게 시작하고, 리뷰 5개가 쌓이면 올리는 걸 추천해요. 프리랜서 모듈의 견적 계산기로 실수령액도 확인해 보세요.';
  }
  if (/세금|공제|연금|irp|isa/i.test(t)) {
    return '연금저축·IRP는 낸 돈의 13.2~16.5%를 연말정산에서 돌려받을 수 있어요(2025년 기준, 한도 있음). 세금 아끼기 모듈의 계산기로 내 예상 환급액을 확인해 보세요. 정확한 판단은 세무 전문가 확인을 권해요.';
  }
  return '좋은 질문이에요. 지금 진행 중인 단계와 연결해서 생각해 보면, 오늘 할 수 있는 가장 작은 행동 하나를 정하는 게 제일 빨라요. 홈의 오늘의 미션부터 해 볼까요?';
}

export async function coachReply(history: ChatMessage[], context: string, nextStep?: string): Promise<string> {
  const last = history[history.length - 1]?.text ?? '';
  if (!aiConnected) return localCoachReply(last, nextStep);
  try {
    const { reply } = await post<{ reply: string }>({ type: 'coach', context, messages: history });
    return reply || localCoachReply(last, nextStep);
  } catch {
    return localCoachReply(last, nextStep);
  }
}

// 단계별 맞춤 팁. 서버가 없으면 프로필에 따른 기본 팁.
export async function personalTips(methodId: string, profile: Profile, context: string): Promise<Record<string, string>> {
  const mod = moduleFor(methodId);
  if (!mod) return {};
  if (aiConnected) {
    try {
      const { tips } = await post<{ tips: { id: string; tip: string }[] }>({
        type: 'personalize',
        context,
        steps: mod.steps.map((s) => ({ id: s.id, title: s.title })),
      });
      return Object.fromEntries(tips.map((t) => [t.id, t.tip]));
    } catch {
      // 기본 팁으로 대체
    }
  }
  const tips: Record<string, string> = {};
  for (const s of mod.steps) {
    if (s.minutes >= 60 && profile.hoursPerWeek <= 3) {
      tips[s.id] = `주 ${profile.hoursPerWeek}시간이면 이 단계는 2~3일에 나눠서 해도 괜찮아요.`;
    }
  }
  return tips;
}
