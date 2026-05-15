import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OpenAiResponse } from './ai.types';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

@Injectable()
export class AiClient {
  constructor(private readonly config: ConfigService) {}

  async call<T>(
    systemInstruction: string,
    input: string,
    schemaName: string,
    schema: object,
    guard: (value: unknown) => value is T,
  ): Promise<T> {
    const data = await this.fetchOpenAi(
      systemInstruction,
      input,
      schemaName,
      schema,
    );
    const text = this.extractOutputText(data);
    return this.parseAnalysis(text, guard);
  }

  private async fetchOpenAi(
    instructions: string,
    input: string,
    schemaName: string,
    schema: object,
  ): Promise<OpenAiResponse> {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.getModel(),
        instructions,
        input,
        max_output_tokens: 700,
        store: false,
        text: {
          format: {
            type: 'json_schema',
            name: schemaName,
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new BadGatewayException(
        `OpenAI request failed: ${await response.text()}`,
      );
    }

    const data = (await response.json()) as OpenAiResponse;

    if (data.error?.message) {
      throw new BadGatewayException(data.error.message);
    }

    if (data.status && data.status !== 'completed') {
      throw new BadGatewayException(`OpenAI response status: ${data.status}`);
    }

    return data;
  }

  private extractOutputText(data: OpenAiResponse): string {
    if (data.output_text) {
      return data.output_text;
    }

    const text = data.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text' && content.text)?.text;

    if (!text) {
      throw new BadGatewayException('OpenAI response did not include text');
    }

    return text;
  }

  private parseAnalysis<T>(
    output: string,
    guard: (value: unknown) => value is T,
  ): T {
    let parsed: unknown;

    try {
      parsed = JSON.parse(output);
    } catch {
      throw new BadGatewayException('OpenAI response was not valid JSON');
    }

    if (!guard(parsed)) {
      throw new BadGatewayException(
        'OpenAI response did not match the expected schema',
      );
    }

    return parsed;
  }

  private getApiKey(): string {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('OPENAI_API_KEY is not configured');
    }

    return apiKey;
  }

  private getModel(): string {
    return this.config.get<string>('OPENAI_MODEL') ?? 'gpt-5.4-mini';
  }
}
