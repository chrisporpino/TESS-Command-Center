<p align="center">

# TESS Command Center

**Uma interface de observabilidade para entender o que múltiplos agentes de IA estão fazendo em tempo real.**

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38BDF8)

</p>

<p align="center">
  <img src="./demo.gif" width="900">
</p>

## Contexto do Projeto

**TESS Command Center** é uma interface em React projetada para visualizar e interagir com múltiplos agentes de IA executando tarefas simultaneamente.

A aplicação não possui backend real — todos os dados e execuções são **simulados localmente**, permitindo demonstrar comportamento de agentes em tempo real.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

Ferramentas de IA utilizadas durante o desenvolvimento:

- **Claude Code** → geração e modificação de código
- **ChatGPT** → revisão de UX, micro-interações e decisões de produto

## Objetivo do Design

Explorar como interfaces podem tornar **sistemas de IA multi-agente observáveis e compreensíveis para humanos**.

O foco é permitir que usuários:

- entendam rapidamente o que múltiplos agentes estão fazendo
- acompanhem execução em tempo real
- interajam diretamente com agentes individuais

Com ênfase em **observabilidade**, **clareza visual** e **micro-interações elegantes**.

## Arquitetura da Interface

A interface segue um modelo de **atenção progressiva em três zonas**:

- **Feed de Agentes (esquerda)** — lista de agentes com nome, modelo, status, progresso e tempo de execução
- **Terminal de Execução (centro)** — log em tempo real mostrando o que o agente está fazendo
- **Painel de Detalhe (direita)** — histórico de prompts e envio de novas instruções para o agente selecionado

## Estados dos Agentes

| Status | Descrição |
|---|---|
| `idle` | aguardando instrução |
| `thinking` | analisando o prompt |
| `executing` | executando a tarefa |
| `done` | tarefa finalizada |
| `error` | erro durante execução |

Fluxo típico: `idle → thinking → executing → done → idle`

## Simulação de Agentes

O sistema inclui uma simulação que:

- gera logs em tempo real
- atualiza progresso
- alterna estados automaticamente
- simula múltiplos agentes trabalhando simultaneamente

Isso permite demonstrar a interface funcionando **sem necessidade de backend**.

## Decisões de UX

### Observability through motion

Os estados dos agentes são comunicados através de **animação de borda sincronizada**:

- `idle` → sem animação
- `thinking` → animação lenta
- `executing` → animação rápida

Todas as animações são **globalmente sincronizadas**, permitindo perceber o estado geral do sistema pela visão periférica.

### Seleção automática de agente

Ao abrir a interface, um agente é selecionado automaticamente para evitar tela vazia.

Prioridade de seleção:

1. agente `executing`
2. agente `thinking`
3. primeiro da lista

Isso garante que:

- o terminal já mostre atividade
- o painel de detalhes esteja preenchido
- a interface pareça viva desde o início

### Timer de execução

Agentes em `executing` exibem tempo decorrido.

- o timer é inicializado a partir de `startedAt`
- não depende de transição de estado para começar

### Regras de progresso

| Status | Progresso |
|---|---|
| `idle` | 0% |
| `thinking` | 0–20% |
| `executing` | 1–99% |
| `done` | 100% |
| `error` | congelado |

## Micro-interações

- **Animação de borda sincronizada** — indica estado dos agentes
- **Highlight ao carregar** — destaca o agente selecionado automaticamente
- **Feedback ao enviar prompt** — pulso visual no card
- **Glow no terminal** — ao iniciar execução
- **Animação de conclusão** — destaque verde com ícone de check ao completar tarefa

## Problemas resolvidos

| Problema | Solução |
|---|---|
| Tela inicial vazia | Seleção automática de agente |
| Timer não aparecia | `startedAt` adicionado nos agentes já em `executing` |
| Idle mostrando 100% | Regras de progresso aplicadas nas transições de estado |

## Considerações finais

Este projeto explora como **interfaces de observabilidade podem tornar sistemas de IA multi-agente mais compreensíveis e operáveis por humanos**.

Mesmo com dados simulados, o objetivo foi construir uma experiência que se aproxime de ferramentas reais usadas para monitorar e operar sistemas de agentes em tempo real.