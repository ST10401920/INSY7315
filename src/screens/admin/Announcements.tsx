import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import "./Announcements.css";

interface Announcement {
  id: number;
  title: string;
  message: string;
  created_at: string;
  admin_id: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view announcements");
        setLoading(false);
        return;
      }

      console.log("Using token:", token.substring(0, 20) + "..."); // Log truncated token for debugging

      const response = await axios.get(
        "https://insy7315-api-deploy.onrender.com/announcements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response received:", response.data); // Debug log
      setAnnouncements(response.data.announcements);
      setLoading(false);
    } catch (err: any) {
      console.error("Full error:", err); // Debug log
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again");
        // Clear invalid token
        localStorage.removeItem("token");
        // Optionally redirect to login page
        window.location.href = "/login";
      } else {
        setError(err.response?.data?.error || "Failed to fetch announcements");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      console.log("Current role:", role); // Debug log

      // Temporarily remove role check for testing
      // if (role !== "admin") {
      //   setError("You must be an admin to post announcements");
      //   setIsSubmitting(false);
      //   return;
      // }

      await axios.post(
        "https://insy7315-api-deploy.onrender.com/announcements",
        newAnnouncement,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNewAnnouncement({ title: "", message: "" });
      fetchAnnouncements(); // Refresh the list
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create announcement");
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      position: "relative",
    },
    content: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "0 24px 48px",
    },
    heading: {
      fontSize: "30px",
      fontWeight: "bold",
      marginBottom: "24px",
      color: "#111827",
    },
    form: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "32px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      marginBottom: "16px",
      fontSize: "16px",
      backgroundColor: "white",
      color: "#111827",
      outline: "none",
      transition: "all 0.2s ease",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      marginBottom: "16px",
      fontSize: "16px",
      minHeight: "120px",
      resize: "vertical",
      backgroundColor: "white",
      color: "#111827",
      outline: "none",
      transition: "all 0.2s ease",
    },
    button: {
      background: "linear-gradient(135deg, #50bc72, #41599c)",
      color: "white",
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "opacity 0.2s",
    },
    buttonHover: {
      opacity: 0.9,
    },
    announcement: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
      position: "relative",
      overflow: "hidden",
    },
    announcementTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    announcementMeta: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "16px",
    },
    announcementMessage: {
      fontSize: "16px",
      color: "#374151",
      lineHeight: 1.5,
      whiteSpace: "pre-wrap",
    },
    error: {
      color: "#ef4444",
      marginBottom: "16px",
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#fef2f2",
    },
    loadingSpinner: {
      textAlign: "center" as const,
      padding: "40px 0",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />

      {/* Header Section with Pattern Background */}
      <div
        style={{
          background: "linear-gradient(135deg, #50bc72, #41599c)",
          padding: "60px 0 80px 0",
          marginBottom: "20px",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "16px",
            }}
          >
            Announcements
          </h1>
          <p
            style={{
              color: "white",
              fontSize: "18px",
              opacity: 0.9,
            }}
          >
            Keep your community informed with important updates and news
          </p>
        </div>
      </div>

      <main style={{ ...styles.content, marginTop: "-60px" }}>
        {/* Create Announcement Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            ...styles.form,
            background: "white",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            position: "relative",
            zIndex: 1,
          }}
          className="announcement-form"
        >
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Create New Announcement
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Share important updates with your community
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <input
            type="text"
            placeholder="Announcement Title"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            style={styles.input}
            required
          />
          <textarea
            placeholder="What would you like to announce?"
            value={newAnnouncement.message}
            onChange={(e) =>
              setNewAnnouncement({
                ...newAnnouncement,
                message: e.target.value,
              })
            }
            style={styles.textarea}
            required
          />
          <button
            type="submit"
            style={styles.button}
            disabled={isSubmitting}
            className="post-button"
          >
            {isSubmitting ? "Posting..." : "Post Announcement"}
          </button>
        </form>

        {/* Announcements List */}
        <div style={{ marginTop: "40px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Recent Announcements
          </h2>

          {loading ? (
            <div style={styles.loadingSpinner}>Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: "0 auto 16px" }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <p>No announcements yet</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  ...styles.announcement,
                  background: "white",
                  padding: "24px",
                  marginBottom: "16px",
                  position: "relative",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "2px solid rgba(80, 188, 114, 0.6)",
                  borderImage:
                    "linear-gradient(135deg, rgba(80, 188, 114, 0.6), rgba(65, 89, 156, 0.6)) 1",
                }}
                className="announcement-card"
              >
                <h2 style={styles.announcementTitle}>{announcement.title}</h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#4b5563",
                    fontSize: "14px",
                    marginBottom: "12px",
                    fontWeight: "500",
                  }}
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
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span style={{ color: "#4b5563" }}>
                    {formatDate(announcement.created_at)}
                  </span>
                </div>
                <p style={styles.announcementMessage}>{announcement.message}</p>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Announcements;
