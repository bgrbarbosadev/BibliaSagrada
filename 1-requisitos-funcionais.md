# Documento de Especificação de Requisitos Funcionais

## 1. Navegação e Seleção de Conteúdo

### RF01 – Seleção de Livro, Capítulo e Versículo
O sistema deve permitir ao usuário selecionar qualquer livro da Bíblia, escolher um capítulo específico e, opcionalmente, determinar a partir de qual versículo deseja iniciar a leitura.

### RF02 – Navegação Sequencial
O leitor deve conseguir avançar para o próximo capítulo ou voltar para o capítulo anterior por meio de comandos simples (como botões "Avançar" e "Voltar") sem precisar reabrir o menu de seleção de livros.

### RF03 – Foco Visual do Versículo Selecionado
Caso o usuário utilize a seleção inicial de um versículo específico (conforme RF01), o sistema deve direcionar a tela (via rolagem automática e/ou destaque visual) diretamente para o versículo escolhido.

## 2. Gerenciamento e Restrição de Idiomas/Versões

### RF04 – Alternância de Versão
O sistema deve permitir que o usuário altere a versão/tradução do texto atual a qualquer momento durante a leitura.

### RF05 – Restrição de Idiomas por Testamento
O sistema deve limitar a disponibilidade das línguas originais com base no livro selecionado:

- As opções **Hebraico** e **Aramaico** só devem ficar disponíveis para seleção se o livro atual pertencer ao **Antigo Testamento**.
- A opção **Grego** só deve ficar disponível para seleção se o livro atual pertencer ao **Novo Testamento**.

### RF06 – Redirecionamento de Versão Incompatível
Caso o usuário esteja lendo um livro do Antigo Testamento em uma versão exclusiva (ex: Hebraico) e navegue para um livro do Novo Testamento, o sistema deve automaticamente alterar a versão ativa para uma tradução padrão pré-definida em português (ex: NVI ou ARA) para evitar telas em branco ou erros.

## 3. Experiência de Leitura e Customização Visual

### RF07 – Adaptação de Sentido de Leitura (RTL/LTR)
O sistema deve adaptar a direção da exibição do texto na tela conforme a convenção gramatical do idioma selecionado:

- **Da esquerda para a direita (LTR)** para português (ARC, ARA, NAA, NVI, NVT, NTLH, Católica), inglês (KJV), espanhol (RVR) e grego.
- **Da direita para a esquerda (RTL)** para hebraico e aramaico.

### RF08 – Identificação de Versículos
Cada versículo deve ser exibido com seu respectivo número indicador de forma clara e legível, respeitando a ordem de leitura do idioma.

### RF09 – Alternância de Temas (Claro/Escuro)
O sistema deve permitir ao usuário alternar a interface entre um Tema Claro (fundo claro com textos escuros) e um Tema Escuro/Dark (fundo escuro com textos claros), aplicando a mudança instantaneamente a todas as telas do aplicativo.

## 4. Recursos Avançados de Estudo

### RF10 – Modo de Comparação de Versões
O sistema deve permitir ao usuário ativar uma visualização paralela (lado a lado ou em linhas alternadas) para comparar o mesmo capítulo ou versículo em duas ou mais versões/idiomas diferentes simultaneamente.

### RF11 – Validação de Paralelismo
No modo de comparação, o sistema deve garantir que apenas versões compatíveis com o testamento do livro atual (conforme as regras dos RF05 e RF06) sejam exibidas para seleção nas colunas secundárias.

---

> Com este modelo final homologado, o escopo do projeto está perfeitamente blindado e pronto para a fase de arquitetura técnica e desenvolvimento.
