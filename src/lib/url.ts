/**
 * Caminho de asset que respeita o `base` do Astro.
 *
 * O site pode ser servido da raiz de um domínio ou de um subcaminho (o
 * GitHub Pages de projeto serve em `/<repo>/`). Escrever `/images/x.webp`
 * direto quebra no segundo caso: nada em `public/` é reescrito no build.
 */
export function asset(caminho: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${caminho.replace(/^\//, '')}`;
}
