
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed." },
        { status: 405 },
      );
    }

    try {
      const { groupId } = await req.json();

      if (typeof groupId !== "string" || !groupId.trim()) {
        return Response.json(
          { error: "Group ID is required." },
          { status: 400 },
        );
      }

      // Create the invitation using the authenticated user's permissions.
      const { data, error } = await ctx.supabase
        .from("group_invitations")
        .insert({
          group_id: groupId,
          email: null,
          invited_by: ctx.userClaims.id,
        })
        .select("id, group_id, token, expires_at")
        .single();

      if (error) {
        console.error("Invitation creation failed:", error);

        return Response.json(
          { error: "Could not create invitation." },
          { status: 400 },
        );
      }

      // Build the invitation link.
      const appUrl = Deno.env.get("APP_URL") ??
        "https://circle.emma-hogdal.workers.dev";

      const invitationUrl = `${appUrl}/invite/${data.token}`;

      return Response.json({
        message: "Invitation link created!",
        invitation: data,
        invitationUrl,
      });
    } catch (error) {
      console.error("Unexpected error:", error);

      return Response.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
  }),
};
