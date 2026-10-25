import { useState } from 'react';
import { Avatar, ar } from './ui';

const COLORS = ['#2f7d6b', '#b5653a', '#3b6ea8', '#8a4f9e', '#c0453c', '#c8a24a', '#2a8a8a', '#6b7a3a'];

export default function Settings({ readers, me, updateReader, onSwitch }) {
  return (
    <div className="fade-in">
      {readers.map((r) => (
        <ReaderSettings key={r.id} reader={r} isMe={r.id === me.id} updateReader={updateReader} />
      ))}

      <div className="card section">
        <div className="card-title"><h2>الجهاز</h2></div>
        <p className="small muted" style={{ marginTop: 0 }}>
          أنت تستخدم الموقع الآن باسم <b>{me.name}</b>. يحفظ الجهاز اختيارك تلقائياً.
        </p>
        <button className="btn ghost" onClick={onSwitch}>تبديل القارئ</button>
      </div>

      <div className="card section small muted">
        <div className="card-title"><h2 style={{ color: 'var(--ink)' }}>عن الموقع</h2></div>
        <p style={{ margin: '0 0 6px' }}>تُحفظ البيانات في قاعدة بيانات مشتركة (Supabase) وتظهر فوراً على جهازَي الزوجين.</p>
        <p style={{ margin: 0 }}>ترقيم الصفحات بحسب مصحف المدينة النبوية (604 صفحة، 30 جزءاً، 114 سورة).</p>
      </div>
    </div>
  );
}

function ReaderSettings({ reader, isMe, updateReader }) {
  const [name, setName] = useState(reader.name);
  const [goal, setGoal] = useState(reader.daily_goal);

  const save = (e) => {
    e.preventDefault();
    const patch = {};
    if (name.trim() && name.trim() !== reader.name) patch.name = name.trim();
    const g = Number(goal);
    if (g >= 1 && g <= 100 && g !== reader.daily_goal) patch.daily_goal = g;
    if (Object.keys(patch).length) updateReader(reader.id, patch);
  };

  return (
    <form className="card section" onSubmit={save}>
      <div className="card-title">
        <div className="row"><Avatar reader={reader} /><h2>{reader.name} {isMe && <span className="small muted">(أنا)</span>}</h2></div>
      </div>
      <div className="row" style={{ gap: 14 }}>
        <label className="small muted">
          الاسم<br />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
        </label>
        <label className="small muted">
          الوِرد اليومي (صفحات)<br />
          <input type="number" min="1" max="100" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </label>
        <label className="small muted">
          الصيغة<br />
          <select value={reader.gender} onChange={(e) => updateReader(reader.id, { gender: e.target.value })}>
            <option value="m">مذكّر</option>
            <option value="f">مؤنّث</option>
          </select>
        </label>
      </div>
      <div className="small muted" style={{ margin: '12px 0 6px' }}>اللون</div>
      <div className="row">
        {COLORS.map((c) => (
          <button type="button" key={c} onClick={() => updateReader(reader.id, { color: c })}
            style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: reader.color === c ? '3px solid var(--ink)' : '3px solid transparent' }}
            aria-label={c} />
        ))}
      </div>
      <p className="small muted" style={{ margin: '10px 0 0' }}>
        بوِرد {ar(goal || 1)} صفحات يومياً تُختم في نحو {ar(Math.ceil(604 / (Number(goal) || 1)))} يوماً.
      </p>
      <button className="btn sm" type="submit" style={{ marginTop: 10 }}>حفظ</button>
    </form>
  );
}
