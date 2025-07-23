import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function validateToken(authHeader) {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace(/^Bearer\s+/, '');
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    throw new Error(error.message);
  }
  if (!data.user) {
    throw new Error('Unauthorized');
  }

  return data.user;
}