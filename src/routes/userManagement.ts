import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();
//maybe an error here if go its to do with userId maybe it should be id idk we will see
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { role } = req.body;
  const { id } = req.params;

  const validRoles = ["tenant", "property_manager", "caretaker", "admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ profile: data[0] });
});

export default router;
