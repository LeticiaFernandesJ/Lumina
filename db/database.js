const { createClient } = require('@supabase/supabase-js');
let supabase = null;

function getDb() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return supabase;
}

const db = {
  supabase: () => getDb(),
};

module.exports = db;

module.exports.initDb = async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  console.log('URL ok?', !!url, '| KEY ok?', !!key);
  console.log('URL valor:', url);

  supabase = createClient(url, key);

  const { data, error } = await supabase.from('users').select('count').limit(1);
  console.log('Teste query:', { data, error: error?.message });

  console.log('✅ Supabase conectado');
  return supabase;
};
