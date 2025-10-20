import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { supabase } from "./src/supabaseClient";
import authRoutes from "./src/routes/auth";
import propertyRoutes from "./src/routes/properties";
import maintenanceRoutes from "./src/routes/maintenance";
import userManagementRoutes from "./src/routes/userManagement";
import announcementsRoutes from "./src/routes/announcements";
import chatbotRoutes from "./src/routes/chatbot";
import noAuthProperty from "./src/routes/noAuthProperty";
import adminDash from "./src/routes/adminDash";
import rentalsRoutes from "./src/routes/rentals";
import applicationsRoutes from "./src/routes/applications";
import leaseRoutes from "./src/routes/lease";
import notificationsRouter from "./src/routes/pushNotifications";


const app = express();

// Global middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true               
}));
app.use(express.json({ limit: "10mb" })); 

// Route registration
app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/user-management", userManagementRoutes);
app.use("/announcements", announcementsRoutes);
app.use("/chatbot/", chatbotRoutes);
app.use("/no-auth-properties", noAuthProperty);
app.use("/admin-dash", adminDash);             
app.use("/applications", applicationsRoutes);  
app.use("/rentals", rentalsRoutes);           
app.use("/leases", leaseRoutes);
app.use("/notifications", notificationsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
