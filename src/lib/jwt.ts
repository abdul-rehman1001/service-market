import jwt from 'jsonwebtoken';
import type { SignOptions, Secret } from 'jsonwebtoken';

export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';

function requireJwtSecret(): Secret {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return jwtSecret as Secret;
}

export function signToken(payload: object, expiresIn: string | number = ACCESS_TOKEN_EXPIRY) {
  const options = { expiresIn } as unknown as SignOptions;
  return jwt.sign(payload as string | object | Buffer, requireJwtSecret(), options);
}

export function signAccessToken(payload: object) {
  return signToken(payload, ACCESS_TOKEN_EXPIRY);
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

export function isTokenExpired(token: string): boolean {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return true;

  try {
    jwt.verify(token, jwtSecret as Secret);
    return false;
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return true;
    }
    return true;
  }
}
