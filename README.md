# Pizzaria: site modelo

Site modelo de pizzaria para apresentar a clientes. A marca, o cardápio, os preços, o endereço e os contatos são fictícios, e uma faixa no topo avisa que é um site de demonstração.

Feito com Astro, GSAP e Lenis. Todas as páginas são HTML estático com texto de verdade, rápidas e boas para o Google.

## Páginas

| Página | Endereço |
| --- | --- |
| Início | `/` |
| Cardápio (pizzas salgadas e doces, bebidas, filtro vegetariano/vegano, bordas, pedido pelo WhatsApp) | `/cardapio/` |
| Festas e eventos (tipos de evento, como funciona, fotos, dúvidas, orçamento) | `/eventos/` |
| Nossa história | `/nossa-historia/` |
| Rodízio de sexta (horário, endereço, como chegar, mapa) | `/rodizio/` |
| Contato e orçamento (formulário, WhatsApp, telefone, e-mail) | `/contato/` |
| Privacidade e cookies (LGPD) | `/privacidade/` |

Também tem `sitemap.xml`, `robots.txt` e página 404.

## Adaptar para um cliente

Tudo fica em **`src/data/site.ts`**: nome, frase, contatos, WhatsApp, cardápio, preços, eventos, dúvidas, horário do rodízio e fotos.
Os valores marcados com `// EXEMPLO` são fictícios e precisam ser trocados.

- **Nome da marca:** `name` (aparece no topo, no título gigante e no rodapé).
- **Horário:** `hours`, de domingo a sábado (`null` = fechado). O site destaca o dia de hoje e mostra "Aberto agora" ou quando abre, no rodapé e na página de contato.
- **Pedidos:** no cardápio o cliente adiciona os itens, revisa o pedido, preenche os dados (nome, telefone, entrega ou retirada, endereço, pagamento, troco, observações) e envia tudo numa mensagem pronta para o WhatsApp de `contact.whatsapp`. Os botões "Peça agora" também vão para esse número.
- **Fotos próprias:** em vez do `id` do Unsplash, use `src` (ex.: `/img/cardapio/brigadeiro`) com um WebP por largura em `public/` (`-240`, `-360`, `-540`, `-720.webp`).
- **Fotos:** cada foto tem `id` (Unsplash) e `alt`. Para fotos do cliente, adapte `src/lib/img.ts`.
- **Vídeo do topo:** arquivos em `public/video` (MP4 1280 px e 854 px, WebM e as imagens de capa). Mantenha cerca de 1,7 MB no computador e 0,7 MB no celular.
- **Formulário de orçamento:** com `quoteForm.endpoint` vazio funciona em modo demonstração (valida, bloqueia spam e mostra a confirmação, sem enviar). Com um endpoint estilo Formspree, envia de verdade.
- **`mockupNotice: true`** mostra a faixa "Site modelo" e tira o site do Google. No site real, mude para `false`.

Depois de trocar o nome ou a frase, gere de novo a imagem de compartilhamento e o favicon: `npm run og`.

## Animações

- **Topo:** vídeo da pizza girando com vapor, em loop sem emenda visível; botão de pausar; aproxima um pouco ao rolar.
- **Cardápio na home:** baralho de cartões que se abre em leque com a rolagem (computador) ou se passa arrastando (celular).
- **Gire a pizza (home):** meia pizza inteira na base da tela; a cada trecho de rolagem ela gira e dá lugar ao próximo sabor, com os nomes num arco e o nome, preço, descrição e ingredientes trocando junto. Setas e nomes também trocam o sabor. Fotos em `public/img/sabores`.
- Títulos que sobem palavra por palavra, fotos que se revelam, cartões do cardápio que entram com a rolagem e pizza girando no topo das páginas internas.
- Quem desativa animações no aparelho vê tudo parado, e os botões continuam funcionando.

## Comandos

```
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
npm run preview  # serve dist/
npm run og       # imagem de compartilhamento e favicon
```
