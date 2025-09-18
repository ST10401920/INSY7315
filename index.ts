import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { supabase } from "./src/supabaseClient";
import authRoutes from "./src/routes/auth";
import propertyRoutes from "./src/routes/properties";
import maintenanceRoutes from "./src/routes/maintenance";
import userManagementRoutes from "./src/routes/userManagement";
import announcementsRoutes from "./src/routes/announcements";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/user-management", userManagementRoutes);
app.use("/announcements", announcementsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
