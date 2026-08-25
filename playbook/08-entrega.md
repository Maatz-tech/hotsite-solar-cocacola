# 08 — Entrega

Roda quando o cliente vai receber. Antes disso, não.

---

## SEO

Por página (props do `Base.astro`):

- `<title>` único, ≤ 60 caracteres.
- `<meta name="description">` único, 140–160 caracteres.
- Open Graph: `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`.
- Twitter Card `summary_large_image` com os mesmos campos.
- `<link rel="canonical">` para a URL final.

No projeto:

- `robots.txt` em `public/`.
- `@astrojs/sitemap` instalado, `sitemap-index.xml` gerado no build.
- JSON-LD: pelo menos `Organization` no `Base.astro`. Conforme o caso:
  `LocalBusiness`, `Article`, `BreadcrumbList`.
- URLs limpas, sem `.html`, trailing slash consistente.

### Checklist

- [ ] Todas as páginas com title/description únicos.
- [ ] Todas as imagens com `alt`.
- [ ] Hierarquia de headings sem pulos.
- [ ] Sitemap acessível.
- [ ] `<html lang="pt-BR">`.
- [ ] `SITE_URL` em `src/data/site.ts` é o domínio real.

---

## Performance

Targets Lighthouse (mobile, 4G throttled):

| Categoria | Target |
|---|---|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | 100 |
| SEO | 100 |

Táticas:

- Fontes: 1 família, ≤ 4 pesos, `preconnect` + `font-display: swap`. Preload só
  do peso do LCP.
- Imagens: WebP + `astro:assets` + `loading="lazy"` (exceto LCP).
- CSS: Tailwind v4 já purga. Zero `@import` externo em produção.
- JS: idealmente zero KB. O `motion` entra com import tardio
  ([05](05-animacao.md)).
- Sem trackers ou scripts de terceiros sem discussão explícita.

```bash
npm run build
npm run preview
# outra aba: Lighthouse (DevTools) em mobile
```

Score abaixo do target: investigar → ajustar → medir de novo. Não entregar
amarelo/vermelho sem justificativa escrita no PROJECT.md.

---

## Acessibilidade

- **Contraste** AA mínimo (4.5:1 texto normal, 3:1 texto grande). A cor de
  destaque sobre branco costuma falhar — conferir.
- **Foco visível** em todos os interativos.
- **Skip link** `<a href="#main">` no topo do body, visível ao Tab (já no template).
- **ARIA** só onde o HTML nativo não resolve. `aria-label` em botão-ícone,
  `aria-expanded`/`aria-controls` em toggle.
- **Formulários:** `<label>` associado, `required`, `type` correto, mensagens de
  erro programáticas.
- **Ordem de tab:** navegar o site inteiro só com teclado antes da entrega.
- Rodar `axe` (extensão) ou `pa11y` como check final.

---

## Build e checklist final

```bash
npm run build     # sem warning
npm run preview   # sanity check no build
```

- [ ] Lighthouse com todos os targets batidos.
- [ ] Todas as seções validadas contra o Figma, screenshots arquivados em `docs/`.
- [ ] Links de nav funcionando, incluindo âncoras.
- [ ] Formulários com destino real — nunca `action="#"`.
- [ ] Favicon, OG image e sitemap corretos.
- [ ] Sem `console.log`, `TODO` ou texto placeholder (`Lorem`, `<Marca>`, `LOGO`).
- [ ] `robots.txt` permite indexação (se o cliente autorizou).
- [ ] Pendências do PROJECT.md zeradas ou explicitamente aceitas pelo cliente.
- [ ] Erros pegos nesta rodada registrados em [09-qa-erros-comuns](09-qa-erros-comuns.md).

### Grep final

```bash
grep -rn "TODO\|Lorem\|<Marca>\|exemplo.com.br\|console.log" src/ public/
grep -rnE "#[0-9a-fA-F]{6}" src/components src/pages   # hex fora do global.css
```
