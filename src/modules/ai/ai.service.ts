import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Target } from '../target/entities/target.entity';
import { Task } from '../target/entities/task.entity';
import { Creation } from '../creation/entities/creation.entity';
import { SearchKeywordDto } from './dto/search-keyword.dto';
import { ChatDto } from './dto/chat.dto';
import { SummarizeDto } from './dto/summarize.dto';
import { ExpandDto } from './dto/expand.dto';
import { RewriteDto } from './dto/rewrite.dto';
import { GenerateDto } from './dto/generate.dto';
import axios, { AxiosInstance } from 'axios';

/**
 * 搜索结果接口
 */
export interface SearchResult {
  type: string;
  data: any[];
  total: number;
}

/**
 * 统一搜索结果接口
 */
export interface UnifiedSearchResult {
  results: SearchResult[];
  total: number;
}

/**
 * AI聊天响应接口
 */
export interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI文本处理响应接口
 */
export interface TextProcessResponse {
  result: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI服务
 * 提供关键词搜索和AI聊天功能
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private httpClient: AxiosInstance | null = null;
  private apiKey: string | null = null;
  private baseURL: string;
  private model: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Target)
    private targetRepository: Repository<Target>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Creation)
    private creationRepository: Repository<Creation>,
    private readonly configService: ConfigService,
  ) {
    this.initializeHttpClient();
  }

  /**
   * 初始化HTTP客户端
   */
  private initializeHttpClient(): void {
    this.apiKey = this.configService.get<string>('ARK_API_KEY') || this.configService.get<string>('COZE_API_KEY');
    this.baseURL = this.configService.get<string>('ARK_BASE_URL', 'https://ark.cn-beijing.volces.com/api/v3');
    this.model = this.configService.get<string>('ARK_MODEL', 'doubao-seed-1-6-flash-250828');
    if (this.apiKey) {
      this.httpClient = axios.create({
        baseURL: this.baseURL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('火山引擎AI客户端初始化成功');
    } else {
      this.logger.warn('ARK_API_KEY未配置，AI聊天功能将不可用');
    }
  }


  /**
   * AI聊天
   * @param chatDto - 聊天参数
   * @returns AI响应
   */
  async chat(chatDto: ChatDto): Promise<ChatResponse> {
    const { message, history = [], systemPrompt } = chatDto;
    try {
      if (!this.httpClient || !this.apiKey) {
        throw new BadRequestException('AI服务未配置，请检查ARK_API_KEY环境变量');
      }
      const aiResponse = await this.callDoubaoAI(message, history, systemPrompt);
      return {
        message: aiResponse.content,
        usage: aiResponse.usage ? {
          promptTokens: aiResponse.usage.prompt_tokens || 0,
          completionTokens: aiResponse.usage.completion_tokens || 0,
          totalTokens: aiResponse.usage.total_tokens || 0,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('AI聊天失败:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('AI聊天服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 总结内容
   * @param summarizeDto - 总结参数
   * @returns 总结结果
   */
  async summarize(summarizeDto: SummarizeDto): Promise<TextProcessResponse> {
    const { content, length = 200, style } = summarizeDto;
    try {
      if (!this.httpClient || !this.apiKey) {
        throw new BadRequestException('AI服务未配置，请检查ARK_API_KEY环境变量');
      }
      let systemPrompt = `你是一个专业的文本总结助手。请对用户提供的内容进行总结。`;
      if (style) {
        systemPrompt += `总结风格：${style}。`;
      }
      systemPrompt += `总结长度控制在约${length}字左右。只返回总结内容，不要添加其他说明。`;
      const userMessage = `请总结以下内容：\n\n${content}`;
      const aiResponse = await this.callDoubaoAI(userMessage, [], systemPrompt);
      return {
        result: aiResponse.content,
        usage: aiResponse.usage ? {
          promptTokens: aiResponse.usage.prompt_tokens,
          completionTokens: aiResponse.usage.completion_tokens,
          totalTokens: aiResponse.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('内容总结失败:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('内容总结服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 扩写内容
   * @param expandDto - 扩写参数
   * @returns 扩写结果
   */
  async expand(expandDto: ExpandDto): Promise<TextProcessResponse> {
    const { content, targetLength, direction } = expandDto;
    try {
      if (!this.httpClient || !this.apiKey) {
        throw new BadRequestException('AI服务未配置，请检查ARK_API_KEY环境变量');
      }
      let systemPrompt = `你是一个专业的文本扩写助手。请对用户提供的内容进行扩写，使其更加丰富和详细。`;
      if (direction) {
        systemPrompt += `扩写方向：${direction}。`;
      }
      if (targetLength) {
        systemPrompt += `目标长度：约${targetLength}字。`;
      }
      systemPrompt += `保持原文的核心意思，只扩写内容，不要添加其他说明。`;
      const userMessage = `请扩写以下内容：\n\n${content}`;
      const aiResponse = await this.callDoubaoAI(userMessage, [], systemPrompt);
      return {
        result: aiResponse.content,
        usage: aiResponse.usage ? {
          promptTokens: aiResponse.usage.prompt_tokens,
          completionTokens: aiResponse.usage.completion_tokens,
          totalTokens: aiResponse.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('内容扩写失败:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('内容扩写服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 改写内容
   * @param rewriteDto - 改写参数
   * @returns 改写结果
   */
  async rewrite(rewriteDto: RewriteDto): Promise<TextProcessResponse> {
    const { content, style, requirements } = rewriteDto;
    try {
      if (!this.httpClient || !this.apiKey) {
        throw new BadRequestException('AI服务未配置，请检查ARK_API_KEY环境变量');
      }
      let systemPrompt = `你是一个专业的文本改写助手。请对用户提供的内容进行改写。`;
      const styleMap: Record<string, string> = {
        formal: '使用正式、规范的表达方式',
        casual: '使用随意、轻松的表达方式',
        professional: '使用专业、严谨的表达方式',
        simple: '使用简洁、明了的表达方式',
        elaborate: '使用详细、丰富的表达方式',
      };
      if (style && styleMap[style]) {
        systemPrompt += `改写风格：${styleMap[style]}。`;
      }
      if (requirements) {
        systemPrompt += `其他要求：${requirements}。`;
      }
      systemPrompt += `保持原文的核心意思和主要信息，只改写表达方式，不要添加其他说明。`;
      const userMessage = `请改写以下内容：\n\n${content}`;
      const aiResponse = await this.callDoubaoAI(userMessage, [], systemPrompt);
      return {
        result: aiResponse.content,
        usage: aiResponse.usage ? {
          promptTokens: aiResponse.usage.prompt_tokens,
          completionTokens: aiResponse.usage.completion_tokens,
          totalTokens: aiResponse.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('内容改写失败:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('内容改写服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 根据提示词生成内容
   * @param generateDto - 生成参数
   * @returns 生成结果
   */
  async generate(generateDto: GenerateDto): Promise<TextProcessResponse> {
    const { prompt, length = 1000, contentType, keywords } = generateDto;
    try {
      if (!this.httpClient || !this.apiKey) {
        throw new BadRequestException('AI服务未配置，请检查ARK_API_KEY环境变量');
      }
      let systemPrompt = `你是一个专业的内容创作助手。根据用户的提示词和要求，创作高质量的内容。`;
      if (contentType) {
        systemPrompt += `内容类型：${contentType}。`;
      }
      if (keywords) {
        systemPrompt += `主题关键词：${keywords}。`;
      }
      systemPrompt += `内容长度控制在约${length}字左右。直接返回生成的内容，不要添加其他说明。`;
      const userMessage = prompt;
      const aiResponse = await this.callDoubaoAI(userMessage, [], systemPrompt);
      return {
        result: aiResponse.content,
        usage: aiResponse.usage ? {
          promptTokens: aiResponse.usage.prompt_tokens,
          completionTokens: aiResponse.usage.completion_tokens,
          totalTokens: aiResponse.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('内容生成失败:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('内容生成服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 格式化消息内容
   * 将字符串或数组格式转换为火山引擎API要求的格式
   */
  private formatMessageContent(
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
  ): string | Array<{ type: string; text?: string; image_url?: { url: string } }> {
    if (typeof content === 'string') {
      return content;
    }
    return content.map(item => {
      if (item.type === 'text') {
        return { type: 'text', text: item.text || '' };
      }
      if (item.type === 'image_url' && item.image_url) {
        return { type: 'image_url', image_url: { url: item.image_url.url } };
      }
      return item;
    });
  }

  /**
   * 调用火山引擎豆包AI
   */
  private async callDoubaoAI(
    message: string | Array<{ type: string; text?: string; image_url?: { url: string } }>,
    history: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>,
    systemPrompt?: string,
  ): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    try {
      if (!this.httpClient || !this.apiKey) {
        throw new BadRequestException('AI服务未配置');
      }
      const messages: Array<{ 
        role: 'system' | 'user' | 'assistant'; 
        content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> 
      }> = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      const formattedHistory = history.map(item => {
        const role = item.role as 'user' | 'assistant';
        return {
          role,
          content: this.formatMessageContent(item.content),
        };
      });
      messages.push(...formattedHistory);
      const formattedMessage = this.formatMessageContent(message);
      messages.push({ role: 'user', content: formattedMessage });
      const requestBody = {
        model: this.model,
        messages: messages,
        thinking: {
          type: 'disabled',
        },
        temperature: 0.7,
        max_tokens: 2000,
      };
      const startTime = Date.now();
      const response = await this.httpClient.post(
        '/chat/completions',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.logger.log(`AI聊天耗时: ${duration}ms`);
      const choice = response.data.choices?.[0];
      if (!choice || !choice.message) {
        throw new BadRequestException('AI服务返回了空响应');
      }
      let content: string;
      if (typeof choice.message.content === 'string') {
        content = choice.message.content;
      } else if (Array.isArray(choice.message.content)) {
        content = choice.message.content
          .map((item: any) => {
            if (item.type === 'text' && item.text) {
              return item.text;
            }
            return '';
          })
          .join('');
      } else {
        content = JSON.stringify(choice.message.content);
      }
      return {
        content,
        usage: response.data.usage ? {
          prompt_tokens: response.data.usage.prompt_tokens || 0,
          completion_tokens: response.data.usage.completion_tokens || 0,
          total_tokens: response.data.usage.total_tokens || 0,
        } : undefined,
      };
    } catch (error) {
      this.logger.error('调用火山引擎AI失败:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new BadRequestException(`AI服务调用失败: ${errorMessage}`);
      }
      if (error instanceof Error) {
        throw new BadRequestException(`AI服务调用失败: ${error.message}`);
      }
      throw new BadRequestException('AI服务调用失败，请检查配置');
    }
  }
}
