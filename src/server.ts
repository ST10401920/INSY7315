import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error('Supabase keys are not configured correctly.');
}

// Client for privileged, server-side actions
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

// Middleware to protect routes by verifying the JWT
const protect = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    (req as any).user = user;
    next();
};

// --- Authentication Routes (Client-Facing) ---
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  const { data: { user }, error } = await supabaseAdmin.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ message: 'User created. Check email for verification.' });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }
  // Return the Supabase session to the client
  res.status(200).json(data.session);
});

// --- Google SSO Routes ---
app.get('/auth/google', async (req, res) => {
  const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // This is a crucial redirect URL for your frontend
      redirectTo: `${process.env.EXPRESS_API_URL}/auth/callback/google`
    }
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.redirect(data.url);
});

app.get('/auth/callback/google', async (req, res) => {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).json({ error: 'Code not provided' });
    }

    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
    if (error) {
        return res.status(400).json({ error: error.message });
    }

    // This is a simple response for demonstration.
    // In a real app, you would redirect to your React/Mobile app with the token
    // e.g., res.redirect(`myapp://auth?token=${data.session.access_token}`);
    res.json({ session: data.session });
});

// --- Protected Routes ---
app.get('/api/profile', protect, async (req, res) => {
  const user = (req as any).user;

  // Fetch the user's role from your `profiles` table
  const { data, error } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }

  res.json({ email: user.email, role: data.role });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));