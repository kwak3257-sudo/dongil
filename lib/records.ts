import type { MoneyRecord } from './types';

export function monthlyTotals(records: MoneyRecord[], now: Date = new Date()) {
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = records.filter((r) => {
    const d = new Date(r.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === ym;
  });
  const earned = thisMonth.filter((r) => r.kind === 'earned').reduce((s, r) => s + r.amount, 0);
  const saved = thisMonth.filter((r) => r.kind === 'saved').reduce((s, r) => s + r.amount, 0);
  const allTime = records.reduce((s, r) => s + r.amount, 0);
  return { earned, saved, total: earned + saved, allTime };
}
