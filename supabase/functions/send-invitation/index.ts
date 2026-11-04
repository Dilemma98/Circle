import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    // Only allow POST requests.
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    try {
      // Read the invitation details.
      const { groupId, email } = await req.json();

      if (
        typeof groupId !== "string" ||
        typeof email !== "string" ||
        !email.trim()
      ) {
        return Response.json(
          { error: "Group ID and email are required." },
          { status: 400 },
        );
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Basic email validation.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return Response.json(
          { error: "Invalid email address." },
          { status: 400 },
        );
      }

      // Create the invitation using the authenticated user's permissions.
      const { data, error } = await ctx.supabase
        .from("group_invitations")
        .insert({
          group_id: groupId,
          email: normalizedEmail,
          invited_by: ctx.userClaims.id,
        })
        .select("id, group_id, email, token, expires_at")
        .single();

      if (error) {
        console.error("Invitation creation failed:", error);

        return Response.json(
          { error: "Could not create invitation." },
          { status: 400 },
        );
      }

      // Send the invitation email using Resend.
      const resendApiKey = Deno.env.get("RESEND_API_KEY");

      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is missing.");
      }

      // Create the invitation link.
      const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:5173";
      const invitationUrl = `${appUrl}/invite/${data.token}`;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Circle <onboarding@resend.dev>",
          to: [normalizedEmail],
          subject: "Du har blivit inbjuden till Circle!",
          html: `
            <h1>Du har fått en inbjudan!</h1>
            <p>Du har blivit inbjuden till en grupp i Circle.</p>
            <p>
              <a href="${invitationUrl}">Acceptera inbjudan</a>
            </p>
            <p>Länken är giltig i sju dagar.</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const emailError = await emailResponse.text();
        console.error("Resend error:", emailError);

        throw new Error("Could not send invitation email.");
      }

      const emailData = await emailResponse.json();

      return Response.json({
        message: "Invitation created and email sent!",
        invitation: data,
        emailId: emailData.id,
      });
    } catch (error) {
      console.error("Unexpected error:", error);

      return Response.json({ error: "Something went wrong." }, { status: 500 });
    }
  }),
};
