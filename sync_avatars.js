const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: { schema: 'public' },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: ws,
    },
  }
);

async function sync() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  for (const user of users.users) {
    if (user.user_metadata?.avatar_url) {
      await supabase.from('profiles').update({ avatar_url: user.user_metadata.avatar_url }).eq('id', user.id);
      console.log(`Updated ${user.email}`);
    }
  }
}
sync();
