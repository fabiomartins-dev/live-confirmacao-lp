import { Arrow } from "@/components/arrow";
import { Countdown } from "@/components/countdown";
import { GridLines } from "@/components/grid-lines";
import { Header } from "@/components/header";
import { HLine, MaskLines, Reveal } from "@/components/motion";
import { ParallaxArt } from "@/components/parallax-art";
import { RsvpForm } from "@/components/rsvp-form";
import { EVENT, PLACEHOLDER, getEventDisplay } from "@/lib/event";

const THEMES = [
  {
    n: "01", label: "TRABALHO E RENDA", q: "De onde virá a nossa renda?",
    d: "Se agentes executam mais tarefas, o que muda nas profissões, nas carreiras e na forma como ganhamos dinheiro?",
  },
  {
    n: "02", label: "NEGÓCIOS E OPORTUNIDADES", q: "O que poderemos construir com os agentes?",
    d: "Novas formas de empreender, equipes menores e negócios operados com IA: quais possibilidades se abrem e o que será necessário para aproveitá-las?",
  },
  {
    n: "03", label: "VALOR E PODER", q: "Quem fica com o valor?",
    d: "Se os agentes produzem, quem recebe os ganhos? Uma conversa sobre propriedade, controle e distribuição de oportunidades nessa nova economia.",
  },
] as const;

export default function Home() {
  const ev = getEventDisplay();

  return (
    <div className="page">
      <div className="page-grid" aria-hidden="true"><GridLines /></div>
      <Countdown />
      <Header />

      <main>
        {/* 2. HERO */}
        <section className="hero" id="topo" aria-labelledby="hero-title">
          <div className="frame cols hero-grid">
            <div className="cell cell-2 hero-main">
              <Reveal immediate delay={0.25}><p className="caption">AE / ENCONTRO AO VIVO</p></Reveal>
              <MaskLines as="h1" id="hero-title" className="display hero-title" immediate delay={0.35} stagger={0.12} y={24}
                lines={["O mundo pós-trabalho:", "qual será o seu lugar?"]} />
            </div>
            <div className="cell hero-aside">
              <Reveal immediate delay={0.85}>
                <p className="body-s">
                  Quando agentes de IA trabalham, produzem e fazem negócios, o que muda na forma como vivemos e ganhamos dinheiro? Uma conversa sobre as oportunidades, os dilemas e o nosso lugar nessa nova economia.
                </p>
              </Reveal>
              <Reveal immediate delay={1.0}>
                <dl className="facts">
                  <div><dt className="sr-only">Data</dt><dd>{ev.date}</dd></div>
                  <div><dt className="sr-only">Horário</dt><dd>{ev.time} · Horário de Brasília</dd></div>
                  <div><dt className="sr-only">Local</dt><dd>Online · {ev.platform}</dd></div>
                </dl>
              </Reveal>
              <Reveal immediate delay={1.15}>
                <a className="btn" href="#confirmar">Quero participar da conversa <Arrow /></a>
              </Reveal>
            </div>
          </div>
          <ParallaxArt eager aspect="1600 / 640" className="art-hero" layers={[
            { src: "/art/hero-far.svg", amount: 12 },
            { src: "/art/hero-mid.svg", amount: 28 },
            { src: "/art/hero-near.svg", amount: 46 },
          ]} />
        </section>

        {/* 3. ABERTURA DA CONVERSA */}
        <section className="section" id="conversa" aria-labelledby="conversa-title">
          <HLine />
          <div className="frame cols section-grid">
            <div className="cell cell-2">
              <Reveal><p className="caption">A CONVERSA</p></Reveal>
              <MaskLines as="h2" id="conversa-title" className="display h-xl"
                lines={["Se os agentes fazem o trabalho,", "o que fazemos nós?"]} />
            </div>
            <div className="cell cell-end">
              <Reveal delay={0.25}>
                <p className="body-s">
                  Durante muito tempo, trabalhar foi o principal caminho para gerar renda, construir uma carreira e encontrar nosso lugar na sociedade. Se agentes de IA passam a executar parte desse trabalho, como essa relação pode mudar?
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 4. TEMAS DA LIVE */}
        <section className="themes" id="temas" aria-labelledby="temas-title">
          <HLine />
          <div className="frame cols theme-head">
            <div className="cell"><Reveal><h2 className="caption" id="temas-title">TEMAS DA LIVE</h2></Reveal></div>
          </div>
          {THEMES.map((t, i) => (
            <div key={t.n}>
              <HLine delay={0.05 * i} />
              <div className="frame cols theme">
                <div className="cell"><Reveal delay={0.05}><p className="caption">{t.n} / {t.label}</p></Reveal></div>
                <div className="cell cell-2">
                  <MaskLines as="h3" className="display h-md" lines={[t.q]} />
                  <Reveal delay={0.15}><p className="body-s theme-desc">{t.d}</p></Reveal>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 5. CONFIRMAÇÃO DE PRESENÇA */}
        <section className="section confirm" id="confirmar" aria-labelledby="confirmar-title">
          <HLine />
          <div className="frame cols section-grid">
            <div className="cell">
              <Reveal><p className="caption">CONFIRMAÇÃO DE PRESENÇA</p></Reveal>
              <MaskLines as="h2" id="confirmar-title" className="display h-confirm"
                lines={["O futuro do trabalho também é uma conversa sobre você."]} />
              <Reveal delay={0.2}>
                <p className="body-s confirm-text">Traga suas perguntas e sua visão. Confirme sua presença para conversar sobre o que podemos perder, ganhar e construir em um mundo com agentes de IA.</p>
              </Reveal>
            </div>
            <div className="cell cell-2 confirm-form">
              <Reveal delay={0.15}><RsvpForm display={ev} /></Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* 7. RODAPÉ */}
      <footer className="footer">
        <HLine />
        <div className="frame cols footer-bar">
          <div className="cell"><span className="brand">Autonomous Economy</span></div>
          <div className="cell cell-2 footer-desc">
            <p className="body-s">Conversas sobre os agentes de IA e as mudanças no trabalho, nos negócios e na economia.</p>
          </div>
        </div>
        <ParallaxArt aspect="2000 / 560" className="art-footer" layers={[
          { src: "/art/footer-far.svg", amount: 12 },
          { src: "/art/footer-mid.svg", amount: 26 },
          { src: "/art/footer-water.svg", amount: 26 },
          { src: "/art/footer-near.svg", amount: 44 },
        ]} />
      </footer>
    </div>
  );
}
