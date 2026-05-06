import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Human-sounding usernames
const FIRST = ['Alex','Sam','Jordan','Casey','Morgan','Riley','Quinn','Avery','Blake','Drew','Sky','Sage','Rowan','Parker','Hayden','Reese','Dakota','Cameron','Taylor','Charlie','Max','Leo','Luna','Ivy','Nova','Zara','Kai','Finn','Jade','Owen','Mila','Theo','Aria','Luca','Nyla','Ezra','Maya','Nico','Vera','Silas'];
const LAST = ['_music','_vibes','_sounds','_beats','_indie','_punk','_rock','_soul','_jazz','_wave','_tunes','_bass','_keys','_loops','_echo','_vinyl','_groove','_rhythm','_melody','_note','99','42','77','88','23','01','_x','_z','_hq'];

function randomUsername() {
  return FIRST[Math.floor(Math.random()*FIRST.length)] + LAST[Math.floor(Math.random()*LAST.length)] + Math.floor(Math.random()*999);
}

const ALBUM_REVIEW_TEXTS = [
  "A masterclass in songwriting. Every track flows seamlessly into the next.",
  "I've been listening to this on repeat for weeks. Timeless.",
  "The production quality is phenomenal. You can hear every detail.",
  "This album changed the way I think about music forever.",
  "Not a single weak track. Pure perfection from start to finish.",
  "Emotionally devastating in the best way possible. A true masterpiece.",
  "Sonically adventurous while remaining deeply accessible. Brilliant.",
  "A cultural milestone. This defined an entire generation.",
  "The ambition on display here is breathtaking. Truly groundbreaking.",
  "Every listen reveals something new. The layers are incredible.",
  "Raw, powerful, and unforgettable. One of the greatest ever made.",
  "The arrangements are flawless. World-class musicianship.",
  "Dark, moody, and absolutely captivating from beginning to end.",
  "An essential record for any serious music fan. A landmark.",
  "Pushed boundaries that nobody thought could be pushed. Revolutionary.",
  "Lyrically profound and musically innovative. A rare combination.",
  "One of those albums that grows on you with every listen.",
  "The textures and sonic palette here are unlike anything else.",
  "A perfect blend of experimentation and accessibility.",
  "Hauntingly beautiful. This album stays with you long after it ends.",
];

const SONG_REVIEW_TEXTS = [
  "This track defines a generation. Absolutely iconic.",
  "The melody is pure ear candy. Can't stop replaying this.",
  "A perfect song. Not a single note out of place.",
  "The bridge section is heavenly. Gives me chills every time.",
  "Lyrically, this is some of the finest songwriting I've ever heard.",
  "This song made me fall in love with music all over again.",
  "The production is insanely good. Every element is polished.",
  "An absolute earworm. Been humming this for days.",
  "The vocal performance here is otherworldly. Pure emotion.",
  "A timeless classic that will never sound dated.",
  "The groove on this track is infectious. Pure energy.",
  "Emotionally resonant and beautifully crafted.",
  "This song deserves to be in every 'best of' list.",
  "The way this builds to the climax is pure musical genius.",
  "A song that captures a feeling words can't describe.",
];

// Verified iTunes album IDs
const ALBUMS = [
  '1097861387', // OK Computer
  '697194602',  // Discovery
  '1440871474', // To Pimp a Butterfly
  '1474815798', // Abbey Road
  '269572838',  // Thriller
  '594061854',  // Rumours
  '1065975633', // The Wall
  '1097862870', // Kid A
  '1109714933', // In Rainbows
  '1440860389', // good kid maad city
  '1445865909', // MBDTF
  '574050396',  // Back In Black
  '580708175',  // Led Zeppelin IV
  '1276760743', // Miseducation of Lauryn Hill
  '1440869641', // Weezer Blue Album
  '1544491232', // 21 - Adele
  '1440892370', // MTV Unplugged - Nirvana
];

// Verified iTunes song IDs
const SONGS = [
  '1440871886', // Alright
  '1097861836', // Karma Police
  '697195787',  // Harder Better Faster Stronger
  '1066498948', // Money
  '1440650711', // Bohemian Rhapsody
  '580708180',  // Stairway to Heaven
  '1440783625', // Smells Like Teen Spirit
  '269573364',  // Billie Jean
  '635770202',  // Hotel California
  '1065976170', // Comfortably Numb
  '1097861770', // Paranoid Android
  '617154366',  // Get Lucky
  '1440903439', // Lose Yourself
  '1441133277', // Hey Jude
];

async function seed() {
  console.log('🚀 Starting massive seed...');

  // 1. Create 200 dummy users
  const userIds: string[] = [];
  const { data: existingUsers } = await supabase.from('profiles').select('id');
  if (existingUsers) {
    existingUsers.forEach(u => userIds.push(u.id));
  }

  const NEEDED = 200 - userIds.length;
  if (NEEDED > 0) {
    console.log(`Creating ${NEEDED} new dummy users...`);
    for (let i = 0; i < NEEDED; i++) {
      const username = randomUsername();
      const id = crypto.randomUUID();
      const { error } = await supabase.from('profiles').insert({
        id,
        username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });
      if (!error) {
        userIds.push(id);
        if (i % 50 === 0) console.log(`  Created ${i}/${NEEDED} users...`);
      }
    }
  }
  console.log(`✅ Total users: ${userIds.length}`);

  // 2. Seed album reviews (50-80 reviews per album)
  console.log('📀 Seeding album reviews...');
  for (const albumId of ALBUMS) {
    const { count } = await supabase.from('ratings').select('*', { count: 'exact', head: true })
      .eq('api_item_id', albumId).eq('type', 'album');
    
    if (count && count >= 40) {
      console.log(`  Skipping album ${albumId} (already has ${count} ratings)`);
      continue;
    }

    const reviewCount = 50 + Math.floor(Math.random() * 30);
    const shuffled = [...userIds].sort(() => 0.5 - Math.random()).slice(0, reviewCount);
    console.log(`  Seeding album ${albumId} with ${reviewCount} reviews...`);

    for (const userId of shuffled) {
      const score = (2.5 + Math.random() * 2.5).toFixed(1);
      await supabase.from('ratings').insert({
        user_id: userId, api_item_id: albumId, type: 'album', score: parseFloat(score)
      });

      if (Math.random() > 0.35) {
        const text = ALBUM_REVIEW_TEXTS[Math.floor(Math.random() * ALBUM_REVIEW_TEXTS.length)];
        await supabase.from('reviews').insert({
          user_id: userId, api_item_id: albumId, type: 'album', content: text
        });
      }
    }
  }

  // 3. Seed song reviews (30-60 reviews per song)
  console.log('🎵 Seeding song reviews...');
  for (const songId of SONGS) {
    const { count } = await supabase.from('ratings').select('*', { count: 'exact', head: true })
      .eq('api_item_id', songId).eq('type', 'song');
    
    if (count && count >= 30) {
      console.log(`  Skipping song ${songId} (already has ${count} ratings)`);
      continue;
    }

    const reviewCount = 30 + Math.floor(Math.random() * 30);
    const shuffled = [...userIds].sort(() => 0.5 - Math.random()).slice(0, reviewCount);
    console.log(`  Seeding song ${songId} with ${reviewCount} reviews...`);

    for (const userId of shuffled) {
      const score = (2.5 + Math.random() * 2.5).toFixed(1);
      await supabase.from('ratings').insert({
        user_id: userId, api_item_id: songId, type: 'song', score: parseFloat(score)
      });

      if (Math.random() > 0.4) {
        const text = SONG_REVIEW_TEXTS[Math.floor(Math.random() * SONG_REVIEW_TEXTS.length)];
        await supabase.from('reviews').insert({
          user_id: userId, api_item_id: songId, type: 'song', content: text
        });
      }
    }
  }

  console.log('🎉 Massive seed complete!');
}

seed().catch(console.error);
