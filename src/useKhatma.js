import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';
import { TOTAL_PAGES, SURAHS, JUZ_START } from './quranData';

// ---------- أدوات التاريخ ----------
export const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const todayKey = () => dayKey(new Date());
const shiftDay = (key, n) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
};

const LOCALE = 'ar-u-nu-latn'; // عربي بأرقام 0-9
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(LOCALE, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
export const fmtShort = (d) =>
  d ? new Date(d).toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' }) : '—';
export const fmtWeekday = (d) => new Date(d).toLocaleDateString(LOCALE, { weekday: 'short' });

// ---------- الحسابات ----------
export function computeStats(reads /* Map page -> read_at */, goal) {
  const pagesRead = reads.size;
  const percent = Math.round((pagesRead / TOTAL_PAGES) * 1000) / 10;

  // صفحات لكل يوم
  const byDay = new Map();
  for (const t of reads.values()) {
    const k = dayKey(t);
    byDay.set(k, (byDay.get(k) || 0) + 1);
  }
  const today = todayKey();
  const todayPages = byDay.get(today) || 0;

  // الأيام المتواصلة (تُحسب من اليوم، أو من أمس إذا لم يُقرأ اليوم بعد)
  let streak = 0;
  let cursor = byDay.has(today) ? today : shiftDay(today, -1);
  while (byDay.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }

  // آخر 7 أيام
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const k = shiftDay(today, -i);
    last7.push({ key: k, pages: byDay.get(k) || 0 });
  }
  const weekTotal = last7.reduce((a, b) => a + b.pages, 0);
  const avgPerDay = weekTotal / 7;
  const remaining = TOTAL_PAGES - pagesRead;
  const daysLeft = avgPerDay > 0 ? Math.ceil(remaining / avgPerDay) : null;
  const daysLeftAtGoal = Math.ceil(remaining / goal);

  // أول صفحة غير مقروءة
  let nextPage = null;
  for (let p = 1; p <= TOTAL_PAGES; p++) if (!reads.has(p)) { nextPage = p; break; }

  // حالة كل سورة
  const surahs = SURAHS.map((s) => {
    let done = 0;
    let last = null;
    for (const p of s.pages) {
      const t = reads.get(p);
      if (t) { done++; if (!last || t > last) last = t; }
    }
    return {
      ...s,
      done,
      total: s.pages.length,
      status: done === 0 ? 'none' : done === s.pages.length ? 'done' : 'partial',
      completedAt: done === s.pages.length ? last : null,
    };
  });
  const surahsDone = surahs.filter((s) => s.status === 'done').length;

  // حالة كل جزء
  const juz = JUZ_START.map((start, i) => {
    const end = i < 29 ? JUZ_START[i + 1] - 1 : TOTAL_PAGES;
    let done = 0;
    for (let p = start; p <= end; p++) if (reads.has(p)) done++;
    return { number: i + 1, start, end, done, total: end - start + 1 };
  });

  return {
    pagesRead, percent, todayPages, streak, last7, weekTotal, avgPerDay,
    remaining, daysLeft, daysLeftAtGoal, nextPage, surahs, surahsDone, juz,
    lastReadAt: reads.size ? [...reads.values()].sort().at(-1) : null,
  };
}

// ---------- الخطاف الرئيسي ----------
export function useKhatma() {
  const [readers, setReaders] = useState([]);
  const [khatmas, setKhatmas] = useState({}); // reader_id -> أحدث ختمة
  const [reads, setReads] = useState({}); // reader_id -> Map(page -> read_at)
  const [history, setHistory] = useState({}); // reader_id -> [ختمات مكتملة]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const reloadTimer = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data: rs, error: e1 } = await supabase.from('readers').select('*').order('id');
      if (e1) throw e1;
      const { data: ks, error: e2 } = await supabase
        .from('khatmas').select('*').order('number', { ascending: false });
      if (e2) throw e2;

      const latest = {};
      const hist = {};
      for (const k of ks) {
        if (!latest[k.reader_id]) latest[k.reader_id] = k;
        if (k.completed_at) (hist[k.reader_id] ||= []).push(k);
      }
      // ضمان وجود ختمة لكل قارئ
      for (const r of rs) {
        if (!latest[r.id]) {
          const { data, error } = await supabase
            .from('khatmas').insert({ reader_id: r.id, number: 1 }).select().single();
          if (error) throw error;
          latest[r.id] = data;
        }
      }

      const ids = Object.values(latest).map((k) => k.id);
      const { data: prs, error: e3 } = await supabase
        .from('page_reads').select('khatma_id,page,read_at').in('khatma_id', ids);
      if (e3) throw e3;

      const byReader = {};
      for (const r of rs) byReader[r.id] = new Map();
      const khatmaToReader = Object.fromEntries(Object.values(latest).map((k) => [k.id, k.reader_id]));
      for (const row of prs) byReader[khatmaToReader[row.khatma_id]]?.set(row.page, row.read_at);

      setReaders(rs);
      setKhatmas(latest);
      setReads(byReader);
      setHistory(hist);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // التحديثات الفورية من الطرف الآخر
  useEffect(() => {
    const schedule = () => {
      clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(load, 400);
    };
    const ch = supabase
      .channel('khatma-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_reads' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'khatmas' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'readers' }, schedule)
      .subscribe();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener('focus', onFocus);
      clearTimeout(reloadTimer.current);
    };
  }, [load]);

  // تحديث محلي متفائل ثم إرسال
  const applyLocal = (readerId, pages, on) => {
    setReads((prev) => {
      const m = new Map(prev[readerId]);
      const now = new Date().toISOString();
      for (const p of pages) on ? m.set(p, m.get(p) || now) : m.delete(p);
      return { ...prev, [readerId]: m };
    });
  };

  const checkCompletion = useCallback(async (readerId, mapAfter) => {
    const k = khatmas[readerId];
    if (!k || k.completed_at) return;
    if (mapAfter.size >= TOTAL_PAGES) {
      await supabase.from('khatmas').update({ completed_at: new Date().toISOString() }).eq('id', k.id);
      await load();
    }
  }, [khatmas, load]);

  const setPages = useCallback(async (readerId, pages, on) => {
    const k = khatmas[readerId];
    if (!k || k.completed_at || !pages.length) return;
    const current = reads[readerId] || new Map();
    const target = on ? pages.filter((p) => !current.has(p)) : pages.filter((p) => current.has(p));
    if (!target.length) return;
    applyLocal(readerId, target, on);
    setBusy(true);
    try {
      if (on) {
        const rows = target.map((page) => ({ khatma_id: k.id, page }));
        const { error } = await supabase.from('page_reads').upsert(rows, { onConflict: 'khatma_id,page', ignoreDuplicates: true });
        if (error) throw error;
        const after = new Map(current);
        for (const p of target) after.set(p, 'x');
        await checkCompletion(readerId, after);
      } else {
        const { error } = await supabase.from('page_reads').delete().eq('khatma_id', k.id).in('page', target);
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      applyLocal(readerId, target, !on); // تراجع
    } finally {
      setBusy(false);
    }
  }, [khatmas, reads, checkCompletion]);

  const togglePage = useCallback((readerId, page) => {
    const on = !(reads[readerId]?.has(page));
    return setPages(readerId, [page], on);
  }, [reads, setPages]);

  const markUpTo = useCallback((readerId, page) => {
    const pages = [];
    for (let p = 1; p <= page; p++) pages.push(p);
    return setPages(readerId, pages, true);
  }, [setPages]);

  const startNewKhatma = useCallback(async (readerId) => {
    const k = khatmas[readerId];
    if (!k || !k.completed_at) return;
    setBusy(true);
    const { error } = await supabase.from('khatmas').insert({ reader_id: readerId, number: k.number + 1 });
    if (error) setError(error.message);
    await load();
    setBusy(false);
  }, [khatmas, load]);

  const updateReader = useCallback(async (readerId, patch) => {
    setReaders((rs) => rs.map((r) => (r.id === readerId ? { ...r, ...patch } : r)));
    const { error } = await supabase.from('readers').update(patch).eq('id', readerId);
    if (error) { setError(error.message); load(); }
  }, [load]);

  const stats = useMemo(() => {
    const out = {};
    for (const r of readers) out[r.id] = computeStats(reads[r.id] || new Map(), r.daily_goal || 4);
    return out;
  }, [readers, reads]);

  return {
    readers, khatmas, reads, history, stats, loading, error, busy,
    togglePage, setPages, markUpTo, startNewKhatma, updateReader, reload: load,
  };
}
