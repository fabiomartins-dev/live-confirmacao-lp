"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

const pad = (n: number) => String(n).padStart(2, "0");

/** Barra fixa no topo: contagem regressiva até o início da live (horário de Brasília). */
export function Countdown() {
  const start = EVENT.startsAt ? new Date(EVENT.startsAt).getTime() : NaN;
  const end = start + (EVENT.durationMinutes ?? 60) * 60_000;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);

  if (Number.isNaN(start)) return null;

  let content: React.ReactNode;
  if (now === null) {
    content = <span className="cd-label">A live começa em breve</span>;
  } else if (now >= end) {
    content = <span className="cd-label">Live encerrada</span>;
  } else if (now >= start) {
    content = (
      <>
        <span className="cd-label"><span className="cd-dot" aria-hidden="true" /> Ao vivo agora</span>
        {EVENT.streamUrl && (
          <a className="cd-link" href={EVENT.streamUrl} target="_blank" rel="noopener noreferrer">Entrar no Google Meet</a>
        )}
      </>
    );
  } else {
    const s = Math.floor((start - now) / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const units: [number | string, string][] = [[d, "d"], [pad(h), "h"], [pad(m), "min"], [pad(sec), "s"]];
    content = (
      <>
        <span className="cd-label">A live começa em</span>
        <span className="cd-time" role="timer" aria-label={`Faltam ${d} dias, ${h} horas, ${m} minutos e ${sec} segundos`}>
          {units.map(([v, u]) => (
            <span key={u} className="cd-unit"><b>{v}</b>{u}</span>
          ))}
        </span>
      </>
    );
  }

  return <div className="countdown" aria-live="off"><div className="frame cd-inner">{content}</div></div>;
}
