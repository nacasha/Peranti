const fs = require('fs-extra');
const path = require('path');
const packageJson = require('../package.json');

const version = packageJson.version; // Get the version from package.json

// Create a new file and write the version
const distFolderPath = path.join(__dirname, '../public');
const versionFilePath = path.join(distFolderPath, 'metadata.json');
fs.ensureDirSync(distFolderPath); // Ensure dist folder exists

const metadata = {
  version
}

fs.writeFileSync(versionFilePath, JSON.stringify(metadata, null, 2));
