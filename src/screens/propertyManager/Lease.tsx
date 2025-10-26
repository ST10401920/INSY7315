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
  documents?: boolean; // Changed to boolean
  status: "pending" | "approved" | "rejected";
  approved_at?: string;
  notes?: string;
  submitted_at: string;
}

interface Lease {
  id: number;
  manager_id: string;
  tenant_id: string;
  application_id: number; // Add this field
  lease_document: string;
  signed_document?: string;
  status: "sent_to_tenant" | "signed_by_tenant" | "acknowledged_by_manager";
  created_at: string;
  updated_at: string;
}

const Lease: React.FC = () => {
  const [leaseApplications, setLeaseApplications] = useState<
    LeaseApplication[]
  >([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingLease, setSendingLease] = useState<number | null>(null);
  const [leaseDocument, setLeaseDocument] = useState<File | null>(null);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] =
    useState<LeaseApplication | null>(null);

  useEffect(() => {
    fetchLeaseApplications();
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      const token = await getSupabaseToken();
      const response = await axios.get(
        "https://insy7315-api-deploy.onrender.com/leases",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched leases:", response.data.leases); // Debug log
      setLeases(response.data.leases || []);
    } catch (err: any) {
      console.error("Error fetching leases:", err.message);
    }
  };

  const fetchLeaseApplications = async () => {
    try {
      console.log("Fetching lease applications...");
      const token = await getSupabaseToken();
      console.log("Got token:", token ? "Token exists" : "No token");

      const response = await axios.get(
        "https://insy7315-api-deploy.onrender.com/applications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
        `https://insy7315-api-deploy.onrender.com/applications/${leaseId}`,
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

        // If it was approved and created a rental
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

  const handleSendLease = async () => {
    if (!selectedApplicant || !leaseDocument) {
      alert("Please select a lease document file");
      return;
    }

    setSendingLease(selectedApplicant.id);
    try {
      const token = await getSupabaseToken();

      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Extract base64 data (remove the data:application/pdf;base64, prefix)
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(leaseDocument);
      });

      // Send as JSON with base64 file data
      const response = await axios.post(
        "https://insy7315-api-deploy.onrender.com/leases",
        {
          tenantId: selectedApplicant.applicant_id,
          applicationId: selectedApplicant.id, // Add the application ID
          lease_document: `data:application/pdf;base64,${fileBase64}`,
          filename: leaseDocument.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Lease sent:", response.data);
      alert("Lease document sent successfully to tenant!");

      // Refresh leases
      await fetchLeases();

      // Close modal and reset
      setShowLeaseModal(false);
      setLeaseDocument(null);
      setSelectedApplicant(null);
    } catch (err: any) {
      console.error("Error sending lease:", err.response?.data || err.message);
      alert("Failed to send lease document. Please try again.");
    } finally {
      setSendingLease(null);
    }
  };

  const handleAcknowledgeLease = async (leaseId: number) => {
    try {
      const token = await getSupabaseToken();
      await axios.put(
        `https://insy7315-api-deploy.onrender.com/leases/${leaseId}`,
        { action: "acknowledge" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Lease acknowledged successfully!");
      await fetchLeases();
    } catch (err: any) {
      console.error(
        "Error acknowledging lease:",
        err.response?.data || err.message
      );
      alert("Failed to acknowledge lease. Please try again.");
    }
  };

  const downloadApplicationDocument = async (applicationId: number) => {
    try {
      console.log(`Requesting document for application ID: ${applicationId}`);
      const token = await getSupabaseToken();
      const response = await axios.get(
        `https://insy7315-api-deploy.onrender.com/applications/${applicationId}/document`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API Response:", response.data);
      console.log("Response status:", response.status);

      const { document: documentData } = response.data;
      const filename = `application-${applicationId}-documents.pdf`;

      if (!documentData) {
        console.log("No document found in response");
        alert("No document found for this application.");
        return;
      }

      console.log("Document type:", typeof documentData);
      console.log("Document preview:", documentData?.substring?.(0, 100));

      let base64Data = "";

      // Handle different document formats
      if (typeof documentData === "string") {
        try {
          // Try to parse as JSON array first (your current format)
          const parsed = JSON.parse(documentData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log("Document is JSON array format");
            base64Data = parsed[0]; // Get first element from array
          } else {
            console.log("Document is plain string");
            base64Data = documentData;
          }
        } catch (e) {
          // If JSON parsing fails, treat as plain string
          console.log("Document is plain string (JSON parse failed)");
          base64Data = documentData;
        }
      } else {
        console.log("Document is not a string");
        alert("Document format not supported.");
        return;
      }

      // Remove data URL prefix if present
      if (base64Data.startsWith("data:")) {
        console.log("Removing data URL prefix");
        base64Data = base64Data.split(",")[1];
      }

      console.log("Processing base64 data, length:", base64Data.length);

      try {
        // Convert base64 to blob for download
        const byteCharacters = atob(base64Data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
        console.log("Download initiated successfully");
      } catch (decodeError) {
        console.error("Error decoding base64:", decodeError);
        alert("Error processing document. The file may be corrupted.");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Error downloading document. Please try again.");
    }
  };

  // Helper function to find lease for an applicant
  const getLeaseForApplicant = (
    applicantId: string,
    applicationId?: number
  ) => {
    // If we have an application ID, match by that (most accurate)
    if (applicationId) {
      return leases.find((lease) => lease.application_id === applicationId);
    }
    // Fallback: match by tenant_id (less accurate, may find wrong lease)
    return leases.find((lease) => lease.tenant_id === applicantId);
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#000000",
                margin: 0,
              }}
            >
              Lease Applications
            </h1>
            <button
              onClick={() => {
                fetchLeases();
                fetchLeaseApplications();
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🔄 Refresh
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                borderCollapse: "separate",
                borderSpacing: 0,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                minWidth: "1400px", // Ensure table doesn't get too narrow
              }}
            >
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  {[
                    { name: "Applicant Name", width: "12%" },
                    { name: "Contact", width: "8%" },
                    { name: "ID & Age", width: "10%" },
                    { name: "Employment", width: "8%" },
                    { name: "Income Details", width: "12%" },
                    { name: "Property ID", width: "6%" },
                    { name: "Documents", width: "6%" },
                    { name: "Actions", width: "18%" },
                    { name: "Lease Status", width: "10%" },
                    { name: "Signed Document", width: "10%" },
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
                        <button
                          onClick={() => downloadApplicationDocument(lease.id)}
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "5px 10px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          View PDF
                        </button>
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
                      {lease.status === "approved" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            flexDirection: "column",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: "#D1FAE5",
                              color: "#065F46",
                            }}
                          >
                            Approved
                          </span>
                          {!getLeaseForApplicant(
                            lease.applicant_id,
                            lease.id
                          ) && (
                            <button
                              onClick={() => {
                                setSelectedApplicant(lease);
                                setShowLeaseModal(true);
                              }}
                              style={{
                                backgroundColor: "#3B82F6",
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
                              Send Lease
                            </button>
                          )}
                        </div>
                      )}
                      {lease.status === "rejected" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: "#FEE2E2",
                            color: "#991B1B",
                          }}
                        >
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Lease Status Column */}
                    <td style={{ padding: "16px 24px" }}>
                      {(() => {
                        // Only show lease info for approved applications
                        if (lease.status !== "approved") {
                          return (
                            <span
                              style={{ color: "#6B7280", fontSize: "12px" }}
                            >
                              N/A
                            </span>
                          );
                        }

                        const leaseDoc = getLeaseForApplicant(
                          lease.applicant_id,
                          lease.id
                        );
                        if (!leaseDoc) {
                          return (
                            <span
                              style={{ color: "#6B7280", fontSize: "12px" }}
                            >
                              No lease sent
                            </span>
                          );
                        }

                        const statusColors = {
                          sent_to_tenant: { bg: "#FEF3C7", text: "#92400E" },
                          signed_by_tenant: { bg: "#D1FAE5", text: "#065F46" },
                          acknowledged_by_manager: {
                            bg: "#E0E7FF",
                            text: "#3730A3",
                          },
                        };

                        const color = statusColors[leaseDoc.status];

                        return (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 8px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: "500",
                                backgroundColor: color.bg,
                                color: color.text,
                              }}
                            >
                              {leaseDoc.status
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>

                            {leaseDoc.status === "signed_by_tenant" && (
                              <button
                                onClick={() =>
                                  handleAcknowledgeLease(leaseDoc.id)
                                }
                                style={{
                                  backgroundColor: "#10B981",
                                  color: "white",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  cursor: "pointer",
                                  border: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Acknowledge
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Signed Document Column */}
                    <td style={{ padding: "16px 24px" }}>
                      {(() => {
                        // Only show signed documents for approved applications
                        if (lease.status !== "approved") {
                          return (
                            <span
                              style={{ color: "#6B7280", fontSize: "12px" }}
                            >
                              N/A
                            </span>
                          );
                        }

                        const leaseDoc = getLeaseForApplicant(
                          lease.applicant_id,
                          lease.id
                        );
                        console.log(
                          `Checking signed doc for applicant ${lease.applicant_id}:`,
                          leaseDoc
                        ); // Debug log

                        if (leaseDoc?.signed_document) {
                          console.log(
                            `Found signed document: ${leaseDoc.signed_document}`
                          ); // Debug log

                          const handleViewSigned = () => {
                            try {
                              if (!leaseDoc.signed_document) return;

                              // Convert base64 to blob for viewing
                              let base64Data = leaseDoc.signed_document;

                              // Remove data URL prefix if present
                              if (base64Data.includes(",")) {
                                base64Data = base64Data.split(",")[1];
                              }

                              // Clean the base64 string - remove any whitespace or invalid characters
                              base64Data = base64Data.replace(
                                /[^A-Za-z0-9+/=]/g,
                                ""
                              );

                              // Validate base64 string length (should be multiple of 4)
                              while (base64Data.length % 4 !== 0) {
                                base64Data += "=";
                              }

                              console.log(
                                "Cleaned base64 data length:",
                                base64Data.length
                              );
                              console.log(
                                "First 100 chars:",
                                base64Data.substring(0, 100)
                              );

                              const byteCharacters = atob(base64Data);
                              const byteNumbers = new Array(
                                byteCharacters.length
                              );
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], {
                                type: "application/pdf",
                              });
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, "_blank");

                              // Clean up the URL after a short delay
                              setTimeout(
                                () => window.URL.revokeObjectURL(url),
                                1000
                              );
                            } catch (error) {
                              console.error("Error opening PDF:", error);
                              console.error(
                                "Base64 data:",
                                leaseDoc.signed_document?.substring(0, 200)
                              );

                              // Fallback: try to download the PDF instead
                              try {
                                const link = document.createElement("a");
                                link.href = leaseDoc.signed_document || "";
                                link.download = "signed-lease.pdf";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } catch (downloadError) {
                                alert(
                                  "Error opening signed document. The file may be corrupted. Please contact support."
                                );
                              }
                            }
                          };

                          return (
                            <button
                              onClick={handleViewSigned}
                              style={{
                                color: "#2563EB",
                                background: "none",
                                border: "none",
                                textDecoration: "underline",
                                fontSize: "12px",
                                fontWeight: "500",
                                cursor: "pointer",
                              }}
                            >
                              View Signed
                            </button>
                          );
                        }
                        return (
                          <span style={{ color: "#6B7280", fontSize: "12px" }}>
                            Not signed
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lease Modal */}
      {showLeaseModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Send Lease Document
            </h2>

            {selectedApplicant && (
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
                  <strong>Tenant:</strong> {selectedApplicant.first_name}{" "}
                  {selectedApplicant.last_name}
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                >
                  <strong>Phone:</strong> {selectedApplicant.phone_number}
                </p>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Lease Document (PDF) *
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setLeaseDocument(e.target.files?.[0] || null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#f9fafb",
                }}
              />
              {leaseDocument && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px 12px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#374151" }}>
                    Selected: {leaseDocument.name}
                  </span>
                  <button
                    onClick={() => setLeaseDocument(null)}
                    style={{
                      marginLeft: "8px",
                      color: "#ef4444",
                      background: "none",
                      border: "none",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: "4px 0 0 0",
                }}
              >
                Upload a PDF lease document to send to the tenant
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowLeaseModal(false);
                  setLeaseDocument(null);
                  setSelectedApplicant(null);
                }}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendLease}
                disabled={
                  !leaseDocument || sendingLease === selectedApplicant?.id
                }
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #50bc72, #41599c)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor:
                    sendingLease === selectedApplicant?.id
                      ? "not-allowed"
                      : "pointer",
                  opacity: sendingLease === selectedApplicant?.id ? 0.6 : 1,
                }}
              >
                {sendingLease === selectedApplicant?.id
                  ? "Sending..."
                  : "Send Lease"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Lease;
