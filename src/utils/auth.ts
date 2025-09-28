import supabase from "../../SupabaseClient";

/**
 * Gets the current session token from Supabase
 * @returns Promise<string>
 */
export const getSupabaseToken = async (): Promise<string> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("No active session");
  }
  return session.access_token;
};

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
