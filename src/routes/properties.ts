import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, location, images, bedrooms, price, amenities } = req.body;

  const { data, error } = await supabase
    .from("property")
    .insert([
      {
        user_id: userId,
        name,
        location,
        images,
        bedrooms,
        price,
        amenities,
      },
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ property: data?.[0] });
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const { data, error } = await supabase
    .from("property")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ properties: data });
});


// Get property by ID
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("property")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "property not found" });
  }

  res.json({ property: data });
});

export default router;
