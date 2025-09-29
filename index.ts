import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { supabase } from "./src/supabaseClient";
import authRoutes from "./src/routes/auth";
import propertyRoutes from "./src/routes/properties";
import maintenanceRoutes from "./src/routes/maintenance";
import userManagementRoutes from "./src/routes/userManagement";
import announcementsRoutes from "./src/routes/announcements";
import chatbotRoutes from "./src/routes/chatbot";
import cors from 'cors';

const app = express();


app.use(express.json());

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/user-management", userManagementRoutes);
app.use("/announcements", announcementsRoutes);
app.use("/chatbot", chatbotRoutes);

app.use(cors({
  origin: 'http://localhost:5173', // or use '*' for public APIs
  credentials: true               // if you're sending cookies or auth headers
}));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const PORT = Number(process.env.PORT) || 3000;
// const HOST = '0.0.0.0';
// app.listen(PORT, HOST, () => {
//   console.log(`Server running on http://${HOST}:${PORT}`);
// });

// app.get("/", (req: Request, res: Response) => {
//   res.send("API is running ✅");
// });

