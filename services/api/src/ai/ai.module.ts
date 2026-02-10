import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AzureOpenAiProvider } from './azure-openai.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, AzureOpenAiProvider],
  exports: [AiService],
})
export class AiModule {}
