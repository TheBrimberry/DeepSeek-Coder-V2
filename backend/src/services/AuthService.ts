import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../models/UserModel';
import { AuthTokens, JwtPayload } from '../types';

export class AuthService {
  static async register(username: string, email: string, password: string) {
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ username, email, password_hash });

    const tokens = this.generateTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), tokens };
  }

  static async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);
    if (!user || !user.is_active) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), tokens };
  }

  static async refreshToken(token: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
      const user = await UserModel.findById(payload.userId);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }
      return this.generateTokens(user.id, user.role);
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  static generateTokens(userId: string, role: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, role } as JwtPayload,
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn as string }
    );
    const refreshToken = jwt.sign(
      { userId, role } as JwtPayload,
      env.jwt.secret,
      { expiresIn: env.jwt.refreshExpiresIn as string }
    );
    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.jwt.secret) as JwtPayload;
  }

  static sanitizeUser(user: { id: string; username: string; email: string; role: string; is_age_verified: boolean; created_at: Date }) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAgeVerified: user.is_age_verified,
      createdAt: user.created_at,
    };
  }
}
