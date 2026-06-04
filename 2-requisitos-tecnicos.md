# Requisitos Técnicos

## 1. Arquitetura de Dados e Armazenamento (JSON)

### RT01 – Indexação por Chaves (Dicionário/Hash)
Os arquivos JSON não devem utilizar estruturas de arrays simples para os versículos. Devem ser estruturados como objetos indexados por strings (ex: `books["JHN"]["chapters"]["1"]["1"]`) para garantir busca com complexidade de tempo constante **O(1)**, evitando travamentos e loops na renderização.

### RT02 – Imutabilidade e Padronização de Schema
Todos os arquivos JSON das diferentes versões (ARC, ARA, KJV, HEB, etc.) devem partilhar rigorosamente do mesmo contrato de dados (mesmos IDs de livros e tipos de dados), permitindo que um único componente React consuma qualquer idioma de forma polimórfica.

### RT03 – Codificação Universal (UTF-8)
Todos os arquivos de dados devem ser codificados estritamente em UTF-8 para garantir o suporte nativo e correto aos caracteres dos alfabetos Grego (Koiné), Hebraico e Aramaico Cirílico/Siríaco.

## 2. Performance e Carregamento (React)

### RT04 – Divisão de Código e Carregamento Dinâmico (Lazy Loading)
O aplicativo não deve realizar o bundle (empacotamento) dos textos bíblicos junto com o código JavaScript principal da interface. As versões devem ser carregadas de forma assíncrona (via requisições HTTP `fetch` sob demanda ou `import()` dinâmico) apenas quando a versão ou livro forem acionados pelo usuário.

### RT05 – Memoização de Componentes de Texto
Devido ao grande volume de nós de texto gerados por capítulo, os componentes de exibição de versículos devem utilizar estratégias de otimização (como `React.memo` ou virtualização de listas, se necessário) para evitar re-renderizações inúteis ao alternar temas ou interagir com o menu.

## 3. Layout, Estilização e Acessibilidade Visual

### RT06 – Suporte Nativo a Layout Bidirecional (RTL/LTR)
O motor de estilização do aplicativo deve gerenciar dinamicamente a propriedade lógica de direção de texto global (`dir="rtl"` ou `dir="ltr"`) e propriedades CSS lógicas (como `padding-inline-start` em vez de `padding-left`) para garantir o alinhamento correto dos idiomas sem quebrar o layout da interface.

### RT07 – Gerenciamento de Estado do Tema (Design System)
A alternância entre temas claro e escuro deve ser controlada centralizadamente (via React Context API, variáveis CSS nativas ou bibliotecas de CSS-in-JS), garantindo a inversão de contraste imediata sem causar FOUC (Flash of Unstyled Content / piscadas em branco na tela).

### RT08 – Responsividade
A interface deve ser projetada seguindo os princípios de Mobile-First ou Fluid Layout, garantindo legibilidade tanto em telas de dispositivos móveis (leitura vertical em uma coluna) quanto em desktops (leitura comparativa em múltiplas colunas).

## 4. Gerenciamento de Estado Global e Roteamento

### RT09 – Sincronização do Estado de Leitura via URL
A localização atual do leitor (Versão, Livro, Capítulo e Versículo) deve ser persistida e gerenciada de preferência na URL (ex: `/read/NVI/JHN/1?verse=1`), permitindo que o usuário recarregue a página, salve a posição nos favoritos ou compartilhe o link direto com outra pessoa.

### RT10 – Validação de Estado Invariante
A lógica de negócio deve conter uma camada de segurança (módulo validador) que impeça o estado do aplicativo de atingir combinações inválidas (ex: tentar carregar `version: "HEB"` estando no livro de Mateus), forçando o recuo para a tradução padrão definida no escopo funcional.
