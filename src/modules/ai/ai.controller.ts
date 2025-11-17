import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService, UnifiedSearchResult, ChatResponse, TextProcessResponse } from './ai.service';
import { SearchKeywordDto } from './dto/search-keyword.dto';
import { ChatDto } from './dto/chat.dto';
import { SummarizeDto } from './dto/summarize.dto';
import { ExpandDto } from './dto/expand.dto';
import { RewriteDto } from './dto/rewrite.dto';
import { GenerateDto } from './dto/generate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * AI控制器
 * 提供关键词搜索和AI聊天接口
 */
@ApiTags('AI服务')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}


  /**
   * AI聊天
   * @param chatDto - 聊天参数
   * @returns AI响应
   */
  @Post('chat')
  @ApiOperation({ summary: 'AI聊天' })
  @ApiResponse({ status: 200, description: '聊天成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async chat(@Body() chatDto: ChatDto): Promise<ChatResponse> {
    return this.aiService.chat(chatDto);
  }

  /**
   * 总结内容
   * @param summarizeDto - 总结参数
   * @returns 总结结果
   */
  @Post('summarize')
  @ApiOperation({ summary: '总结内容' })
  @ApiResponse({ status: 200, description: '总结成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async summarize(@Body() summarizeDto: SummarizeDto): Promise<TextProcessResponse> {
    return this.aiService.summarize(summarizeDto);
  }

  /**
   * 扩写内容
   * @param expandDto - 扩写参数
   * @returns 扩写结果
   */
  @Post('expand')
  @ApiOperation({ summary: '扩写内容' })
  @ApiResponse({ status: 200, description: '扩写成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async expand(@Body() expandDto: ExpandDto): Promise<TextProcessResponse> {
    return this.aiService.expand(expandDto);
  }

  /**
   * 改写内容
   * @param rewriteDto - 改写参数
   * @returns 改写结果
   */
  @Post('rewrite')
  @ApiOperation({ summary: '改写内容' })
  @ApiResponse({ status: 200, description: '改写成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async rewrite(@Body() rewriteDto: RewriteDto): Promise<TextProcessResponse> {
    return this.aiService.rewrite(rewriteDto);
  }

  /**
   * 根据提示词生成内容
   * @param generateDto - 生成参数
   * @returns 生成结果
   */
  @Post('generate')
  @ApiOperation({ summary: '根据提示词生成内容' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async generate(@Body() generateDto: GenerateDto): Promise<TextProcessResponse> {
    return this.aiService.generate(generateDto);
  }
}
