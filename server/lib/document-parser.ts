import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function parseDocument(filePath: string, mimeType: string): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    
    switch (mimeType) {
      case 'application/pdf':
        const pdfData = await pdfParse(fileBuffer);
        return pdfData.text;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxResult.value;
        
      case 'application/msword':
        // For older .doc files, mammoth can handle some cases
        try {
          const docResult = await mammoth.extractRawText({ buffer: fileBuffer });
          return docResult.value;
        } catch (error) {
          throw new Error('Unable to parse .doc file. Please convert to .docx or PDF.');
        }
        
      case 'text/plain':
        return fileBuffer.toString('utf-8');
        
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    throw error;
  }
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
}
