import { Controller, Post, Get, Body, Req, Res, UseGuards, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AiService } from './ai.service';
import { AiGenerateDto } from './dto/ai-generate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Get('status')
  getStatus() {
    return { enabled: this.aiService.isEnabled() };
  }

  @Post('generate')
  async generate(@Body() dto: AiGenerateDto) {
    return this.aiService.generate(dto);
  }

  @Post('generate/stream')
  async generateStream(
    @Body() dto: AiGenerateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // クライアント切断検知
    let clientDisconnected = false;
    req.on('close', () => {
      clientDisconnected = true;
    });

    try {
      for await (const chunk of this.aiService.generateStream(dto)) {
        if (clientDisconnected) break;
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      if (!clientDisconnected) {
        res.write('data: [DONE]\n\n');
      }
    } catch (error) {
      this.logger.warn(
        `AI stream error: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      if (!clientDisconnected) {
        const message = error instanceof Error ? error.message : 'AI生成に失敗しました';
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      }
    } finally {
      res.end();
    }
  }
}
