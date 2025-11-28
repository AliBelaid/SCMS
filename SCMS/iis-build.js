// Custom build script for IIS deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom IIS-optimized build...');

// 1. Run the production build
console.log('Building Angular app with production settings...');
execSync('ng build --configuration production', { stdio: 'inherit' });

// 2. Create web.config for IIS if it doesn't exist
const webConfigPath = path.join(__dirname, 'dist', 'vex', 'web.config');
if (!fs.existsSync(webConfigPath)) {
  console.log('Creating web.config for IIS...');
  const webConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Angular Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
  </system.webServer>
</configuration>`;
  fs.writeFileSync(webConfigPath, webConfigContent);
}

console.log('Build completed successfully!');
console.log('To deploy to IIS, copy the contents of the "dist/vex" directory to your IIS website folder.'); 