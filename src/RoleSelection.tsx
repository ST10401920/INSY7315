import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import supabase from "../SupabaseClient";
import styles from "./signinStyles";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const roles = [
  { value: "property_manager", label: "Property Manager" },
  { value: "caretaker", label: "Caretaker" },
];

const RoleSelection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId") || "";
  const [selectedRole, setSelectedRole] = useState<string>("");
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

  // Check if user already has a role on component mount
  useEffect(() => {
    const checkExistingRole = async () => {
      if (!userId) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) throw error;

        // If user already has a role, redirect them
        if (profile && profile.role) {
          redirectToRoleDashboard(profile.role);
        }
      } catch (err) {
        console.error("Error checking existing role:", err);
      }
    };

    checkExistingRole();
  }, [userId]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRoleSelect = async () => {
    if (!selectedRole || !userId) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", userId);
      if (error) throw error;

      // Show success message
      setSuccessMessage(
        `Role set successfully! Redirecting you to your dashboard...`
      );

      // Redirect based on role after a short delay to show success
      setTimeout(() => {
        redirectToRoleDashboard(selectedRole);
      }, 1500);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container as React.CSSProperties}>
      <div
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}
      >
        <Navbar />
      </div>
      <section
        style={{
          ...styles.section,
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 120,
        }}
      >
        <div
          style={{
            ...styles.card,
            maxWidth: 400,
            width: "100%",
            margin: "0 auto",
            padding: "32px 24px",
            boxShadow: "0 4px 12px rgba(80,188,114,0.08)",
            borderRadius: "16px",
            border: "2px solid #50bc72",
            background: "#fff",
          }}
        >
          <h2
            style={
              {
                ...styles.title,
                marginBottom: 12,
                textAlign: "center",
              } as React.CSSProperties
            }
          >
            Select Your Role
          </h2>
          <p
            style={
              {
                ...styles.subtitle,
                marginBottom: 24,
                textAlign: "center",
                color: "#6b7280",
              } as React.CSSProperties
            }
          >
            Choose your user role. This can only be set once.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              margin: "32px 0",
            }}
          >
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                style={{
                  ...styles.submitButton,
                  background:
                    selectedRole === role.value ? "#50bc72" : "#f3f4f6",
                  color: selectedRole === role.value ? "#fff" : "#222",
                  fontWeight: 600,
                  border:
                    selectedRole === role.value
                      ? "2px solid #50bc72"
                      : "1px solid #e5e7eb",
                  padding: "16px 0",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "18px",
                  boxShadow:
                    selectedRole === role.value
                      ? "0 2px 8px rgba(80,188,114,0.12)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {role.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRoleSelect}
            style={{
              ...styles.submitButton,
              marginTop: 24,
              width: "100%",
              padding: "14px 0",
              fontSize: "17px",
              borderRadius: "8px",
            }}
            disabled={!selectedRole || isLoading}
          >
            {isLoading ? "Saving..." : "Confirm Role"}
          </button>
          {error && (
            <div
              style={
                { ...styles.errorBox, marginTop: 18 } as React.CSSProperties
              }
            >
              <p style={styles.errorText as React.CSSProperties}>{error}</p>
            </div>
          )}
          {successMessage && (
            <div
              style={{
                backgroundColor: "#d1fae5",
                borderColor: "#50bc72",
                borderWidth: "1px",
                borderStyle: "solid",
                borderRadius: "8px",
                padding: "12px 16px",
                marginTop: "18px",
              }}
            >
              <p style={{ color: "#047857", margin: 0, fontWeight: 500 }}>
                {successMessage}
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default RoleSelection;
