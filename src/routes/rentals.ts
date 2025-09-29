import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();

// GET /rentals/my - returns active rentals for the authenticated user with property details
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    // fetch active rentals for this tenant
    const { data: rentals, error: rentalError } = await supabase
      .from("rentals")
      .select("*, property:property_id(*)")
      .eq("tenant_id", userId)
      .eq("status", "active");

    if (rentalError)
      return res.status(400).json({ error: rentalError.message });

    // normalize response: include property details in each rental
    const result = (rentals || []).map((r: any) => ({
      rental: {
        id: r.id,
        start_date: r.start_date,
        end_date: r.end_date,
        status: r.status,
      },
      property: r.property || null,
    }));

    res.json({ rentals: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
