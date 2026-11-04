
import { supabase } from "../../lib/supabase";

// Register a new user.
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  redirectTo?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      ...(redirectTo && {
        emailRedirectTo: redirectTo,
      }),
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

// Sign in an existing user.
export async function signIn(
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

// Sign out the current user.
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
