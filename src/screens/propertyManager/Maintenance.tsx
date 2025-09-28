import React, { useState, useEffect } from "react";
import axios from "axios";
import PropertyManagerNavbar from "../../components/PropertyManagerNavbar";
import Footer from "../../components/Footer";
import { getSupabaseToken } from "../../utils/supabaseToken";

interface MaintenanceTask {
  id: number;
  property_id: number;
  rental_id: number;
  tenant_id: string;
  caretaker_id?: string;
  description: string;
  category: string;
  photos: string[];
  urgency: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  progress_notes: string[];
  created_at: string;
  updated_at: string;
}

interface Caretaker {
  id: string;
  first_name: string; // This will contain the email username
  last_name: string; // This will be empty
}

const Maintenance: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [selectedCaretaker, setSelectedCaretaker] = useState<string>("");

  useEffect(() => {
    fetchTasks();
    fetchCaretakers();
  }, []);

  const fetchCaretakers = async () => {
    try {
      const token = await getSupabaseToken();
      console.log("Fetching caretakers...");
      const response = await axios.get(
        "http://localhost:3000/maintenance/caretakers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Caretakers response:", response.data);
      setCaretakers(response.data.caretakers || []);
    } catch (err: any) {
      console.error("Error fetching caretakers:", err);
      console.error("Error details:", err.response?.data || err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = await getSupabaseToken();
      const response = await axios.get("http://localhost:3000/maintenance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.maintenance || []);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(
        err.response?.data?.error || "Failed to fetch maintenance tasks"
      );
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId: number) => {
    if (!selectedCaretaker) {
      alert("Please select a caretaker");
      return;
    }

    try {
      const token = await getSupabaseToken();
      await axios.put(
        `http://localhost:3000/maintenance/${taskId}/assign`,
        { caretakerId: selectedCaretaker },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh tasks after assignment
      fetchTasks();
      setSelectedTaskId(null);
      setSelectedCaretaker("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to assign task");
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "#D1FAE5",
          color: "#065F46",
        };
      case "in_progress":
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        };
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#374151",
        };
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
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#000000",
            marginBottom: "24px",
          }}
        >
          Maintenance Tasks
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
            padding: "24px",
          }}
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                padding: "20px",
                border: "1px solid #E5E7EB",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                >
                  {task.category}
                </span>
                <span
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: "4px 8px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: getUrgencyColor(task.urgency),
                  }}
                >
                  {task.urgency.toUpperCase()}
                </span>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  color: "#111827",
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                {task.description}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                  }}
                >
                  Property ID: {task.property_id}
                </span>
                <span
                  style={{
                    ...getStatusBadgeStyle(task.status),
                    padding: "4px 8px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {task.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {(task.status === "pending" || task.status === "in_progress") && (
                <>
                  {selectedTaskId === task.id ? (
                    <div style={{ marginTop: "12px" }}>
                      <select
                        value={selectedCaretaker}
                        onChange={(e) => setSelectedCaretaker(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "2px solid #D1D5DB",
                          marginBottom: "12px",
                          fontSize: "14px",
                          backgroundColor: "white",
                          color: "#374151",
                          outline: "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <option value="">Select a caretaker</option>
                        {caretakers.map((caretaker) => (
                          <option key={caretaker.id} value={caretaker.id}>
                            {caretaker.first_name}
                          </option>
                        ))}
                      </select>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleAssignTask(task.id)}
                          style={{
                            background:
                              "linear-gradient(to right, #50bc72, #41599c)",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            border: "none",
                            cursor: "pointer",
                            flex: 1,
                            transition: "all 0.3s ease",
                          }}
                        >
                          {task.caretaker_id ? "Reassign" : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTaskId(null);
                            setSelectedCaretaker("");
                          }}
                          style={{
                            background: "transparent",
                            color: "#000",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            border: "2px solid #000",
                            cursor: "pointer",
                            flex: 1,
                            transition: "all 0.3s ease",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          // prefill with currently assigned caretaker if any
                          setSelectedCaretaker(task.caretaker_id || "");
                        }}
                        style={{
                          background:
                            "linear-gradient(to right, #50bc72, #41599c)",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          border: "none",
                          cursor: "pointer",
                          width: "100%",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {task.caretaker_id ? (
                          <>Reassign Task</>
                        ) : (
                          <>Assign Task</>
                        )}
                      </button>
                      {task.caretaker_id && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "13px",
                            color: "#374151",
                          }}
                        >
                          Assigned to:{" "}
                          {caretakers.find((c) => c.id === task.caretaker_id)
                            ?.first_name || task.caretaker_id}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Maintenance;
