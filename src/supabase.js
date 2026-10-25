import { createClient } from '@supabase/supabase-js';

// المفتاح العام (anon/publishable) آمن للنشر في المتصفح.
// يمكن تغييرهما من متغيرات البيئة في Vercel دون تعديل الكود.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://tmelgjqkwmbylncfvgva.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zo6Xlv_UNDt8Ef3Sdam9pw_yIGKghOO';

export const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 5 } },
});
