import fs from 'fs';
import { faker } from '@faker-js/faker';

const NUM_USERS = 500;
const NUM_REVIEWS_PER_ITEM = 15;

const SONGS = [
  '1440872284', // Alright - Kendrick Lamar
  '1097861834', // Karma Police - Radiohead
  '697194971',  // Harder, Better, Faster, Stronger - Daft Punk
  '1441586576', // EARFQUAKE - Tyler
  '1674233777', // Money - Pink Floyd
];

let sql = '-- MASSIVE SEED SCRIPT FOR SONGS\n\n';

// We reuse existing users by selecting random user_ids from the profiles table.
// Wait, we don't know the user IDs. Instead, let's do a subquery or just generate new users.
// Generating new users is fine for a dummy script.
const userIds: string[] = [];

sql += '-- 1. Insert Auth Users\n';
sql += `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES\n`;
for (let i = 0; i < NUM_USERS; i++) {
  const id = faker.string.uuid();
  userIds.push(id);
  const email = faker.internet.email().replace(/'/g, "''");
  sql += `('${id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${email}', '$2a$10$xyz...', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')`;
  sql += i === NUM_USERS - 1 ? ';\n\n' : ',\n';
}

sql += '-- 2. Insert Profiles\n';
sql += `INSERT INTO public.profiles (id, username, avatar_url, created_at) VALUES\n`;
for (let i = 0; i < NUM_USERS; i++) {
  const username = faker.internet.username().replace(/'/g, "''");
  const avatar = faker.image.avatar();
  sql += `('${userIds[i]}', '${username}', '${avatar}', NOW())`;
  sql += i === NUM_USERS - 1 ? ';\n\n' : ',\n';
}

sql += '-- 3. Insert Ratings and Reviews for Songs\n';
sql += `INSERT INTO public.ratings (user_id, api_item_id, type, score, created_at) VALUES\n`;
const ratingValues: string[] = [];
const reviewValues: string[] = [];

for (const songId of SONGS) {
  const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
  const selectedUsers = shuffledUsers.slice(0, NUM_REVIEWS_PER_ITEM);
  for (const userId of selectedUsers) {
    const score = faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 });
    ratingValues.push(`('${userId}', '${songId}', 'song', ${score}, NOW() - interval '${Math.floor(Math.random() * 100)} days')`);
    if (Math.random() > 0.3) {
      const content = faker.lorem.paragraph({ min: 1, max: 2 }).replace(/'/g, "''");
      reviewValues.push(`('${userId}', '${songId}', 'song', '${content}', NOW() - interval '${Math.floor(Math.random() * 100)} days')`);
    }
  }
}

sql += ratingValues.join(',\n') + ';\n\n';
sql += `INSERT INTO public.reviews (user_id, api_item_id, type, content, created_at) VALUES\n`;
sql += reviewValues.join(',\n') + ';\n\n';

fs.writeFileSync('seed_songs.sql', sql);
console.log('✅ Generated seed_songs.sql! Open it and copy its contents into the Supabase SQL Editor.');
