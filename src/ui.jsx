// عناصر واجهة مشتركة
export function Avatar({ reader, lg }) {
  return (
    <span className={`avatar ${lg ? 'lg' : ''}`} style={{ background: reader.color }}>
      {reader.name.trim().charAt(0)}
    </span>
  );
}

export function Bar({ value, color, thin }) {
  return (
    <div className={`bar ${thin ? 'thin' : ''}`}>
      <span style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

export function Ring({ percent, color, label }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, percent) / 100) * c;
  return (
    <div className="ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg2)" strokeWidth="11" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="11"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="ring-label">
        <div>
          <b className="num">{percent}%</b>
          <br />
          <small>{label}</small>
        </div>
      </div>
    </div>
  );
}

const paths = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  book: 'M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zm16 0a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z',
  grid: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
  history: 'M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7v3l4-4-4-4zm-1 5v5l4 2 .8-1.5-2.8-1.4V8z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.5 4 2-1.5-2-3.5-2.4.8a7 7 0 0 0-1.7-1L16 4H8l-.4 2.8a7 7 0 0 0-1.7 1L3.5 7l-2 3.5 2 1.5v.1l-2 1.4 2 3.5 2.4-.8a7 7 0 0 0 1.7 1L8 20h8l.4-2.8a7 7 0 0 0 1.7-1l2.4.8 2-3.5-2-1.4z',
};
export function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export const ar = (n) => Number(n).toLocaleString('en-US');
