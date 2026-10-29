// Supabase Edge Function: DONGIL AI 코치 + 체크리스트 맞춤화
// 배포: supabase functions deploy coach
// 비밀값: supabase secrets set ANTHROPIC_API_KEY=... (선택: ANTHROPIC_MODEL)
// 앱에서는 EXPO_PUBLIC_AI_ENDPOINT 에 이 함수의 URL을 넣습니다.
import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic();
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-opus-5-5';

const SYSTEM = `당신은 재테크 실행 앱 '돈길(DONGIL)'의 코치입니다.
사용자가 돈 버는 방법을 체크리스트로 따라 하며 첫 수익(또는 첫 절약)까지 가도록 옆에서 이끕니다.
- 한국어로, 짧고 따뜻하게, 오늘 바로 할 수 있는 다음 행동 하나를 분명히 제시하세요.
- 막힌 사용자에게는 일을 5~10분짜리로 더 작게 쪼개 주세요.
- 특정 주식·코인·금융상품을 추천하거나 수익을 보장하지 마세요. 세금·법률은 일반 정보로만 안내하고 전문가 확인을 권하세요.
- 리딩방, 고수익 보장, 다단계, 통장·신분증 대여 요구는 사기 위험이 크다고 분명히 알려 주세요.`;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
};

type Msg = { role: 'user' | 'coach'; text: string };

function textOf(res: Anthropic.Beta.BetaMessage): string {
  return res.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

async function coach(context: string, history: Msg[]) {
  const messages: Anthropic.Beta.BetaMessageParam[] = history.slice(-20).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `${SYSTEM}\n\n[사용자 현재 상황]\n${context}`,
    messages,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });
  if (res.stop_reason === 'refusal') return '이 질문에는 답하기 어려워요. 다른 방식으로 물어봐 주세요.';
  return textOf(res);
}

async function personalize(context: string, steps: { id: string; title: string }[]) {
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `[사용자 상황]\n${context}\n\n[체크리스트 단계]\n${steps
          .map((s) => `${s.id}: ${s.title}`)
          .join('\n')}\n\n각 단계에 이 사용자에게 맞춘 한 문장 팁을 주세요.`,
      },
    ],
    output_config: {
      effort: 'low',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            tips: {
              type: 'array',
              items: {
                type: 'object',
                properties: { id: { type: 'string' }, tip: { type: 'string' } },
                required: ['id', 'tip'],
                additionalProperties: false,
              },
            },
          },
          required: ['tips'],
          additionalProperties: false,
        },
      },
    },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });
  if (res.stop_reason === 'refusal') return { tips: [] };
  return JSON.parse(textOf(res));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const result =
      body.type === 'personalize'
        ? await personalize(String(body.context ?? ''), body.steps ?? [])
        : { reply: await coach(String(body.context ?? ''), body.messages ?? []) };
    return new Response(JSON.stringify(result), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return new Response(JSON.stringify({ error: 'busy' }), { status: 429, headers: cors });
    }
    console.error(e);
    return new Response(JSON.stringify({ error: 'failed' }), { status: 500, headers: cors });
  }
});
