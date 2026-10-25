import { useState } from 'react';
import { Avatar, Bar, Ring, ar } from './ui';
import { fmtDate, fmtWeekday, fmtShort } from './useKhatma';
import { surahsOfPage, juzOfPage, TOTAL_PAGES } from './quranData';

export default function Home({ me, partner, readers, stats, khatmas, markUpTo, togglePage, startNewKhatma, busy }) {
  const s = stats[me.id];
  const k = khatmas[me.id];
  const [upTo, setUpTo] = useState('');

  const next = s.nextPage;
  const nextSurahs = next ? surahsOfPage(next) : [];

  const submitUpTo = (e) => {
    e.preventDefault();
    const p = Number(upTo);
    if (p >= 1 && p <= TOTAL_PAGES) { markUpTo(me.id, p); setUpTo(''); }
  };

  return (
    <div className="fade-in">
      {k?.completed_at && (
        <div className="banner section">
          <h3>🎉 مبارك يا {me.name}، {me.gender === 'f' ? 'أتممتِ' : 'أتممتَ'} الختمة رقم {ar(k.number)}</h3>
          <p className="muted small" style={{ margin: '0 0 10px' }}>
            بدأت {fmtDate(k.started_at)} واكتملت {fmtDate(k.completed_at)}
          </p>
          <button className="btn gold" disabled={busy} onClick={() => startNewKhatma(me.id)}>
            بدء ختمة جديدة
          </button>
        </div>
      )}

      {/* بطاقتي */}
      <div className="card section">
        <div className="card-title">
          <div className="row">
            <Avatar reader={me} />
            <div>
              <h2>{me.name}</h2>
              <div className="muted small">الختمة رقم {ar(k?.number || 1)} · بدأت {fmtShort(k?.started_at)}</div>
            </div>
          </div>
        </div>

        <div className="row" style={{ gap: 18, alignItems: 'center' }}>
          <Ring percent={s.percent} color={me.color} label={`${ar(s.pagesRead)} / ${ar(TOTAL_PAGES)} صفحة`} />
          <div style={{ flex: 1, minWidth: 180 }}>
            {next ? (
              <div className="next-page">
                <div className="big num">{ar(next)}</div>
                <div>
                  <div className="small muted">الصفحة التالية</div>
                  <div className="quran" style={{ fontSize: '1.05rem' }}>
                    {nextSurahs.map((x) => `سورة ${x.name}`).join(' · ')}
                  </div>
                  <div className="small muted">الجزء {ar(juzOfPage(next))}</div>
                </div>
              </div>
            ) : (
              <div className="next-page"><div>✨ قرأت المصحف كاملاً في هذه الختمة</div></div>
            )}
            {!k?.completed_at && next && (
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn sm" disabled={busy} onClick={() => togglePage(me.id, next)}>
                  ✓ قرأت صفحة {ar(next)}
                </button>
                <form className="row" onSubmit={submitUpTo} style={{ gap: 6 }}>
                  <span className="small muted">وصلت إلى</span>
                  <input type="number" min="1" max={TOTAL_PAGES} value={upTo} onChange={(e) => setUpTo(e.target.value)} placeholder="صفحة" />
                  <button className="btn sm ghost" type="submit" disabled={busy || !upTo}>تحديد</button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="stats">
          <div className="stat"><b className="num">{ar(s.todayPages)} <span style={{ fontSize: '0.8rem' }}>/ {ar(me.daily_goal)}</span></b><span>وِرد اليوم</span></div>
          <div className="stat"><b className="num">{ar(s.streak)} 🔥</b><span>أيام متواصلة</span></div>
          <div className="stat"><b className="num">{ar(s.surahsDone)}</b><span>سورة مكتملة</span></div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="row between small muted" style={{ marginBottom: 4 }}>
            <span>وِرد اليوم</span>
            <span className="num">{s.todayPages >= me.daily_goal ? (me.gender === 'f' ? 'أتممتِ وِردكِ اليوم ✓' : 'أتممتَ وِردك اليوم ✓') : `بقي ${ar(me.daily_goal - s.todayPages)} صفحة`}</span>
          </div>
          <Bar value={(s.todayPages / me.daily_goal) * 100} color={s.todayPages >= me.daily_goal ? 'var(--gold)' : me.color} thin />
        </div>

        <p className="small muted" style={{ margin: '12px 0 0' }}>
          {s.remaining > 0 && (
            <>
              بقي {ar(s.remaining)} صفحة.{' '}
              {s.daysLeft
                ? <>بمعدلك الحالي ({s.avgPerDay.toFixed(1)} صفحة/يوم) ستختم بعد نحو {ar(s.daysLeft)} يوماً</>
                : <>بالتزامك بالهدف ({ar(me.daily_goal)} صفحات/يوم) ستختم بعد {ar(s.daysLeftAtGoal)} يوماً</>}
              {s.lastReadAt && <> · آخر قراءة {fmtShort(s.lastReadAt)}</>}
            </>
          )}
        </p>
      </div>

      {/* المقارنة */}
      <div className="card section">
        <div className="card-title"><h2>معاً نحو الختمة</h2></div>
        <div className="grid-2">
          {readers.map((r) => {
            const st = stats[r.id];
            const kk = khatmas[r.id];
            return (
              <div key={r.id}>
                <div className="row between" style={{ marginBottom: 6 }}>
                  <div className="row"><Avatar reader={r} /><b>{r.name}</b></div>
                  <span className="small muted num">ختمة {ar(kk?.number || 1)} · {st.percent}%</span>
                </div>
                <Bar value={st.percent} color={r.color} />
                <div className="row between small muted" style={{ marginTop: 4 }}>
                  <span className="num">{ar(st.pagesRead)} صفحة · {ar(st.surahsDone)} سورة</span>
                  <span className="num">اليوم {ar(st.todayPages)} · 🔥 {ar(st.streak)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="small muted" style={{ marginTop: 18, fontWeight: 700 }}>الصفحات المقروءة في آخر 7 أيام</h3>
        <WeekChart readers={readers} stats={stats} />
        <div className="legend" style={{ marginTop: 8, justifyContent: 'center' }}>
          {readers.map((r) => (
            <span key={r.id}><i style={{ background: r.color }} />{r.name} ({ar(stats[r.id].weekTotal)} صفحة هذا الأسبوع)</span>
          ))}
        </div>
        <Encouragement me={me} partner={partner} stats={stats} />
      </div>
    </div>
  );
}

function WeekChart({ readers, stats }) {
  const max = Math.max(1, ...readers.flatMap((r) => stats[r.id].last7.map((d) => d.pages)));
  const days = stats[readers[0].id].last7;
  return (
    <div className="chart">
      {days.map((d, i) => (
        <div className="day" key={d.key}>
          <div className="bars">
            {readers.map((r) => {
              const v = stats[r.id].last7[i].pages;
              return (
                <span key={r.id} title={`${r.name}: ${v}`}
                  style={{ height: `${(v / max) * 100}%`, background: r.color, opacity: v ? 1 : 0.25 }} />
              );
            })}
          </div>
          <div className="lbl">{i === 6 ? 'اليوم' : fmtWeekday(d.key + 'T12:00:00')}</div>
        </div>
      ))}
    </div>
  );
}

function Encouragement({ me, partner, stats }) {
  if (!partner) return null;
  const a = stats[me.id], b = stats[partner.id];
  const pf = partner.gender === 'f'; // صيغة المؤنث للطرف الآخر
  const mf = me.gender === 'f';
  let msg;
  if (a.todayPages === 0 && b.todayPages > 0)
    msg = `${partner.name} ${pf ? 'قرأت' : 'قرأ'} ${ar(b.todayPages)} صفحة اليوم — ${mf ? 'انضمي' : 'انضم'} ${pf ? 'إليها' : 'إليه'} بصفحة الآن 🌿`;
  else if (a.todayPages > 0 && b.todayPages === 0)
    msg = `ما شاء الله، ${mf ? 'سبقتِ' : 'سبقتَ'} اليوم. ${mf ? 'ذكّري' : 'ذكّر'} ${partner.name} ${pf ? 'بوِردها' : 'بوِرده'} ☺️`;
  else if (a.todayPages > 0 && b.todayPages > 0) msg = 'كلاكما قرأ اليوم — بارك الله فيكما وفي بيتكما 🤍';
  else msg = `لم يقرأ أحدكما بعد اليوم — ${mf ? 'ابدئي' : 'ابدأ'} بصفحة واحدة، والبقية تأتي.`;
  return <p className="small" style={{ margin: '14px 0 0', textAlign: 'center', color: 'var(--green)', fontWeight: 700 }}>{msg}</p>;
}
