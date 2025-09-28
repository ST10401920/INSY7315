import React, { useState, useEffect } from "react";
import axios from "axios";
import PropertyManagerNavbar from "../../components/PropertyManagerNavbar";
import Footer from "../../components/Footer";
import { getSupabaseToken } from "../../utils/supabaseToken";

interface LeaseApplication {
  id: number;
  applicant_id: string;
  property_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  id_number: string;
  age: number;
  job_title: string;
  income: number;
  income_source: string;
  documents?: string;
  status: "pending" | "approved" | "rejected";
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const Lease: React.FC = () => {
  const [leaseApplications, setLeaseApplications] = useState<
    LeaseApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaseApplications();
  }, []);

  const fetchLeaseApplications = async () => {
    try {
      console.log("Fetching lease applications...");
      const token = await getSupabaseToken();
      console.log("Got token:", token ? "Token exists" : "No token");

      const response = await axios.get("http://localhost:3000/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response:", response.data);

      setLeaseApplications(response.data.applications || []); // API returns { applications: [...] }
      setLoading(false);
    } catch (err: any) {
      console.error(
        "Error fetching applications:",
        err.message,
        err.response?.data
      );
      setError(
        err.response?.data?.error || "Failed to fetch lease applications"
      );
      setLoading(false);
    }
  };

  const handleLeaseAction = async (
    leaseId: number,
    action: "approve" | "reject"
  ) => {
    try {
      const token = await getSupabaseToken();
      const response = await axios.put(
        `http://localhost:3000/applications/${leaseId}`,
        {
          status: action === "approve" ? "approved" : "rejected",
          notes: "", // optional notes field
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Update response:", response.data);

      // Only update UI if the server confirms the change
      if (response.data.application) {
        setLeaseApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.id === leaseId ? response.data.application : app
          )
        );

        // If it was approved and created a rental, you might want to show a success message
        if (response.data.rental) {
          alert("Application approved and rental created successfully!");
        }
      }

      // Update local state to reflect the change
      setLeaseApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === leaseId
            ? { ...app, status: action === "approve" ? "approved" : "rejected" }
            : app
        )
      );
    } catch (err: any) {
      console.error(
        "Error updating application:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.error || `Failed to ${action} lease application`;
      alert(errorMessage); // Show error to user
      setError(errorMessage);
    }
  };

  if (loading)
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          minHeight: "100vh",
          backgroundColor: "#ffffff",
        }}
      >
        <PropertyManagerNavbar />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: "600" }}>Loading...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          minHeight: "100vh",
          backgroundColor: "#ffffff",
        }}
      >
        <PropertyManagerNavbar />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div
            style={{ fontSize: "20px", fontWeight: "600", color: "#EF4444" }}
          >
            Error: {error}
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <PropertyManagerNavbar />
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px",
          marginTop: "80px",
        }}
      >
        <div style={{ padding: "24px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#000000",
              marginBottom: "24px",
            }}
          >
            Lease Applications
          </h1>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                borderCollapse: "separate",
                borderSpacing: 0,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                minWidth: "1000px", // Ensure table doesn't get too narrow
              }}
            >
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  {[
                    { name: "Applicant Name", width: "14%" },
                    { name: "Contact", width: "10%" },
                    { name: "ID & Age", width: "12%" },
                    { name: "Employment", width: "10%" },
                    { name: "Income Details", width: "14%" },
                    { name: "Property ID", width: "8%" },
                    { name: "Documents", width: "8%" },
                    { name: "Actions", width: "24%" },
                  ].map((header) => (
                    <th
                      key={header.name}
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#111827",
                        textTransform: "uppercase",
                        width: header.width,
                      }}
                    >
                      {header.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ borderTop: "1px solid #e5e7eb" }}>
                {leaseApplications.map((lease) => (
                  <tr
                    key={lease.id}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "";
                    }}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <td style={{ padding: "16px 24px", color: "#111827" }}>
                      <div style={{ fontWeight: "500" }}>
                        {lease.first_name} {lease.last_name}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", color: "#111827" }}>
                      {lease.phone_number}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#111827" }}>
                      <div>ID: {lease.id_number}</div>
                      <div>Age: {lease.age}</div>
                    </td>
                    <td style={{ padding: "16px 24px", color: "#111827" }}>
                      {lease.job_title}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#111827" }}>
                      <div style={{ fontWeight: "500" }}>
                        R{lease.income.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "14px", color: "#4B5563" }}>
                        Source: {lease.income_source}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", color: "#111827" }}>
                      {lease.property_id}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {lease.documents ? (
                        <a
                          href={lease.documents}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#2563EB",
                            textDecoration: "underline",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          View PDF
                        </a>
                      ) : (
                        <span style={{ color: "#6B7280", fontSize: "14px" }}>
                          No PDF
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                      {lease.status === "pending" && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() =>
                              handleLeaseAction(lease.id, "approve")
                            }
                            style={{
                              backgroundColor: "#10B981",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: "pointer",
                              border: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleLeaseAction(lease.id, "reject")
                            }
                            style={{
                              backgroundColor: "#EF4444",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: "pointer",
                              border: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {lease.status !== "pending" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor:
                              lease.status === "approved"
                                ? "#D1FAE5"
                                : "#FEE2E2",
                            color:
                              lease.status === "approved"
                                ? "#065F46"
                                : "#991B1B",
                          }}
                        >
                          {lease.status.charAt(0).toUpperCase() +
                            lease.status.slice(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Lease;
