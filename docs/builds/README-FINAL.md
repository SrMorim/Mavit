# Mavit - Aplicativo de Quadro Kanban

<div align="center">

![Mavit Logo](assets/icon-128.png)

**Aplicativo de quadro Kanban customizável para gerenciamento de tarefas e projetos**

[![Versão](https://img.shields.io/badge/versão-1.0.0-blue.svg)](https://github.com/maver/mavit)
[![Plataforma](https://img.shields.io/badge/plataforma-Windows%20%7C%20Linux-lightgrey.svg)](#)
[![Licença](https://img.shields.io/badge/licença-MIT-green.svg)](#)

</div>

---

## 🚀 Apresentação

**Mavit** é um aplicativo desktop moderno e intuitivo para gerenciamento de projetos usando metodologia Kanban. Desenvolvido com tecnologias de ponta, oferece uma experiência fluida e personalizável para organizar suas tarefas, projetos e fluxos de trabalho.

### ✨ Por que escolher o Mavit?

- **🎨 Interface Moderna**: Design dark elegante com tema Maver (#dc143c)
- **⚡ Performance**: Aplicativo desktop nativo com tecnologia Electron
- **🔒 Privacidade**: Dados salvos localmente, sem nuvem
- **🎯 Simplicidade**: Interface intuitiva e fácil de usar
- **🔄 Funcionalidade**: Drag & drop, prioridades, datas de vencimento

---

## 📦 Instalação

### Windows (Recomendado)

**📁 Arquivo:** `Mavit-1.0.0-Windows-FINAL.zip` (106.7 MB)

#### Passos de Instalação:

1. **📥 Download**: Baixe o arquivo ZIP do instalador
2. **📂 Extrair**: Descompacte em qualquer pasta do seu computador
3. **▶️ Executar**: Clique duplo em `Install.bat`
4. **✅ Pronto**: Atalho criado na área de trabalho!

> **⚠️ Importante**: Execute como **usuário normal** (não como administrador)

#### Tela de Instalação:
```
[ESPAÇO PARA PRINT: Tela do instalador Windows mostrando o progresso]
```

#### Resultado da Instalação:
```
[ESPAÇO PARA PRINT: Atalho criado na área de trabalho do Windows]
```

---

### Linux

#### Ubuntu/Debian (.deb)
```bash
sudo dpkg -i mavit_1.0.0_amd64.deb
```

#### Universal (AppImage)
```bash
chmod +x Mavit-1.0.0.AppImage
./Mavit-1.0.0.AppImage
```

---

## 🎯 Funcionalidades

### 📋 Gerenciamento de Quadros

#### Criação de Quadros
- **Títulos personalizados** para cada projeto
- **Emojis** para identificação visual rápida
- **Descrições** detalhadas para contexto
- **Cores personalizáveis** para organização

```
[ESPAÇO PARA PRINT: Tela de criação de novo quadro com campos preenchidos]
```

#### Quadro de Exemplo
```
[ESPAÇO PARA PRINT: Visão geral de um quadro completo com várias colunas]
```

---

### 📊 Colunas Customizáveis

#### Estrutura Flexível
- **Colunas ilimitadas** para seu fluxo de trabalho
- **Títulos editáveis** (ex: "A Fazer", "Em Progresso", "Concluído")
- **Cores de destaque** para diferenciação visual
- **Descrições** para regras e critérios

#### Exemplo de Colunas:
```
[ESPAÇO PARA PRINT: Quadro mostrando diferentes colunas com cores distintas]
```

---

### 🎯 Sistema de Cards

#### Cards Inteligentes
- **Títulos** descritivos para tarefas
- **Descrições** detalhadas com contexto
- **Sistema de prioridades** (Baixa, Média, Alta)
- **Datas de vencimento** com alertas visuais
- **Cores automáticas** baseadas na prioridade

#### Prioridades Visuais:
- 🟢 **Baixa**: Verde suave
- 🟡 **Média**: Amarelo/laranja
- 🔴 **Alta**: Vermelho com destaque pulsante

```
[ESPAÇO PARA PRINT: Cards com diferentes prioridades e suas cores]
```

#### Cards com Datas de Vencimento:
```
[ESPAÇO PARA PRINT: Cards mostrando datas de vencimento e alertas de atraso]
```

---

### 🖱️ Drag & Drop Intuitivo

#### Movimentação Fluida
- **Arrastar cards** entre colunas
- **Reordenar** dentro da mesma coluna
- **Feedback visual** durante a movimentação
- **Animações suaves** com Framer Motion

#### Demonstração de Uso:
```
[ESPAÇO PARA PRINT: Sequência mostrando card sendo arrastado entre colunas]
```

---

### 💾 Gerenciamento de Dados

#### Salvamento Automático
- **Persistência local** usando Zustand
- **Backup automático** de todas as alterações
- **Sem dependência de internet**
- **Dados seguros** no seu computador

#### Import/Export JSON
- **Backup completo** de todos os quadros
- **Restauração** a partir de arquivos
- **Migração** entre dispositivos
- **Formato padrão** JSON legível

```
[ESPAÇO PARA PRINT: Tela de import/export mostrando opções de backup]
```

---

### 🎨 Interface e Experiência

#### Design Moderno
- **Tema dark** elegante e profissional
- **Cores Maver** (#dc143c) como destaque
- **Tipografia limpa** e legível
- **Ícones intuitivos** com Lucide React

#### Navegação Intuitiva
- **Sidebar colapsível** para maximizar espaço
- **Breadcrumbs** para orientação
- **Atalhos de teclado** para produtividade
- **Responsividade** para diferentes tamanhos de tela

```
[ESPAÇO PARA PRINT: Interface completa mostrando sidebar, quadro e navegação]
```

#### Sidebar Expandida/Colapsada:
```
[ESPAÇO PARA PRINT: Comparação da sidebar em modo expandido e colapsado]
```

---

## 🛠️ Tecnologias

### Stack Técnico
- **⚡ Electron 28**: Framework desktop multiplataforma
- **⚛️ React 18**: Interface de usuário moderna
- **📝 TypeScript**: Tipagem estática e desenvolvimento robusto
- **🎨 Tailwind CSS**: Estilização utilitária e responsiva
- **🔄 Zustand**: Gerenciamento de estado simples e eficaz
- **✨ Framer Motion**: Animações fluidas e interativas
- **🖱️ @dnd-kit**: Funcionalidade drag & drop avançada

### Arquitetura
```
src/
├── components/          # Componentes React
│   ├── Sidebar.tsx     # Navegação lateral
│   ├── Board.tsx       # Quadro principal
│   ├── Column.tsx      # Colunas de tarefas
│   ├── Card.tsx        # Cards individuais
│   └── *Modal.tsx      # Modais de criação/edição
├── store/              # Gerenciamento de estado
├── types/              # Definições TypeScript
└── utils/              # Funções utilitárias
```

---

## 🎮 Como Usar

### 1. Primeiro Acesso
```
[ESPAÇO PARA PRINT: Tela inicial com quadro de exemplo]
```

### 2. Criando seu Primeiro Quadro
1. Clique no botão **"+"** na sidebar
2. Escolha um **emoji** representativo
3. Digite um **título** para o projeto
4. Adicione uma **descrição** (opcional)
5. Clique em **"Criar Quadro"**

```
[ESPAÇO PARA PRINT: Passo a passo da criação de quadro]
```

### 3. Adicionando Colunas
1. Clique em **"+ Adicionar Coluna"**
2. Defina o **título** da coluna (ex: "To Do")
3. Escolha uma **cor** de destaque
4. Adicione **descrição** das regras
5. Salve as alterações

```
[ESPAÇO PARA PRINT: Modal de criação de coluna]
```

### 4. Criando Cards
1. Clique em **"+ Adicionar Card"** na coluna
2. Digite o **título** da tarefa
3. Adicione **descrição** detalhada
4. Defina a **prioridade** (Baixa/Média/Alta)
5. Configure **data de vencimento** (opcional)
6. Salve o card

```
[ESPAÇO PARA PRINT: Modal de criação de card com todos os campos]
```

### 5. Organizando Tarefas
- **Arrastar cards** entre colunas para mudar status
- **Reordenar** por prioridade ou data
- **Editar** cards com duplo clique
- **Excluir** cards que não são mais necessários

```
[ESPAÇO PARA PRINT: Demonstração de organização de tarefas]
```

---

## 📱 Casos de Uso

### 👩‍💼 Gestão de Projetos
- **Sprints** de desenvolvimento
- **Planejamento** de releases
- **Acompanhamento** de bugs
- **Coordenação** de equipes

### 👨‍🎓 Estudos e Pesquisa
- **Cronograma** de estudos
- **Progresso** de disciplinas
- **Organização** de materiais
- **Acompanhamento** de prazos

### 🏠 Vida Pessoal
- **Tarefas domésticas**
- **Planejamento** de viagens
- **Organização** de eventos
- **Metas pessoais**

### 🏢 Fluxos de Trabalho
- **Processos** empresariais
- **Aprovações** e revisões
- **Pipeline** de vendas
- **Atendimento** ao cliente

---

## 🔧 Requisitos do Sistema

### Windows
- **Sistema**: Windows 10/11 (64-bit)
- **Memória**: 4GB RAM (recomendado: 8GB)
- **Armazenamento**: 300MB livres
- **Dependências**: Nenhuma (tudo incluído)

### Linux
- **Sistema**: Ubuntu 18.04+ / Debian 10+ / distribuições similares
- **Memória**: 4GB RAM (recomendado: 8GB)
- **Armazenamento**: 300MB livres
- **Dependências**: Bibliotecas do sistema (auto-instaladas via DEB)

---

## 🆘 Solução de Problemas

### Windows

#### Instalador não executa
- ✅ Execute como **usuário normal** (não administrador)
- ✅ Verifique se todos os arquivos foram extraídos
- ✅ Execute `TESTE-INSTALADOR.bat` para diagnóstico

#### Aplicativo não abre
- ✅ Verifique se foi instalado em `%LOCALAPPDATA%\Mavit`
- ✅ Execute diretamente `Mavit.exe`
- ✅ Verifique antivírus (adicione exceção se necessário)

### Linux

#### Erro de dependências (.deb)
```bash
sudo apt-get install -f
```

#### AppImage não executa
```bash
chmod +x Mavit-1.0.0.AppImage
```

---

## 📞 Suporte e Informações

### Desenvolvimento
- **Equipe**: Maver Team
- **Versão**: 1.0.0
- **Tecnologias**: Electron + React + TypeScript
- **Licença**: MIT

### Contato e Feedback
- **Issues**: [GitHub Issues](https://github.com/maver/mavit/issues)
- **Email**: team@mavit.com
- **Website**: [mavit.com](https://mavit.com)

### Recursos Adicionais
- **Documentação**: [docs.mavit.com](https://docs.mavit.com)
- **Tutoriais**: [tutorials.mavit.com](https://tutorials.mavit.com)
- **Comunidade**: [community.mavit.com](https://community.mavit.com)

---

## 🎉 Conclusão

**Mavit** representa uma solução completa e moderna para gerenciamento de projetos pessoais e profissionais. Com sua interface intuitiva, funcionalidades robustas e instalação simplificada, oferece tudo que você precisa para organizar suas tarefas de forma eficiente.

### 🚀 Comece Agora!

1. **📥 Baixe** o instalador para sua plataforma
2. **⚡ Instale** em menos de 1 minuto
3. **🎯 Organize** seus projetos imediatamente
4. **📈 Aumente** sua produtividade

---

<div align="center">

**Transforme sua produtividade com Mavit!**

![Mavit Preview](assets/preview-mockup.png)

*Interface moderna e intuitiva para máxima produtividade*

---

*Desenvolvido com ❤️ pela Maver Team*

</div>