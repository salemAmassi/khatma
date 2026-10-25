import { useEffect, useState } from 'react';
import { useKhatma } from './useKhatma';
import { Avatar, Icon } from './ui';
import Home from './Home';
import Surahs from './Surahs';
import Juz from './Juz';
import History from './History';
import Settings from './Settings';

const TABS = [
  { id: 'home', label: 'الرئيسية', icon: 'home' },
  { id: 'surahs', label: 'السور', icon: 'book' },
  { id: 'juz', label: 'الأجزاء', icon: 'grid' },
  { id: 'history', label: 'السجل', icon: 'history' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings' },
];

export default function App() {
  const data = useKhatma();
  const [meId, setMeId] = useState(() => Number(localStorage.getItem('khatma.reader')) || null);
  const [tab, setTab] = useState('home');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (data.error) {
      setToast(data.error);
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [data.error]);

  const choose = (id) => {
    localStorage.setItem('khatma.reader', String(id));
    setMeId(id);
    setTab('home');
  };
  const switchReader = () => {
    localStorage.removeItem('khatma.reader');
    setMeId(null);
  };

  if (data.loading) {
    return (
      <div className="app">
        <div className="loading"><div className="spinner" />جارٍ التحميل…</div>
      </div>
    );
  }

  if (!data.readers.length) {
    return <div className="app"><div className="loading">لم يتم العثور على القرّاء. تأكد من إعداد قاعدة البيانات.</div></div>;
  }

  const me = data.readers.find((r) => r.id === meId);

  if (!me) {
    return (
      <div className="app">
        <div className="pick fade-in">
          <div>
            <img src="/icon.svg" alt="" width="72" height="72" style={{ borderRadius: 18 }} />
            <h1 style={{ marginTop: 12 }}>ختمتنا</h1>
            <p className="muted">متابعة ختم القرآن الكريم معاً</p>
            <p className="quran" style={{ fontSize: '1.2rem', color: 'var(--green)' }}>﴿ وَقُرْآنًا فَرَقْنَاهُ لِتَقْرَأَهُ عَلَى النَّاسِ عَلَىٰ مُكْثٍ ﴾</p>
          </div>
          <div>
            <p className="muted" style={{ marginBottom: 12 }}>من يقرأ الآن؟</p>
            <div className="pick-grid">
              {data.readers.map((r) => (
                <button className="pick-card" key={r.id} onClick={() => choose(r.id)} style={{ borderColor: r.color + '55' }}>
                  <Avatar reader={r} lg />
                  <b>{r.name}</b>
                  <span className="small muted">{data.stats[r.id].percent}% من الختمة</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const partner = data.readers.find((r) => r.id !== me.id) || null;
  const common = { ...data, me, partner };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="/icon.svg" alt="" />
          <div>
            <h1>ختمتنا</h1>
            <div className="quran">متابعة ختم القرآن الكريم</div>
          </div>
        </div>
        <button className="reader-chip" onClick={switchReader} title="تبديل القارئ">
          <Avatar reader={me} />
          <span><b>{me.name}</b><br /><span className="small muted">تبديل</span></span>
        </button>
      </header>

      <main>
        {tab === 'home' && <Home {...common} />}
        {tab === 'surahs' && <Surahs {...common} />}
        {tab === 'juz' && <Juz {...common} />}
        {tab === 'history' && <History {...common} />}
        {tab === 'settings' && <Settings {...common} onSwitch={switchReader} />}
      </main>

      <nav className="tabs">
        <div className="tabs-inner">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
