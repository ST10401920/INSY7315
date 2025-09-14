import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { supabase } from "./src/supabaseClient";
import authRoutes from "./src/routes/auth";


const app = express();

app.use(express.json());

app.use("/auth", authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
