import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { data, error } = await supabase.rpc("dashboard_stats");

  if (error) return res.status(400).json({ error: error.message });

  res.json({ stats: data?.[0] });
});

export default router;
