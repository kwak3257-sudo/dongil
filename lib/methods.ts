import type { Method } from './types';

// 우선순위 문서의 11가지 방법. available=true 는 MVP에서 체크리스트가 준비된 모듈.
export const METHODS: Method[] = [
  { id: 'spending', baseRank: 1, name: '새는 돈 막기', summary: '구독·통신비 정리, 파킹통장·비상금 만들기', minCapital: 'none', minHours: 1, needsSkill: false, risk: 'low', daysToFirst: 7, growth: 'low', available: true },
  { id: 'tax', baseRank: 2, name: '세금 아끼기', summary: '연금저축·IRP·ISA로 세액공제와 비과세 혜택 받기', minCapital: 'small', minHours: 1, needsSkill: false, risk: 'low', daysToFirst: 30, growth: 'low', available: true },
  { id: 'freelance', baseRank: 3, name: '프리랜서 시작하기', summary: '가진 기술을 크몽·숨고 상품으로 팔기', minCapital: 'none', minHours: 5, needsSkill: true, risk: 'low', daysToFirst: 21, growth: 'mid', available: true },
  { id: 'ai-service', baseRank: 4, name: 'AI 활용 대행', summary: 'AI로 글·번역·썸네일·문서 정리 대행', minCapital: 'none', minHours: 5, needsSkill: false, risk: 'low', daysToFirst: 30, growth: 'mid', available: false },
  { id: 'resell', baseRank: 5, name: '중고거래·리셀', summary: '안 쓰는 물건부터 팔아 종잣돈 만들기', minCapital: 'none', minHours: 2, needsSkill: false, risk: 'mid', daysToFirst: 3, growth: 'low', available: false },
  { id: 'blog', baseRank: 6, name: '블로그·제휴마케팅', summary: '글을 쌓아 광고·제휴 수익 만들기', minCapital: 'none', minHours: 5, needsSkill: false, risk: 'low', daysToFirst: 120, growth: 'high', available: false },
  { id: 'shorts', baseRank: 7, name: '유튜브 쇼츠·인스타', summary: '한 분야 콘텐츠로 채널 키우기', minCapital: 'none', minHours: 7, needsSkill: false, risk: 'low', daysToFirst: 240, growth: 'high', available: false },
  { id: 'digital', baseRank: 8, name: '디지털 상품 판매', summary: '전자책·템플릿·강의 만들어 팔기', minCapital: 'none', minHours: 5, needsSkill: true, risk: 'low', daysToFirst: 60, growth: 'high', available: false },
  { id: 'store', baseRank: 9, name: '스마트스토어·위탁판매', summary: '작은 온라인 쇼핑몰 운영', minCapital: 'small', minHours: 10, needsSkill: false, risk: 'mid', daysToFirst: 60, growth: 'high', available: false },
  { id: 'etf', baseRank: 10, name: 'ETF 적립식 투자', summary: '지수 ETF를 매달 사서 장기로 불리기', minCapital: 'small', minHours: 1, needsSkill: false, risk: 'mid', daysToFirst: 365, growth: 'mid', available: false },
  { id: 'gig', baseRank: 11, name: '배달·단기 알바', summary: '시간을 바로 돈으로 바꾸기', minCapital: 'none', minHours: 5, needsSkill: false, risk: 'mid', daysToFirst: 1, growth: 'low', available: false },
];

export const methodById = (id: string) => METHODS.find((m) => m.id === id);
