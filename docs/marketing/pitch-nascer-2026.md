# Pitch Page — Programa Nascer 2026

Página de pitch do **contaLeve** para inscrição no Programa Nascer VII Edição (FAPESC nº 024/2026).

---

## URL de produção

```
https://gustavomourao.github.io/contaLeve/pitch-nascer-2026
```

A página é deployada automaticamente via GitHub Actions sempre que um push atinge `main` com alterações em `marketing/` ou no próprio workflow.

---

## Contexto do programa

| Item | Detalhe |
|------|---------|
| **Programa** | Programa Nascer — VII Edição |
| **Edital** | Chamada Pública FAPESC nº 024/2026 |
| **Prazo de inscrição** | até 15/06/2026 (23h59 horário de Brasília) |
| **Inscrição oficial** | [nascer.sc.gov.br](https://nascer.sc.gov.br) |
| **Prêmio máximo** | R$ 220.000 (1º lugar Super Pitch Day) |
| **Site do programa** | [programanascer.com.br](https://programanascer.com.br) |

A pitch page serve como material de apoio e de divulgação pública do projeto — **não substitui a inscrição oficial** pelo formulário do programa.

---

## Arquivos relevantes

| Arquivo | Propósito |
|---------|-----------|
| [`marketing/src/content/icps/pitch-nascer-2026.mdx`](../../marketing/src/content/icps/pitch-nascer-2026.mdx) | Conteúdo completo da pitch page (frontmatter + MDX) |
| [`marketing/astro.config.mjs`](../../marketing/astro.config.mjs) | Configuração do Astro com suporte a `DEPLOY_SITE` / `DEPLOY_BASE` |
| [`.github/workflows/deploy-pitch.yml`](../../.github/workflows/deploy-pitch.yml) | Workflow de build + deploy para GitHub Pages |

---

## Como editar o conteúdo da página

O arquivo `pitch-nascer-2026.mdx` usa a estrutura padrão do marketing site com dois layer de conteúdo:

### 1. Frontmatter (blocos visuais)

```yaml
blocks:
  - type: Hero          # título principal + CTA
  - type: Features      # cards com pilares do negócio
  - type: RichText      # corpo MDX (ver abaixo)
  - type: CTA           # call to action final
  - type: FAQ           # perguntas e respostas da banca
```

Para ajustar o hero, features ou FAQ, edite diretamente os campos dentro do `blocks:` no frontmatter.

### 2. Corpo MDX (narrativa detalhada)

Abaixo do `---` final do frontmatter fica o corpo MDX renderizado pelo bloco `RichText`. Estrutura atual:

```
## O Problema
## A Solução
## Mercado e Inovação
## Produto Atual: O que o MVP Entrega
## Modelo de Negócio
## Perfil Empreendedor e Equipe
## Plano de Uso dos Recursos
## Por que o Programa Nascer é o caminho certo
<LeadForm ...>
## Impacto Esperado
```

---

## Critérios de avaliação cobertos

A pitch page foi estruturada para endereçar os 4 eixos de mérito do edital:

| Critério (edital) | Seção na pitch page |
|-------------------|---------------------|
| **Problema e Solução** | Hero, Features (cards 1–2), `## O Problema`, `## A Solução` |
| **Mercado e Inovação** | Features (cards 3–4), `## Mercado e Inovação` |
| **Perfil Empreendedor e Equipe** | Features (card 6), `## Perfil Empreendedor e Equipe` |
| **Gestão e Recursos** | Features (card 6), `## Plano de Uso dos Recursos` |

---

## Deploy e infraestrutura

### Pipeline de CI/CD

```
push → main
    └── paths: marketing/** ou .github/workflows/deploy-pitch.yml
          ↓
    [build] ubuntu-latest
      • actions/checkout@v4
      • actions/setup-node@v4 (Node 20, cache npm)
      • npm ci  (marketing/package-lock.json)
      • npm run build  (DEPLOY_SITE + DEPLOY_BASE → astro.config.mjs)
      • actions/upload-pages-artifact@v3 (marketing/dist)
          ↓
    [deploy] environment: github-pages
      • actions/deploy-pages@v4
```

### Configuração única no repositório (one-time)

1. Vá em **Settings → Pages** do repositório `GustavoMourao/contaLeve`
2. Em **Source**, selecione **"GitHub Actions"**
3. Salve — pronto. O próximo push disparará o deploy automaticamente.

### Variáveis de ambiente do build

| Variável | Valor em produção | Valor em dev local |
|----------|------------------|--------------------|
| `DEPLOY_SITE` | `https://gustavomourao.github.io` | *(não definida → `http://localhost:4321`)* |
| `DEPLOY_BASE` | `/contaLeve` | *(não definida → `/`)* |

Se você configurar um **domínio personalizado** no GitHub Pages:
- Altere `DEPLOY_SITE` no workflow para o seu domínio (ex: `https://pitch.contaLeve.com.br`)
- Remova `DEPLOY_BASE` (ou defina como `/`)

---

## Rodar localmente

```bash
cd marketing
npm install
npm run dev
# Abra http://localhost:4321/pitch-nascer-2026
```

Para simular exatamente o build de produção:

```bash
cd marketing
DEPLOY_SITE=https://gustavomourao.github.io \
DEPLOY_BASE=/contaLeve \
npm run build && npm run preview
# Abra http://localhost:4321/contaLeve/pitch-nascer-2026
```

---

## Cheklist antes da apresentação

- [ ] Testar a URL de produção após o primeiro deploy
- [ ] Verificar que o LeadForm envia corretamente para o backend
- [ ] Adicionar OG image (`frontmatter.seo.ogImage`) para compartilhamento no WhatsApp / LinkedIn
- [ ] Revisar números de mercado (TAM/SAM/SOM) com fonte citável
- [ ] Atualizar seção de equipe com nome completo e LinkedIn do(s) fundador(es)
- [ ] Confirmar inscrição oficial em [nascer.sc.gov.br](https://nascer.sc.gov.br) até 15/06/2026

---

## Links úteis

- MVP ao vivo: [conta-leve.vercel.app](https://conta-leve.vercel.app)
- Pitch page (produção): [gustavomourao.github.io/contaLeve/pitch-nascer-2026](https://gustavomourao.github.io/contaLeve/pitch-nascer-2026)
- Edital oficial: [programanascer.com.br/edital2026.pdf](https://programanascer.com.br/edital2026.pdf)
- Formulário de inscrição: [nascer.sc.gov.br](https://nascer.sc.gov.br)
- Suporte do programa: programa@nascer.sc.gov.br
