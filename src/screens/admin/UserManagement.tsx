import React from "react";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import axios from "axios";

// Set base URL for API requests
axios.defaults.baseURL = "http://localhost:3000";

// Define user interface
interface User {
  id: string;
  email: string;
  role: "tenant" | "property_manager" | "caretaker" | "admin";
  created_at: string;
}

// API response types
interface ApiResponse<T> {
  error?: {
    message: string;
  };
  profiles?: T[];
}

interface UserManagementState {
  users: User[];
  searchTerm: string;
  editingUser: User | null;
  isEditing: boolean;
  statusMessage: string;
  filterRole: string;
}

class UserManagement extends React.Component<{}, UserManagementState> {
  state: UserManagementState = {
    users: [],
    searchTerm: "",
    editingUser: null,
    isEditing: false,
    statusMessage: "",
    filterRole: "all",
  };

  async componentDidMount() {
    await this.fetchUsers();
  }

  // Fetch users from API
  fetchUsers = async () => {
    try {
      const accessToken = localStorage.getItem("token");

      console.log("Attempting to fetch users from API");

      if (!accessToken) {
        console.log("No access token found");
        this.setState({ statusMessage: "Please login to view users" });
        setTimeout(() => this.setState({ statusMessage: "" }), 3000);
        return;
      }

      const response = await axios.get("/user-management", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("API Response:", response.data);

      if (response.data && Array.isArray(response.data.profiles)) {
        this.setState({ users: response.data.profiles });
      } else {
        console.error("Invalid response format:", response.data);
        this.setState({
          statusMessage: "Error: Invalid data format from server",
        });
        setTimeout(() => this.setState({ statusMessage: "" }), 3000);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      this.setState({ statusMessage: "Error fetching users" });
      setTimeout(() => this.setState({ statusMessage: "" }), 3000);
    }
  };

  // Handle role change
  handleRoleChange = async (
    userId: string,
    newRole: "tenant" | "property_manager" | "caretaker" | "admin"
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Validate role before sending request
      const validRoles = [
        "tenant",
        "property_manager",
        "caretaker",
        "admin",
      ] as const;
      if (!validRoles.includes(newRole)) {
        this.setState({ statusMessage: "Invalid role selected" });
        return;
      }

      // Detailed logging of request data
      console.log("Request details:", {
        userId,
        newRole,
        endpoint: `/user-management/${userId}`,
        requestBody: { role: newRole },
        validRoles: ["tenant", "property_manager", "caretaker", "admin"],
      });

      const response = await axios.put(
        `/user-management/${userId}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Server response:", response.data);

      if (response.data && response.data.profile) {
        // Update local state with the returned profile
        const updatedUsers = this.state.users.map((user) =>
          user.id === userId ? { ...user, ...response.data.profile } : user
        );

        this.setState({
          users: updatedUsers,
          statusMessage: "User role updated successfully",
          isEditing: false,
          editingUser: null,
        });
      }

      setTimeout(() => this.setState({ statusMessage: "" }), 3000);
    } catch (error: any) {
      console.error("Error details:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.error || "Error updating user role";
      this.setState({ statusMessage: errorMessage });
      setTimeout(() => this.setState({ statusMessage: "" }), 3000);
    }
  };

  handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleFilterRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ filterRole: e.target.value });
  };

  formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  openEditModal = (user: User) => {
    // Ensure we have a valid role when opening the modal
    const editingUser = {
      ...user,
      role: user.role || "tenant", // Provide a default role if none exists
    };
    console.log("Opening modal with user:", editingUser);

    this.setState({
      editingUser,
      isEditing: true,
    });
  };

  // Get filtered users
  getFilteredUsers = () => {
    return this.state.users.filter((user) => {
      const matchesSearch = user.email
        .toLowerCase()
        .includes(this.state.searchTerm.toLowerCase());
      const matchesRoleFilter =
        this.state.filterRole === "all" || user.role === this.state.filterRole;

      return matchesSearch && matchesRoleFilter;
    });
  };

  styles: Record<string, React.CSSProperties> = {
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
      color: "#111827",
      fontSize: "14px",
      cursor: "pointer",
      appearance: "menulist",
      fontWeight: "500",
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
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
      color: "#374151",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    saveButton: {
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "none",
      background: "linear-gradient(135deg, #50bc72, #41599c)",
      color: "white",
      display: "flex",
      alignItems: "center",
      gap: "8px",
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

  render() {
    const {
      searchTerm,
      filterRole,
      isEditing,
      editingUser,
      statusMessage,
      users,
    } = this.state;
    const filteredUsers = users.filter((user) => {
      const emailMatch = user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const roleMatch =
        !filterRole || filterRole === "all" || user.role === filterRole;
      return emailMatch && roleMatch;
    });

    return (
      <div style={this.styles.container}>
        <AdminNavbar />

        <main style={this.styles.content}>
          <h1 style={this.styles.heading}>User Management</h1>

          {/* Controls Bar */}
          <div style={this.styles.controlsBar}>
            <div style={this.styles.searchContainer}>
              <div style={this.styles.searchIcon}>
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
                style={this.styles.searchInput}
                value={searchTerm}
                onChange={this.handleSearchTermChange}
              />
            </div>

            <div style={this.styles.filterGroup}>
              <span style={this.styles.filterLabel}>Filter by role:</span>
              <select
                style={this.styles.filterSelect}
                value={filterRole}
                onChange={this.handleFilterRoleChange}
              >
                <option value="all">All Roles</option>
                <option value="property_manager">Property Manager</option>
                <option value="caretaker">Caretaker</option>
                <option value="tenant">Tenant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div style={this.styles.tableContainer}>
            <table style={this.styles.table}>
              <thead style={this.styles.tableHeader}>
                <tr>
                  <th style={this.styles.tableHeaderCell}>Email</th>
                  <th style={this.styles.tableHeaderCell}>Role</th>
                  <th style={this.styles.tableHeaderCell}>Date Created</th>
                  <th style={this.styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} style={this.styles.tableRow}>
                      <td style={this.styles.tableCell}>{user.email}</td>
                      <td style={this.styles.tableCell}>
                        <span
                          style={{
                            ...this.styles.roleBadge,
                            ...(user.role === "admin"
                              ? this.styles.adminBadge
                              : user.role === "property_manager"
                              ? this.styles.propertyManagerBadge
                              : this.styles.caretakerBadge),
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={this.styles.tableCell}>
                        {this.formatDate(user.created_at)}
                      </td>
                      <td style={this.styles.tableCell}>
                        <button
                          style={{
                            ...this.styles.actionButton,
                            ...this.styles.editButton,
                          }}
                          onClick={() => this.openEditModal(user)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={this.styles.emptyState}>
                      <div style={this.styles.emptyStateIcon}>
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </div>
                      No users found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          {isEditing && editingUser && (
            <div
              style={this.styles.modalOverlay}
              onClick={() => this.setState({ isEditing: false })}
            >
              <div
                style={this.styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={this.styles.modalHeader}>
                  <h3 style={this.styles.modalTitle}>Edit User</h3>
                  <button
                    style={this.styles.modalClose}
                    onClick={() => this.setState({ isEditing: false })}
                  >
                    ×
                  </button>
                </div>
                <div style={this.styles.modalBody}>
                  <div style={this.styles.formGroup}>
                    <label style={this.styles.formLabel}>Email</label>
                    <input
                      type="email"
                      style={this.styles.formInput}
                      value={editingUser.email}
                      disabled
                    />
                  </div>
                  <div style={this.styles.formGroup}>
                    <label style={this.styles.formLabel}>Role</label>
                    <select
                      style={this.styles.formSelect}
                      value={editingUser.role || ""}
                      onChange={(e) => {
                        const newRole = e.target.value as
                          | "admin"
                          | "property_manager"
                          | "caretaker"
                          | "tenant";
                        console.log("Selected role:", newRole);

                        // Update the editingUser with the new role
                        const updatedUser = {
                          ...editingUser,
                          role: newRole,
                        };

                        console.log("Updating user with:", updatedUser);

                        this.setState(
                          {
                            editingUser: updatedUser,
                          },
                          () => {
                            console.log(
                              "State after update:",
                              this.state.editingUser
                            );
                          }
                        );
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
                        value="property_manager"
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
                      <option
                        value="tenant"
                        style={{
                          color: "#111827",
                          padding: "8px",
                          backgroundColor: "#fff",
                        }}
                      >
                        Tenant
                      </option>
                    </select>
                  </div>
                </div>
                <div style={this.styles.modalFooter}>
                  <button
                    style={this.styles.cancelButton}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onClick={() => this.setState({ isEditing: false })}
                  >
                    Cancel
                  </button>
                  <button
                    style={this.styles.saveButton}
                    onMouseOver={(e) => {
                      e.currentTarget.style.filter = "brightness(1.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.filter = "brightness(1)";
                    }}
                    onClick={() => {
                      console.log("Saving with editingUser:", editingUser);

                      if (!editingUser || !editingUser.role) {
                        console.error("Missing role or user data");
                        this.setState({
                          statusMessage: "Please select a valid role",
                        });
                        return;
                      }

                      // Validate role before saving
                      const validRoles = [
                        "admin",
                        "property_manager",
                        "caretaker",
                        "tenant",
                      ] as const;
                      if (!validRoles.includes(editingUser.role)) {
                        console.error("Invalid role:", editingUser.role);
                        this.setState({
                          statusMessage: "Invalid role selected",
                        });
                        return;
                      }

                      // Proceed with role change
                      this.handleRoleChange(editingUser.id, editingUser.role);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Alert */}
          {statusMessage && (
            <div style={this.styles.statusAlert}>{statusMessage}</div>
          )}
        </main>

        <Footer />
      </div>
    );
  }
}

export default UserManagement;
