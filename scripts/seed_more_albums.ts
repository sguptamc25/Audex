import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedMoreAlbums() {
  console.log('💿 Seeding more albums with correct iTunes IDs...');

  const { data: users } = await supabase.from('profiles').select('id').limit(100);
  if (!users || users.length === 0) {
    console.log('No users found.');
    return;
  }
  console.log(`Found ${users.length} users.`);

  const ALBUMS = [
    { id: '1474815798', name: 'Abbey Road - The Beatles' },
    { id: '269572838', name: 'Thriller - Michael Jackson' },
    { id: '594061854', name: 'Rumours - Fleetwood Mac' },
    { id: '1065975633', name: 'The Wall - Pink Floyd' },
    { id: '1097862870', name: 'Kid A - Radiohead' },
    { id: '1109714933', name: 'In Rainbows - Radiohead' },
    { id: '1440860389', name: 'good kid maad city - Kendrick Lamar' },
    { id: '1445865909', name: 'My Beautiful Dark Twisted Fantasy - Kanye West' },
    { id: '574050396', name: 'Back In Black - AC/DC' },
    { id: '580708175', name: 'Led Zeppelin IV' },
    { id: '1276760743', name: 'Miseducation of Lauryn Hill' },
    { id: '1440869641', name: 'Weezer Blue Album' },
    { id: '1544491232', name: '21 - Adele' },
    { id: '1440892370', name: 'MTV Unplugged - Nirvana' },
  ];

  const reviewTexts = [
    "An absolute masterpiece from start to finish. Every track is perfection.",
    "This album changed the entire landscape of music. Groundbreaking.",
    "The production quality is insane. You hear something new every listen.",
    "A perfect album. Not a single weak track.",
    "This is what music should aspire to be. Revolutionary.",
    "Emotionally complex, sonically stunning, lyrically brilliant.",
    "One of those albums that gets better with every listen.",
    "A cultural milestone. This defined an entire decade of music.",
    "The ambition on display here is breathtaking.",
    "Sonically adventurous while remaining deeply accessible.",
    "A timeless record that will be studied for decades.",
    "Every element works together in perfect harmony.",
  ];

  for (const album of ALBUMS) {
    // Check if we already have ratings for this album
    const { count } = await supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('api_item_id', album.id).eq('type', 'album');
    if (count && count > 0) {
      console.log(`  Skipping ${album.name} (already has ${count} ratings)`);
      continue;
    }

    console.log(`  Seeding: ${album.name}...`);
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    const ratingCount = 20 + Math.floor(Math.random() * 15);
    const selected = shuffled.slice(0, ratingCount);

    for (const user of selected) {
      const score = (3.0 + Math.random() * 2.0).toFixed(1);
      
      await supabase.from('ratings').insert({
        user_id: user.id,
        api_item_id: album.id,
        type: 'album',
        score: parseFloat(score),
      });

      if (Math.random() > 0.4) {
        const review = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        await supabase.from('reviews').insert({
          user_id: user.id,
          api_item_id: album.id,
          type: 'album',
          content: review,
        });
      }
    }
  }

  console.log('✅ Done seeding more albums!');
}

seedMoreAlbums().catch(console.error);
