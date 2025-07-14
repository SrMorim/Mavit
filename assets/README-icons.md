# App Icons Setup

Para criar os ícones da aplicação, você precisa gerar os seguintes arquivos a partir do icon.svg:

## Windows (icon.ico)
- Tamanhos: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
- Formato: ICO multi-tamanho

## Linux (icon.png)  
- Tamanho: 512x512
- Formato: PNG com transparência

## macOS (icon.icns) - Opcional
- Tamanhos múltiplos em formato ICNS

## Como Gerar os Ícones

### Opção 1: Online (Recomendado)
1. Vá para https://convertio.co/svg-ico/ ou https://cloudconvert.com/
2. Faça upload do `icon.svg`
3. Converta para os formatos necessários

### Opção 2: Usando ImageMagick (se instalado)
```bash
# Para PNG
convert icon.svg -resize 512x512 icon.png

# Para ICO (múltiplos tamanhos)
convert icon.svg -resize 256x256 icon-256.png
convert icon.svg -resize 128x128 icon-128.png
convert icon.svg -resize 64x64 icon-64.png
convert icon.svg -resize 48x48 icon-48.png
convert icon.svg -resize 32x32 icon-32.png
convert icon.svg -resize 16x16 icon-16.png
convert icon-*.png icon.ico
```

### Opção 3: Usar um editor como GIMP ou Inkscape
1. Abrir icon.svg no Inkscape
2. Exportar como PNG nos tamanhos necessários
3. Usar GIMP para criar o arquivo ICO multi-tamanho

Após gerar os arquivos, coloque-os nesta pasta:
- `assets/icon.ico` (Windows)
- `assets/icon.png` (Linux)
- `assets/icon.icns` (macOS)