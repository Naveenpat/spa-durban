import fs from 'fs';
import path from 'path';

export const deleteUploadedFile = (relativeFilePath: string) => {
  if (!relativeFilePath) return;

  const fullPath = path.join(__dirname, '../../public', relativeFilePath);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log('🗑️ Deleted file:', fullPath);
    } catch (err) {
      console.error('❌ Failed to delete file:', err);
    }
  } else {
    console.warn('⚠️ File not found to delete:', fullPath);
  }
};
