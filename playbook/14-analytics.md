# 14 — Analytics (GTM)

A medição dos sites entra por **Google Tag Manager**, nunca por tag solta no
código. O contêiner é da Eureca e é **um só para todos os projetos**:

| | |
|---|---|
| Contêiner | **`GTM-TLVV5RQ`** — GTM da Eureca |
| Vale para | todos os sites da casa, salvo se o cliente exigir o contêiner dele |
| Quem mexe nas tags | a Eureca, dentro do painel do GTM — **não no código** |

A consequência prática: uma vez colado o par de snippets abaixo, **o site não
precisa de mais nenhum deploy para ganhar ou trocar uma tag**. GA4, pixel de
mídia, mapa de calor — tudo passa a ser configuração no painel. Se alguém pedir
"adiciona o GA4 no site", a resposta quase sempre é: já está, entra pelo GTM.

---

## Onde entra

São **dois** trechos, e os dois são obrigatórios. Pular o segundo é o erro
clássico — a página funciona, ninguém percebe, e a medição de quem está sem JS
simplesmente não existe.

### 1. O mais alto possível no `<head>`

```astro
<!-- Google Tag Manager -->
<script is:inline>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TLVV5RQ');</script>
<!-- End Google Tag Manager -->
```

### 2. Imediatamente depois do `<body>`

```astro
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TLVV5RQ"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

Os dois moram no `src/layouts/Base.astro`, que é o único lugar por onde toda
página passa. Nunca em `index.astro`, nunca numa seção.

---

## `is:inline` não é opcional

O snippet que o Google entrega vem com `<script>` puro. **No Astro, isso não
funciona como está**: sem `is:inline`, o Astro trata o bloco como módulo,
processa, renomeia e move para um bundle — o GTM deixa de carregar no `<head>`
e o "o mais alto possível" vira mentira.

A única diferença entre o que o Google manda e o que se cola no `Base.astro` é
esse atributo. É a mesma razão pela qual a marcação `.js` do `<html>` usa
`is:inline` logo acima — ver [05-animacao](05-animacao.md).

O `<noscript>` não precisa de nada: é HTML, não script.

---

## O que isso custa em performance

GTM é terceiro no caminho e **vai** cobrar seu preço no Lighthouse. O que é
normal e o que é defeito:

- O script é `async` e não bloqueia o render. **LCP e CLS não devem mudar.**
  Se mudaram, o problema não é o GTM — é outra coisa que entrou junto.
- **TBT sobe**, porque o contêiner executa no main thread. Alguns
  milissegundos é o esperado.
- A queda maior quase nunca é do contêiner vazio: é das **tags que a Eureca
  liga dentro dele**. Um pixel de mídia pesado derruba a nota sem que uma linha
  do repositório mude.

Por isso: **medir a performance antes de colar o GTM** e registrar o número no
`PROJECT.md`. É o único jeito de saber depois se a queda veio do site ou do
painel. Ver [08-entrega](08-entrega.md).

---

## Conferir se está no ar

Não confie no build. No site publicado:

```bash
# os dois trechos presentes
curl -s https://<dominio>/ | grep -c 'GTM-TLVV5RQ'   # espera 2

# e o script saiu inline no <head>, não bundleado
curl -s https://<dominio>/ | grep -o 'gtm.js?id=' 
```

Se o `grep -c` devolver `1`, faltou o `<noscript>`. Se devolver `0` num build
local, o mais provável é o `is:inline` esquecido.

Na hora de validar de verdade, o **Preview do próprio GTM** é o que vale — ele
diz se o contêiner disparou, e é a Eureca quem opera.

---

## Antes de mandar pro cliente

- [ ] Os **dois** snippets no `Base.astro`, com `is:inline` no primeiro
- [ ] ID confere: `GTM-TLVV5RQ`
- [ ] Lighthouse rodado **antes** de colar, número registrado no `PROJECT.md`
- [ ] Se o cliente tem contêiner próprio, o ID trocado nos **dois** lugares
