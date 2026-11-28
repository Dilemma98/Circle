
import { supabase } from "../../lib/supabase";

export interface Invitation {
  invitation_id: string;
  group_id: string;
  group_name: string;
  email: string | null;
  expires_at: string;
  accepted_at: string | null;
}

interface CreatedInvitation {
  id: string;
  group_id: string;
  code: string;
  expires_at: string;
}

interface SendInvitationResponse {
  message: string;
  invitation: CreatedInvitation;
}

interface AcceptInvitationResponse {
  message: string;
  group: {
    group_id: string;
    group_name: string;
  };
}

export async function getInvitationByCode(
  code: string,
): Promise<Invitation | null> {
  const normalizedCode = code
    .trim()
    .toUpperCase()
    .replace(/-/g, "");

  const { data, error } = await supabase.rpc(
    "get_invitation_by_code",
    {
      invitation_code: normalizedCode,
    },
  );

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

export async function acceptInvitation(
  code: string
): Promise<AcceptInvitationResponse> {
  const { data, error } = await supabase.functions.invoke(
    "accept-invitation",
    {
      body: { code },
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

  return data as AcceptInvitationResponse;
}

export async function sendInvitation(
  groupId: string
): Promise<SendInvitationResponse> {
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
        errorData.error ?? "Kunde inte skapa inbjudningskod."
      );
    }

    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as SendInvitationResponse;
}
