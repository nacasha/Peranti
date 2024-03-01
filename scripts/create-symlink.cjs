const fs = require('fs');

const createSymlink = (sourcePath, targetPath) => {
  try {
    fs.symlinkSync(sourcePath, targetPath, 'dir');
    console.log('Symlink created successfully.');
  } catch (error) {
    console.log('Symlink already exist.');
  }
};

createSymlink('../packages/extensions-runner', './src-tauri/extensions-runner');
