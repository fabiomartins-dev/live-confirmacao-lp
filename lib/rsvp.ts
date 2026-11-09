import { EVENT } from "./event";

export type RsvpInput = { name: string; email: string; whatsapp: string; instagram: string; twitter: string; youtube: string };

export type RsvpResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "rejected" | "network"; message: string };

/**
 * ============================ PONTO DE INTEGRAÇÃO ============================
 * Envia a inscrição para `EVENT.rsvpEndpoint` (POST, application/json):
 *
 *   { nome, email, whatsapp, instagram, youtube, twitter } (strings; vazio quando não informado)
 *
 * Contrato esperado: qualquer resposta 2xx significa "inscrição registrada".
 * Só nesse caso a interface mostra o estado de sucesso. O front-end NÃO afirma
 * que e-mails/mensagens foram enviados — isso depende do serviço de envio.
 *
 * Sem endpoint configurado, nada é enviado e nenhuma inscrição é simulada.
 * ==============================================================================
 */
/** "(11) 91234-5678" -> "+5511912345678". Vazio continua vazio. */
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return `+${digits.length <= 11 ? `55${digits}` : digits}`;
}

export async function submitRsvp(input: RsvpInput): Promise<RsvpResult> {
  if (!EVENT.rsvpEndpoint) {
    return {
      ok: false,
      reason: "not-configured",
      message: "As inscrições ainda não estão abertas. Nenhum dado foi enviado — tente novamente em breve.",
    };
  }
  try {
    const res = await fetch(EVENT.rsvpEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: input.name,
        email: input.email,
        whatsapp: toE164(input.whatsapp),
        instagram: input.instagram,
        youtube: input.youtube,
        twitter: input.twitter,
      }),
    });
    if (!res.ok) {
      return { ok: false, reason: "rejected", message: "Não foi possível confirmar sua presença agora. Confira os dados e tente novamente." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "network", message: "Falha de conexão. Verifique sua internet e tente novamente." };
  }
}
