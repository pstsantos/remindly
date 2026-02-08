import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Path, Pattern, Problem, PracticeEvent, ScheduledOccurrence, RevisitPace } from '@/types/fixation';
import { BASE_INTERVALS, PACE_MULTIPLIERS } from '@/types/fixation';
import { format, addDays } from 'date-fns';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useFixationStore() {
  const [paths, setPaths] = useState<Path[]>(() => loadFromStorage('fixation_paths', []));
  const [patterns, setPatterns] = useState<Pattern[]>(() => loadFromStorage('fixation_patterns', []));
  const [problems, setProblems] = useState<Problem[]>(() => loadFromStorage('fixation_problems', []));
  const [events, setEvents] = useState<PracticeEvent[]>(() => loadFromStorage('fixation_events', []));
  const [scheduled, setScheduled] = useState<ScheduledOccurrence[]>(() => loadFromStorage('fixation_scheduled', []));
  const [pace, setPace] = useState<RevisitPace>(() => loadFromStorage('fixation_pace', 'standard'));

  useEffect(() => saveToStorage('fixation_paths', paths), [paths]);
  useEffect(() => saveToStorage('fixation_patterns', patterns), [patterns]);
  useEffect(() => saveToStorage('fixation_problems', problems), [problems]);
  useEffect(() => saveToStorage('fixation_events', events), [events]);
  useEffect(() => saveToStorage('fixation_scheduled', scheduled), [scheduled]);
  useEffect(() => saveToStorage('fixation_pace', pace), [pace]);

  const addPath = useCallback((name: string, intention?: string, color?: string) => {
    const path: Path = { id: generateId(), name, intention, color };
    setPaths(prev => [...prev, path]);
    return path;
  }, []);

  const addPattern = useCallback((name: string, pathId: string, practiceSetCount: number = 5) => {
    const pattern: Pattern = { id: generateId(), name, pathId, successCount: 0, practiceSetCount };
    setPatterns(prev => [...prev, pattern]);
    return pattern;
  }, []);

  const deletePattern = useCallback((patternId: string) => {
    setPatterns(prev => prev.filter(p => p.id !== patternId));
    setScheduled(prev => prev.filter(s => s.patternId !== patternId));
    setProblems(prev => prev.filter(p => p.patternId !== patternId));
    setEvents(prev => prev.filter(e => e.patternId !== patternId));
  }, []);

  const addProblem = useCallback((patternId: string, name: string) => {
    const problem: Problem = { id: generateId(), patternId, name, date: format(new Date(), 'yyyy-MM-dd') };
    setProblems(prev => [...prev, problem]);
    return problem;
  }, []);

  const getProblemsForPattern = useCallback((patternId: string) => {
    return problems.filter(p => p.patternId === patternId);
  }, [problems]);

  const searchPatterns = useCallback((query: string) => {
    if (!query.trim()) return patterns;
    const lower = query.toLowerCase();
    return patterns.filter(p => p.name.toLowerCase().includes(lower));
  }, [patterns]);

  const computeNextDate = useCallback((successCount: number, fixationLevel: 'light' | 'medium' | 'heavy', currentPace: RevisitPace) => {
    if (fixationLevel === 'heavy') return 1;
    const cappedCount = Math.min(successCount, 6);
    const base = cappedCount >= 6 ? 45 : (BASE_INTERVALS[cappedCount] || 1);
    let interval = base * PACE_MULTIPLIERS[currentPace];
    if (fixationLevel === 'medium') interval *= 0.7;
    return Math.max(1, Math.round(interval));
  }, []);

  const logPractice = useCallback((
    patternId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    fixationLevel: 'light' | 'medium' | 'heavy',
    problemName?: string
  ) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const event: PracticeEvent = { id: generateId(), date: today, patternId, difficulty, fixationLevel, problemName };
    setEvents(prev => [...prev, event]);

    // Optionally add problem
    if (problemName?.trim()) {
      const problem: Problem = { id: generateId(), patternId, name: problemName.trim(), date: today };
      setProblems(prev => [...prev, problem]);
    }

    // Increment success count
    setPatterns(prev => prev.map(p =>
      p.id === patternId ? { ...p, successCount: p.successCount + 1 } : p
    ));

    // Remove old scheduled for this pattern
    setScheduled(prev => prev.filter(s => s.patternId !== patternId));

    // Get updated success count
    const pattern = patterns.find(p => p.id === patternId);
    const newSuccess = (pattern?.successCount || 0) + 1;
    const daysUntil = computeNextDate(newSuccess, fixationLevel, pace);
    const nextDate = format(addDays(new Date(), daysUntil), 'yyyy-MM-dd');

    const occurrence: ScheduledOccurrence = {
      id: generateId(),
      date: nextDate,
      patternId,
      autoGenerated: true,
    };
    setScheduled(prev => [...prev, occurrence]);

    return { event, occurrence };
  }, [patterns, pace, computeNextDate]);

  const skipToday = useCallback((patternId: string) => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    setScheduled(prev => {
      const filtered = prev.filter(s => s.patternId !== patternId);
      return [...filtered, { id: generateId(), date: tomorrow, patternId, autoGenerated: true }];
    });
  }, []);

  const getTodayScheduled = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return scheduled
      .filter(s => s.date <= today)
      .map(s => ({
        ...s,
        pattern: patterns.find(p => p.id === s.patternId),
        path: paths.find(pa => pa.id === patterns.find(p => p.id === s.patternId)?.pathId),
      }));
  }, [scheduled, patterns, paths]);

  const getScheduledForDate = useCallback((date: string) => {
    return scheduled
      .filter(s => s.date === date)
      .map(s => ({
        ...s,
        pattern: patterns.find(p => p.id === s.patternId),
        path: paths.find(pa => pa.id === patterns.find(p => p.id === s.patternId)?.pathId),
      }));
  }, [scheduled, patterns, paths]);

  const getEventsForDate = useCallback((date: string) => {
    return events
      .filter(e => e.date === date)
      .map(e => ({
        ...e,
        pattern: patterns.find(p => p.id === e.patternId),
        path: paths.find(pa => pa.id === patterns.find(p => p.id === e.patternId)?.pathId),
      }));
  }, [events, patterns, paths]);

  return {
    paths, patterns, problems, events, scheduled, pace,
    addPath, addPattern, deletePattern, addProblem,
    getProblemsForPattern, searchPatterns,
    logPractice, skipToday,
    getTodayScheduled, getScheduledForDate, getEventsForDate, setPace,
  };
}
