import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CaretakerNavbar from "../../components/CaretakerNavbar";
import Footer from "../../components/Footer";
import "./Task.css";

// Interface for task data structure
interface TaskImage {
  id: string;
  url: string;
  caption?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  propertyName: string;
  propertyUnit?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in progress" | "completed";
  dateSubmitted: string;
  dateUpdated: string;
  tenantName: string;
  tenantContact: string;
  images: TaskImage[];
  completionImages: TaskImage[];
  notes?: string;
}

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Leaking Kitchen Faucet",
    description:
      "The kitchen faucet has been dripping consistently. Water is collecting in the sink basin and it's getting worse.",
    propertyName: "Sunset Heights",
    propertyUnit: "Apt 301",
    priority: "medium",
    status: "pending",
    dateSubmitted: "2025-08-30T15:23:00",
    dateUpdated: "2025-08-30T15:23:00",
    tenantName: "Sarah Johnson",
    tenantContact: "sarah.j@example.com",
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1585400044344-a83be0859ee1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
        caption: "Kitchen faucet leaking",
      },
    ],
    completionImages: [],
  },
  {
    id: "task-2",
    title: "Broken AC Unit",
    description:
      "The AC unit in the living room is not cooling properly and making a loud noise when running. Temperature in apartment is reaching 85°F.",
    propertyName: "Marina Towers",
    propertyUnit: "Unit 512",
    priority: "high",
    status: "in progress",
    dateSubmitted: "2025-08-29T10:15:00",
    dateUpdated: "2025-09-01T09:30:00",
    tenantName: "Michael Chen",
    tenantContact: "michael.c@example.com",
    images: [
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1581275233127-20dc052072e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
        caption: "AC unit exterior",
      },
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1611072337226-1972e4e0d0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
        caption: "Thermostat reading",
      },
    ],
    completionImages: [],
    notes: "Ordered replacement part on 9/1. Should arrive within 2 days.",
  },
  {
    id: "task-3",
    title: "Clogged Bathroom Drain",
    description:
      "The bathroom sink is draining very slowly. I've tried using drain cleaner but it didn't solve the issue.",
    propertyName: "Oak Ridge Apartments",
    propertyUnit: "202",
    priority: "low",
    status: "completed",
    dateSubmitted: "2025-08-27T14:40:00",
    dateUpdated: "2025-08-28T11:15:00",
    tenantName: "Emily Rodriguez",
    tenantContact: "emily.r@example.com",
    images: [
      {
        id: "img-4",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
        caption: "Bathroom sink with standing water",
      },
    ],
    completionImages: [
      {
        id: "img-5",
        url: "https://images.unsplash.com/photo-1620626011761-996c5c8d0d7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
        caption: "Cleaned drain and pipes",
      },
      {
        id: "img-6",
        url: "https://images.unsplash.com/photo-1620626710703-9dfbf9d88b2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
        caption: "Water flowing properly now",
      },
    ],
    notes:
      "Used snake tool to remove hair clog. Also applied enzyme cleaner to prevent future clogs.",
  },
  {
    id: "task-4",
    title: "Broken Door Handle",
    description:
      "The handle on the front door is loose and sometimes gets stuck. It's becoming difficult to open and close the door properly.",
    propertyName: "Willow Gardens",
    propertyUnit: "House 7",
    priority: "medium",
    status: "pending",
    dateSubmitted: "2025-09-01T08:12:00",
    dateUpdated: "2025-09-01T08:12:00",
    tenantName: "Robert Taylor",
    tenantContact: "robert.t@example.com",
    images: [
      {
        id: "img-7",
        url: "https://images.unsplash.com/photo-1581622558663-b2886e4f2cd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
        caption: "Door handle is misaligned",
      },
    ],
    completionImages: [],
  },
  {
    id: "task-5",
    title: "Smoke Detector Beeping",
    description:
      "The smoke detector in the hallway has been beeping intermittently for the past two days. Likely needs a battery replacement.",
    propertyName: "Parkside Commons",
    propertyUnit: "Apt 118",
    priority: "urgent",
    status: "in progress",
    dateSubmitted: "2025-08-31T19:45:00",
    dateUpdated: "2025-09-01T10:20:00",
    tenantName: "Jennifer Kim",
    tenantContact: "jennifer.k@example.com",
    images: [],
    completionImages: [],
    notes:
      "Scheduled visit for today at 2PM. Will replace batteries and check all smoke detectors in unit.",
  },
];

const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    // In a real app, you would fetch tasks from your API
    setLoading(true);
    // Simulating API fetch
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 800);
  }, []);

  // Update task status
  const updateTaskStatus = (
    taskId: string,
    newStatus: "pending" | "in progress" | "completed"
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              dateUpdated: new Date().toISOString(),
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
  };

  // Handle file selection for image upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  // Submit completion photos
  const submitCompletionPhotos = (taskId: string) => {
    if (uploadedImages.length === 0) return;

    // In a real app, you would upload these to your storage service
    const newCompletionImages: TaskImage[] = uploadedImages.map(
      (file, index) => ({
        id: `new-img-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        caption: `Completion photo ${index + 1}`,
      })
    );

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completionImages: [
                ...task.completionImages,
                ...newCompletionImages,
              ],
              dateUpdated: new Date().toISOString(),
            }
          : task
      )
    );

    // Clear uploaded files
    setUploadedImages([]);

    // Show success message
    setStatusUpdateMessage("Photos uploaded successfully");
    setTimeout(() => setStatusUpdateMessage(""), 3000);
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

  // Get appropriate background color for priority levels
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#e5f6ff";
      case "medium":
        return "#fff8e6";
      case "high":
        return "#ffe9e6";
      case "urgent":
        return "#ffdfdf";
      default:
        return "#f3f4f6";
    }
  };

  // Get appropriate text color for priority levels
  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#0284c7";
      case "medium":
        return "#ca8a04";
      case "high":
        return "#dc2626";
      case "urgent":
        return "#991b1b";
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
      background: "#50bc72",
      color: "white",
      border: "1px solid #50bc72",
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
      backgroundColor: "#50bc72",
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
      backgroundColor: "#50bc72",
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
                ...(filterStatus === "in progress"
                  ? styles.filterButtonActive
                  : {}),
              }}
              onClick={() => setFilterStatus("in progress")}
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
                      <h3 style={styles.taskTitle}>{task.title}</h3>
                      <p style={styles.taskProperty}>
                        {task.propertyName}{" "}
                        {task.propertyUnit && `• ${task.propertyUnit}`}
                      </p>
                      <div
                        style={{
                          ...styles.priorityBadge,
                          backgroundColor: getPriorityColor(task.priority),
                          color: getPriorityTextColor(task.priority),
                        }}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}{" "}
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
                        {task.status === "in progress"
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
                        <span>Submitted {formatDate(task.dateSubmitted)}</span>
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
                        <span>{task.tenantName}</span>
                      </div>
                    </div>

                    {/* Image previews */}
                    {task.images.length > 0 && (
                      <div style={styles.imagePreviewContainer}>
                        {task.images.map((image) => (
                          <img
                            key={image.id}
                            src={image.url}
                            alt={image.caption || "Task image"}
                            style={styles.imagePreview}
                            onClick={() => setActiveTask(task)}
                          />
                        ))}
                      </div>
                    )}

                    {task.notes && (
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
                        <p style={styles.noteText}>{task.notes}</p>
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
                    {activeTask.title}
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
                        backgroundColor: getPriorityColor(activeTask.priority),
                        color: getPriorityTextColor(activeTask.priority),
                      }}
                    >
                      {activeTask.priority.charAt(0).toUpperCase() +
                        activeTask.priority.slice(1)}{" "}
                      Priority
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(activeTask.status).bg,
                        color: getStatusColor(activeTask.status).text,
                      }}
                    >
                      {activeTask.status === "in progress"
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
                    <strong>{activeTask.propertyName}</strong>{" "}
                    {activeTask.propertyUnit && `• ${activeTask.propertyUnit}`}
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
                      <span>
                        Submitted {formatDate(activeTask.dateSubmitted)}
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
                        Last updated {formatDate(activeTask.dateUpdated)}
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
                      <span>{activeTask.tenantName}</span>
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
                      <span>{activeTask.tenantContact}</span>
                    </div>
                  </div>
                </div>

                {activeTask.notes && (
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionTitle}>Notes</h4>
                    <div style={styles.noteSection}>
                      <p style={styles.noteText}>{activeTask.notes}</p>
                    </div>
                  </div>
                )}

                {/* Tenant's Images */}
                {activeTask.images.length > 0 && (
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionTitle}>Images from Tenant</h4>
                    <div style={styles.imageGallery}>
                      {activeTask.images.map((image) => (
                        <div
                          key={image.id}
                          style={styles.galleryImageContainer}
                        >
                          <img
                            src={image.url}
                            alt={image.caption || "Task image"}
                            style={styles.galleryImage}
                          />
                          {image.caption && (
                            <div style={styles.galleryImageCaption}>
                              {image.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Images */}
                {activeTask.completionImages.length > 0 && (
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionTitle}>Completion Images</h4>
                    <div style={styles.imageGallery}>
                      {activeTask.completionImages.map((image) => (
                        <div
                          key={image.id}
                          style={styles.galleryImageContainer}
                        >
                          <img
                            src={image.url}
                            alt={image.caption || "Completion image"}
                            style={styles.galleryImage}
                          />
                          {image.caption && (
                            <div style={styles.galleryImageCaption}>
                              {image.caption}
                            </div>
                          )}
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
                          ...(activeTask.status === "in progress"
                            ? {
                                ...styles.buttonPrimary,
                                opacity: 0.5,
                                cursor: "default",
                              }
                            : styles.buttonSecondary),
                        }}
                        onClick={() =>
                          updateTaskStatus(activeTask.id, "in progress")
                        }
                        disabled={activeTask.status === "in progress"}
                      >
                        In Progress
                      </button>
                      <button
                        style={{
                          ...styles.button,
                          ...styles.buttonPrimary,
                          backgroundColor: "#047857",
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
