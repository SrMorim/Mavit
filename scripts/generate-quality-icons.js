#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Enhanced SVG icon
function createSVGIcon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2a2a2a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2a2a2a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGrad)" stroke="#dc143c" stroke-width="8"/>
  
  <!-- Main kanban board -->
  <g transform="translate(128, 128)">
    <!-- Board background -->
    <rect x="0" y="0" width="256" height="192" rx="12" fill="url(#boardGrad)" stroke="#dc143c" stroke-width="3"/>
    
    <!-- Column 1 - To Do -->
    <rect x="16" y="16" width="64" height="160" rx="6" fill="#333" stroke="#555" stroke-width="1"/>
    <rect x="20" y="20" width="56" height="8" rx="3" fill="#dc143c"/>
    <rect x="22" y="32" width="52" height="20" rx="3" fill="#444"/>
    <rect x="22" y="56" width="52" height="16" rx="3" fill="#444"/>
    <rect x="22" y="76" width="52" height="18" rx="3" fill="#444"/>
    <rect x="22" y="98" width="52" height="14" rx="3" fill="#444"/>
    
    <!-- Column 2 - In Progress -->
    <rect x="96" y="16" width="64" height="160" rx="6" fill="#333" stroke="#555" stroke-width="1"/>
    <rect x="100" y="20" width="56" height="8" rx="3" fill="#dc143c"/>
    <rect x="102" y="32" width="52" height="16" rx="3" fill="#444"/>
    <rect x="102" y="52" width="52" height="22" rx="3" fill="#444"/>
    <rect x="102" y="78" width="52" height="24" rx="3" fill="#444"/>
    
    <!-- Column 3 - Done -->
    <rect x="176" y="16" width="64" height="160" rx="6" fill="#333" stroke="#555" stroke-width="1"/>
    <rect x="180" y="20" width="56" height="8" rx="3" fill="#dc143c"/>
    <rect x="182" y="32" width="52" height="14" rx="3" fill="#444"/>
    <rect x="182" y="50" width="52" height="18" rx="3" fill="#444"/>
    <rect x="182" y="72" width="52" height="16" rx="3" fill="#444"/>
    <rect x="182" y="92" width="52" height="20" rx="3" fill="#444"/>
  </g>
  
  <!-- App title -->
  <text x="256" y="380" text-anchor="middle" fill="#dc143c" font-family="Arial, sans-serif" font-size="36" font-weight="bold">Mavit</text>
</svg>`;
}

async function generateQualityIcons() {
  console.log('🎨 Generating high-quality icons with Sharp...');
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  const svgContent = createSVGIcon();
  const svgBuffer = Buffer.from(svgContent);
  
  try {
    // Update SVG file
    fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgContent);
    console.log('✅ Updated icon.svg');
    
    // Generate PNG (512x512 for Linux)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ Created high-quality icon.png (512x512)');
    
    // Generate smaller PNG for ICO conversion
    const iconSizes = [16, 32, 48, 64, 128, 256];
    const icoImages = [];
    
    for (const size of iconSizes) {
      const buffer = await sharp(svgBuffer)
        .resize(size, size)
        .png({ quality: 100 })
        .toBuffer();
      icoImages.push(buffer);
      console.log(`✅ Created ${size}x${size} icon buffer`);
    }
    
    // For Windows ICO, we'll use the 256x256 PNG as a fallback
    // (Real ICO generation would require a specialized library)
    await sharp(svgBuffer)
      .resize(256, 256)
      .png({ quality: 100 })
      .toFile(path.join(assetsDir, 'icon.ico'));
    console.log('✅ Created icon.ico (256x256 PNG format)');
    
    // Generate additional sizes for different uses
    await sharp(svgBuffer)
      .resize(128, 128)
      .png({ quality: 100 })
      .toFile(path.join(assetsDir, 'icon-128.png'));
    
    await sharp(svgBuffer)
      .resize(64, 64)
      .png({ quality: 100 })
      .toFile(path.join(assetsDir, 'icon-64.png'));
    
    await sharp(svgBuffer)
      .resize(32, 32)
      .png({ quality: 100 })
      .toFile(path.join(assetsDir, 'icon-32.png'));
    
    console.log('✅ Created additional icon sizes');
    
    console.log('\n🎉 High-quality icon generation completed!');
    console.log('📁 All icons ready in:', assetsDir);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateQualityIcons();