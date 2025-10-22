import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";

const router = Router();

// Submit a new application (tenant)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const applicantId = (req as any).userId;
  const {
    propertyId,
    lease_agreed,
    documents,
    first_name,
    last_name,
    phone_number,
    id_number,
    age,
    job_title,
    income,
    income_source,
    notes,
  } = req.body;

  if (!lease_agreed)
    return res
      .status(400)
      .json({ error: "You must agree to the lease to submit." });

  if (
    !propertyId ||
    !first_name ||
    !last_name ||
    !phone_number ||
    !id_number ||
    !age
  )
    return res.status(400).json({ error: "Missing required fields." });

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        property_id: propertyId,
        applicant_id: applicantId,
        lease_agreed: true,
        documents,
        first_name,
        last_name,
        phone_number,
        id_number,
        age,
        job_title,
        income,
        income_source,
        notes,
      },
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ application: data?.[0] });
});

// List applications
// - Property managers: applications for their properties
// - Tenants: their own applications
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  // fetch role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile)
    return res.status(400).json({ error: "Unable to fetch user role" });

  const role = profile.role;

  try {
    if (role === "property_manager") {
      // get properties owned by this manager
      const { data: props } = await supabase
        .from("property")
        .select("id")
        .eq("user_id", userId);
      const propIds = (props || []).map((p: any) => p.id);

      if (propIds.length === 0) return res.json({ applications: [] });

      const { data, error } = await supabase
        .from("applications")
        .select(
          "id, applicant_id, property_id, first_name, last_name, phone_number, id_number, age, job_title, income, income_source, status, approved_at, notes, submitted_at, documents"
        )
        .in("property_id", propIds);
      if (error) return res.status(400).json({ error: error.message });
      // Process data to convert documents to boolean (has documents or not)
      const processedData = data?.map((app) => ({
        ...app,
        documents: app.documents ? true : false,
      }));

      return res.json({ applications: processedData });
    }

    // made a change
    // Treat empty or null roles as tenant
    if (role === "tenant" || !role || role.trim() === "") {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("applicant_id", userId);

      if (error) return res.status(400).json({ error: error.message });
      return res.json({ applications: data });
    }

    // admins see all applications
    if (role === "admin") {
      const { data, error } = await supabase.from("applications").select("*");
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ applications: data });
    }

    // other roles are not allowed to list applications
    return res.status(403).json({ error: "Forbidden" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Get specific application document
router.get(
  "/:id/document",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).userId;

    try {
      // Fetch user role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: "Unable to fetch user role" });
      }

      const role = profile.role;

      // Get the application with just the document field
      const { data: application, error } = await supabase
        .from("applications")
        .select("documents, applicant_id, property_id")
        .eq("id", id)
        .single();

      if (error || !application) {
        return res.status(404).json({ error: "Application not found" });
      }
      // Add debug logging
      console.log("Application found:", {
        id: id,
        hasDocuments: !!application.documents,
        documentsType: typeof application.documents,
        documentsLength: application.documents?.length || 0,
        documentsPreview:
          application.documents?.substring?.(0, 50) || "no preview",
      });

      // Authorization check
      let authorized = false;

      if (role === "admin") {
        authorized = true;
      } else if (role === "tenant" || !role || role.trim() === "") {
        // Tenant can only access their own applications
        authorized = application.applicant_id === userId;
      } else if (role === "property_manager") {
        // Property manager can access applications for their properties
        const { data: props } = await supabase
          .from("property")
          .select("id")
          .eq("user_id", userId);
        const propIds = (props || []).map((p: any) => p.id);
        authorized = propIds.includes(application.property_id);
      }

      if (!authorized) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json({ document: application.documents });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Server error" });
    }
  }
);
// Update application status (approve/reject) - only property manager who owns the property or admin
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { status, notes } = req.body; // status should be 'approved' or 'rejected'

  if (!status || !["approved", "rejected"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  // fetch application
  const { data: appData, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (appError || !appData)
    return res.status(404).json({ error: "Application not found" });

  // fetch role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile)
    return res.status(400).json({ error: "Unable to fetch user role" });

  const role = profile.role;

  // property manager check - must own the property
  if (role === "property_manager") {
    const { data: props } = await supabase
      .from("property")
      .select("id")
      .eq("user_id", userId)
      .eq("id", appData.property_id);
    if (!props || props.length === 0)
      return res.status(403).json({ error: "Forbidden" });
  } else if (role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updates: any = { status };
  if (status === "approved") updates.approved_at = new Date().toISOString();
  if (notes) updates.notes = notes;

  // If approving, create a rental and mark property unavailable
  let rentalCreated: any = null;
  if (status === "approved") {
    // re-check property availability
    const { data: propertyRow, error: propErr } = await supabase
      .from("property")
      .select("available")
      .eq("id", appData.property_id)
      .single();

    if (propErr || !propertyRow)
      return res.status(400).json({ error: "Unable to fetch property" });

    if (propertyRow.available === false)
      return res.status(400).json({ error: "Property is not available" });

    // create rental
    const { data: rentalData, error: rentalErr } = await supabase
      .from("rentals")
      .insert([
        {
          property_id: appData.property_id,
          tenant_id: appData.applicant_id,
        },
      ])
      .select();

    if (rentalErr) return res.status(400).json({ error: rentalErr.message });

    rentalCreated = rentalData?.[0];

    // mark property as unavailable
    const { data: propUpdate, error: propUpdateErr } = await supabase
      .from("property")
      .update({ available: false })
      .eq("id", appData.property_id)
      .select();

    if (propUpdateErr) {
      // attempt to rollback rental
      if (rentalCreated?.id) {
        await supabase.from("rentals").delete().eq("id", rentalCreated.id);
      }
      return res
        .status(500)
        .json({ error: "Failed to mark property as unavailable" });
    }

    // optional: attach rental id to application notes
    updates.notes =
      (updates.notes ? updates.notes + "\n" : "") +
      `rental_id:${rentalCreated?.id}`;
  }

  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    // if application update failed and we created a rental, try to rollback changes
    if (rentalCreated?.id) {
      await supabase.from("rentals").delete().eq("id", rentalCreated.id);
      // try to set property available back to true
      await supabase
        .from("property")
        .update({ available: true })
        .eq("id", appData.property_id);
    }
    return res.status(400).json({ error: error.message });
  }

  res.json({ application: data?.[0], rental: rentalCreated });
});

export default router;
