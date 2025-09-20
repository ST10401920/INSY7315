import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();
//maybe an error here if go its to do with userId maybe it should be id idk we will see
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { role } = req.body;
  const { id } = req.params;

  const validRoles = ["tenant", "property_manager", "caretaker", "admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id) // Using the ID from URL params
    .select();

  if (error) return res.status(400).json({ error: error.message });
  if (!data || data.length === 0)
    return res.status(404).json({ error: "User not found" });

  res.json({ profile: data[0] });
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ profiles: data });
});

export default router;
