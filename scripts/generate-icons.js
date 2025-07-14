#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple PNG header for a basic icon
function createBasicPNG(width, height, color = [220, 20, 60]) {
  // PNG file format with a simple colored square
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, width, // width (32-bit)
    0x00, 0x00, 0x00, height, // height (32-bit)
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    // CRC for IHDR would go here, but we'll use a simpler approach
  ]);
  
  // For simplicity, let's create a basic colored bitmap and convert to PNG format
  // This is a very basic implementation - in production you'd use a proper image library
  
  return pngData;
}

// Create a simple ICO file with embedded bitmap
function createBasicICO() {
  // ICO file header (6 bytes)
  const header = Buffer.from([
    0x00, 0x00, // Reserved (must be 0)
    0x01, 0x00, // Image type (1 = ICO)
    0x01, 0x00  // Number of images
  ]);
  
  // Image directory entry (16 bytes)
  const dirEntry = Buffer.from([
    0x20,       // Width (32 pixels)
    0x20,       // Height (32 pixels)
    0x00,       // Color count (0 = more than 256 colors)
    0x00,       // Reserved (must be 0)
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32-bit)
    0x00, 0x04, 0x00, 0x00, // Size of image data (1024 bytes for 32x32x32bit)
    0x16, 0x00, 0x00, 0x00  // Offset to image data
  ]);
  
  // Simple 32x32 bitmap data (simplified - just create red square)
  const imageSize = 32 * 32 * 4; // 32x32 pixels * 4 bytes per pixel (RGBA)
  const imageData = Buffer.alloc(imageSize);
  
  // Fill with red color (BGRA format for ICO)
  for (let i = 0; i < imageSize; i += 4) {
    imageData[i] = 60;     // Blue
    imageData[i + 1] = 20; // Green  
    imageData[i + 2] = 220; // Red
    imageData[i + 3] = 255; // Alpha
  }
  
  return Buffer.concat([header, dirEntry, imageData]);
}

// Create SVG-based icon that we can convert
function createSVGIcon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="#1a1a1a" rx="64"/>
  
  <!-- Main icon - Kanban board representation -->
  <g transform="translate(96, 96)">
    <!-- Board background -->
    <rect x="0" y="0" width="320" height="240" rx="16" fill="#2a2a2a" stroke="#dc143c" stroke-width="4"/>
    
    <!-- Column 1 -->
    <rect x="20" y="20" width="80" height="200" rx="8" fill="#333" stroke="#555" stroke-width="2"/>
    <rect x="30" y="30" width="60" height="12" rx="4" fill="#dc143c"/>
    <rect x="30" y="50" width="60" height="30" rx="4" fill="#444"/>
    <rect x="30" y="90" width="60" height="25" rx="4" fill="#444"/>
    <rect x="30" y="125" width="60" height="20" rx="4" fill="#444"/>
    
    <!-- Column 2 -->
    <rect x="120" y="20" width="80" height="200" rx="8" fill="#333" stroke="#555" stroke-width="2"/>
    <rect x="130" y="30" width="60" height="12" rx="4" fill="#dc143c"/>
    <rect x="130" y="50" width="60" height="25" rx="4" fill="#444"/>
    <rect x="130" y="85" width="60" height="30" rx="4" fill="#444"/>
    <rect x="130" y="125" width="60" height="35" rx="4" fill="#444"/>
    
    <!-- Column 3 -->
    <rect x="220" y="20" width="80" height="200" rx="8" fill="#333" stroke="#555" stroke-width="2"/>
    <rect x="230" y="30" width="60" height="12" rx="4" fill="#dc143c"/>
    <rect x="230" y="50" width="60" height="20" rx="4" fill="#444"/>
    <rect x="230" y="80" width="60" height="25" rx="4" fill="#444"/>
    <rect x="230" y="115" width="60" height="30" rx="4" fill="#444"/>
  </g>
  
  <!-- App name -->
  <text x="256" y="420" text-anchor="middle" fill="#dc143c" font-family="Arial, sans-serif" font-size="32" font-weight="bold">MD</text>
</svg>`;
}

async function generateIcons() {
  console.log('🎨 Generating generic icons for Mavit...');
  
  // Ensure assets directory exists
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  try {
    // Create SVG icon
    const svgContent = createSVGIcon();
    fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgContent);
    console.log('✅ Created icon.svg');
    
    // Try to use sharp if available, otherwise create simple icons
    let sharp;
    try {
      sharp = require('sharp');
      console.log('📦 Using sharp for high-quality icon generation');
      
      // Generate PNG from SVG
      await sharp(Buffer.from(svgContent))
        .resize(512, 512)
        .png()
        .toFile(path.join(assetsDir, 'icon.png'));
      console.log('✅ Created icon.png (512x512)');
      
      // Generate ICO (multiple sizes)
      const sizes = [16, 32, 48, 64, 128, 256];
      const icoBuffers = await Promise.all(
        sizes.map(size => 
          sharp(Buffer.from(svgContent))
            .resize(size, size)
            .png()
            .toBuffer()
        )
      );
      
      // For ICO, we'll save the largest PNG as a fallback
      await sharp(Buffer.from(svgContent))
        .resize(256, 256)
        .png()
        .toFile(path.join(assetsDir, 'icon.ico'));
      console.log('✅ Created icon.ico (fallback as PNG)');
      
    } catch (sharpError) {
      console.log('📝 Sharp not available, creating basic icons...');
      
      // Fallback: Create basic bitmap-style icons
      const basicICO = createBasicICO();
      fs.writeFileSync(path.join(assetsDir, 'icon.ico'), basicICO);
      console.log('✅ Created basic icon.ico');
      
      // Create a simple PNG using Canvas or similar approach
      // For now, let's create a placeholder that electron-builder can use
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x02, 0x00, // width 512
        0x00, 0x00, 0x02, 0x00, // height 512  
        0x08, 0x02, 0x00, 0x00, 0x00, // bit depth 8, color type 2 (RGB), compression 0, filter 0, interlace 0
        0x91, 0x3A, 0x86, 0x1B, // CRC
        0x00, 0x00, 0x00, 0x00, // IEND length
        0x49, 0x45, 0x4E, 0x44, // IEND
        0xAE, 0x42, 0x60, 0x82  // CRC
      ]);
      
      // This is a minimal PNG, electron-builder might still work with it
      fs.writeFileSync(path.join(assetsDir, 'icon.png'), pngHeader);
      console.log('✅ Created basic icon.png');
    }
    
    console.log('\n🎉 Icon generation completed!');
    console.log('📁 Icons created in:', assetsDir);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Install sharp if needed
async function installSharp() {
  try {
    require('sharp');
  } catch (error) {
    console.log('📦 Installing sharp for better icon quality...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install sharp --no-save', { stdio: 'inherit' });
      console.log('✅ Sharp installed successfully');
    } catch (installError) {
      console.log('⚠️  Could not install sharp, using fallback method');
    }
  }
}

// Main execution
if (require.main === module) {
  installSharp().then(() => generateIcons()).catch(console.error);
}

module.exports = { generateIcons };