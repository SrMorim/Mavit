#!/bin/bash

# Script para testar a instalação do Mavit
# Este script verifica se todas as dependências estão disponíveis

echo "🔍 Testando dependências do Mavit..."

# Função para verificar se um pacote está instalado
check_package() {
    if dpkg -l | grep -q "^ii  $1 "; then
        echo "✅ $1 - Instalado"
        return 0
    else
        echo "❌ $1 - NÃO instalado"
        return 1
    fi
}

# Lista de dependências do DEB
DEPENDENCIES=(
    "libgtk-3-0"
    "libnss3" 
    "libxss1"
    "libxtst6"
    "xdg-utils"
    "libatspi2.0-0"
    "libdrm2"
    "libxcomposite1"
    "libxdamage1"
    "libxrandr2"
    "libgbm1"
    "libasound2"
)

missing_deps=()

echo "📋 Verificando dependências:"
for dep in "${DEPENDENCIES[@]}"; do
    if ! check_package "$dep"; then
        missing_deps+=("$dep")
    fi
done

if [ ${#missing_deps[@]} -eq 0 ]; then
    echo ""
    echo "🎉 Todas as dependências estão instaladas!"
    echo "✅ O Mavit pode ser instalado sem problemas."
else
    echo ""
    echo "⚠️  Dependências em falta: ${#missing_deps[@]}"
    echo "📦 Para instalar as dependências em falta:"
    echo "sudo apt-get update"
    echo "sudo apt-get install ${missing_deps[*]}"
fi

echo ""
echo "🚀 Para instalar o Mavit:"
echo "sudo dpkg -i mavit_1.0.0_amd64.deb"
echo "sudo apt-get install -f  # Se houver problemas de dependência"

echo ""
echo "🔄 Alternativa (AppImage - sem dependências):"
echo "chmod +x Mavit-1.0.0.AppImage"
echo "./Mavit-1.0.0.AppImage"