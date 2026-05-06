import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const POPULAR_ALBUMS = [
  '13217438', // OK Computer
  '9856554',  // TPAB
  '302127',   // Discovery
  '97092142', // IGOR
  '54010372', // The Dark Side of the Moon
];

async function seed() {
  console.log('🌱 Starting database seed...');

  const users = [];
  for (let i = 0; i < 20; i++) {
    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: faker.internet.email(),
      password: 'password123',
      email_confirm: true
    });
    
    if (authErr) {
      console.log('Auth Error:', authErr.message);
      continue;
    }

    const userId = authData.user.id;

    // 2. Create profile
    const { data: profile, error: profErr } = await supabase.from('profiles').insert({
      id: userId,
      username: faker.internet.username(),
      avatar_url: faker.image.avatar(),
    }).select().single();
    
    if (profErr) {
      console.log('Profile Error:', profErr.message);
      continue;
    }
    
    if (profile) users.push(profile);
  }
  
  console.log(`✅ Created ${users.length} dummy users.`);

  for (const albumId of POPULAR_ALBUMS) {
    for (const user of users) {
      if (Math.random() > 0.3) {
        const score = faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 });
        await supabase.from('ratings').insert({
          user_id: user.id,
          api_item_id: albumId,
          type: 'album',
          score,
        });

        if (Math.random() > 0.5) {
          await supabase.from('reviews').insert({
            user_id: user.id,
            api_item_id: albumId,
            type: 'album',
            content: faker.lorem.paragraph({ min: 1, max: 3 }),
          });
        }
      }
    }
  }
  console.log('✅ Seeded ratings and reviews for top albums.');
  console.log('🎉 Seeding complete!');
}

seed().catch(console.error);
