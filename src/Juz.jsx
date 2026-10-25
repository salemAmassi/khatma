import { Bar, ar } from './ui';
import { surahsOfPage } from './quranData';

export default function Juz({ me, partner, stats, khatmas, setPages, busy }) {
  const s = stats[me.id];
  const ps = partner ? stats[partner.id] : null;
  const locked = !!khatmas[me.id]?.completed_at;
  const doneCount = s.juz.filter((j) => j.done === j.total).length;

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between">
          <h2 style={{ fontSize: '1.05rem' }}>الأجزاء المكتملة</h2>
          <b className="num" style={{ color: me.color, fontSize: '1.3rem' }}>{ar(doneCount)} / 30</b>
        </div>
        <Bar value={(doneCount / 30) * 100} color={me.color} />
      </div>

      <div className="juz-grid">
        {s.juz.map((j) => {
          const first = surahsOfPage(j.start)[0];
          const pct = (j.done / j.total) * 100;
          const pj = ps?.juz[j.number - 1];
          const full = j.done === j.total;
          return (
            <div className="juz" key={j.number} style={full ? { borderColor: me.color } : undefined}>
              <b>الجزء {ar(j.number)} {full && '✓'}</b>
              <div className="small muted quran">يبدأ بسورة {first?.name}</div>
              <div className="small muted num">الصفحات {ar(j.start)}–{ar(j.end)}</div>
              <div style={{ margin: '8px 0 6px' }}><Bar value={pct} color={me.color} thin /></div>
              <div className="row between small muted num">
                <span>{ar(j.done)}/{ar(j.total)}</span>
                {pj && <span style={{ color: partner.color }}>{partner.name}: {ar(pj.done)}/{ar(pj.total)}</span>}
              </div>
              {!locked && !full && (
                <button className="btn sm ghost block" style={{ marginTop: 8 }} disabled={busy}
                  onClick={() => {
                    const pages = [];
                    for (let p = j.start; p <= j.end; p++) pages.push(p);
                    setPages(me.id, pages, true);
                  }}>
                  ✓ قرأت الجزء كاملاً
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
