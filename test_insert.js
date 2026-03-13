const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oiygctvyeflvmdxwwoui.supabase.co', 'sb_publishable_bXYBGQMd--2mwLNC5MopjA_gm26w5vk');

async function checkEnum() {
  const { data, error } = await supabase.from('users').insert({
    user_id: 'e6a8e63d-4c3e-4f51-a20c-c7f999dbb0ff', 
    email: 'fake@example.com',
    name: 'Fake',
    role: 'citizen',
    phone: '123'
  });
  console.log(data, error);
}

checkEnum();
