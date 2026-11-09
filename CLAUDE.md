# live-confirmacao-lp

## Skills

As skills do projeto ficam em `.claude/skills/<nome>/SKILL.md` (origem: https://github.com/whaleyxbt/claude-motion). Antes de iniciar uma tarefa, verifique se alguma skill abaixo se aplica e leia o `SKILL.md` correspondente — siga as instruções dele.

| Skill | Use quando |
|---|---|
| [motion-design](.claude/skills/motion-design/SKILL.md) | Criar, animar, ajustar timing ou polir vídeos/composições/cenas/transições em Remotion (timing, easing, springs, tipografia, cor). |
| [review-loop](.claude/skills/review-loop/SKILL.md) | Depois de qualquer mudança visual ou de timing em um vídeo, e antes de dá-lo como pronto (render → contact sheets → crítica → correção). |
| [sound-design](.claude/skills/sound-design/SKILL.md) | Adicionar/alterar áudio, SFX, trilha ou loudness de um vídeo. |
| [web-sims](.claude/skills/web-sims/SKILL.md) | Vídeo de simulação (agentes, partículas, 3D) feito como página HTML com `render(t)` capturada em mp4. |

## Como usar

- Invoque pelo nome (ex.: `/motion-design`) ou deixe o Claude carregá-las pela descrição.
- Ao adicionar uma nova skill, crie `.claude/skills/<nome>/SKILL.md` com frontmatter (`name`, `description`) e registre-a na tabela acima.

## Observação

As skills referenciam arquivos do repositório original (`src/`, `sfx/`, `sims/`, `scripts/`, `timeline.json`), que **não** existem neste projeto. Para usá-las na prática, copie essas pastas do repo claude-motion ou adapte os caminhos nos `SKILL.md`.
