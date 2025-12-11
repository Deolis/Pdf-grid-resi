import { PDFDocument, rgb } from 'pdf-lib';
import { GridFile, GridConfig } from '../types';

export const generateGridPdf = async (files: GridFile[], config: GridConfig): Promise<Uint8Array> => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // A4 dimensions in points (approx 72 dpi)
  // Width: 595.28, Height: 841.89
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  
  const { margin, gap } = config;
  
  // Calculate grid dimensions
  const contentWidth = PAGE_WIDTH - (margin * 2);
  const contentHeight = PAGE_HEIGHT - (margin * 2);
  
  const cellWidth = (contentWidth - (gap * 2)) / 3;
  const cellHeight = (contentHeight - (gap * 2)) / 3;
  
  // Iterate through the files (max 9)
  for (let i = 0; i < Math.min(files.length, 9); i++) {
    const gridFile = files[i];
    const arrayBuffer = await gridFile.file.arrayBuffer();
    
    try {
      // Load the source PDF
      const srcPdf = await PDFDocument.load(arrayBuffer);
      
      // We only take the first page of the source PDF
      const [embeddedPage] = await pdfDoc.embedPages([srcPdf.getPages()[0]]);
      
      // Calculate Grid Position (0-8)
      // Row 0 is Top, Row 2 is Bottom
      // Col 0 is Left, Col 2 is Right
      const col = i % 3;
      const row = Math.floor(i / 3);
      
      // PDF Coordinate system starts at Bottom-Left
      // So visual top row corresponds to higher Y value
      
      const xPos = margin + (col * (cellWidth + gap));
      // For Y: Start from top margin, go down by row index * (height + gap)
      // Since Y=0 is bottom, we calculate from top (PAGE_HEIGHT)
      const yPos = PAGE_HEIGHT - margin - cellHeight - (row * (cellHeight + gap));
      
      // Scale logic: Fit within the cell while maintaining aspect ratio
      const { width: srcWidth, height: srcHeight } = embeddedPage.size();
      
      const scaleX = cellWidth / srcWidth;
      const scaleY = cellHeight / srcHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const scaledWidth = srcWidth * scale;
      const scaledHeight = srcHeight * scale;
      
      // Center in cell
      const xOffset = (cellWidth - scaledWidth) / 2;
      const yOffset = (cellHeight - scaledHeight) / 2;
      
      page.drawPage(embeddedPage, {
        x: xPos + xOffset,
        y: yPos + yOffset,
        width: scaledWidth,
        height: scaledHeight,
      });

      // Optional: Draw cell border for debugging or style
      if (config.showBorders) {
        page.drawRectangle({
          x: xPos,
          y: yPos,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
        });
      }

    } catch (err) {
      console.error(`Error processing file ${gridFile.name}:`, err);
      // Draw a placeholder error text in the box
      const col = i % 3;
      const row = Math.floor(i / 3);
      const xPos = margin + (col * (cellWidth + gap));
      const yPos = PAGE_HEIGHT - margin - cellHeight - (row * (cellHeight + gap));
      
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(1, 0, 0),
        borderWidth: 1,
      });
    }
  }
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};