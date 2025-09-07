import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";

// Define user interface
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "property manager" | "caretaker";
  dateCreated: string;
  lastLogin: string;
  status: "active" | "inactive";
}

// Mock data for users
const mockUsers: User[] = [
  {
    id: "user-001",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "admin",
    dateCreated: "2025-01-15T10:30:00",
    lastLogin: "2025-09-01T08:45:00",
    status: "active",
  },
  {
    id: "user-002",
    name: "Emily Johnson",
    email: "emily.j@example.com",
    role: "property manager",
    dateCreated: "2025-02-20T14:20:00",
    lastLogin: "2025-08-30T11:20:00",
    status: "active",
  },
  {
    id: "user-003",
    name: "Michael Wong",
    email: "michael.wong@example.com",
    role: "caretaker",
    dateCreated: "2025-03-10T09:15:00",
    lastLogin: "2025-09-02T07:30:00",
    status: "active",
  },
  {
    id: "user-004",
    name: "Sarah Miller",
    email: "sarah.m@example.com",
    role: "caretaker",
    dateCreated: "2025-04-05T16:40:00",
    lastLogin: "2025-08-28T15:15:00",
    status: "active",
  },
  {
    id: "user-005",
    name: "David Chen",
    email: "david.c@example.com",
    role: "property manager",
    dateCreated: "2025-05-12T11:10:00",
    lastLogin: "2025-08-31T10:05:00",
    status: "active",
  },
  {
    id: "user-006",
    name: "Jessica Taylor",
    email: "jessica.t@example.com",
    role: "admin",
    dateCreated: "2025-06-18T13:25:00",
    lastLogin: "2025-09-01T14:30:00",
    status: "active",
  },
  {
    id: "user-007",
    name: "Robert Garcia",
    email: "robert.g@example.com",
    role: "caretaker",
    dateCreated: "2025-07-22T08:50:00",
    lastLogin: "2025-08-25T09:40:00",
    status: "inactive",
  },
  {
    id: "user-008",
    name: "Amanda Lewis",
    email: "amanda.l@example.com",
    role: "property manager",
    dateCreated: "2025-08-05T10:15:00",
    lastLogin: "2025-09-02T11:25:00",
    status: "active",
  },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    // In a real app, you would fetch users from an API
    // This simulates API loading
    const loadUsers = async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(mockUsers);
    };

    loadUsers();
  }, []);

  // Handle role change
  const handleRoleChange = (
    userId: string,
    newRole: "admin" | "property manager" | "caretaker"
  ) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, role: newRole } : user
    );

    setUsers(updatedUsers);

    // Show success message
    setStatusMessage(`User role updated successfully`);
    setTimeout(() => setStatusMessage(""), 3000);

    // Close edit modal if open
    if (isEditing && editingUser?.id === userId) {
      setIsEditing(false);
      setEditingUser(null);
    }
  };

  // Empty space for future functions

  // Open edit modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsEditing(true);
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRoleFilter = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRoleFilter;
  }); // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: "100vh",
      width: "100%",
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
    controlsBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px",
    },
    searchContainer: {
      position: "relative",
      width: "300px",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
    },
    searchInput: {
      padding: "10px 16px 10px 40px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      width: "100%",
      fontSize: "14px",
      backgroundColor: "white",
      color: "#111827",
    },
    filterGroup: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    filterLabel: {
      fontSize: "14px",
      color: "#6b7280",
    },
    filterSelect: {
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
    },
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      backgroundColor: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
    },
    tableHeaderCell: {
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
    },
    tableRow: {
      borderBottom: "1px solid #e5e7eb",
      transition: "background-color 0.2s",
    },
    tableRowHover: {
      backgroundColor: "#f9fafb",
    },
    tableCell: {
      padding: "16px",
      fontSize: "14px",
      color: "#111827",
    },
    roleBadge: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: "500",
    },
    adminBadge: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
    },
    propertyManagerBadge: {
      backgroundColor: "#e0f2fe",
      color: "#0369a1",
    },
    caretakerBadge: {
      backgroundColor: "#d1fae5",
      color: "#047857",
    },
    statusBadge: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: "500",
    },
    activeBadge: {
      backgroundColor: "#d1fae5",
      color: "#047857",
    },
    inactiveBadge: {
      backgroundColor: "#f3f4f6",
      color: "#6b7280",
    },
    actionButton: {
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
      color: "#374151",
    },
    editButton: {
      backgroundColor: "#eff6ff",
      color: "#1e40af",
      border: "1px solid #bfdbfe",
      marginRight: "8px",
    },
    deleteButton: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
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
      maxWidth: "500px",
      overflow: "hidden",
    },
    modalHeader: {
      padding: "20px 24px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
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
    formGroup: {
      marginBottom: "20px",
    },
    formLabel: {
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#111827",
    },
    formInput: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    formSelect: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "6px",
      border: "1px solid #50bc72", // Green border to highlight active element
      fontSize: "14px",
      backgroundColor: "#f0fdf4", // Light green background
      color: "#111827",
      fontWeight: "500",
      appearance: "menulist", // Force native dropdown appearance
      cursor: "pointer",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    modalFooter: {
      padding: "16px 24px",
      borderTop: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      backgroundColor: "#f9fafb",
    },
    cancelButton: {
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
      color: "#374151",
    },
    saveButton: {
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "none",
      backgroundColor: "#50bc72", // Green theme color
      color: "white",
    },
    statusAlert: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      padding: "12px 20px",
      backgroundColor: "#50bc72", // Green theme color
      color: "white",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      zIndex: 1000,
      animation: "slideIn 0.3s ease-out",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 24px",
      color: "#6b7280",
    },
    emptyStateIcon: {
      fontSize: "48px",
      marginBottom: "16px",
      color: "#9ca3af",
    },
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />

      <main style={styles.content}>
        <h1 style={styles.heading}>User Management</h1>

        {/* Controls Bar */}
        <div style={styles.controlsBar}>
          <div style={styles.searchContainer}>
            <div style={styles.searchIcon}>
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users by email"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Filter by role:</span>
            <select
              style={styles.filterSelect}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="property manager">Property Manager</option>
              <option value="caretaker">Caretaker</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Email</th>
                <th style={styles.tableHeaderCell}>Role</th>
                <th style={styles.tableHeaderCell}>Date Created</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.roleBadge,
                          ...(user.role === "admin"
                            ? styles.adminBadge
                            : user.role === "property manager"
                            ? styles.propertyManagerBadge
                            : styles.caretakerBadge),
                        }}
                      >
                        {user.role === "property manager"
                          ? "Property Manager"
                          : user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {formatDate(user.dateCreated)}
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        style={{ ...styles.actionButton, ...styles.editButton }}
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </div>
                    <p>No users found matching your search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isEditing && editingUser && (
          <div style={styles.modalOverlay} onClick={() => setIsEditing(false)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Edit User</h3>
                <button
                  style={styles.modalClose}
                  onClick={() => setIsEditing(false)}
                >
                  ×
                </button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    style={styles.formInput}
                    value={editingUser.email}
                    disabled
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Role</label>
                  <select
                    style={styles.formSelect}
                    value={editingUser.role}
                    onChange={(e) => {
                      const newRole = e.target.value as
                        | "admin"
                        | "property manager"
                        | "caretaker";
                      setEditingUser({ ...editingUser, role: newRole });
                    }}
                  >
                    <option
                      value="admin"
                      style={{
                        color: "#111827",
                        padding: "8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      Admin
                    </option>
                    <option
                      value="property manager"
                      style={{
                        color: "#111827",
                        padding: "8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      Property Manager
                    </option>
                    <option
                      value="caretaker"
                      style={{
                        color: "#111827",
                        padding: "8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      Caretaker
                    </option>
                  </select>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.saveButton}
                  onClick={() => {
                    handleRoleChange(editingUser.id, editingUser.role);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Alert */}
        {statusMessage && <div style={styles.statusAlert}>{statusMessage}</div>}
      </main>

      <Footer />
    </div>
  );
};

export default UserManagement;
