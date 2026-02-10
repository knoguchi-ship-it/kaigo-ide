import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiProvider, AiGenerateOptions, AiGenerateResult } from './ai-provider.interface';
import { AzureOpenAiProvider } from './azure-openai.provider';

@Injectable()
export class AiService {
  private readonly provider: AiProvider;
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly azureProvider: AzureOpenAiProvider,
  ) {
    this.enabled = !!this.configService.get<string>('AZURE_OPENAI_API_KEY');
    this.provider = this.azureProvider;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async generate(options: AiGenerateOptions): Promise<AiGenerateResult> {
    if (!this.enabled) {
      throw new BadRequestException('AI機能が設定されていません。AZURE_OPENAI_API_KEYを設定してください。');
    }
    return this.provider.generate(options);
  }

  async *generateStream(options: AiGenerateOptions): AsyncIterable<string> {
    if (!this.enabled) {
      throw new BadRequestException('AI機能が設定されていません。');
    }
    yield* this.provider.generateStream(options);
  }
}
