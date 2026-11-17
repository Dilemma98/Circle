
import { supabase } from "../../lib/supabase";

export interface Invitation {
  invitation_id: string;
  group_id: string;
  group_name: string;
  email: string | null;
  expires_at: string;
  accepted_at: string | null;
}

export async function getInvitationByToken(
  token: string
): Promise<Invitation | null> {
  const { data, error } = await supabase.rpc(
    "get_invitation_by_token",
    {
      invitation_token: token,
    }
  );

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

export async function acceptInvitation(token: string) {
  const { data, error } = await supabase.functions.invoke(
    "accept-invitation",
    {
      body: { token },
    }
  );

  if (error) {
    const response = error.context;

    if (response instanceof Response) {
      const errorData = await response.json();

      throw new Error(
        errorData.error ?? "Kunde inte acceptera inbjudan."
      );
    }

    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function sendInvitation(groupId: string) {
  const { data, error } = await supabase.functions.invoke(
    "send-invitation",
    {
      body: { groupId },
    }
  );

  if (error) {
    const response = error.context;

    if (response instanceof Response) {
      const errorData = await response.json();

      throw new Error(
        errorData.error ?? "Kunde inte skapa inbjudningslänk."
      );
    }

    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as {
    message: string;
    invitation: {
      id: string;
      group_id: string;
      token: string;
      expires_at: string;
    };
    invitationUrl: string;
  };
}
