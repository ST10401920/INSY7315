import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const adminId = (req as any).userId;
  const { title, message } = req.body;

  const { data, error } = await supabase
    .from("announcments")
    .insert([
      {
        admin_id: adminId,
        title,
        message,
      },
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ announcement: data?.[0] });
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("announcments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ announcements: data });
});

export default router;
