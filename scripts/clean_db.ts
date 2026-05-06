import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function clean() {
  console.log('🧹 Cleaning old invalid Deezer IDs from database...');
  
  const VALID_ITUNES_IDS = [
    '1097861387', // OK Computer
    '1440871877', // TPAB
    '1441586573', // IGOR
    '1674233408', // Dark Side of the Moon
    '697194953',  // Discovery
    '1440872284', // Alright - Kendrick Lamar
    '1097861834', // Karma Police - Radiohead
    '697194971',  // Harder, Better, Faster, Stronger - Daft Punk
    '1441586576', // EARFQUAKE - Tyler
    '1674233777', // Money - Pink Floyd
  ];

  // Delete all ratings and reviews that are NOT in our valid iTunes list
  // Actually, let's just delete everything that is purely numeric and < 9 digits (Deezer IDs are short, iTunes are 9-10 digits)
  // Easier: delete ratings where api_item_id = '13217438', '9856554', '302127', '97092142', '54010372' (the old hardcoded Deezer ones)
  const OLD_IDS = ['13217438', '9856554', '302127', '97092142', '54010372'];

  for (const id of OLD_IDS) {
    await supabase.from('ratings').delete().eq('api_item_id', id);
    await supabase.from('reviews').delete().eq('api_item_id', id);
  }

  console.log('✅ Cleaned up old data! Your charts should now perfectly match the new iTunes IDs.');
}

clean().catch(console.error);
