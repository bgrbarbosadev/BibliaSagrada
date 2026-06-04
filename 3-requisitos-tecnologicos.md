# Requisitos Tecnológicos

## 1. Core & Build System (A Base do App)

**Framework:** Vite (com React)

> **Por quê?** O Vite é o padrão da indústria para aplicações React SPA (Single Page Application). Ele oferece um tempo de build instantâneo e suporte nativo impecável para o carregamento dinâmico de arquivos JSON (Dynamic Imports), que usaremos para o Lazy Loading das versões da Bíblia.

**Linguagem:** TypeScript

> **Por quê?** Como lidamos com um contrato de dados rígido para os JSONs e dezenas de siglas de livros (GEN, JHN) e versões (ARA, HEB), o TypeScript vai garantir que nenhum programador tente acessar um capítulo ou propriedade inexistente, pegando os erros em tempo de desenvolvimento.

## 2. Gerenciamento de Estado & Roteamento (Lógica e Navegação)

**Roteador:** React Router (v6+)

> **Por quê?** Essencial para cumprir o requisito de atualizar a URL conforme a leitura (ex: `/ler/NVI/GEN/1`). Ele permite capturar os parâmetros da URL de forma limpa e gerenciar o histórico de navegação (voltar/avançar).

**Gerenciamento de Estado Global:** Zustand ou React Context API

> **Por quê?** Para estados simples como o "Tema Atual" (Claro/Escuro) e "Versões Ativas no Modo Comparação", o Zustand é uma biblioteca extremamente leve, que evita re-renderizações desnecessárias na árvore de componentes se comparada ao Redux, mantendo o app rápido mesmo com milhares de palavras na tela.

## 3. Estilização & Design System (Temas e RTL/LTR)

**CSS Framework:** Tailwind CSS (v4+) ou Styled Components

> **Recomendação:** Tailwind CSS. Ele possui suporte nativo excelente para o Modo Escuro (basta usar o prefixo `dark:`) e para layout bidirecional através de classes de propriedades lógicas (como `ms-4` para margin-start e `pe-2` para padding-end), que se adaptam sozinhas se a tela mudar para o Hebraico/Aramaico (`dir="rtl"`).

## 4. Otimização de Performance para Textos Longos

**Renderização de Listas:** React-Window ou React-Virtual

> **Por quê?** Se o usuário abrir um capítulo muito longo (como o Salmo 119, que tem 176 versículos) e ativar o modo de comparação com 3 versões lado a lado, o navegador terá que renderizar mais de 500 blocos de texto complexos. Uma biblioteca de Virtualização renderiza na tela apenas os versículos que estão visíveis na Janela (Viewport) do usuário, mantendo o uso de memória do celular ou computador próximo de zero.

## 5. Estratégia de Hospedagem e Distribuição

**Hospedagem:** Vercel, Netlify ou GitHub Pages

> **Por quê?** Como o app será compilado como um pacote de arquivos estáticos (HTML, JS, CSS e os JSONs na pasta `public`), ele pode ser hospedado gratuitamente em plataformas de CDN de alta performance. Isso significa que a Bíblia vai carregar na velocidade da luz em qualquer lugar do mundo.
