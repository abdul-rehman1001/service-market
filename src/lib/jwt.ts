import jwt from 'jsonwebtoken';
import type { SignOptions, Secret } from 'jsonwebtoken';

function requireJwtSecret(): Secret {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return jwtSecret as Secret;
}

export function signToken(payload: object, expiresIn: string | number = '7d') {
  const options = { expiresIn } as unknown as SignOptions;
  return jwt.sign(payload as string | object | Buffer, requireJwtSecret(), options);
}

export function verifyToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    return jwt.verify(token, jwtSecret as Secret);
  } catch {
    return null;
  }
}
