import { EVENT } from "./event";

const pad = (n: number) => String(n).padStart(2, "0");
const utc = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Gera o .ics com os dados reais do evento. Retorna null se faltar data ou duração. */
export function buildIcs(): string | null {
  if (!EVENT.startsAt || !EVENT.durationMinutes) return null;
  const start = new Date(EVENT.startsAt);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + EVENT.durationMinutes * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Autonomous Economy//Live//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${utc(start)}-agent-economy@live`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${esc(EVENT.title)}`,
    `DESCRIPTION:${esc(EVENT.streamUrl ? `Acesso: ${EVENT.streamUrl}` : "Autonomous Economy: uma conversa ao vivo sobre trabalho, renda e o nosso lugar na economia dos agentes.")}`,
    ...(EVENT.streamUrl ? [`URL:${EVENT.streamUrl}`, `LOCATION:${esc(EVENT.platform ?? EVENT.streamUrl)}`] : EVENT.platform ? [`LOCATION:${esc(EVENT.platform)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
