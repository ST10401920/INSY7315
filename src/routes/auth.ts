import { Router, Request, Response } from "express";
import { supabase } from "../supabaseClient";
import admin from "firebase-admin";
import serviceAccount from "../config/serviceAccountKey.json";

const router = Router();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

router.get("/google", async (req: Request, res: Response) => {
  //update this redirect to what the app is called or its deep link??????
  const redirectTo = "http://localhost:3000/auth/callback";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) return res.status(400).json({ error: error.message });
  res.redirect(data.url);
});

router.get("/callback", (req: Request, res: Response) => {
  res.send(`
    <html>
      <head><title>Login Successful</title></head>
      <body>
        <h1>Login Successful!</h1>
        <p>Access token is in the URL hash: <code>#access_token=...</code></p>
      </body>
    </html>
  `);
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session)
    return res.status(401).json({ error: error?.message || "Login failed" });
// Changes Made
  res.json({
    accessToken: data.session.access_token, 
    userId: data.user?.id,
    email: data.user?.email,
  });
});

router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ access_token: data.session?.access_token, user: data.user });
});

router.post("/firebase", async (req: Request, res: Response) => {
  const { firebaseToken } = req.body;
  if (!firebaseToken)
    return res.status(400).json({ error: "No token provided" });

  try {
    // 1. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = decodedToken.email;
    if (!email)
      return res.status(400).json({ error: "Firebase user has no email" });

    // 2. List users and filter by email
    const { data: usersData, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    const existingUser = usersData?.users.find((u: any) => u.email === email);

    let userId: string;

    if (!existingUser) {
      // 3. Create user in Supabase Auth if not found
      const { data: createdUser, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
        });

      if (createError) throw createError;
      userId = createdUser.user.id;
    } else {
      userId = existingUser.id;
    }

    // 4. Return the Supabase auth.users.id
    res.status(200).json({
      message: "Firebase user synced with Supabase",
      userId,
      email,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid token or Supabase error" });
  }
});

export default router;
