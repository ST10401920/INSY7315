import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";

const router = Router();

// Get all available properties
router.get("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("property")
    .select("*")
    .eq("available", true);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ properties: data });
});

// Added
// Get a single property by ID
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("property")
    .select("*")
    .eq("id", id)
    .single(); 

  if (error) return res.status(404).json({ error: "Property not found" });

  res.json({ property: data });
});

export default router;
