import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  // fetch properties that are available
  const { data, error } = await supabase
    .from("property")
    .select("*")
    .eq("available", true);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ properties: data });
});

export default router;
