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

// Compatibilidade: retorna interface similar ao sql.js
// mas usando Supabase por baixo
const db = {
  supabase: () => getDb(),
};

module.exports = db;
module.exports.initDb = async () => {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  console.log('✅ Supabase conectado');
  return supabase;
};
