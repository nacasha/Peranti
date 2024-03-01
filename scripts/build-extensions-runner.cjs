const fs = require('fs').promises;
const path = require('path');
const uglify = require('uglify-js');

const nodeModulesDir = 'node_modules';
const minifiedDir = 'packages/extensions-runner/dependencies';
const targetFolders = ['vm2'];

async function minifyFiles(dir) {
  const files = await fs.readdir(dir);
  if (dir.includes(".pnpm")) {
    return
  }

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      await minifyFiles(filePath); // Recursive call for directories
    } else if (path.extname(file) === '.js' && targetFolders.some(folder => filePath.includes(folder))) {
      const relativePath = path.relative(nodeModulesDir, filePath);
      const outputFile = path.join(minifiedDir, relativePath);

      // Ensure the output directory exists before writing the file
      await fs.mkdir(path.dirname(outputFile), { recursive: true });

      const code = await fs.readFile(filePath, 'utf-8');
      const result = uglify.minify(code);

      await fs.writeFile(outputFile, code);
    }
  }
}

async function main() {
  try {
    // Create minified directory if it doesn't exist
    await fs.mkdir(minifiedDir, { recursive: true });
    await minifyFiles(nodeModulesDir);
    console.log('Minification complete.');
  } catch (error) {
    console.error('Error during minification:', error);
  }
}

// Run the main function
main();
