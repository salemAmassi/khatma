import { useMemo, useState } from 'react';
import { Bar, ar } from './ui';
import { fmtShort } from './useKhatma';
import { TYPE_LABEL } from './quranData';

export default function Surahs({ me, partner, stats, reads, khatmas, setPages, togglePage, busy }) {
  const s = stats[me.id];
  const myReads = reads[me.id] || new Map();
  const partnerReads = partner ? reads[partner.id] || new Map() : new Map();
  const partnerStats = partner ? stats[partner.id] : null;
  const locked = !!khatmas[me.id]?.completed_at;

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all'); // all | none | partial | done
  const [open, setOpen] = useState(null);

  const list = useMemo(() => {
    let L = s.surahs;
    if (filter !== 'all') L = L.filter((x) => x.status === filter);
    if (q.trim()) {
      const t = q.trim();
      L = L.filter((x) => x.name.includes(t) || String(x.number) === t);
    }
    return L;
  }, [s.surahs, filter, q]);

  const counts = {
    done: s.surahs.filter((x) => x.status === 'done').length,
    partial: s.surahs.filter((x) => x.status === 'partial').length,
    none: s.surahs.filter((x) => x.status === 'none').length,
  };

  return (
    <div className="fade-in">
      <div className="toolbar">
        <input type="text" placeholder="ابحث باسم السورة أو رقمها…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="seg">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>الكل</button>
          <button className={filter === 'none' ? 'active' : ''} onClick={() => setFilter('none')}>لم تُقرأ ({counts.none})</button>
          <button className={filter === 'partial' ? 'active' : ''} onClick={() => setFilter('partial')}>جارية ({counts.partial})</button>
          <button className={filter === 'done' ? 'active' : ''} onClick={() => setFilter('done')}>مكتملة ({counts.done})</button>
        </div>
      </div>

      {locked && (
        <div className="banner" style={{ marginBottom: 12 }}>
          هذه الختمة مكتملة ✓ — ابدأ ختمة جديدة من الرئيسية لتسجيل قراءة جديدة.
        </div>
      )}

      {list.map((x) => {
        const isOpen = open === x.number;
        const pStatus = partnerStats?.surahs[x.number - 1];
        return (
          <div className={`surah ${x.status}`} key={x.number}>
            <button className="surah-head" onClick={() => setOpen(isOpen ? null : x.number)}>
              <span className="surah-no num">{x.number}</span>
              <span>
                <span className="surah-name">
                  <span className="quran">{x.name}</span>
                  <span className="surah-meta">{TYPE_LABEL[x.type]} · {ar(x.ayahs)} آية</span>
                </span>
                <span className="surah-meta num">
                  {x.total === 1 ? `صفحة ${ar(x.start)}` : `الصفحات ${ar(x.start)}–${ar(x.end)}`}
                  {x.completedAt && <> · اكتملت {fmtShort(x.completedAt)}</>}
                </span>
              </span>
              <span className="surah-right">
                <span className="num">{x.status === 'done' ? '✓ مكتملة' : `${ar(x.done)}/${ar(x.total)}`}</span>
                <Bar value={(x.done / x.total) * 100} color={me.color} thin />
                {partner && pStatus && (
                  <span style={{ color: partner.color }} className="num">
                    {partner.name}: {pStatus.status === 'done' ? '✓' : `${pStatus.done}/${pStatus.total}`}
                  </span>
                )}
              </span>
            </button>

            {isOpen && (
              <div className="surah-body fade-in">
                <div className="pages">
                  {x.pages.map((p) => {
                    const on = myReads.has(p);
                    const pr = partnerReads.has(p);
                    const t = myReads.get(p);
                    return (
                      <button
                        key={p}
                        className={`page ${on ? 'on' : ''} ${pr ? 'partner' : ''}`}
                        style={{ '--partner': partner?.color }}
                        disabled={busy || locked}
                        title={on ? `قرأتها ${fmtShort(t)}` : 'لم تُقرأ'}
                        onClick={() => togglePage(me.id, p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <div className="row between">
                  <div className="legend">
                    <span><i style={{ background: me.color }} />قرأتها</span>
                    {partner && <span><i style={{ background: '#fff', border: '1px solid var(--line)', boxShadow: `inset 0 -3px 0 ${partner.color}` }} />قرأها {partner.name}</span>}
                  </div>
                  {!locked && (
                    <div className="row">
                      <button className="btn sm" disabled={busy || x.status === 'done'} onClick={() => setPages(me.id, x.pages, true)}>
                        ✓ قرأت السورة كاملة
                      </button>
                      {x.done > 0 && (
                        <button className="btn sm danger" disabled={busy} onClick={() => setPages(me.id, x.pages, false)}>
                          إلغاء
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {list.length === 0 && <p className="muted" style={{ textAlign: 'center' }}>لا توجد سور مطابقة.</p>}
      <p className="small muted" style={{ textAlign: 'center', marginTop: 16 }}>
        ترقيم الصفحات بحسب مصحف المدينة النبوية (604 صفحة). الصفحة التي تبدأ فيها سورة جديدة تُحسب للسورة الجديدة.
      </p>
    </div>
  );
}
