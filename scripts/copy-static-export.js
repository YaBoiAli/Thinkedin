const fs = require('fs-extra');
const path = require('path');

async function copyStaticExport() {
  try {
    console.log('📦 Copying Next.js static export to out directory...');
    
    // Create output directory
    await fs.ensureDir('out');
    
    // Copy static assets
    await fs.copy('.next/static', 'out/_next/static');
    console.log('✅ Copied static assets');
    
    // Copy HTML files from server directory
    const serverAppDir = '.next/server/app';
    const files = await fs.readdir(serverAppDir);
    
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filename = file === 'index.html' ? 'index.html' : `${file}`;
        await fs.copy(path.join(serverAppDir, file), path.join('out', filename));
        console.log(`✅ Copied ${filename}`);
      }
    }
    
    // Create a catch-all route for dynamic routes (SPA behavior)
    const indexContent = await fs.readFile(path.join(serverAppDir, 'index.html'), 'utf8');
    
    // Copy subdirectories
    const subdirs = await fs.readdir(serverAppDir, { withFileTypes: true });
    for (const dirent of subdirs) {
      if (dirent.isDirectory()) {
        const subPath = path.join(serverAppDir, dirent.name);
        const outSubPath = path.join('out', dirent.name);
        
        // For directories like 'thoughts', create the structure
        await fs.ensureDir(outSubPath);
        
        const subFiles = await fs.readdir(subPath);
        for (const subFile of subFiles) {
          if (subFile.endsWith('.html')) {
            await fs.copy(path.join(subPath, subFile), path.join(outSubPath, subFile));
            console.log(`✅ Copied ${dirent.name}/${subFile}`);
          }
        }
      }
    }
    
    // Copy public directory files
    if (await fs.pathExists('public')) {
      await fs.copy('public', 'out');
      console.log('✅ Copied public files');
    }
    
    console.log('🚀 Static export ready for Firebase Hosting!');
    
  } catch (error) {
    console.error('❌ Error copying static export:', error);
    process.exit(1);
  }
}

copyStaticExport(); 