import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { supabase } from "./src/supabaseClient";
import authRoutes from "./src/routes/auth";
import propertyRoutes from "./src/routes/properties";
import maintenanceRoutes from "./src/routes/maintenance";
import userManagementRoutes from "./src/routes/userManagement";
import announcementsRoutes from "./src/routes/announcements";
import chatbotRoutes from "./src/routes/chatbot"; // keep your local route
import noAuthProperty from "./src/routes/noAuthProperty";
import adminDash from "./src/routes/adminDash";
import rentalsRoutes from "./src/routes/rentals";
import applicationsRoutes from "./src/routes/applications";
import leaseRoutes from "./src/routes/lease";

const app = express();

// Global middleware
app.use(cors({
  origin: 'http://localhost:5173', // or '*' if public
  credentials: true               // for cookies/auth headers
}));
app.use(express.json({ limit: "10mb" })); // keep remote limit

// Route registration
app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/user-management", userManagementRoutes);
app.use("/announcements", announcementsRoutes);
app.use("/chatbot", chatbotRoutes);            // local
app.use("/no-auth-properties", noAuthProperty); // remote
app.use("/admin-dash", adminDash);              // remote
app.use("/applications", applicationsRoutes);  // remote
app.use("/rentals", rentalsRoutes);            // remote

app.use("/no-auth-properties", noAuthProperty);
app.use("/admin-dash", adminDash);
app.use("/applications", applicationsRoutes);
app.use("/rentals", rentalsRoutes);
app.use("/leases", leaseRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
