# Design system (marketing → produto)

Este documento define a arquitetura do sistema visual compartilhado entre o site de marketing (Astro) e, no futuro, o produto (app / área logada). O nome comercial e o logo ainda podem mudar; **tokens e estrutura** são a fonte de verdade estável.

## Fontes de verdade

| Camada | Onde | Responsabilidade |
|--------|------|------------------|
| Tokens CSS | `marketing/src/styles/design-tokens.css` | Cores, tipografia, raios, sombras, escala mínima. Prefixo **`--ds-*`** para valores canônicos. |
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

## Página de referência visual

- URL local: `/design-system`
- Ficheiro: `marketing/src/pages/design-system.astro`
- Uso: validação rápida de tokens e primitivos (estilo “bento”), não substitui documentação escrita.

## Legado e evolução

- Componentes de bloco existentes já consomem tokens e primitivos atualizados.
- **Legado** (componentes antigos do produto ou estilos ad-hoc fora de `design-tokens.css`) fica fora desta fase; quando forem migrados, devem deixar de definir cores hardcoded em favor de `--ds-*` ou utilitários `@theme`.

## Referências cruzadas

- Modelo de conteúdo e `tokenOverrides`: `02-content-model.md`
- Arquitetura geral do marketing: `01-architecture.md`
