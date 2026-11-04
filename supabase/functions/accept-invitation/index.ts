import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    try {
      const { token } = await req.json();

      if (typeof token !== "string" || !token.trim()) {
        return Response.json(
          { error: "Invitation token is required." },
          { status: 400 },
        );
      }

      // Accept the invitation through the database function.
      const { data, error } = await ctx.supabase
        .rpc("accept_group_invitation", {
          invitation_token: token,
        })
        .single();

      if (error) {
        console.error("Invitation acceptance failed:", error);

        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({
        message: "Invitation accepted successfully!",
        group: data,
      });

      // Check if the invitation has expired.
      if (new Date(invitation.expires_at) < new Date()) {
        return Response.json(
          { error: "This invitation has expired." },
          { status: 400 },
        );
      }

      // Check if the invitation has already been accepted.
      if (invitation.accepted_at) {
        return Response.json(
          { error: "This invitation has already been accepted." },
          { status: 400 },
        );
      }
      // Get the authenticated user's email address.
      const userEmail = ctx.userClaims.email;

      if (
        typeof userEmail !== "string" ||
        userEmail.toLowerCase() !== invitation.email.toLowerCase()
      ) {
        return Response.json(
          { error: "This invitation belongs to another email address." },
          { status: 403 },
        );
      }

      return Response.json({
        message: "Invitation token received!",
      });
    } catch (error) {
      console.error("Unexpected error:", error);

      return Response.json({ error: "Something went wrong." }, { status: 500 });
    }
  }),
};
