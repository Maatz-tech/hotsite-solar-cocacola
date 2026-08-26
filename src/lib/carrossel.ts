/**
 * Arrastar carrossel com o mouse.
 *
 * O trilho é um contêiner de scroll nativo: no toque o swipe já funciona de
 * graça, mas o mouse não arrasta scroll nenhum. Isso deixava o desktop
 * dependendo só das setas.
 *
 * Só intercepta ponteiro do tipo `mouse` — toque e caneta continuam no
 * comportamento nativo, que é melhor que qualquer emulação.
 */

/** Distância em px a partir da qual o gesto vira arrasto, e não clique. */
const LIMIAR = 5;

export function arrastavelComMouse(trilho: HTMLElement) {
  let ativo = false;
  let arrastou = false;
  let xInicial = 0;
  let scrollInicial = 0;
  let snapOriginal = '';

  trilho.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    ativo = true;
    arrastou = false;
    xInicial = e.clientX;
    scrollInicial = trilho.scrollLeft;

    // O snap briga com o arrasto: ele puxa de volta a cada frame.
    snapOriginal = trilho.style.scrollSnapType;
    trilho.style.scrollSnapType = 'none';
    trilho.classList.add('arrastando');
  });

  trilho.addEventListener('pointermove', (e) => {
    if (!ativo) return;
    const dx = e.clientX - xInicial;
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
    // Devolver o snap agora faz o trilho assentar sozinho no card mais próximo.
    trilho.style.scrollSnapType = snapOriginal;
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
