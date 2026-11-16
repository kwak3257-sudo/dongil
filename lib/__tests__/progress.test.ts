import { canCheck, isModuleDone, nextModule, stepStatuses } from '../progress';
import { useStore } from '../store';
import type { Profile } from '../types';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const profile: Profile = { capital: 'none', hoursPerWeek: 7, skills: ['design'], incomeType: 'salary', goalMonthly: 500000, risk: 'low' };
const done = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, '2026-10-29T00:00:00Z']));
const firstSeven = ['fr-1', 'fr-2', 'fr-3', 'fr-4', 'fr-5', 'fr-6', 'fr-7'];

describe('step rules', () => {
  it('opens steps one at a time', () => {
    const st = stepStatuses('freelance', done('fr-1'));
    expect(st['fr-1']).toBe('done');
    expect(st['fr-2']).toBe('current');
    expect(st['fr-3']).toBe('locked');
    expect(canCheck('freelance', 'fr-3', done('fr-1'))).toBe('locked');
    expect(canCheck('freelance', 'fr-2', done('fr-1'))).toBe('ok');
  });

  it('a record step cannot be ticked, only recorded', () => {
    expect(canCheck('freelance', 'fr-8', done(...firstSeven))).toBe('needsRecord');
  });

  it('suggests the next unfinished module', () => {
    const all = done(...firstSeven, 'fr-8', 'fr-9', 'fr-10');
    expect(isModuleDone('freelance', all)).toBe(true);
    const next = nextModule(profile, ['freelance'], all);
    expect(next?.available).toBe(true);
    expect(next?.id).not.toBe('freelance');
  });
});

describe('store enforces the rules', () => {
  beforeEach(() => useStore.setState({ completed: {}, records: [], activeModules: ['freelance'], lastProgressAt: null }));
  const s = () => useStore.getState();

  it('cannot skip ahead or tick through a record step', () => {
    expect(s().completeStep('fr-3')).toBe('locked');
    for (const id of firstSeven) expect(s().completeStep(id)).toBe('ok');
    expect(s().completeStep('fr-8')).toBe('needsRecord');
    expect(s().completed['fr-8']).toBeUndefined();
    expect(s().completeStep('fr-9')).toBe('locked');
  });

  it('recording money completes only the current matching record step', () => {
    for (const id of firstSeven.slice(0, 3)) s().completeStep(id);
    expect(s().addRecord({ kind: 'earned', amount: 50000, methodId: 'freelance' })).toBeNull(); // 아직 fr-8 차례 아님
    expect(s().completed['fr-8']).toBeUndefined();
    for (const id of firstSeven.slice(3)) s().completeStep(id);
    expect(s().addRecord({ kind: 'saved', amount: 10000, methodId: 'freelance' })).toBeNull(); // 종류가 다름
    expect(s().addRecord({ kind: 'earned', amount: 150000, methodId: 'freelance' })?.id).toBe('fr-8');
    expect(s().completeStep('fr-9')).toBe('ok');
  });

  it('only the most recent step can be undone', () => {
    s().completeStep('fr-1');
    s().completeStep('fr-2');
    expect(s().undoStep('fr-1')).toBe(false);
    expect(s().undoStep('fr-2')).toBe(true);
    expect(stepStatuses('freelance', s().completed)['fr-2']).toBe('current');
  });
});
