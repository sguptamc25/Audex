import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedSongsDirect() {
  console.log('Seeding songs directly...');

  const { data: users } = await supabase.from('profiles').select('id').limit(20);
  if (!users || users.length === 0) {
    console.log('No users found. Please run the user seed first.');
    return;
  }

  const SONGS = [
    '1440872284', // Alright - Kendrick Lamar
    '1097861834', // Karma Police - Radiohead
    '697194971',  // Harder, Better, Faster, Stronger - Daft Punk
    '1441586576', // EARFQUAKE - Tyler
    '1674233777', // Money - Pink Floyd
  ];

  for (const songId of SONGS) {
    for (const user of users) {
      if (Math.random() > 0.4) {
        await supabase.from('ratings').insert({
          user_id: user.id,
          api_item_id: songId,
          type: 'song',
          score: (Math.floor(Math.random() * 4) + 6) / 2 // Random score 3.0 to 5.0
        });
        
        if (Math.random() > 0.5) {
          await supabase.from('reviews').insert({
            user_id: user.id,
            api_item_id: songId,
            type: 'song',
            content: "An absolute masterpiece. This song changed my life."
          });
        }
      }
    }
  }

  console.log('✅ Directly seeded songs to Supabase!');
}

seedSongsDirect().catch(console.error);
