import React, { useState, useEffect } from "react";
import axios from "axios";
import CaretakerNavbar from "../../components/CaretakerNavbar";
import Footer from "../../components/Footer";
import { getSupabaseToken } from "../../utils/auth";
import "./Task.css";

// Interface for task data structure from API
interface Task {
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
  progress_notes?: string[];
  created_at: string;
  updated_at: string;
  // Additional fields that we'll get from joins or separate calls
  property_name?: string;
  property_unit?: string;
  tenant_name?: string;
  tenant_contact?: string;
}

const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch tasks assigned to the current caretaker
  const fetchTasks = async () => {
    try {
      const token = await getSupabaseToken();
      const response = await axios.get(
        "http://localhost:3000/maintenance/assigned",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks(response.data.maintenance || []);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Update task status
  const updateTaskStatus = async (
    taskId: number,
    newStatus: "pending" | "in_progress" | "completed"
  ) => {
    try {
      const token = await getSupabaseToken();
      await axios.patch(
        `http://localhost:3000/maintenance/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : task
        )
      );

      // Show success message
      setStatusUpdateMessage(`Task status updated to ${newStatus}`);
      setTimeout(() => setStatusUpdateMessage(""), 3000);

      // Close modal if task is set to completed
      if (newStatus === "completed" && activeTask?.id === taskId) {
        setTimeout(() => setActiveTask(null), 1500);
      }
    } catch (err: any) {
      console.error("Error updating task status:", err);
      setStatusUpdateMessage("Failed to update task status");
    }
  };

  // Handle file selection for image upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  // Submit completion photos
  const submitCompletionPhotos = async (taskId: number) => {
    if (uploadedImages.length === 0) return;

    try {
      const formData = new FormData();
      uploadedImages.forEach((file) => {
        formData.append("photos", file);
      });

      const token = await getSupabaseToken();
      const response = await axios.post(
        `http://localhost:3000/maintenance/${taskId}/photos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update task with new photos from API response
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                photos: [...task.photos, ...response.data.photos],
                updated_at: new Date().toISOString(),
              }
            : task
        )
      );

      // Clear uploaded files
      setUploadedImages([]);

      // Show success message
      setStatusUpdateMessage("Photos uploaded successfully");
      setTimeout(() => setStatusUpdateMessage(""), 3000);
    } catch (err: any) {
      console.error("Error uploading images:", err);
      setStatusUpdateMessage("Failed to upload images");
    }
  };

  // Filter tasks by status
  const filteredTasks =
    filterStatus === "all"
      ? tasks
      : tasks.filter((task) => task.status === filterStatus);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get appropriate background color for urgency levels
  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "#e5f6ff";
      case "medium":
        return "#fff8e6";
      case "high":
        return "#ffe9e6";
      default:
        return "#f3f4f6";
    }
  };

  // Get appropriate text color for urgency levels
  const getPriorityTextColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "#0284c7";
      case "medium":
        return "#ca8a04";
      case "high":
        return "#dc2626";
      default:
        return "#374151";
    }
  };

  // Get appropriate status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#fef3c7", text: "#d97706" };
      case "in progress":
        return { bg: "#e0f2fe", text: "#0369a1" };
      case "completed":
        return { bg: "#d1fae5", text: "#047857" };
      default:
        return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: "#f9fafb",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      overflowX: "hidden",
    },
    content: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "120px 24px 48px",
      width: "100%",
      boxSizing: "border-box",
    },
    heading: {
      fontSize: "30px",
      fontWeight: "bold",
      marginBottom: "24px",
      color: "#111827",
    },
    filtersBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px",
    },
    filterGroup: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    filterButton: {
      padding: "8px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      background: "white",
      color: "#374151",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    filterButtonActive: {
      background: "linear-gradient(135deg, #50bc72, #41599c)",
      color: "white",
      border: "none",
    },
    searchInput: {
      padding: "8px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      minWidth: "200px",
    },
    taskCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      marginBottom: "24px",
    },
    taskHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #f3f4f6",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
    },
    taskTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      margin: 0,
      marginBottom: "4px",
    },
    taskProperty: {
      fontSize: "14px",
      color: "#6b7280",
      margin: 0,
    },
    priorityBadge: {
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block",
      marginTop: "6px",
    },
    statusBadge: {
      padding: "4px 12px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block",
    },
    taskContent: {
      padding: "16px 24px",
    },
    taskDescription: {
      color: "#374151",
      margin: "0 0 16px 0",
      lineHeight: 1.6,
    },
    taskMeta: {
      fontSize: "14px",
      color: "#6b7280",
      display: "flex",
      gap: "24px",
      flexWrap: "wrap",
      marginBottom: "16px",
    },
    taskMetaItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    imagePreviewContainer: {
      display: "flex",
      gap: "12px",
      overflowX: "auto",
      paddingBottom: "12px",
      marginBottom: "16px",
    },
    imagePreview: {
      width: "120px",
      height: "90px",
      objectFit: "cover",
      borderRadius: "8px",
      cursor: "pointer",
    },
    taskActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      padding: "16px 24px",
      borderTop: "1px solid #f3f4f6",
      backgroundColor: "#fafafa",
    },
    button: {
      padding: "10px 16px",
      borderRadius: "8px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "none",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
    },
    buttonPrimary: {
      background: "linear-gradient(135deg, #50bc72, #41599c)",
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: "white",
      color: "#374151",
      border: "1px solid #e5e7eb",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "24px",
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      width: "100%",
      maxWidth: "800px",
      maxHeight: "90vh",
      overflow: "auto",
    },
    modalHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #f3f4f6",
      position: "sticky",
      top: 0,
      backgroundColor: "white",
      zIndex: 1,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalClose: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#9ca3af",
    },
    modalBody: {
      padding: "24px",
    },
    modalSection: {
      marginBottom: "32px",
    },
    modalSectionTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "16px",
    },
    uploadContainer: {
      border: "2px dashed #e5e7eb",
      padding: "32px 24px",
      borderRadius: "8px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s",
      marginBottom: "16px",
    },
    uploadContainerHover: {
      borderColor: "#50bc72",
      backgroundColor: "rgba(80, 188, 114, 0.05)",
    },
    uploadInput: {
      display: "none",
    },
    uploadIcon: {
      fontSize: "32px",
      color: "#9ca3af",
      marginBottom: "12px",
    },
    uploadText: {
      color: "#6b7280",
    },
    selectedFilesList: {
      marginTop: "16px",
    },
    selectedFile: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 12px",
      backgroundColor: "#f9fafb",
      borderRadius: "4px",
      marginBottom: "8px",
    },
    statusAlert: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      padding: "12px 20px",
      background: "linear-gradient(135deg, #50bc72, #41599c)",
      color: "white",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      zIndex: 1000,
      animation: "slideIn 0.3s ease-out",
    },
    modalFooter: {
      padding: "16px 24px",
      borderTop: "1px solid #f3f4f6",
      backgroundColor: "#fafafa",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      position: "sticky",
      bottom: 0,
    },
    imageGallery: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "20px",
    },
    galleryImageContainer: {
      position: "relative",
      borderRadius: "8px",
      overflow: "hidden",
    },
    galleryImage: {
      width: "100%",
      aspectRatio: "4/3",
      objectFit: "cover",
    },
    galleryImageCaption: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "8px 12px",
      backgroundColor: "rgba(0,0,0,0.7)",
      color: "white",
      fontSize: "12px",
    },
    statusButtons: {
      display: "flex",
      gap: "8px",
      marginTop: "16px",
    },
    noteSection: {
      marginTop: "20px",
      padding: "16px",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
    },
    noteText: {
      margin: 0,
      color: "#374151",
    },
  };

  return (
    <div className="task-container" style={styles.container}>
      <CaretakerNavbar />
      <main style={styles.content}>
        <h1 style={styles.heading}>Maintenance Task Board</h1>

        {/* Filters */}
        <div style={styles.filtersBar}>
          <div style={styles.filterGroup}>
            <button
              style={{
                ...styles.filterButton,
                ...(filterStatus === "all" ? styles.filterButtonActive : {}),
              }}
              onClick={() => setFilterStatus("all")}
            >
              All Tasks
            </button>
            <button
              style={{
                ...styles.filterButton,
                ...(filterStatus === "pending"
                  ? styles.filterButtonActive
                  : {}),
              }}
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </button>
            <button
              style={{
                ...styles.filterButton,
                ...(filterStatus === "in_progress"
                  ? styles.filterButtonActive
                  : {}),
              }}
              onClick={() => setFilterStatus("in_progress")}
            >
              In Progress
            </button>
            <button
              style={{
                ...styles.filterButton,
                ...(filterStatus === "completed"
                  ? styles.filterButtonActive
                  : {}),
              }}
              onClick={() => setFilterStatus("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  style={styles.taskCard}
                  className="task-card"
                >
                  <div style={styles.taskHeader}>
                    <div>
                      <h3 style={styles.taskTitle}>{task.category}</h3>
                      <p style={styles.taskProperty}>
                        {task.property_name || "Property"}{" "}
                        {task.property_unit && `• ${task.property_unit}`}
                      </p>
                      <div
                        style={{
                          ...styles.priorityBadge,
                          backgroundColor: getPriorityColor(task.urgency),
                          color: getPriorityTextColor(task.urgency),
                        }}
                      >
                        {task.urgency.charAt(0).toUpperCase() +
                          task.urgency.slice(1)}{" "}
                        Priority
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(task.status).bg,
                          color: getStatusColor(task.status).text,
                        }}
                      >
                        {task.status === "in_progress"
                          ? "In Progress"
                          : task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div style={styles.taskContent}>
                    <p style={styles.taskDescription}>{task.description}</p>
                    <div style={styles.taskMeta}>
                      <div style={styles.taskMetaItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Submitted {formatDate(task.created_at)}</span>
                      </div>
                      <div style={styles.taskMetaItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{task.tenant_name || "Tenant"}</span>
                      </div>
                    </div>

                    {/* Image previews */}
                    {task.photos && task.photos.length > 0 && (
                      <div style={styles.imagePreviewContainer}>
                        {task.photos.map((photoUrl, index) => (
                          <img
                            key={index}
                            src={photoUrl}
                            alt="Task image"
                            style={styles.imagePreview}
                            onClick={() => setActiveTask(task)}
                          />
                        ))}
                      </div>
                    )}

                    {task.progress_notes && task.progress_notes.length > 0 && (
                      <div style={styles.noteSection}>
                        <p
                          style={{
                            ...styles.noteText,
                            fontWeight: 500,
                            marginBottom: "4px",
                          }}
                        >
                          Notes:
                        </p>
                        <p style={styles.noteText}>
                          {task.progress_notes[task.progress_notes.length - 1]}
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={styles.taskActions}>
                    <button
                      style={{ ...styles.button, ...styles.buttonSecondary }}
                      onClick={() => setActiveTask(task)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#6b7280",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: "0 auto 16px", color: "#9ca3af" }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
                <p>No tasks found with the current filter</p>
              </div>
            )}
          </>
        )}

        {/* Task Detail Modal */}
        {activeTask && (
          <div style={styles.modalOverlay} onClick={() => setActiveTask(null)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2 style={{ margin: 0 }}>Task Details</h2>
                <button
                  style={styles.modalClose}
                  onClick={() => setActiveTask(null)}
                >
                  ×
                </button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.modalSection}>
                  <h3
                    style={{
                      ...styles.taskTitle,
                      fontSize: "24px",
                      marginBottom: "12px",
                    }}
                  >
                    {activeTask.category}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        ...styles.priorityBadge,
                        backgroundColor: getPriorityColor(activeTask.urgency),
                        color: getPriorityTextColor(activeTask.urgency),
                      }}
                    >
                      {activeTask.urgency.charAt(0).toUpperCase() +
                        activeTask.urgency.slice(1)}{" "}
                      Priority
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(activeTask.status).bg,
                        color: getStatusColor(activeTask.status).text,
                      }}
                    >
                      {activeTask.status === "in_progress"
                        ? "In Progress"
                        : activeTask.status.charAt(0).toUpperCase() +
                          activeTask.status.slice(1)}
                    </span>
                  </div>
                  <p
                    style={{
                      ...styles.taskProperty,
                      fontSize: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <strong>{activeTask.property_name || "Property"}</strong>{" "}
                    {activeTask.property_unit &&
                      `• ${activeTask.property_unit}`}
                  </p>
                  <p style={{ ...styles.taskDescription, fontSize: "16px" }}>
                    {activeTask.description}
                  </p>

                  <div style={{ ...styles.taskMeta, marginTop: "20px" }}>
                    <div style={styles.taskMetaItem}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>Submitted {formatDate(activeTask.created_at)}</span>
                    </div>
                    <div style={styles.taskMetaItem}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>
                        Last updated {formatDate(activeTask.updated_at)}
                      </span>
                    </div>
                    <div style={styles.taskMetaItem}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{activeTask.tenant_name || "Tenant"}</span>
                    </div>
                    <div style={styles.taskMetaItem}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span>
                        {activeTask.tenant_contact || "No contact info"}
                      </span>
                    </div>
                  </div>
                </div>

                {activeTask.progress_notes &&
                  activeTask.progress_notes.length > 0 && (
                    <div style={styles.modalSection}>
                      <h4 style={styles.modalSectionTitle}>Progress Notes</h4>
                      <div style={styles.noteSection}>
                        {activeTask.progress_notes.map((note, index) => (
                          <p key={index} style={styles.noteText}>
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Task Photos */}
                {activeTask.photos && activeTask.photos.length > 0 && (
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionTitle}>Task Photos</h4>
                    <div style={styles.imageGallery}>
                      {activeTask.photos.map((photoUrl, index) => (
                        <div key={index} style={styles.galleryImageContainer}>
                          <img
                            src={photoUrl}
                            alt="Task image"
                            style={styles.galleryImage}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Completion Photos */}
                {activeTask.status !== "completed" && (
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionTitle}>
                      Upload Completion Photos
                    </h4>
                    <label
                      htmlFor="photo-upload"
                      style={styles.uploadContainer}
                      className="upload-container"
                    >
                      <div style={styles.uploadIcon}>
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="12" y1="18" x2="12" y2="12"></line>
                          <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                      </div>
                      <p style={styles.uploadText}>
                        <strong>Click to upload</strong> or drag and drop
                      </p>
                      <p style={{ ...styles.uploadText, fontSize: "12px" }}>
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        multiple
                        style={styles.uploadInput}
                        onChange={handleFileSelect}
                      />
                    </label>

                    {/* Selected Files List */}
                    {uploadedImages.length > 0 && (
                      <div style={styles.selectedFilesList}>
                        <h5
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "8px",
                          }}
                        >
                          Selected files ({uploadedImages.length})
                        </h5>
                        {uploadedImages.map((file, index) => (
                          <div key={index} style={styles.selectedFile}>
                            <span>{file.name}</span>
                            <button
                              onClick={() =>
                                setUploadedImages((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              style={{
                                background: "none",
                                border: "none",
                                color: "#9ca3af",
                                cursor: "pointer",
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          style={{
                            ...styles.button,
                            ...styles.buttonPrimary,
                            marginTop: "12px",
                          }}
                          onClick={() => submitCompletionPhotos(activeTask.id)}
                          disabled={uploadedImages.length === 0}
                        >
                          Upload Photos
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Update Status */}
                {activeTask.status !== "completed" && (
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionTitle}>Update Task Status</h4>
                    <div style={styles.statusButtons}>
                      <button
                        style={{
                          ...styles.button,
                          ...styles.buttonSecondary,
                          opacity: activeTask.status === "pending" ? 1 : 0.5,
                          cursor:
                            activeTask.status === "pending"
                              ? "default"
                              : "pointer",
                        }}
                        onClick={() =>
                          updateTaskStatus(activeTask.id, "pending")
                        }
                        disabled={activeTask.status === "pending"}
                      >
                        Pending
                      </button>
                      <button
                        style={{
                          ...styles.button,
                          ...(activeTask.status === "in_progress"
                            ? {
                                ...styles.buttonPrimary,
                                opacity: 0.5,
                                cursor: "default",
                              }
                            : styles.buttonSecondary),
                        }}
                        onClick={() =>
                          updateTaskStatus(activeTask.id, "in_progress")
                        }
                        disabled={activeTask.status === "in_progress"}
                      >
                        In Progress
                      </button>
                      <button
                        style={{
                          ...styles.button,
                          ...styles.buttonPrimary,
                          background:
                            "linear-gradient(135deg, #50bc72, #41599c)",
                        }}
                        onClick={() =>
                          updateTaskStatus(activeTask.id, "completed")
                        }
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div style={styles.modalFooter}>
                <button
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onClick={() => setActiveTask(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Alert */}
        {statusUpdateMessage && (
          <div style={styles.statusAlert} className="status-alert">
            {statusUpdateMessage}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TaskPage;
