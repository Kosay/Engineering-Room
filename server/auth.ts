import type { Request } from 'express';
import { getAdminAuth } from './firebase-admin';

export async function requireFirebaseUser(req: Request) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) throw new Error('Missing Firebase ID token.');

  const token = header.slice('Bearer '.length).trim();
  if (!token) throw new Error('Missing Firebase ID token.');

  return getAdminAuth().verifyIdToken(token);
}
