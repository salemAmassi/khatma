import { Avatar, ar } from './ui';
import { fmtDate } from './useKhatma';

const daysBetween = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));

export default function History({ readers, history, khatmas, stats }) {
  const total = readers.reduce((n, r) => n + (history[r.id]?.length || 0), 0);

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 14, textAlign: 'center' }}>
        <div className="muted small">مجموع الختمات المكتملة في بيتكما</div>
        <div style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--gold)', lineHeight: 1.1 }} className="num">{ar(total)}</div>
        <div className="quran muted" style={{ marginTop: 6 }}>﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾</div>
      </div>

      <div className="grid-2">
        {readers.map((r) => {
          const H = history[r.id] || [];
          const cur = khatmas[r.id];
          const st = stats[r.id];
          return (
            <div className="card" key={r.id}>
              <div className="card-title">
                <div className="row"><Avatar reader={r} /><h2>{r.name}</h2></div>
                <span className="small muted num">{ar(H.length)} ختمة مكتملة</span>
              </div>

              {cur && !cur.completed_at && (
                <div className="small" style={{ background: 'var(--bg)', borderRadius: 12, padding: '8px 12px', marginBottom: 10 }}>
                  <b>الختمة {ar(cur.number)} (جارية)</b> — بدأت {fmtDate(cur.started_at)} · {st.percent}% · {ar(st.pagesRead)} صفحة
                </div>
              )}

              {H.length === 0 ? (
                <p className="muted small" style={{ margin: 0 }}>لا توجد ختمات مكتملة بعد — بإذن الله قريباً.</p>
              ) : (
                <ul className="timeline">
                  {H.map((k) => (
                    <li key={k.id}>
                      <span className="medal num">{k.number}</span>
                      <div className="small">
                        <b>الختمة رقم {ar(k.number)}</b>
                        <div className="muted">
                          من {fmtDate(k.started_at)} إلى {fmtDate(k.completed_at)}
                          <br />
                          خلال {ar(daysBetween(k.started_at, k.completed_at))} يوماً
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
