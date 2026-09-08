/**
 * Carrossel de página inteira: um card por vez, sempre assentado.
 *
 * O trilho é um contêiner de scroll nativo com `scroll-snap`. `paginar()` põe
 * um índice por cima disso — setas, bolinhas e arrasto passam a falar em
 * "card 3", não em "scrollLeft 1284" — e `arrastavelComMouse()` faz o mouse
 * arrastar (o toque já arrasta de graça; o mouse, não).
 */

/** Distância em px a partir da qual o gesto vira arrasto, e não clique. */
const LIMIAR = 5;

/** Fração da largura do card que já conta como intenção de virar a página. */
const FRACAO_VIRADA = 0.15;

/** Tempo máximo de uma rolagem suave, pra devolver o snap depois dela. */
const ASSENTAR_MS = 500;

export type Carrossel = {
  /** Índice do card mais próximo da posição atual. */
  indice(): number;
  /** Rola até o card `i` (clampado nas pontas), suave conforme o CSS. */
  irPara(i: number): void;
  /** Chama `cb` agora e a cada mudança de card. */
  aoMudar(cb: (indice: number, total: number) => void): void;
};

export function paginar(trilho: HTMLElement): Carrossel {
  const cards = () => Array.from(trilho.children) as HTMLElement[];

  /**
   * `scrollLeft` que encosta o card no início do snapport. Usa o retângulo
   * vivo em vez de `offsetLeft` (que depende do offsetParent) e desconta o
   * `scroll-padding-left`, senão o alvo erra por 24px no mobile.
   */
  function alvo(card: HTMLElement): number {
    const recuo = parseFloat(getComputedStyle(trilho).scrollPaddingLeft) || 0;
    const desloc = card.getBoundingClientRect().left - trilho.getBoundingClientRect().left;
    const bruto = trilho.scrollLeft + desloc - trilho.clientLeft - recuo;
    return Math.max(0, Math.min(bruto, trilho.scrollWidth - trilho.clientWidth));
  }

  function indice(): number {
    let melhor = 0;
    let menor = Infinity;
    cards().forEach((card, i) => {
      const distancia = Math.abs(alvo(card) - trilho.scrollLeft);
      if (distancia < menor) {
        menor = distancia;
        melhor = i;
      }
    });
    return melhor;
  }

  function irPara(i: number) {
    const lista = cards();
    const card = lista[Math.max(0, Math.min(i, lista.length - 1))];
    if (card) trilho.scrollTo({ left: alvo(card) });
  }

  const ouvintes: ((indice: number, total: number) => void)[] = [];
  let agendado = false;

  function avisar() {
    const i = indice();
    const total = cards().length;
    for (const cb of ouvintes) cb(i, total);
  }

  // Um aviso por frame: o evento de scroll dispara dezenas de vezes por gesto.
  trilho.addEventListener(
    'scroll',
    () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => {
        agendado = false;
        avisar();
      });
    },
    { passive: true }
  );
  window.addEventListener('resize', avisar);

  return {
    indice,
    irPara,
    aoMudar(cb) {
      ouvintes.push(cb);
      cb(indice(), cards().length);
    },
  };
}

/** Intervalo padrão do autoplay: tempo de ler um depoimento sem correr. */
const AUTOPLAY_MS = 8000;

/**
 * Avança sozinho, dando a volta no fim.
 *
 * Pausa em tudo que indica que alguém está lendo ou mexendo: ponteiro em cima,
 * foco por teclado dentro do trilho, aba em segundo plano e carrossel fora da
 * tela. Com `prefers-reduced-motion` não roda — movimento que a pessoa não
 * pediu é justamente o que essa preferência desliga.
 */
export function autoplay(
  trilho: HTMLElement,
  carrossel: Carrossel,
  intervalo = AUTOPLAY_MS
) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let relogio: ReturnType<typeof setInterval> | null = null;
  const travas = new Set<string>();

  function tocar() {
    if (relogio || travas.size) return;
    relogio = setInterval(() => {
      const total = trilho.children.length;
      carrossel.irPara((carrossel.indice() + 1) % total);
    }, intervalo);
  }

  function pausar(motivo: string) {
    travas.add(motivo);
    if (relogio) {
      clearInterval(relogio);
      relogio = null;
    }
  }

  function retomar(motivo: string) {
    travas.delete(motivo);
    tocar();
  }

  /** Reinicia a contagem: depois de uma troca manual o tempo começa de novo. */
  function adiar() {
    if (!relogio) return;
    clearInterval(relogio);
    relogio = null;
    tocar();
  }

  trilho.addEventListener('pointerenter', () => pausar('ponteiro'));
  trilho.addEventListener('pointerleave', () => retomar('ponteiro'));
  trilho.addEventListener('focusin', () => pausar('foco'));
  trilho.addEventListener('focusout', () => retomar('foco'));

  document.addEventListener('visibilitychange', () =>
    document.hidden ? pausar('aba') : retomar('aba')
  );

  // Fora da tela não adianta girar: quando a pessoa chegar já teria passado.
  new IntersectionObserver(
    ([entrada]) => (entrada.isIntersecting ? retomar('fora') : pausar('fora')),
    { threshold: 0.3 }
  ).observe(trilho);

  pausar('fora');
  return { adiar, pausar, retomar };
}

/**
 * Arrastar com o mouse. Só intercepta ponteiro do tipo `mouse` — toque e
 * caneta seguem no comportamento nativo, que é melhor que qualquer emulação.
 *
 * Com o `carrossel`, soltar não deixa o trilho onde a mão parou: ele vai pro
 * card seguinte se o arrasto passou de FRACAO_VIRADA, ou volta pro card de
 * origem se não passou. É a diferença entre "arrastar até achar" e virar página.
 */
export function arrastavelComMouse(trilho: HTMLElement, carrossel?: Carrossel) {
  let ativo = false;
  let arrastou = false;
  let xInicial = 0;
  let dx = 0;
  let scrollInicial = 0;
  let indiceInicial = 0;
  let snapOriginal = '';

  trilho.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    ativo = true;
    arrastou = false;
    dx = 0;
    xInicial = e.clientX;
    scrollInicial = trilho.scrollLeft;
    indiceInicial = carrossel?.indice() ?? 0;

    // O snap briga com o arrasto: ele puxa de volta a cada frame. E o
    // `scroll-smooth` do CSS vale também pra `scrollLeft =`, o que fazia cada
    // frame do arrasto virar uma animação — a mão ia na frente do trilho.
    snapOriginal = trilho.style.scrollSnapType;
    trilho.style.scrollSnapType = 'none';
    trilho.style.scrollBehavior = 'auto';
    trilho.classList.add('arrastando');
  });

  trilho.addEventListener('pointermove', (e) => {
    if (!ativo) return;
    dx = e.clientX - xInicial;
    if (!arrastou && Math.abs(dx) < LIMIAR) return;
    if (!arrastou) {
      arrastou = true;
      trilho.setPointerCapture(e.pointerId);
    }
    trilho.scrollLeft = scrollInicial - dx;
  });

  const soltar = () => {
    if (!ativo) return;
    ativo = false;
    trilho.classList.remove('arrastando');
    trilho.style.scrollBehavior = '';

    if (!carrossel) {
      trilho.style.scrollSnapType = snapOriginal;
      return;
    }

    const largura = (trilho.firstElementChild as HTMLElement | null)?.clientWidth ?? trilho.clientWidth;
    const virou = Math.abs(dx) > largura * FRACAO_VIRADA;
    carrossel.irPara(indiceInicial + (virou ? (dx < 0 ? 1 : -1) : 0));

    // O snap só volta depois que a rolagem suave assenta: devolver agora faria
    // o trilho pular pro card mais próximo antes da animação sair do lugar.
    const restaurar = () => {
      trilho.style.scrollSnapType = snapOriginal;
    };
    trilho.addEventListener('scrollend', restaurar, { once: true });
    setTimeout(restaurar, ASSENTAR_MS);
  };

  trilho.addEventListener('pointerup', soltar);
  trilho.addEventListener('pointercancel', soltar);
  trilho.addEventListener('lostpointercapture', soltar);

  // Um arrasto que termina em cima de um link não pode virar navegação.
  trilho.addEventListener(
    'click',
    (e) => {
      if (!arrastou) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  // Sem isso o browser tenta arrastar a imagem do card em vez do trilho.
  trilho.addEventListener('dragstart', (e) => e.preventDefault());
}
