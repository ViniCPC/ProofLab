import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OpenAiResponse } from './ai.types';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class AiClient {
  private readonly logger = new Logger(AiClient.name);

  constructor(private readonly config: ConfigService) {}

  async call<T>(
    systemInstruction: string,
    input: string,
    schemaName: string,
    schema: object,
    guard: (value: unknown) => value is T,
  ): Promise<T> {
    const data = await this.fetchWithRetry(
      systemInstruction,
      input,
      schemaName,
      schema,
    );
    const text = this.extractOutputText(data);
    return this.parseAnalysis(text, guard);
  }

  private async fetchWithRetry(
    instructions: string,
    input: string,
    schemaName: string,
    schema: object,
  ): Promise<OpenAiResponse> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await this.fetchOpenAi(instructions, input, schemaName, schema);
      } catch (error) {
        lastError = error;

        if (
          error instanceof ServiceUnavailableException ||
          attempt === MAX_ATTEMPTS
        ) {
          throw error;
        }

        this.logger.warn(
          `OpenAI call failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }

    throw lastError;
  }

  private async fetchOpenAi(
    instructions: string,
    input: string,
    schemaName: string,
    schema: object,
  ): Promise<OpenAiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    let response: Response;

    try {
      response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        signal: controller.signal,
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
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new BadGatewayException(
          `OpenAI request timed out after ${REQUEST_TIMEOUT_MS}ms`,
        );
      }

      throw new BadGatewayException(
        `OpenAI request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timeout);
    }

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
