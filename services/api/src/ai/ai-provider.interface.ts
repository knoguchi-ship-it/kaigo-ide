export interface AiGenerateOptions {
  type: 'care_record' | 'monitoring_comment' | 'monitoring_overall' | 'judgment';
  keywords?: string;
  context?: {
    category?: string;
    goalText?: string;
    rating?: number;
    evaluations?: { goalText: string; rating: number; comment?: string }[];
  };
}

export interface AiGenerateResult {
  text: string;
  model: string;
}

export interface AiProvider {
  generate(options: AiGenerateOptions): Promise<AiGenerateResult>;
  generateStream(
    options: AiGenerateOptions,
  ): AsyncIterable<string>;
}
