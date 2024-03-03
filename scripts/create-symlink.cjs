const fs = require('fs');

const createSymlink = (sourcePath, targetPath) => {
  try {
    fs.symlinkSync(sourcePath, targetPath, 'dir');
    console.log('Symlink successfully created.');
  } catch (error) {
    console.log('Symlink successfully created.');
  }
};

createSymlink('../packages/extensions-runner', './src-tauri/extensions-runner');
