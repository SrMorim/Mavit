#!/bin/bash

# Mavit Installer Setup Script
# Este script prepara o ambiente para criar instaladores Windows e Linux

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
setup_environment() {
    print_status "🚀 Configurando ambiente para criação de instaladores Mavit"
    echo

    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js encontrado: $NODE_VERSION"
    else
        print_error "Node.js não encontrado! Instale Node.js 18+ primeiro."
        exit 1
    fi

    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm encontrado: $NPM_VERSION"
    else
        print_error "npm não encontrado!"
        exit 1
    fi

    # Install dependencies
    print_status "📦 Instalando dependências..."
    npm install

    # Check for assets directory
    if [ ! -d "assets" ]; then
        print_warning "Pasta assets não encontrada, criando..."
        mkdir -p assets
    fi

    # Check for required icons
    if [ ! -f "assets/icon.ico" ] || [ ! -f "assets/icon.png" ]; then
        print_warning "Ícones não encontrados!"
        print_status "📋 Você precisa criar os ícones da aplicação:"
        print_status "1. Use o arquivo assets/icon.svg como base"
        print_status "2. Crie icon.ico (Windows) e icon.png (Linux)"
        print_status "3. Veja assets/README-icons.md para instruções"
        
        read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Ícones encontrados ✓"
    fi

    print_success "✅ Ambiente configurado com sucesso!"
    echo
}

# Function to build for specific platform
build_for_platform() {
    local platform=$1
    
    case $platform in
        "windows")
            print_status "🖥️ Criando instalador Windows..."
            npm run release:win
            ;;
        "linux")
            print_status "🐧 Criando pacotes Linux..."
            npm run release:linux
            ;;
        "all")
            print_status "🌍 Criando instaladores para todas as plataformas..."
            npm run release:all
            ;;
        *)
            print_status "📦 Criando instalador para plataforma atual..."
            npm run release
            ;;
    esac
}

# Function to show build results
show_results() {
    if [ -d "release" ]; then
        print_success "🎉 Instaladores criados com sucesso!"
        print_status "📁 Arquivos gerados em ./release/:"
        echo
        
        # List files with sizes
        for file in release/*; do
            if [ -f "$file" ]; then
                size=$(du -h "$file" | cut -f1)
                filename=$(basename "$file")
                echo "  📄 $filename ($size)"
            fi
        done
        
        echo
        print_status "📤 Para distribuir os instaladores:"
        print_status "1. Teste a instalação em sistemas limpos"
        print_status "2. Faça upload para GitHub Releases"
        print_status "3. Atualize links no README.md"
    else
        print_error "Pasta release não encontrada. Build falhou?"
    fi
}

# Function to clean previous builds
clean_builds() {
    print_status "🗑️ Limpando builds anteriores..."
    rm -rf release dist
    print_success "Limpeza concluída"
}

# Function to show help
show_help() {
    cat << EOF
Mavit Installer Setup Script

Uso: $0 [comando] [opções]

Comandos:
  setup     Configura o ambiente (padrão)
  build     Cria instaladores
  clean     Limpa builds anteriores
  help      Mostra esta ajuda

Opções para 'build':
  --windows    Cria apenas instalador Windows
  --linux      Cria apenas pacotes Linux  
  --all        Cria para todas as plataformas
  (sem opção)  Cria para a plataforma atual

Exemplos:
  $0                    # Setup + build para plataforma atual
  $0 build --windows    # Apenas Windows
  $0 build --linux     # Apenas Linux
  $0 build --all        # Todas as plataformas
  $0 clean              # Limpar builds

Pré-requisitos:
  - Node.js 18+
  - npm 8+
  - Ícones em assets/ (icon.ico, icon.png)

EOF
}

# Main script logic
main() {
    case "${1:-setup}" in
        "setup")
            setup_environment
            print_status "Execute '$0 build' para criar os instaladores"
            ;;
        "build")
            case "${2}" in
                "--windows")
                    build_for_platform "windows"
                    ;;
                "--linux")
                    build_for_platform "linux"
                    ;;
                "--all")
                    build_for_platform "all"
                    ;;
                "")
                    build_for_platform "current"
                    ;;
                *)
                    print_error "Opção desconhecida: $2"
                    show_help
                    exit 1
                    ;;
            esac
            show_results
            ;;
        "clean")
            clean_builds
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Comando desconhecido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Check if running in correct directory
if [ ! -f "package.json" ] || ! grep -q "mavit" package.json; then
    print_error "Execute este script na pasta raiz do projeto Mavit"
    exit 1
fi

# Run main function with all arguments
main "$@"