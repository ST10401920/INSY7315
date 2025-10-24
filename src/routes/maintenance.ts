import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();

// Submit a maintenance request (tenants only)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const {
      propertyId,
      rentalId,
      caretakerId,
      description,
      category,
      photos,
      urgency,
      progress_notes,
    } = req.body;

    // validate required fields
    if (!propertyId || !rentalId || !description || !category || !urgency) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const allowedUrgency = ["low", "medium", "high"];
    if (!allowedUrgency.includes(urgency)) {
      return res.status(400).json({ error: "Invalid urgency value." });
    }

    // verify the rental exists and belongs to this tenant and matches the property
    const { data: rentalRow, error: rentalErr } = await supabase
      .from("rentals")
      .select("id, property_id, tenant_id, status")
      .eq("id", rentalId)
      .single();

    if (rentalErr || !rentalRow)
      return res.status(404).json({ error: "Rental not found." });
    if (rentalRow.tenant_id !== userId)
      return res.status(403).json({ error: "You do not own this rental." });
    if (rentalRow.property_id !== propertyId)
      return res
        .status(400)
        .json({ error: "Property and rental do not match." });

    // prepare insert payload
    const insertPayload: any = {
      property_id: propertyId,
      rental_id: rentalId,
      tenant_id: userId,
      caretaker_id: caretakerId || null,
      description,
      category,
      photos: Array.isArray(photos) ? photos : photos ? [photos] : [],
      urgency,
      progress_notes: Array.isArray(progress_notes)
        ? progress_notes
        : progress_notes
        ? [progress_notes]
        : [],
    };

    const { data, error } = await supabase
      .from("maintenance")
      .insert([insertPayload])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ maintenance: data?.[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// GET /maintenance - property managers see tasks for their properties
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    // fetch properties owned by manager
    const { data: props } = await supabase
      .from("property")
      .select("id")
      .eq("user_id", userId);
    const propIds = (props || []).map((p: any) => p.id);
    if (propIds.length === 0) return res.json({ maintenance: [] });

    const { data, error } = await supabase
      .from("maintenance")
      .select("*")
      .in("property_id", propIds);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ maintenance: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// PUT /maintenance/:id/assign - property manager assigns a caretaker
router.put("/:id/assign", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { caretakerId } = req.body;

  if (!caretakerId)
    return res.status(400).json({ error: "Missing caretakerId" });

  // fetch role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile)
    return res.status(400).json({ error: "Unable to fetch user role" });

  if (profile.role !== "property_manager" && profile.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });

  // fetch maintenance request
  const { data: mReq, error: mErr } = await supabase
    .from("maintenance")
    .select("*")
    .eq("id", id)
    .single();

  if (mErr || !mReq)
    return res.status(404).json({ error: "Maintenance request not found" });

  // assign caretaker
  const { data, error } = await supabase
    .from("maintenance")
    .update({ caretaker_id: caretakerId, status: "in_progress" })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ maintenance: data?.[0] });
});

// GET /maintenance - tenants can see their request(s)
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const { data, error } = await supabase
    .from("maintenance")
    .select("*")
    .eq("tenant_id", userId);

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ maintenance: data });
});

// GET /rentals/my - tenant fetches their active rental
router.get("/rentals/my", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const { data, error } = await supabase
    .from("rentals")
    .select("id, property_id, tenant_id, status")
    .eq("tenant_id", userId)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "No active rental found" });
  }

  res.json(data);
});

// GET /maintenance/assigned - caretaker sees tasks assigned to them
router.get("/assigned", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const { data, error } = await supabase
    .from("maintenance")
    .select("*")
    .eq("caretaker_id", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ maintenance: data });
});

// GET /maintenance/caretakers - get all caretakers for assignment
router.get("/caretakers", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    // Verify the requester is a property manager
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile)
      return res.status(400).json({ error: "Unable to fetch user role" });

    if (profile.role !== "property_manager" && profile.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    // Fetch all caretakers
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email") // Only select id and email since that's what we have
      .eq("role", "caretaker");

    if (error) return res.status(400).json({ error: error.message });

    // Transform the data to match the frontend expectations
    const transformedData = data.map((user) => ({
      id: user.id,
      first_name: user.email.split("@")[0], // Use email username as display name
      last_name: "", // Empty string since we don't have last name
    }));

    res.json({ caretakers: transformedData });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// PUT /maintenance/:id/update - caretaker updates task status and optionally adds photos
router.put("/:id/update", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { status, progress_notes, photos } = req.body;

  try {
    const allowedStatuses = ["pending", "in_progress", "completed"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Fetch the maintenance request
    const { data: maintenance, error: fetchError } = await supabase
      .from("maintenance")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !maintenance) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }

    // Verify caretaker is assigned
    if (maintenance.caretaker_id !== userId) {
      return res.status(403).json({ error: "You are not assigned to this task" });
    }

    // Build update payload
    const updatePayload: any = { updated_at: new Date().toISOString() };

    if (status) {
      updatePayload.status = status;
    }

    if (progress_notes) {
      const currentNotes: string[] = maintenance.progress_notes || [];
      const newNotes = Array.isArray(progress_notes)
        ? progress_notes
        : [progress_notes];
      updatePayload.progress_notes = [...currentNotes, ...newNotes];
    }

    if (photos && Array.isArray(photos) && photos.length > 0) {
      const currentPhotos: string[] = maintenance.photos || [];
      updatePayload.photos = [...currentPhotos, ...photos];
    }

    const { data, error: updateErr } = await supabase
      .from("maintenance")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    res.json({ maintenance: data?.[0], message: "Task updated successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

//get for tenant
// router.get("/:id", requireAuth, async (req: Request, res: Response) => {
//   const userId = (req as any).userId;
//   const { id } = req.params;
//   const { data, error } = await supabase.from("maintenance").select("*");

//   if (error) return res.status(400).json({ error: error.message });
//   return res.json({ maintenance: data });
// });

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId; 
  const { id } = req.params;

  const { data, error } = await supabase
    .from("maintenance")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ maintenance: data });
});

// Tenant reopens a completed request
router.put("/:id/reopen", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  try {
    const { data: maintenance, error } = await supabase
      .from("maintenance")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !maintenance) {
      return res.status(404).json({ error: "Maintenance request not found" });
    }

    // Verify tenant owns this request
    if (maintenance.tenant_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Only allow reopening if completed
    if (maintenance.status !== "completed") {
      return res.status(400).json({ error: "Only completed requests can be reopened" });
    }

    const { data, error: updateErr } = await supabase
      .from("maintenance")
      .update({ status: "pending", caretaker_id: null, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    res.json({ maintenance: data?.[0], message: "Request reopened" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;