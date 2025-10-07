import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();

// Manager creates a lease and sends to tenant
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { tenantId, lease_document, applicationId } = req.body;

  if (!tenantId || !lease_document || !applicationId)
    return res
      .status(400)
      .json({ error: "Missing tenantId, lease_document, or applicationId" });

  // Verify that the application exists and is approved
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("applicant_id", tenantId)
    .eq("status", "approved")
    .single();

  if (appError || !application) {
    return res.status(400).json({
      error: "Application not found or not approved",
    });
  }

  // Check if a lease already exists for this application
  const { data: existingLease, error: existingError } = await supabase
    .from("leases")
    .select("*")
    .eq("application_id", applicationId)
    .single();

  if (existingLease) {
    return res.status(400).json({
      error: "A lease already exists for this application",
    });
  }

  const { data, error } = await supabase
    .from("leases")
    .insert([
      {
        manager_id: userId,
        tenant_id: tenantId,
        application_id: applicationId,
        lease_document,
        status: "sent_to_tenant",
      },
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ lease: data?.[0] });
});

// GET /leases - manager sees leases they sent; tenant sees leases addressed to them
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile)
    return res.status(400).json({ error: "Unable to fetch user role" });

  const role = profile.role;

  if (role === "property_manager") {
    // Include application details for better context
    const { data, error } = await supabase
      .from("leases")
      .select(
        `
        *,
        applications (
          id,
          property_id,
          first_name,
          last_name,
          status
        )
      `
      )
      .eq("manager_id", userId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ leases: data });
  } else {
    const { data, error } = await supabase
      .from("leases")
      .select(
        `
        *,
        applications (
          id,
          property_id,
          first_name,
          last_name,
          status
        )
      `
      )
      .eq("tenant_id", userId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ leases: data });
  }

  return res.status(403).json({ error: "Forbidden" });
});

// PUT /leases/:id - tenant signs (upload signed_document) or manager acknowledges
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { signed_document, action } = req.body;

  // fetch lease with application details
  const { data: lease, error: leaseErr } = await supabase
    .from("leases")
    .select(
      `
      *,
      applications (
        id,
        property_id,
        first_name,
        last_name,
        status
      )
    `
    )
    .eq("id", id)
    .single();
  if (leaseErr || !lease)
    return res.status(404).json({ error: "Lease not found" });

  // determine role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (profileError || !profile)
    return res.status(400).json({ error: "Unable to fetch user role" });
  const role = profile.role;

  // Manager acknowledges after tenant signed
  if (role === "property_manager" && lease.manager_id === userId) {
    if (action === "acknowledge" && lease.status === "signed_by_tenant") {
      const { data, error } = await supabase
        .from("leases")
        .update({ status: "acknowledged_by_manager" })
        .eq("id", id)
        .select();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ lease: data?.[0] });
    }
    return res
      .status(400)
      .json({ error: "Invalid action or lease not signed yet" });
  } else {
    if (!signed_document) {
      return res.status(400).json({ error: "Missing signed_document" });
    }
    const { data, error } = await supabase
      .from("leases")
      .update({ signed_document, status: "signed_by_tenant" })
      .eq("id", id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ lease: data?.[0] });
  }

  return res.status(403).json({ error: "Forbidden" });
});

export default router;
