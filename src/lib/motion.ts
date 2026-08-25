/**
 * Tokens e primitivas de movimento — fonte única de verdade das animações.
 * Ver playbook/05-animacao.md.
 *
 * Nunca espalhar `duration: 0.63` mágico pelas seções: importe daqui.
 * O estado inicial (opacity: 0) mora no CSS, condicionado à classe `.js`.
 */

/** ease-out expo — curva padrão do projeto */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** ease-in-out suave, para loops (marquee, autoplay) */
export const EASE_SOFT = [0.4, 0, 0.2, 1] as const;

export const DUR = {
  fast: 0.25, // micro-interação
  base: 0.45, // entrada de elemento
  slow: 0.7, // reveal de bloco / slide
} as const;

/** Quanto do elemento precisa estar visível para disparar o reveal */
export const IN_VIEW_AMOUNT = 0.25;

/** Delay entre itens de uma lista */
export const STAGGER = 0.1;

/** Presets declarativos — para uso com motion/react */
export const fadeUp = {
  initial: { opacity: 0, y: 24, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: DUR.slow, ease: EASE },
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: DUR.base, ease: EASE },
} as const;

/** True quando o usuário pediu menos movimento. Sempre checar antes de animar. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fallback que REVELA. Conteúdo preso em opacity:0 porque o módulo não
 * carregou é conteúdo perdido.
 */
function mostrar(els: ArrayLike<Element>) {
  for (const el of Array.from(els) as HTMLElement[]) {
    el.style.opacity = '1';
    el.style.filter = 'none';
    el.style.transform = 'none';
  }
}

/**
 * Devolve o controle ao CSS quando a animação termina — senão o transform
 * inline deixado pelo Motion mata qualquer :hover com transform.
 * Ver playbook/09-qa-erros-comuns.md#qa-002
 */
function liberar(el: HTMLElement) {
  el.style.opacity = '1'; // continua inline: precisa vencer `.js [data-reveal]`
  el.style.transform = '';
  el.style.filter = '';
  el.style.willChange = '';
}

/**
 * Import tardio do `motion` (~26 KB gzip): ele competia banda com a imagem
 * do LCP. Como todo reveal está abaixo da dobra, adiar não é percebido.
 */
let ocioso: Promise<void> | null = null;
function aposCarregar(): Promise<void> {
  if (!ocioso) {
    ocioso = new Promise<void>((resolve) => {
      const seguir = () =>
        'requestIdleCallback' in window
          ? window.requestIdleCallback(() => resolve(), { timeout: 600 })
          : setTimeout(resolve, 120);
      if (document.readyState === 'complete') seguir();
      else window.addEventListener('load', seguir, { once: true });
    });
  }
  return ocioso;
}

type Opts = { atraso?: number };

/** Reveal padrão: fade + subida curta + blur saindo. Bloco, imagem, card solto. */
export async function revealOnScroll(selector: string, opts: Opts = {}) {
  const alvos = document.querySelectorAll<HTMLElement>(selector);
  if (!alvos.length) return;
  if (prefersReducedMotion()) return mostrar(alvos);

  await aposCarregar();
  const { animate, inView } = await import('motion');

  inView(
    selector,
    (el) => {
      animate(
        el,
        { opacity: [0, 1], y: [24, 0], filter: ['blur(10px)', 'blur(0px)'] },
        { duration: DUR.slow, delay: opts.atraso ?? 0, ease: EASE }
      ).finished.then(() => liberar(el as HTMLElement));
    },
    { amount: IN_VIEW_AMOUNT }
  );
}

/** Grid de cards / lista de itens: os FILHOS do container entram em cascata. */
export async function revealStagger(selector: string, opts: Opts = {}) {
  const containers = document.querySelectorAll<HTMLElement>(selector);
  if (!containers.length) return;
  if (prefersReducedMotion()) {
    for (const c of containers) mostrar(c.children);
    return;
  }

  await aposCarregar();
  const { animate, inView, stagger } = await import('motion');

  inView(
    selector,
    (el) => {
      const filhos = Array.from(el.children) as HTMLElement[];
      animate(
        filhos,
        { opacity: [0, 1], y: [28, 0], filter: ['blur(10px)', 'blur(0px)'] },
        {
          duration: DUR.slow - 0.1,
          delay: stagger(STAGGER, { startDelay: opts.atraso ?? 0 }),
          ease: EASE,
        }
      ).finished.then(() => filhos.forEach(liberar));
    },
    { amount: IN_VIEW_AMOUNT }
  );
}

/** Entrada lateral: item de acordeão, card que entra pela borda. */
export async function revealFromX(
  selector: string,
  opts: Opts & { de?: 'esquerda' | 'direita' } = {}
) {
  const alvos = document.querySelectorAll<HTMLElement>(selector);
  if (!alvos.length) return;
  if (prefersReducedMotion()) return mostrar(alvos);

  const x = opts.de === 'direita' ? 32 : -32;

  await aposCarregar();
  const { animate, inView } = await import('motion');

  inView(
    selector,
    (el) => {
      animate(
        el,
        { opacity: [0, 1], x: [x, 0], filter: ['blur(8px)', 'blur(0px)'] },
        { duration: 0.55, delay: opts.atraso ?? 0, ease: EASE }
      ).finished.then(() => liberar(el as HTMLElement));
    },
    { amount: IN_VIEW_AMOUNT }
  );
}

/**
 * Heading palavra a palavra. UM por seção, sempre no heading — em body copy
 * vira ruído. As palavras já vêm quebradas em <span data-palavra> do build
 * (ver RevealText.astro): quebrar no cliente causa reflow e piscada.
 */
export async function revealWords(selector: string, opts: Opts = {}) {
  const headings = document.querySelectorAll<HTMLElement>(selector);
  if (!headings.length) return;
  if (prefersReducedMotion()) {
    for (const h of headings) mostrar(h.querySelectorAll('[data-palavra]'));
    return;
  }

  await aposCarregar();
  const { animate, inView, stagger } = await import('motion');

  inView(
    selector,
    (el) => {
      const palavras = Array.from(
        el.querySelectorAll<HTMLElement>('[data-palavra]')
      );
      if (!palavras.length) return;
      animate(
        palavras,
        { opacity: [0, 1], y: [14, 0], filter: ['blur(8px)', 'blur(0px)'] },
        {
          duration: 0.55,
          delay: stagger(0.045, { startDelay: opts.atraso ?? 0 }),
          ease: EASE,
        }
      ).finished.then(() => palavras.forEach(liberar));
    },
    { amount: IN_VIEW_AMOUNT }
  );
}

/**
 * Divisor / sublinhado que se desenha.
 * ATENÇÃO: observa-se o PAI, não a linha. Um elemento em scaleX(0) tem caixa
 * de área zero e o IntersectionObserver nunca reporta interseção para ela.
 * Ver playbook/09-qa-erros-comuns.md#qa-003
 */
export async function drawLine(selector: string, opts: Opts = {}) {
  const linhas = document.querySelectorAll<HTMLElement>(selector);
  if (!linhas.length) return;
  if (prefersReducedMotion()) {
    for (const l of linhas) l.style.transform = 'none';
    return;
  }

  await aposCarregar();
  const { animate, inView } = await import('motion');

  for (const linha of linhas) {
    const pai = linha.parentElement;
    if (!pai) continue;
    inView(
      pai,
      () => {
        animate(
          linha,
          { transform: ['scaleX(0)', 'scaleX(1)'] },
          { duration: DUR.slow - 0.1, delay: opts.atraso ?? 0, ease: EASE }
        );
      },
      { amount: IN_VIEW_AMOUNT }
    );
  }
}

/** Parallax leve ligado ao scroll — foto grande de fundo. */
export async function parallax(selector: string, distancia = 40) {
  const alvos = document.querySelectorAll<HTMLElement>(selector);
  if (!alvos.length || prefersReducedMotion()) return;

  await aposCarregar();
  const { animate, scroll } = await import('motion');

  for (const el of alvos) {
    scroll(animate(el, { y: [-distancia, distancia] }, { ease: 'linear' }), {
      target: el,
      offset: ['start end', 'end start'],
    });
  }
}
