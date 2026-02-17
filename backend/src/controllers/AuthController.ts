import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserModel } from '../models/UserModel';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      const result = await AuthService.register(username, email, password);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const status = message.includes('already') ? 409 : 500;
      res.status(status).json({ error: message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: message });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }
      const tokens = await AuthService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(AuthService.sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async verifyAge(req: Request, res: Response): Promise<void> {
    try {
      await UserModel.updateAgeVerification(req.user!.userId, true);
      res.json({ message: 'Age verification confirmed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify age' });
    }
  }
}
