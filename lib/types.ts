export type Capital = 'none' | 'small' | 'mid' | 'large';
export type RiskLevel = 'low' | 'mid' | 'high';
export type IncomeType = 'salary' | 'business' | 'student' | 'none';
export type Skill =
  | 'design'
  | 'video'
  | 'dev'
  | 'writing'
  | 'language'
  | 'excel'
  | 'teaching'
  | 'sales';

export interface Profile {
  capital: Capital;
  hoursPerWeek: number;
  skills: Skill[];
  incomeType: IncomeType;
  goalMonthly: number; // 원
  risk: RiskLevel;
}

export interface Method {
  id: string;
  baseRank: number; // 일반 개인 기준 우선순위 (1이 가장 먼저)
  name: string;
  summary: string;
  minCapital: Capital;
  minHours: number;
  needsSkill: boolean;
  risk: RiskLevel;
  daysToFirst: number; // 첫 수익(또는 절약)까지 대략적인 일수
  growth: 'low' | 'mid' | 'high'; // 수익 상한
  available: boolean; // MVP에서 체크리스트가 준비된 모듈
}

export type Phase = 'week1' | 'day30' | 'day90';

export interface Step {
  id: string;
  phase: Phase;
  title: string;
  minutes: number;
  guide: string[];
  tip?: string;
  tool?: ToolId;
  proof?: 'saved' | 'earned';
}

export type ToolId = 'subscriptions' | 'emergency' | 'taxCredit' | 'quote' | 'listing';

export interface ModuleTemplate {
  methodId: string;
  goalLabel: string; // 첫 수익 지도에 표시할 목표
  steps: Step[];
}

export interface MoneyRecord {
  id: string;
  date: string; // ISO
  kind: 'earned' | 'saved';
  amount: number;
  methodId?: string;
  memo?: string;
}

export interface ChatMessage {
  role: 'user' | 'coach';
  text: string;
  at: string;
}
