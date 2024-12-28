const fs = require('fs');
const path = require('path');

module.exports.uploadImage = (file) => {
  const targetPath = path.join(__dirname, '../uploads/', file.filename);
  fs.renameSync(file.path, targetPath);
  return {
    url: `/uploads/${file.filename}`,
    path: targetPath,
  };
};

module.exports.removeImage = (filePath) => {
  fs.unlinkSync(filePath);
};
