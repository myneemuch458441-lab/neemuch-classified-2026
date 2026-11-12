import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  activeNow: number;
  lastUpdated: string;
}

// Fixed baseline anchor date: 1 October 2026, starting at 1,280 base visits
const BASE_ANCHOR_TIME = new Date('2026-10-01T00:00:00Z').getTime();
const BASE_ANCHOR_COUNT = 1280;

/**
 * Returns deterministic daily increment between 15 and 20 for any date string 'YYYY-MM-DD'
 * Ensures 15 to 20 visits are added every single day automatically.
 */
export function getDailyIncrementForDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  // Yields integer between 15 and 20
  return 15 + (Math.abs(hash) % 6);
}

/**
 * Calculates theoretical minimum total visitors and today's visitors based on elapsed days.
 * Every day elapsed strictly increments count by 15-20 automatically.
 */
export function calculateBaselineStats(now: Date = new Date()): { total: number; today: number } {
  const currentUtcTime = now.getTime();
  const daysDiff = Math.max(0, Math.floor((currentUtcTime - BASE_ANCHOR_TIME) / (1000 * 60 * 60 * 24)));

  let accumulatedTotal = BASE_ANCHOR_COUNT;
  const tempDate = new Date(BASE_ANCHOR_TIME);

  for (let i = 0; i < daysDiff; i++) {
    const dStr = tempDate.toISOString().slice(0, 10);
    accumulatedTotal += getDailyIncrementForDate(dStr);
    tempDate.setUTCDate(tempDate.getUTCDate() + 1);
  }

  // Today's portion (progressively accumulated throughout 24 hours + minimum 6)
  const todayStr = now.toISOString().slice(0, 10);
  const todayTarget = getDailyIncrementForDate(todayStr); // 15 to 20
  const hoursFraction = (now.getUTCHours() * 60 + now.getUTCMinutes()) / 1440;
  const todayPortion = Math.max(4, Math.min(todayTarget, Math.floor(todayTarget * hoursFraction) + 4));

  return {
    total: accumulatedTotal + todayPortion,
    today: todayPortion
  };
}

const LOCAL_STORAGE_KEY = 'neemuch_visitor_stats';
const LOCAL_SESSION_KEY = 'neemuch_session_visited_today';

export function getLocalVisitorStats(): VisitorStats {
  const baseline = calculateBaselineStats();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        totalVisitors: Math.max(baseline.total, Number(parsed.totalVisitors) || baseline.total),
        todayVisitors: Math.max(baseline.today, Number(parsed.todayVisitors) || baseline.today),
        activeNow: Math.floor(Math.random() * 3) + 2, // 2-4 online
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (e) {
    console.warn('Local visitor cache read error:', e);
  }

  return {
    totalVisitors: baseline.total,
    todayVisitors: baseline.today,
    activeNow: 3,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Real-time listener for visitor statistics in Firestore with localStorage fallback
 */
export function subscribeToVisitorStats(callback: (stats: VisitorStats) => void): () => void {
  const baseline = calculateBaselineStats();
  const initialLocal = getLocalVisitorStats();
  callback(initialLocal);

  const docRef = doc(db, 'siteStats', 'visitors');

  let activeCount = Math.floor(Math.random() * 3) + 2;

  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const firestoreTotal = Number(data.totalVisitors) || 0;
        const firestoreToday = Number(data.todayVisitors) || 0;

        // Ensure total is at least baseline (never drops below 15-20/day growth)
        const finalTotal = Math.max(baseline.total, firestoreTotal);
        const finalToday = Math.max(baseline.today, firestoreToday);

        const currentStats: VisitorStats = {
          totalVisitors: finalTotal,
          todayVisitors: finalToday,
          activeNow: activeCount,
          lastUpdated: data.lastUpdated || new Date().toISOString()
        };

        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentStats));
        } catch {}

        callback(currentStats);
      } else {
        // Initialize doc in Firestore
        const initStats: VisitorStats = {
          totalVisitors: baseline.total,
          todayVisitors: baseline.today,
          activeNow: activeCount,
          lastUpdated: new Date().toISOString()
        };
        setDoc(docRef, initStats).catch((e) => {
          console.warn('Initial siteStats creation failed, using baseline:', e);
        });
        callback(initStats);
      }
    },
    (error) => {
      console.warn('Firestore visitor count listen error, using local baseline:', error);
      callback(initialLocal);
    }
  );

  // Periodically fluctuate active live visitors gently (e.g. 2 to 5 users)
  const interval = setInterval(() => {
    activeCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    const cached = getLocalVisitorStats();
    callback({
      ...cached,
      activeNow: activeCount
    });
  }, 12000);

  return () => {
    unsubscribe();
    clearInterval(interval);
  };
}

/**
 * Record a visit when user enters the app.
 * If user hasn't visited today, increments total and today's visitor count in Firestore.
 */
export async function recordVisitorHit(): Promise<void> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const baseline = calculateBaselineStats();

  // Check if session already recorded today
  const lastSessionDate = sessionStorage.getItem(LOCAL_SESSION_KEY);
  const isNewSessionToday = lastSessionDate !== todayStr;

  try {
    const docRef = doc(db, 'siteStats', 'visitors');
    const snap = await getDoc(docRef);

    let nextTotal = baseline.total;
    let nextToday = baseline.today;

    if (snap.exists()) {
      const data = snap.data();
      const currentDocTotal = Number(data.totalVisitors) || baseline.total;
      const currentDocDate = data.lastDate || '';
      const isSameDate = currentDocDate === todayStr;

      // Base total is always at least the cumulative daily increment
      nextTotal = Math.max(baseline.total, currentDocTotal);
      nextToday = isSameDate ? Math.max(baseline.today, Number(data.todayVisitors) || baseline.today) : baseline.today;

      if (isNewSessionToday) {
        nextTotal += 1;
        nextToday += 1;
      }
    } else {
      if (isNewSessionToday) {
        nextTotal += 1;
        nextToday += 1;
      }
    }

    sessionStorage.setItem(LOCAL_SESSION_KEY, todayStr);

    const payload = {
      totalVisitors: nextTotal,
      todayVisitors: nextToday,
      activeNow: Math.floor(Math.random() * 3) + 2,
      lastDate: todayStr,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.warn('Could not update Firestore visitor count, saving local:', err);
    sessionStorage.setItem(LOCAL_SESSION_KEY, todayStr);
    const updated = {
      totalVisitors: baseline.total + 1,
      todayVisitors: baseline.today + 1,
      activeNow: 3,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
}
