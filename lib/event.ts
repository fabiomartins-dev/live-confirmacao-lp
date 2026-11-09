/**
 * Configuração central da live.
 *
 * Todo valor desconhecido fica como `null` e aparece na página como placeholder
 * explícito (ex.: "[DATA]"). Nada aqui é inventado: preencha quando houver o dado real.
 */
export const EVENT = {
  /** Título da live. */
  title: "O mundo pós-trabalho: qual será o seu lugar?",

  /**
   * Início da live em ISO 8601 COM offset de Brasília, ex.: "2026-12-10T19:00:00-03:00".
   * Enquanto for `null`, a página mostra [DATA] / [HORÁRIO] e o botão de agenda fica indisponível.
   */
  startsAt: "2026-11-09T20:00:00-03:00" as string | null,

  /** Fuso usado para exibir data e horário. */
  timezone: "America/Sao_Paulo",

  /** Duração em minutos (necessária para gerar o compromisso na agenda). */
  durationMinutes: 60 as number | null,

  /** Plataforma da transmissão, ex.: "YouTube", "Zoom". */
  platform: "YouTube" as string | null,

  /** Link de acesso à transmissão (entra na descrição do compromisso da agenda). */
  streamUrl: "https://www.youtube.com/channel/UC6_IcFW6_snFedexDeG-KTA" as string | null,

  /** Link do WhatsApp para lembretes (ex.: canal/comunidade). Sem ele, o botão não aparece. */
  whatsappUrl: null as string | null,

  /**
   * Endpoint de inscrição (POST, JSON). Veja `lib/rsvp.ts` para o contrato.
   * Enquanto for `null`, o formulário NÃO simula inscrição: informa que ainda não está aberto.
   */
  rsvpEndpoint: (process.env.NEXT_PUBLIC_RSVP_WEBHOOK_URL || null) as string | null,

  /** Nossas redes e blog (tela de obrigado). Sem valor, o link não aparece. */
  social: {
    youtube: "https://www.youtube.com/channel/UC6_IcFW6_snFedexDeG-KTA" as string | null,
    instagram: null as string | null,
    twitter: null as string | null,
  },
  blogUrl: null as string | null,

  /** Link da política de privacidade. */
  privacyUrl: null as string | null,

  /** E-mail de contato exibido no rodapé. */
  contactEmail: null as string | null,
} as const;

export const PLACEHOLDER = {
  date: "09/11/2026",
  time: "20:00",
  platform: "Youtube",
  contact: "economyagent@gmail.com",
  privacy: "[POLÍTICA DE PRIVACIDADE]",
} as const;

function parsedStart(): Date | null {
  if (!EVENT.startsAt) return null;
  const d = new Date(EVENT.startsAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type EventDisplay = {
  date: string;
  time: string;
  platform: string;
  /** true quando data e horário são reais (permite gerar o .ics). */
  scheduled: boolean;
  /** true quando a agenda pode ser gerada com dados reais. */
  canAddToCalendar: boolean;
};

export function getEventDisplay(): EventDisplay {
  const start = parsedStart();
  const platform = EVENT.platform ?? PLACEHOLDER.platform;
  if (!start) {
    return { date: PLACEHOLDER.date, time: PLACEHOLDER.time, platform, scheduled: false, canAddToCalendar: false };
  }
  const date = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: EVENT.timezone,
  }).format(start);
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: EVENT.timezone,
  }).format(start);
  return {
    date: date.charAt(0).toUpperCase() + date.slice(1),
    time,
    platform,
    scheduled: true,
    canAddToCalendar: EVENT.durationMinutes !== null && EVENT.durationMinutes > 0,
  };
}
