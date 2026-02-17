import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function requireAgeVerification(req: Request, res: Response, next: NextFunction): void {
  if (!env.ageVerification.required) {
    next();
    return;
  }

  const ageVerified = req.headers['x-age-verified'] === 'true' ||
    req.cookies?.age_verified === 'true';

  if (!ageVerified) {
    res.status(403).json({
      error: 'Age verification required',
      minimumAge: env.ageVerification.minimumAge,
      message: `You must be at least ${env.ageVerification.minimumAge} years old to access this content.`,
    });
    return;
  }

  next();
}
