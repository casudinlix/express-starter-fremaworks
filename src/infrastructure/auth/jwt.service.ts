import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { UnauthorizedError } from '../../shared/errors/AppError';

export interface JWTPayload {
  id: string;
  email: string;
  role?: string;
}

export class JWTService {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    // @ts-ignore - JWT library type issue with expiresIn
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JWTPayload): string {
    // @ts-ignore - JWT library type issue with expiresIn
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(payload: JWTPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, config.security.bcryptRounds);
  }

  /**
   * Compare password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
