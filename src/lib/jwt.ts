import jwt from 'jsonwebtoken';
import type { SignOptions, Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? 'supersecret') as Secret;

export function signToken(payload: object, expiresIn: string | number = '7d') {
  const options = { expiresIn } as unknown as SignOptions;
  return jwt.sign(payload as string | object | Buffer, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
