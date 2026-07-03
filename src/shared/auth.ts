import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccessToken = (payload: object) =>
  (jwt.sign as any)(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn });

export const signRefreshToken = (payload: object) =>
  (jwt.sign as any)(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwtAccessSecret as jwt.Secret) as jwt.JwtPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwtRefreshSecret as jwt.Secret) as jwt.JwtPayload;
