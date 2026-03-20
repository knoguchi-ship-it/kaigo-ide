import { Injectable } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';
import type { TDocumentDefinitions, ContentTable, TableCell } from 'pdfmake/interfaces';

interface PdfClient {
  id: string;
  familyName: string;
  givenName: string;
}

interface PdfCareRecord {
  recordDate: string | Date;
  category: string;
  content: string;
  professionalJudgment?: string | null;
  clientFamilyOpinion?: string | null;
  relatedOrganization?: string | null;
  client: PdfClient;
}

type RecordWithClient = PdfCareRecord;

const CATEGORY_LABELS: Record<string, string> = {
  VISIT: '訪問',
  PHONE: '電話',
  FAX: 'FAX',
  MAIL: 'メール',
  CONFERENCE: '会議',
  OTHER: 'その他',
};

/**
 * 西暦年 → 和暦文字列
 */
function toWareki(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // 令和: 2019-05-01〜
  if (y >= 2019) {
    const ry = y - 2018;
    return `R${ry}.${m}.${d}`;
  }
  // 平成: 1989-01-08〜2019-04-30
  if (y >= 1989) {
    const hy = y - 1988;
    return `H${hy}.${m}.${d}`;
  }
  return `${y}.${m}.${d}`;
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${min}`;
}

@Injectable()
export class CareRecordPdfService {
  constructor(private readonly pdfService: PdfService) {}

  async generateTable5Pdf(
    client: PdfClient,
    records: RecordWithClient[],
    authorName: string,
    dateRange: { from?: string; to?: string },
  ): Promise<Buffer> {
    const docDefinition = this.buildDocDefinition(
      client,
      records,
      authorName,
      dateRange,
    );
    return this.pdfService.generatePdf(docDefinition);
  }

  private buildDocDefinition(
    client: PdfClient,
    records: RecordWithClient[],
    authorName: string,
    dateRange: { from?: string; to?: string },
  ): TDocumentDefinitions {
    // ヘッダー情報部分
    const headerInfo = this.buildHeaderInfo(client, authorName, dateRange);

    // テーブル本体
    const table = this.buildRecordTable(records);

    return {
      pageSize: 'A4',
      pageMargins: [30, 40, 30, 40],
      content: [
        {
          text: '居宅介護支援経過記録（第5表）',
          style: 'title',
          alignment: 'center' as const,
          margin: [0, 0, 0, 12],
        },
        ...headerInfo,
        table,
      ],
      footer: (currentPage: number, pageCount: number) => ({
        text: `${currentPage} / ${pageCount}`,
        alignment: 'right' as const,
        margin: [0, 10, 30, 0],
        fontSize: 8,
      }),
      styles: {
        title: {
          fontSize: 14,
          bold: true,
        },
        headerLabel: {
          fontSize: 9,
          bold: true,
        },
        headerValue: {
          fontSize: 9,
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          alignment: 'center' as const,
        },
        tableCell: {
          fontSize: 8,
        },
      },
      defaultStyle: {
        font: 'NotoSansJP',
        fontSize: 9,
      },
    };
  }

  private buildHeaderInfo(
    client: PdfClient,
    authorName: string,
    dateRange: { from?: string; to?: string },
  ) {
    const clientName = `${client.familyName} ${client.givenName}`;

    const rangeText = dateRange.from && dateRange.to
      ? `${dateRange.from} 〜 ${dateRange.to}`
      : dateRange.from
        ? `${dateRange.from} 〜`
        : dateRange.to
          ? `〜 ${dateRange.to}`
          : '全期間';

    return [
      {
        columns: [
          {
            text: [
              { text: '利用者名: ', style: 'headerLabel' },
              { text: clientName, style: 'headerValue' },
            ],
            width: '*',
          },
          {
            text: [
              { text: '期間: ', style: 'headerLabel' },
              { text: rangeText, style: 'headerValue' },
            ],
            width: 'auto',
          },
        ],
        margin: [0, 0, 0, 4] as [number, number, number, number],
      },
      {
        text: [
          { text: '居宅介護支援事業者・事業所名及び担当者名: ', style: 'headerLabel' },
          { text: authorName, style: 'headerValue' },
        ],
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
    ];
  }

  private buildRecordTable(records: RecordWithClient[]): ContentTable {
    const headerRow: TableCell[] = [
      { text: '年月日', style: 'tableHeader' },
      { text: '区分', style: 'tableHeader' },
      { text: '内  容', style: 'tableHeader' },
    ];

    const bodyRows: TableCell[][] = records.map((record) => {
      const date = new Date(record.recordDate);
      const dateStr = `${toWareki(date)}\n${formatTime(date)}`;

      // 内容の組み立て
      const contentParts: string[] = [record.content];
      if (record.professionalJudgment) {
        contentParts.push(`【専門員の判断】${record.professionalJudgment}`);
      }
      if (record.clientFamilyOpinion) {
        contentParts.push(`【利用者・家族の意見】${record.clientFamilyOpinion}`);
      }
      if (record.relatedOrganization) {
        contentParts.push(`（関係機関: ${record.relatedOrganization}）`);
      }
      const contentText = contentParts.join('\n');

      return [
        { text: dateStr, style: 'tableCell', alignment: 'center' as const },
        {
          text: CATEGORY_LABELS[record.category] ?? record.category,
          style: 'tableCell',
          alignment: 'center' as const,
        },
        { text: contentText, style: 'tableCell' },
      ];
    });

    return {
      table: {
        headerRows: 1,
        widths: [65, 40, '*'],
        body: [headerRow, ...bodyRows],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#333333',
        vLineColor: () => '#333333',
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 3,
        paddingBottom: () => 3,
      },
    };
  }
}
