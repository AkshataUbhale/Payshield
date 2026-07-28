import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export default function (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Check if not token
  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }

  // Verify token
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbacksecret",
    );
    req.user = (decoded as any).user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
}
