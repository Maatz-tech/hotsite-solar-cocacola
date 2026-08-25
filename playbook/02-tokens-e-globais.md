# 02 — Design tokens e globais

Tudo mora em [`src/styles/global.css`](../src/styles/global.css). **Nunca**
hard-codar cor ou fonte fora daqui.

## `@theme`

Mapear 1:1 com o `get_variable_defs` do Figma. Nome do token segue a semântica
da marca, não o nome literal do Figma quando ele for ruim.

```css
@theme {
  /* Marca */
  --color-brand: #hex;
  --color-brand-dark: #hex;      /* hover / sombra */
  --color-accent: #hex;          /* destaque, eyebrow */

  /* Superfícies */
  --color-ink: #hex;             /* texto e fundos escuros */
  --color-surface: #ffffff;
  --color-surface-alt: #hex;

  /* Derivadas com alpha — evita spray de opacity nas seções */
  --color-ink-70: rgb(… / 0.7);
  --color-on-dark-70: rgb(255 255 255 / 0.7);

  /* Tipografia */
  --font-sans: "<Família>", ui-sans-serif, system-ui, sans-serif;

  /* Layout — medir no Figma */
  --container-lp: 1216px;
  --radius-card: 20px;
  --radius-btn: 12px;
}
```

**Fonte licenciada:** colocar a substituta do Google Fonts na cadeia e deixar a
licenciada na frente. Quando os `.woff2` chegarem, declarar os `@font-face` e ela
assume sozinha — nenhuma outra linha do projeto muda.

## Utilitárias semânticas

Se apareceu **2× no design com o mesmo estilo**, vira utilitária. Nunca duplicar
`text-[32px] font-bold leading-[1.4]` nas seções.

| Classe | Para |
|---|---|
| `.container-lp` | Container padrão da página |
| `.h1` `.h2` `.h3` | Escala de headings do Figma |
| `.body` `.body-sm` `.body-on-dark` | Body copy |
| `.eyebrow` | Rótulo colorido acima do heading |
| `.btn` + `.btn-primary/outline/invert` + `.btn-sm/md/lg` | Botões |
| `.card` `.card-interactive` | Cards |
| `.pill` | Chips |

## Onde cada bloco do CSS mora, e por quê

O arquivo tem quatro blocos, nessa ordem:

1. `@theme` — tokens.
2. `@layer base` — reset semântico, `cursor: pointer`, `:focus-visible`.
3. `@layer components` — utilitárias semânticas.
4. **Hover, fora de qualquer layer.** No Tailwind v4 as utilitárias vencem
   `@layer components`, então um hover escrito lá dentro perde para
   `border-transparent` no elemento. Regra sem layer vence todas as layers.
   Ver [QA-001](09-qa-erros-comuns.md#qa-001).
5. Estado inicial dos reveals, condicionado a `.js`. Ver [05-animacao](05-animacao.md).

## Checklist

- [ ] Todas as cores do `get_variable_defs` mapeadas.
- [ ] Só os pesos de fonte realmente usados foram importados (≤ 4).
- [ ] Escala de headings/body definida em CSS, não em spray de Tailwind.
- [ ] Zero hex fora deste arquivo (`grep -rE "#[0-9a-fA-F]{6}" src/components src/pages`).
