const fs = require('fs-extra');
const path = require('path');

async function copySPABuild() {
  try {
    console.log('📦 Setting up Next.js SPA for Firebase Hosting...');
    
    // Create output directory
    await fs.ensureDir('out');
    
    // Copy static assets
    await fs.copy('.next/static', 'out/_next/static');
    console.log('✅ Copied static assets');
    
    // Copy public directory files
    if (await fs.pathExists('public')) {
      await fs.copy('public', 'out');
      console.log('✅ Copied public files');
    }
    
    // Create a simple index.html that bootstraps the Next.js app
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Think Space</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f5f5f5;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 18px;
            color: #666;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin-right: 12px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="__next">
        <div class="loading">
            <div class="spinner"></div>
            Loading Think Space...
        </div>
    </div>
    <script>
        // Simple client-side routing for Firebase hosting
        (function() {
            const path = window.location.pathname;
            
            // For development or if running the actual Next.js server
            if (window.location.hostname === 'localhost' || window.location.port === '3000') {
                return;
            }
            
            // For production on Firebase hosting, load the app
            console.log('Loading Next.js app for:', path);
            
            // Create script element to load the Next.js app
            const script = document.createElement('script');
            script.src = '/_next/static/chunks/webpack-d4e8752ccff794f6.js';
            document.head.appendChild(script);
            
            // You might need to load additional chunks here
            // This is a simplified approach
        })();
    </script>
</body>
</html>`;
    
    await fs.writeFile(path.join('out', 'index.html'), indexHtml);
    console.log('✅ Created SPA bootstrap index.html');
    
    console.log('🚀 SPA build ready for Firebase Hosting!');
    
  } catch (error) {
    console.error('❌ Error setting up SPA build:', error);
    process.exit(1);
  }
}

copySPABuild(); 