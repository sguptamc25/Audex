import fs from 'fs';
import { faker } from '@faker-js/faker';

// Configuration
const NUM_USERS = 500; // Supabase SQL editor crashes if you paste >1MB of text. Change to 10000 if using psql.
const NUM_REVIEWS_PER_ALBUM = 30;

const ALBUMS = [
  '1097861387', // OK Computer
  '1440871877', // TPAB
  '1441586573', // IGOR
  '1674233408', // Dark Side of the Moon
  '697194953',  // Discovery
];

// We need valid auth user IDs to satisfy foreign keys. 
// We will insert fake users into auth.users directly.
// NOTE: Password hash is fake, these users cannot actually log in.

console.log('Generating seed.sql file...');
let sql = '-- MASSIVE SEED SCRIPT FOR AUDEX\n\n';

// 1. Generate Auth Users
sql += '-- 1. Insert Auth Users\n';
sql += `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES\n`;

const userIds: string[] = [];

for (let i = 0; i < NUM_USERS; i++) {
  const id = faker.string.uuid();
  userIds.push(id);
  const email = faker.internet.email().replace(/'/g, "''");
  
  sql += `('${id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${email}', '$2a$10$xyz...', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')`;
  sql += i === NUM_USERS - 1 ? ';\n\n' : ',\n';
}

// 2. Generate Profiles
sql += '-- 2. Insert Profiles\n';
sql += `INSERT INTO public.profiles (id, username, avatar_url, created_at) VALUES\n`;

for (let i = 0; i < NUM_USERS; i++) {
  const username = faker.internet.username().replace(/'/g, "''");
  const avatar = faker.image.avatar();
  sql += `('${userIds[i]}', '${username}', '${avatar}', NOW())`;
  sql += i === NUM_USERS - 1 ? ';\n\n' : ',\n';
}

// 3. Generate Ratings & Reviews
sql += '-- 3. Insert Ratings and Reviews\n';
sql += `INSERT INTO public.ratings (user_id, api_item_id, type, score, created_at) VALUES\n`;
const ratingValues: string[] = [];
const reviewValues: string[] = [];

for (const albumId of ALBUMS) {
  // Randomly select users to rate this album
  const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
  const selectedUsers = shuffledUsers.slice(0, NUM_REVIEWS_PER_ALBUM);
  
  for (const userId of selectedUsers) {
    const score = faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 });
    ratingValues.push(`('${userId}', '${albumId}', 'album', ${score}, NOW() - interval '${Math.floor(Math.random() * 100)} days')`);
    
    // 70% chance to also write a review
    if (Math.random() > 0.3) {
      const content = faker.lorem.paragraph({ min: 1, max: 3 }).replace(/'/g, "''");
      reviewValues.push(`('${userId}', '${albumId}', 'album', '${content}', NOW() - interval '${Math.floor(Math.random() * 100)} days')`);
    }
  }
}

sql += ratingValues.join(',\n') + ';\n\n';

sql += `INSERT INTO public.reviews (user_id, api_item_id, type, content, created_at) VALUES\n`;
sql += reviewValues.join(',\n') + ';\n\n';

fs.writeFileSync('seed.sql', sql);
console.log('✅ Generated seed.sql! Open it and copy its contents into the Supabase SQL Editor.');
