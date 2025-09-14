import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabaseClient";

export default async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    return res.status(401).json({ error: "Invalid token" });

  (req as any).userId = data.user.id;
  next();
}
