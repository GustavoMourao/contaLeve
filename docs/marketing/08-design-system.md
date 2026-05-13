# Design system (marketing → produto)

Este documento define a arquitetura do sistema visual compartilhado entre o site de marketing (Astro) e, no futuro, o produto (app / área logada). O nome comercial e o logo ainda podem mudar; **tokens e estrutura** são a fonte de verdade estável.

## Fontes de verdade

| Camada | Onde | Responsabilidade |
|--------|------|------------------|
| Tokens CSS | `marketing/src/styles/design-tokens.css` | Cores, tipografia, raios, sombras, escala mínima. Prefixo **`--ds-*`** para valores canônicos. |
| Preview de tokens (UI) | `marketing/src/lib/designTokenPreview.ts` + `marketing/src/components/preview/DesignTokenPreview.astro` | Lista e grupos mostrados em `/design-system`; valores sempre via `var(...)` a partir de `:root`. |
| Aliases de conteúdo | Mesmo ficheiro (`--color-*`) | Chaves permitidas em `tokenOverrides` no frontmatter (ver `src/lib/schema.ts` e `src/lib/tokens.ts`). |
| Tailwind | `marketing/src/styles/global.css` (`@theme`) | Utilitários (`bg-ds-green`, `shadow-ds-md`, `rounded-card`, `font-display`, …). |
| Form field classes | `marketing/src/lib/fieldStyles.ts` | Funções puras que devolvem strings de classes — fáceis de testar e reutilizar em blocos e no produto. |

## Escopo por superfície

Três categorias orientam onde viver cada peça UI. O objetivo é evitar duplicação desnecessária e, ao mesmo tempo, não forçar o mesmo componente onde o contexto (SEO, narrativa, densidade de dados) é diferente.

### 1. Marketing-only (`marketing/src/components/blocks/`)

Blocos compostos para landing pages: `Hero`, `Features`, `FAQ`, `LeadForm`, `CTA`, `RichText`. Podem usar primitivos e tokens livremente; copy e layout são otimizados para conversão e leitura rápida.

### 2. Sistema / produto (futuro)

Componentes densos, tabelas complexas, navegação persistente, estados de conta. **Ainda não existem neste repositório**; quando forem criados, devem consumir os mesmos `--ds-*` / `fieldStyles` sempre que o visual tiver de permanecer alinhado à marca.

### 3. Partilhados (`marketing/src/components/primitives/` + `fieldStyles.ts`)

Elementos atómicos reutilizáveis: `Button`, `Heading`, `Section`, `Container`, `Input`, `Textarea`, `Badge`, `Alert`. São candidatos naturais a extrair para um pacote interno (`@conta-leve/ui`) ou a copiar para o monorepo do app, **sem** alterar os tokens centrais.

**Variantes:** o mesmo primitivo pode expor `variant` / `tone` (ex.: `Button` `vivid` vs `primary`; `Alert` `success` vs `error`) em vez de duplicar componentes.

## Regras visuais (resumo)

- Contraste forte; fundos de marca **off-white** ou **charcoal**; cartões **brancos** com borda charcoal.
- **Sem** sombras com blur; apenas offset fixo (`shadow-ds-sm` / `shadow-ds-md`).
- Borda de interface **2.5px** sólida charcoal por defeito.
- Verde da marca em **dois** passos apenas (`green`, `green-vivid`); não introduzir escala “pastel”.
- Semântica: success / warning / error (pink) / info (teal), com variantes **vivid** para texto sobre fundo escuro — ver comentários em `design-tokens.css` e cheat-sheet HTML de referência.
- Tipografia: **Epilogue** (display / dados fortes), **Outfit** (corpo e UI). Ícones: Lucide, traço monoline ~2px (SVG inline onde ainda não há pacote).

## Navegação do preview (hub unificado)

As páginas **apenas de preview** (`/`, `/design-system`, `/docs`) partilham o mesmo cromo:

- **Barra horizontal no topo** (`PreviewTopNav`): alterna entre Campaigns (índice de LPs), Design system e Handbook. Ficheiro: `marketing/src/components/preview/PreviewTopNav.astro`; dados em `marketing/src/lib/previewNav.ts`.
- **Handbook** (`/docs/*`): barra lateral com a lista de ficheiros Markdown (layout `DocsLayout.astro`).
- **Design system** (`/design-system`): barra lateral com **âncoras na mesma página** (componente `DesignSystemSidebar.astro`; lista de ids em `previewNav.ts` → `designSystemNavItems`). Em ecrãs estreitos, os mesmos destinos aparecem como **chips** horizontais por baixo do topo.

As landing pages reais (`BasicLP`, rotas `/{slug}`) **não** incluem este cromo — continuam limpas para o domínio de campanha.

## Página de referência visual

- URL local: `/design-system`
- Ficheiros: `marketing/src/pages/design-system.astro` (grelha de componentes), `marketing/src/components/preview/DesignTokenPreview.astro` (grelha de **tokens** com valores via `var(...)`), `marketing/src/lib/designTokenPreview.ts` (lista das variáveis mostradas no preview).
- Uso: validação rápida de tokens e primitivos (estilo “bento”), não substitui documentação escrita.

## Manter a documentação alinhada (obrigatório em PR)

Sempre que alterares o sistema visual, atualiza **em conjunto** os sítios onde isso fica registado — evita desvio entre código, preview e handbook.

| Alteração | O que atualizar |
|-----------|-----------------|
| Novo ou renomeado **token** em `design-tokens.css` | `src/lib/designTokenPreview.ts` (para o preview listar o token), e se aplicável `src/styles/global.css` (`@theme`), `src/lib/schema.ts` / `src/lib/tokens.ts` para `tokenOverrides`. |
| Novo **utilitário Tailwind** ligado a tokens | `global.css` (`@theme`) e, se relevante, este doc na tabela “Fontes de verdade”. |
| Novo **primitivo** (`Button`, `Input`, …) ou nova **variante** | Exemplo em `design-system.astro` (ou no preview que o represente) e, se mudar a arquitectura, secção “Partilhados” / “Escopo” neste ficheiro. |
| Novo **bloco** de landing | Descrever em `02-content-model.md` se o modelo de conteúdo mudar; opcionalmente uma linha aqui se for decisão de design system. |

Regra simples: **PR que introduz token ou componente visível deve incluir a atualização do preview e/ou deste `.md` na mesma entrega.** Reviews devem rejeitar omissões conscientes (salvo follow-up explícito com issue).

## Legado e evolução

- Componentes de bloco existentes já consomem tokens e primitivos atualizados.
- **Legado** (componentes antigos do produto ou estilos ad-hoc fora de `design-tokens.css`) fica fora desta fase; quando forem migrados, devem deixar de definir cores hardcoded em favor de `--ds-*` ou utilitários `@theme`.

## Referências cruzadas

- Modelo de conteúdo e `tokenOverrides`: `02-content-model.md`
- Arquitetura geral do marketing: `01-architecture.md`
