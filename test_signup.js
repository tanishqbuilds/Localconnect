const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oiygctvyeflvmdxwwoui.supabase.co', 'sb_publishable_bXYBGQMd--2mwLNC5MopjA_gm26w5vk');

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: {
        name: 'Test User',
        role: 'citizen',
        phone: '1234567890'
      }
    }
  });
  console.log('Signup result:', JSON.stringify({ data, error }, null, 2));
  process.exit(0);
}

testSignup();
