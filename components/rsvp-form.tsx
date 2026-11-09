"use client";

import { useRef, useState, type FormEvent } from "react";
import { EVENT, PLACEHOLDER, type EventDisplay } from "@/lib/event";
import { buildIcs } from "@/lib/ics";
import { submitRsvp } from "@/lib/rsvp";
import { Arrow } from "./arrow";

type Values = { name: string; email: string; whatsapp: string; instagram: string; twitter: string; youtube: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SOCIALS = [
  { key: "instagram", label: "Instagram", ph: "@seuusuario", host: /instagram\.com/i },
  { key: "twitter", label: "Twitter / X", ph: "@seuusuario", host: /(twitter|x)\.com/i },
  { key: "youtube", label: "YouTube", ph: "@seucanal ou link do canal", host: /youtube\.com|youtu\.be/i },
] as const;
const HANDLE_RE = /^@?[A-Za-z0-9._-]{1,50}$/;

/** Máscara BR: (11) 91234-5678 ou (11) 1234-5678. Aceita colar com +55. */
function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate(v: Values): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  if (!name) e.name = "Informe seu nome.";
  else if (name.length < 2) e.name = "Digite seu nome completo.";
  const email = v.email.trim();
  if (!email) e.email = "Informe seu e-mail.";
  else if (!EMAIL_RE.test(email)) e.email = "Digite um e-mail válido, como nome@exemplo.com.";
  const digits = v.whatsapp.replace(/\D/g, "");
  if (!v.whatsapp.trim()) e.whatsapp = "Informe seu WhatsApp.";
  else if (
    digits.length < 10 || digits.length > 11 ||
    digits.startsWith("0") || digits[0] === "1" && digits[1] === "0" ||
    (digits.length === 11 && digits[2] !== "9")
  ) {
    e.whatsapp = "Digite um WhatsApp válido com DDD, por exemplo (11) 91234-5678.";
  }
  for (const s of SOCIALS) {
    const val = v[s.key].trim();
    if (!val) continue;
    const ok = /^https?:\/\//i.test(val) ? s.host.test(val) : HANDLE_RE.test(val);
    if (!ok) e[s.key] = `Informe seu @ ou o link do seu perfil no ${s.label}.`;
  }
  return e;
}

export function RsvpForm({ display }: { display: EventDisplay }) {
  const [values, setValues] = useState<Values>({ name: "", email: "", whatsapp: "", instagram: "", twitter: "", youtube: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: keyof Values) => (ev: { target: { value: string } }) => {
    const raw = ev.target.value;
    const next = { ...values, [k]: k === "whatsapp" ? formatPhone(raw) : raw };
    setValues(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k: keyof Values) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(values));
  };

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (status === "submitting") return;
    const errs = validate(values);
    setErrors(errs);
    setTouched({ name: true, email: true, whatsapp: true, instagram: true, twitter: true, youtube: true });
    const first = (["name", "email", "whatsapp", "instagram", "twitter", "youtube"] as const).find((k) => errs[k]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    setFormError(null);
    const res = await submitRsvp({
      name: values.name.trim(), email: values.email.trim(), whatsapp: values.whatsapp.trim(),
      instagram: values.instagram.trim(), twitter: values.twitter.trim(), youtube: values.youtube.trim(),
    });
    if (res.ok) {
      setStatus("success");
      requestAnimationFrame(() => successRef.current?.focus());
    } else {
      setStatus("error");
      setFormError(res.message);
    }
  }

  function addToCalendar() {
    const ics = buildIcs();
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-economy-live.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- Estado de sucesso: só após confirmação real do endpoint ---------- */
  if (status === "success") {
    return (
      <div className="success" role="status">
        <h3 className="h-lg" tabIndex={-1} ref={successRef}>Sua presença está confirmada.</h3>
        <p className="body-s">Você está nessa conversa. Reserve a data e traga suas perguntas sobre trabalho, renda e o nosso lugar na economia dos agentes.</p>
        <p className="caption">O mundo pós-trabalho: qual será o seu lugar?</p>
        <dl className="facts">
          <div><dt className="caption">Data</dt><dd>{display.date}</dd></div>
          <div><dt className="caption">Horário</dt><dd>{display.time}{display.scheduled ? " · Horário de Brasília" : ""}</dd></div>
          <div><dt className="caption">Local</dt><dd>Online · {display.platform}</dd></div>
        </dl>
        <div className="actions">
          <button type="button" className="btn" onClick={addToCalendar} disabled={!display.canAddToCalendar}>
            Adicionar à agenda <Arrow />
          </button>
          {/* Só aparece com destino configurado (EVENT.whatsappUrl). */}
          {EVENT.whatsappUrl && (
            <a className="btn btn-ghost" href={EVENT.whatsappUrl} target="_blank" rel="noopener noreferrer">
              Receber lembretes no WhatsApp <Arrow />
            </a>
          )}
        </div>
        {!display.canAddToCalendar && (
          <p className="hint">A agenda fica disponível quando data, horário e duração da live forem definidos.</p>
        )}
        {(Object.values(EVENT.social).some(Boolean) || EVENT.blogUrl) && (
          <div className="follow">
            {Object.values(EVENT.social).some(Boolean) && (
              <>
                <p className="caption">Acompanhe o Autonomous Economy</p>
                <ul className="follow-links">
                  {([["youtube", "YouTube"], ["instagram", "Instagram"], ["twitter", "Twitter / X"]] as const).map(([k, label]) =>
                    EVENT.social[k] ? (
                      <li key={k}><a className="link" href={EVENT.social[k]!} target="_blank" rel="noopener noreferrer">{label}</a></li>
                    ) : null)}
                </ul>
              </>
            )}
            {EVENT.blogUrl && (
              <a className="btn btn-ghost" href={EVENT.blogUrl} target="_blank" rel="noopener noreferrer">
                Ler os artigos no blog <Arrow />
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  const busy = status === "submitting";
  return (
    <form className="form" ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={formError ? "form-error" : undefined}>
      <div className="field">
        <label htmlFor="f-name">Nome <span className="req" aria-hidden="true">*</span></label>
        <input id="f-name" name="name" className="input" type="text" autoComplete="name" required
          value={values.name} onChange={set("name")} onBlur={blur("name")}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "f-name-err" : undefined} />
        {errors.name && <p className="error" id="f-name-err" role="alert">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-email">E-mail <span className="req" aria-hidden="true">*</span></label>
        <input id="f-email" name="email" className="input" type="email" inputMode="email" autoComplete="email" required
          value={values.email} onChange={set("email")} onBlur={blur("email")}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "f-email-err" : undefined} />
        {errors.email && <p className="error" id="f-email-err" role="alert">{errors.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-wa">WhatsApp <span className="req" aria-hidden="true">*</span></label>
        <input id="f-wa" name="whatsapp" className="input" type="tel" inputMode="tel" autoComplete="tel-national" required
          placeholder="(11) 91234-5678"
          value={values.whatsapp} onChange={set("whatsapp")} onBlur={blur("whatsapp")}
          aria-invalid={!!errors.whatsapp} aria-describedby={errors.whatsapp ? "f-wa-err f-wa-hint" : "f-wa-hint"} />
        <p className="hint" id="f-wa-hint">Usaremos o número apenas para avisos sobre esta live.</p>
        {errors.whatsapp && <p className="error" id="f-wa-err" role="alert">{errors.whatsapp}</p>}
      </div>

      <fieldset className="field socials">
        <legend>Redes sociais <span className="opt">(opcional — até 3)</span></legend>
        {SOCIALS.map((s) => (
          <div key={s.key} className="social-row">
            <label htmlFor={`f-${s.key}`}>{s.label}</label>
            <input id={`f-${s.key}`} name={s.key} className="input" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false}
              placeholder={s.ph} value={values[s.key]} onChange={set(s.key)} onBlur={blur(s.key)}
              aria-invalid={!!errors[s.key]} aria-describedby={errors[s.key] ? `f-${s.key}-err` : undefined} />
            {errors[s.key] && <p className="error" id={`f-${s.key}-err`} role="alert">{errors[s.key]}</p>}
          </div>
        ))}
      </fieldset>

      <p className="hint req-note"><span className="req" aria-hidden="true">*</span> Campos obrigatórios</p>

      {formError && <p className="error form-error" id="form-error" role="alert">{formError}</p>}

      <div className="form-foot">
        <button type="submit" className="btn" disabled={busy} aria-busy={busy}>
          {busy ? "Enviando…" : "Confirmar minha presença"} {!busy && <Arrow />}
        </button>
        <p className="hint privacy">
          Usamos seus dados apenas para esta live.{" "}
          {EVENT.privacyUrl ? (
            <a className="link" href={EVENT.privacyUrl} target="_blank" rel="noopener noreferrer">Política de privacidade</a>
          ) : (
            <span title="Configure EVENT.privacyUrl em lib/event.ts">{PLACEHOLDER.privacy}</span>
          )}
        </p>
      </div>
    </form>
  );
}
