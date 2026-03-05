# TESS Command Center

Uma interface em tempo real para observar e interagir com múltiplos agentes de IA executando tarefas simultaneamente.

Este projeto explora como usuários podem **monitorar, compreender e orientar agentes autônomos** trabalhando em paralelo. Em vez de focar apenas na execução de prompts, a interface prioriza **visibilidade operacional** — tornar legível para humanos o que os agentes estão fazendo.

A ideia é simular como poderia ser um **painel de operações para sistemas multi-agentes em produção**.

---

# Como rodar o projeto

```bash
npm install
npm run dev
```

Abra no navegador:

```
http://localhost:5173
```

Não existe backend.
Todos os dados e execuções são simulados localmente.

---

# Ferramentas utilizadas

Este projeto foi desenvolvido utilizando **IA como parte do processo de desenvolvimento**.

Principais ferramentas:

**Claude Code**
Utilizado para estruturação da arquitetura do projeto, lógica de simulação dos agentes e gerenciamento de estado.

**ChatGPT**
Utilizado como parceiro de design para refinamento de decisões de UX e definição de micro-interações.

**Vite + React + TypeScript**
Ambiente de desenvolvimento rápido com arquitetura de componentes clara.

**Tailwind CSS**
Sistema de estilos baseado em tokens, permitindo uma interface consistente em dark mode com acentos visuais por modelo.

**Framer Motion**
Responsável pelas animações e micro-interações da interface.

---

# Decisões de UX

## 1. Modelo de atenção progressiva

A interface segue uma estrutura de três zonas:

* **Feed de agentes (esquerda)** — visão geral da atividade do sistema
* **Terminal de execução (centro)** — foco operacional no que está acontecendo agora
* **Detalhe do agente (direita)** — investigação contextual do agente selecionado

Esse modelo reduz carga cognitiva quando múltiplos agentes estão executando ao mesmo tempo.

O usuário consegue manter consciência do sistema inteiro sem perder o foco no agente atual.

---

## 2. Separação visual entre interface e dados

Foram utilizados dois sistemas tipográficos distintos:

**Inter** — interface e navegação
**JetBrains Mono** — dados operacionais (logs, timers, saída do sistema)

Essa separação ajuda o usuário a diferenciar rapidamente **estrutura da interface** de **atividade do sistema**.

---

## 3. Cor representa identidade, não status

Cada modelo possui uma cor própria:

* GPT → roxo
* Claude → laranja
* Gemini → verde

Essas cores representam **identidade do modelo**, não estado de execução.

Os indicadores de status (thinking / executing / done) usam sinais visuais próprios para evitar ambiguidade.

---

## 4. Fazer os agentes parecerem vivos

Em vez de mudanças de estado estáticas, a interface simula **atividade contínua dos agentes**, incluindo:

* streaming de logs
* progresso de execução
* snapshots de raciocínio
* timers de execução

Esses sinais ajudam o usuário a entender **o que o agente está fazendo neste momento**, e não apenas que ele está rodando.

---

# Micro-interações

Algumas interações sutis foram adicionadas para tornar a interface mais responsiva:

* micro-pulse no botão de envio de prompt
* reação visual do AgentCard ao receber um comando
* glow temporário no terminal quando uma execução inicia
* transição animada entre estados (thinking → executing)

Essas animações foram mantidas discretas para preservar a estética de **ferramenta profissional de operações**.

---

# O que eu faria com mais tempo

### 1. Visualização de trace do agente

Adicionar uma visão detalhada da execução do agente (semelhante a ferramentas como LangSmith), mostrando:

* chamadas de ferramentas
* cadeia de raciocínio
* etapas estruturadas de execução

---

### 2. Métricas operacionais

Expor métricas importantes do sistema:

* uso de tokens
* latência
* número de tool calls

Isso transformaria a interface de um monitor visual para uma ferramenta de **observabilidade de agentes**.

---

### 3. Orquestração de agentes

Adicionar capacidades de controle mais avançadas:

* pausar / retomar agentes
* filas de tarefas
* visualização de dependências entre agentes

Isso permitiria evoluir o sistema de **monitoramento** para **orquestração multi-agente**.

---

# Consideração final

À medida que sistemas de IA se tornam mais autônomos, o desafio deixa de ser apenas executar prompts e passa a ser **tornar esses sistemas compreensíveis para humanos**.

O TESS Command Center é um pequeno experimento nessa direção:
uma interface pensada para revelar **o que os agentes estão fazendo e por quê**.
