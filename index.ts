import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { supabase } from "./src/supabaseClient";
import authRoutes from "./src/routes/auth";
import propertyRoutes from "./src/routes/properties";
import maintenanceRoutes from "./src/routes/maintenance";
import userManagementRoutes from "./src/routes/userManagement";
import announcementsRoutes from "./src/routes/announcements";
import noAuthProperty from "./src/routes/noAuthProperty";
import adminDash from "./src/routes/adminDash";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/user-management", userManagementRoutes);
app.use("/announcements", announcementsRoutes);
app.use("/no-auth-properties", noAuthProperty);
app.use("/admin-dash", adminDash);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
