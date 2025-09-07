import supabase from "../../SupabaseClient";

/**
 * Handles user logout and redirects to homepage
 * @returns Promise<void>
 */
export const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      throw error;
    }

    // Redirect to homepage after successful logout
    window.location.href = "/";
  } catch (err) {
    console.error("Logout failed:", err);
    // Optionally show error toast/notification here
  }
};
