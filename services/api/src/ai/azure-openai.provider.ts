import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AiProvider,
  AiGenerateOptions,
  AiGenerateResult,
} from './ai-provider.interface';
import { buildPrompt } from './prompts';

@Injectable()
export class AzureOpenAiProvider implements AiProvider {
  private readonly logger = new Logger(AzureOpenAiProvider.name);
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly deploymentName: string;
  private readonly apiVersion: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT', '');
    this.apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY', '');
    this.deploymentName = this.configService.get<string>(
      'AZURE_OPENAI_DEPLOYMENT',
      'gpt-4o-mini',
    );
    this.apiVersion = this.configService.get<string>(
      'AZURE_OPENAI_API_VERSION',
      '2024-08-01-preview',
    );
  }

  async generate(options: AiGenerateOptions): Promise<AiGenerateResult> {
    const { system, user } = buildPrompt(options);

    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let response: globalThis.Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('AI生成がタイムアウトしました');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // エラーボディにはAPIキーやセンシティブ情報が含まれ得るため、ステータスのみログ出力
      this.logger.error(`Azure OpenAI error: ${response.status}`);
      throw new Error(`AI生成に失敗しました (${response.status})`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? '';

    return {
      text,
      model: this.deploymentName,
    };
  }

  async *generateStream(options: AiGenerateOptions): AsyncIterable<string> {
    const { system, user } = buildPrompt(options);

    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let response: globalThis.Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('AI生成ストリームがタイムアウトしました');
      }
      throw err;
    }

    if (!response.ok || !response.body) {
      clearTimeout(timeout);
      this.logger.error(`Azure OpenAI stream error: ${response.status}`);
      throw new Error(`AI生成ストリームに失敗しました (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') return;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // skip malformed JSON chunks
          }
        }
      }
    } finally {
      clearTimeout(timeout);
      reader.releaseLock();
    }
  }
}
