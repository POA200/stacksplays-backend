import { Request, Response, NextFunction } from "express";

/**
 * Minimal admin guard using a static header key.
 * Send header:  x-admin-key: <ADMIN_KEY>
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const headerKey = req.header("x-admin-key");
  if (!headerKey || headerKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}