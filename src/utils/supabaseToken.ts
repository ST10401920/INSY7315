import supabase from "../../SupabaseClient";

export const getSupabaseToken = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};
