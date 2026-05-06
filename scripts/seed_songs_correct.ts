import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedSongs() {
  console.log('🎵 Seeding songs with correct iTunes track IDs...');

  // First get existing users
  const { data: users } = await supabase.from('profiles').select('id').limit(100);
  if (!users || users.length === 0) {
    console.log('No users found. Please run the album seed first.');
    return;
  }
  console.log(`Found ${users.length} users to use for reviews.`);

  // Delete old bad song data
  const OLD_SONG_IDS = ['1440872284', '1097861834', '697194971', '1441586576', '1674233777'];
  for (const id of OLD_SONG_IDS) {
    await supabase.from('ratings').delete().eq('api_item_id', id).eq('type', 'song');
    await supabase.from('reviews').delete().eq('api_item_id', id).eq('type', 'song');
  }
  console.log('🧹 Cleaned old song data.');

  // Correct iTunes track IDs
  const SONGS = [
    { id: '1440871886', name: 'Alright - Kendrick Lamar' },
    { id: '1097861836', name: 'Karma Police - Radiohead' },
    { id: '697195787', name: 'Harder Better Faster Stronger - Daft Punk' },
    { id: '1066498948', name: 'Money - Pink Floyd' },
    { id: '1440650711', name: 'Bohemian Rhapsody - Queen' },
    { id: '580708180', name: 'Stairway to Heaven - Led Zeppelin' },
    { id: '1440783625', name: 'Smells Like Teen Spirit - Nirvana' },
    { id: '269573364', name: 'Billie Jean - Michael Jackson' },
    { id: '635770202', name: 'Hotel California - Eagles' },
    { id: '1065976170', name: 'Comfortably Numb - Pink Floyd' },
    { id: '1097861770', name: 'Paranoid Android - Radiohead' },
    { id: '617154366', name: 'Get Lucky - Daft Punk' },
    { id: '1440903439', name: 'Lose Yourself - Eminem' },
    { id: '1441133277', name: 'Hey Jude - The Beatles' },
  ];

  const reviewTexts = [
    "This song defined a generation. Pure artistry.",
    "Incredible production and songwriting. A masterwork.",
    "One of the greatest songs ever recorded. Timeless.",
    "The arrangement is flawless, every note in its place.",
    "Changed the way I think about music. Revolutionary.",
    "Emotionally devastating in the best way possible.",
    "A sonic journey from start to finish. Breathtaking.",
    "This track proves why they're legends.",
    "The energy in this song is absolutely unmatched.",
    "Perfect melody, perfect lyrics, perfect performance.",
    "I've listened to this thousands of times and it never gets old.",
    "Groundbreaking when it came out. Still groundbreaking now.",
    "The musicianship on display here is extraordinary.",
    "A cultural touchstone that everyone needs to hear.",
    "Raw, powerful, and unforgettable.",
  ];

  for (const song of SONGS) {
    console.log(`  Seeding: ${song.name}...`);
    // Pick 15-25 random users for each song
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    const count = 15 + Math.floor(Math.random() * 11);
    const selected = shuffled.slice(0, count);

    for (const user of selected) {
      const score = (3.0 + Math.random() * 2.0).toFixed(1);
      
      // Insert rating
      await supabase.from('ratings').insert({
        user_id: user.id,
        api_item_id: song.id,
        type: 'song',
        score: parseFloat(score),
      });

      // 70% chance to write a review
      if (Math.random() > 0.3) {
        const review = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        await supabase.from('reviews').insert({
          user_id: user.id,
          api_item_id: song.id,
          type: 'song',
          content: review,
        });
      }
    }
  }

  console.log('✅ Done! All songs seeded with correct iTunes track IDs.');
}

seedSongs().catch(console.error);
