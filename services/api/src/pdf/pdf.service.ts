import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

// pdfmake v0.3.x exports a singleton instance (CommonJS)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmake = require('pdfmake') as {
  setFonts: (fonts: Record<string, Record<string, string>>) => void;
  createPdf: (docDefinition: TDocumentDefinitions) => {
    getBuffer: () => Promise<Buffer>;
  };
};

@Injectable()
export class PdfService {
  constructor() {
    const fontsDir = path.resolve(__dirname, '..', '..', 'assets', 'fonts');
    const regularPath = path.join(fontsDir, 'NotoSansJP-Regular.ttf');
    const boldPath = path.join(fontsDir, 'NotoSansJP-Bold.ttf');

    if (!fs.existsSync(regularPath)) {
      throw new Error(`Font file not found: ${regularPath}`);
    }

    pdfmake.setFonts({
      NotoSansJP: {
        normal: regularPath,
        bold: boldPath,
        italics: regularPath,
        bolditalics: boldPath,
      },
    });
  }

  async generatePdf(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    const doc: TDocumentDefinitions = {
      ...docDefinition,
      defaultStyle: {
        font: 'NotoSansJP',
        fontSize: 9,
        ...docDefinition.defaultStyle,
      },
    };

    const pdfDoc = pdfmake.createPdf(doc);
    return pdfDoc.getBuffer();
  }
}
