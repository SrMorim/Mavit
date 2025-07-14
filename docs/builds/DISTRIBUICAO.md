# Mavit - Pacote de Distribuição v1.0.0

## 📦 Arquivos Incluídos

### Linux
1. **mavit_1.0.0_amd64.deb** (70.8 MB)
   - Instalador DEB para Ubuntu/Debian
   - Cria atalhos automáticos no menu
   - Dependências corrigidas (sem gconf)

2. **Mavit-1.0.0.AppImage** (103.5 MB)
   - Executável portátil universal
   - Sem dependências
   - Funciona em qualquer distribuição Linux

### Windows
3. **Mavit-1.0.0-Windows-Ready.zip** (24.7 MB) - **RECOMENDADO**
   - **INSTALADOR PRONTO PARA USO** 
   - SEM dependência do Node.js
   - Executável direto (.exe)
   - Instalação instantânea (apenas cópia)
   - Atalho automático na área de trabalho

4. **Mavit-1.0.0-Windows-Installer-Fixed.zip** (152 KB)
   - Instalador com Node.js (corrigido)
   - Para usuários que preferem Node.js
   - Registro no Painel de Controle

5. **Mavit-1.0.0-Windows-Portable.zip** (148 KB)
   - Versão portátil simples
   - Requer Node.js pré-instalado

## 🚀 Instruções de Instalação

### Linux (Ubuntu/Debian)
```bash
# Método 1: DEB Package
sudo dpkg -i mavit_1.0.0_amd64.deb
sudo apt-get install -f  # Se necessário

# Método 2: AppImage (Universal)
chmod +x Mavit-1.0.0.AppImage
./Mavit-1.0.0.AppImage
```

### Windows
```cmd
# Método Recomendado: Pronto para Uso
1. Extrair Mavit-1.0.0-Windows-Ready.zip
2. Executar "INSTALAR.bat"
3. Atalho criado automaticamente - SEM Node.js necessário!

# Método Alternativo: Com Node.js
1. Extrair Mavit-1.0.0-Windows-Installer-Fixed.zip
2. Executar "INSTALAR.bat"
3. Seguir instruções na tela

# Método Portátil: 
1. Extrair Mavit-1.0.0-Windows-Portable.zip
2. npm install
3. Executar "Mavit.bat"
```

## 🎯 Características do Instalador Windows "Pronto para Uso"

### ✅ Funcionalidades Principais
- 🚀 **SEM Node.js**: Não requer instalação prévia
- ⚡ **Instalação Instantânea**: Apenas cópia de arquivos
- 💻 **Executável Direto**: Mavit.exe pronto para uso
- 🖥️ **Atalho Automático**: Criado na área de trabalho
- 📦 **Tudo Incluído**: 24.7MB com todos os binários
- 🗑️ **Desinstalador**: Remoção completa incluída

### 📋 Processo de Instalação (Novo)
1. **Extração**: Usuário extrai ZIP em qualquer pasta
2. **Execução**: Clica em "INSTALAR.bat"
3. **Cópia**: Arquivos copiados para `%LOCALAPPDATA%\Mavit`
4. **Atalho**: Criado automaticamente na área de trabalho
5. **Pronto**: Execução imediata sem configuração

### 🔧 Instaladores Alternativos
- **Windows-Installer-Fixed**: Para quem prefere Node.js (152KB)
- **Windows-Portable**: Versão manual simples (148KB)

## 🔧 Requisitos do Sistema

### Linux
- Ubuntu 18.04+ / Debian 10+
- Bibliotecas: libgtk-3-0, libnss3, libxss1, etc.
- AppImage: Qualquer distribuição Linux moderna

### Windows
- **Windows-Ready**: Windows 10/11 (SEM outras dependências!)
- **Windows-Installer-Fixed**: Windows 10/11 + Node.js 16+ 
- **Windows-Portable**: Windows 10/11 + Node.js 16+

## 🌟 Sobre o Mavit

**Mavit** é um aplicativo de quadro Kanban customizável para gerenciamento de tarefas e projetos.

### Características Principais
- 📋 Quadros Kanban personalizáveis
- 🎨 Interface dark com tema Maver (#dc143c)
- 🔄 Drag & drop para reordenar cards
- ⭐ Sistema de prioridades (baixa/média/alta)
- 📅 Datas de vencimento com alertas
- 💾 Salvamento automático
- 📤 Import/export JSON
- 🖱️ Interface responsiva e intuitiva

### Tecnologias
- **Electron** - Aplicativo desktop multiplataforma
- **React + TypeScript** - Interface moderna
- **Zustand** - Gerenciamento de estado
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações suaves

## 📞 Suporte e Informações

- **Desenvolvedor**: Maver Team
- **Versão**: 1.0.0
- **Licença**: Uso livre
- **Arquitetura**: x64 (64-bit)

## 📋 Notas de Distribuição

### Para Usuários Finais
- **Linux**: Use DEB se Ubuntu/Debian, AppImage para outras distros
- **Windows**: Use instalador avançado para instalação completa

### Para Administradores
- Todos os instaladores são seguros e não requerem privilégios administrativos
- Windows: Instalação por usuário (%LOCALAPPDATA%)
- Linux: DEB requer sudo, AppImage não

### Verificação de Integridade
- Todos os arquivos foram testados e verificados
- Dependências Linux corrigidas (sem gconf2/gconf-service)
- Scripts Windows verificados contra antivírus

---

**✅ Pacote completo pronto para distribuição!**