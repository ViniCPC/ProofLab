import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiClient } from './ai.client';
import { AiService } from './ai.service';

const research = {
  title: 'Research',
  description: 'A proposal',
  totalAmount: '1000',
};
const milestone = {
  promisedDescription: 'Experiment',
  submittedReport: 'Report',
  progress: 80,
  evidenceText: 'Results',
};

function createService(apiKey?: string) {
  const config = { get: () => apiKey } as unknown as ConfigService;
  const client = new AiClient(config);
  return { service: new AiService(client), client };
}

describe('AiService availability', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([undefined, '', '   '])(
    'returns an honest fallback without a key (%s)',
    async (apiKey) => {
      const { service } = createService(apiKey);
      const fetchSpy = jest.spyOn(global, 'fetch');
      const result = await service.analyzeResearch(research);

      expect(result.source).toBe('unavailable');
      expect(result.innovationScore).toBeNull();
      expect(result.feasibilityScore).toBeNull();
      expect(result.riskLevel).toBeNull();
      expect(result.summary).toContain('indisponível');
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

  it('does not mistake reported progress for AI-validated completion', async () => {
    const { service } = createService();
    const fetchSpy = jest.spyOn(global, 'fetch');
    const result = await service.analyzeMilestone(milestone);

    expect(result.source).toBe('unavailable');
    expect(result.completionEstimate).toBeNull();
    expect(result.consistencyScore).toBeNull();
    expect(result.recommendation).toContain('Não houve validação');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('still uses the configured provider and identifies the response', async () => {
    const { service, client } = createService('test-key');
    const analysis = {
      summary: 'Review',
      recommendation: 'Manual review',
      innovationScore: 60,
      feasibilityScore: 70,
      riskLevel: 'MEDIUM',
      complexityLevel: 'LOW',
    };
    const call = jest.spyOn(client, 'call').mockResolvedValue(analysis);

    expect(await service.analyzeResearch(research)).toEqual({
      ...analysis,
      source: 'openai',
    });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('does not conceal provider failures behind the missing-key fallback', async () => {
    const { service, client } = createService('test-key');
    jest
      .spyOn(client, 'call')
      .mockRejectedValue(new BadGatewayException('Provider down'));

    await expect(service.analyzeResearch(research)).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('keeps per-wallet rate limiting for both real and unavailable analysis', async () => {
    const { service } = createService();
    for (let index = 0; index < 5; index++) {
      await service.analyzeResearch(research, 'wallet-a');
    }

    await expect(
      service.analyzeResearch(research, 'wallet-a'),
    ).rejects.toMatchObject({ status: 429 });
    await expect(
      service.analyzeResearch(research, 'wallet-b'),
    ).resolves.toMatchObject({ source: 'unavailable' });
  });
});
