require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('schemes').select('*');
  console.log(JSON.stringify(data, null, 2));
  const { data: m } = await supabase.from('members').select('*').eq('family_id', 'GUJ-2026-8153');
  console.log(JSON.stringify(m, null, 2));
}
run();