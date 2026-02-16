import { Request, Response, NextFunction } from 'express';

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session && req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function checkPassword(password: string): boolean {
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;

  if (!dashboardPassword) {
    console.error('DASHBOARD_PASSWORD not set in environment variables');
    return false;
  }

  return password === dashboardPassword;
}
