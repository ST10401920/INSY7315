"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./signinStyles";
import Footer from "./components/Footer";
import logo from "./assets/Nestify-Logo.png";
import supabase from "../SupabaseClient";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to redirect users based on their role
  const redirectToRoleDashboard = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "property_manager":
        navigate("/property-manager/dashboard");
        break;
      case "caretaker":
        navigate("/caretaker/tasks");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const EyeIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Get user data after successful login
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Check if the user has a role assigned
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          // Redirect to the appropriate dashboard based on user's role
          redirectToRoleDashboard(profile.role);
        } else {
          // If no role is assigned yet, redirect to role selection
          navigate(`/RoleSelection?userId=${user.id}`);
        }
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/login?source=google_sso",
        },
      });
      if (error) throw error;
      // User will be redirected to Google
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for authentication state and role on component mount
  // Handles redirects after Google SSO login completion
  useEffect(() => {
    const checkAuthAndRole = async () => {
      console.log("Checking authentication state...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("User is authenticated, checking role...");
        // User is authenticated, check their role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role) {
          // If role exists, redirect to the appropriate dashboard
          console.log(`User has role: ${profile.role}, redirecting...`);
          redirectToRoleDashboard(profile.role);
        } else {
          // If no role is assigned yet, redirect to role selection
          console.log("No role assigned, redirecting to role selection...");
          navigate(`/RoleSelection?userId=${session.user.id}`);
        }
      } else {
        console.log("No active session found");
      }
    };

    // Execute immediately
    checkAuthAndRole();
  }, [navigate]);

  return (
    <div style={styles.container as React.CSSProperties}>
      <style>{`@keyframes pulse{0%,100%{opacity:0.05}50%{opacity:0.1}}`}</style>

      <header style={styles.headerBar as React.CSSProperties}>
        <div style={styles.headerContainer as React.CSSProperties}>
          <div style={styles.navbar as React.CSSProperties} className="navbar">
            <a
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              style={styles.logo as React.CSSProperties}
              href="#"
              role="button"
            >
              <img
                src={logo}
                alt="Nestify Logo"
                style={{ width: "32px", height: "32px", borderRadius: "8px" }}
              />
              <span style={styles.logoText as React.CSSProperties}>
                Nestify
              </span>
            </a>
            <nav style={styles.nav as React.CSSProperties} className="nav">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/properties");
                }}
                style={styles.navLink as React.CSSProperties}
                className="nav-link"
                href="#"
                role="button"
              >
                View Properties
              </a>
              <a
                href="#contact"
                style={styles.navLink as React.CSSProperties}
                className="nav-link"
              >
                Contact
              </a>
            </nav>
            <button
              type="button"
              style={styles.backButton as React.CSSProperties}
              className="back-button"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <section
        style={
          {
            ...styles.section,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          } as React.CSSProperties
        }
      >
        <div style={styles.backgroundCircle1 as React.CSSProperties} />
        <div style={styles.backgroundCircle2 as React.CSSProperties} />

        <div
          style={
            {
              ...styles.formContainer,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: 400,
              margin: "0 auto",
            } as React.CSSProperties
          }
        >
          <div style={styles.header as React.CSSProperties}>
            <h1 style={styles.title as React.CSSProperties}>Welcome Back</h1>
            <p style={styles.subtitle as React.CSSProperties}>
              Sign in to access your property management dashboard
            </p>
          </div>

          <div
            style={
              {
                ...styles.card,
                width: "100%",
                boxSizing: "border-box",
              } as React.CSSProperties
            }
          >
            <div style={styles.cardHeader as React.CSSProperties}>
              <h2 style={styles.cardTitle as React.CSSProperties}>Sign In</h2>
              <p style={styles.cardDescription as React.CSSProperties}>
                Enter your credentials to access your account
              </p>
            </div>

            <div
              style={
                {
                  ...styles.cardContent,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                } as React.CSSProperties
              }
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  width: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={handleGoogleSSO}
                  style={styles.googleButton as React.CSSProperties}
                  className="google-button"
                >
                  <GoogleIcon />
                  <span style={{ marginLeft: 8 }}>Sign in with Google</span>
                </button>
                <div
                  style={{
                    textAlign: "center",
                    margin: "12px 0",
                    color: "#6b7280",
                  }}
                >
                  Or continue with email
                </div>
                <input
                  className="input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={
                    {
                      ...styles.input,
                      width: "100%",
                      boxSizing: "border-box",
                    } as React.CSSProperties
                  }
                  required
                />
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={
                      {
                        ...styles.input,
                        width: "100%",
                        boxSizing: "border-box",
                      } as React.CSSProperties
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                // ...existing code...
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    style={styles.checkbox as React.CSSProperties}
                  />
                  <span
                    style={{
                      ...styles.rememberText,
                      color: "#222",
                      fontWeight: 500,
                    }}
                  >
                    Remember me
                  </span>
                </label>
                {error && (
                  <div style={styles.errorBox as React.CSSProperties}>
                    <p style={styles.errorText as React.CSSProperties}>
                      {error}
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  style={styles.submitButton as React.CSSProperties}
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </form>
              <div
                style={{ ...styles.toggleText, color: "#222", marginTop: 16 }}
              >
                <p>
                  Don't have an account?{" "}
                  <a
                    href="/CreateAccount"
                    style={{
                      ...styles.toggleButton,
                      color: "#50bc72",
                      fontWeight: 600,
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LoginPage;
