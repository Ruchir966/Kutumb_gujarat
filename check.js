require('dotenv').config({ path: 'c:/Kutumb_Gujarat/backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('schemes').select('*');
  console.log(JSON.stringify(data, null, 2));
}
run();