import { ApiProperty } from '@nestjs/swagger';
import type { RiskLevel } from '../ai.types';

class AnalysisResponseDto {
  @ApiProperty({ type: String })
  summary!: string;

  @ApiProperty({ type: String })
  recommendation!: string;

  @ApiProperty({ enum: ['openai', 'unavailable'] })
  source!: 'openai' | 'unavailable';
}

export class ResearchAnalysisResponseDto extends AnalysisResponseDto {
  @ApiProperty({ type: Number, minimum: 0, maximum: 100, nullable: true })
  innovationScore!: number | null;

  @ApiProperty({ type: Number, minimum: 0, maximum: 100, nullable: true })
  feasibilityScore!: number | null;

  @ApiProperty({
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    nullable: true,
  })
  riskLevel!: RiskLevel | null;

  @ApiProperty({
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    nullable: true,
  })
  complexityLevel!: RiskLevel | null;
}

export class MilestoneAnalysisResponseDto extends AnalysisResponseDto {
  @ApiProperty({ type: Number, minimum: 0, maximum: 100, nullable: true })
  consistencyScore!: number | null;

  @ApiProperty({ type: Number, minimum: 0, maximum: 100, nullable: true })
  completionEstimate!: number | null;

  @ApiProperty({
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    nullable: true,
  })
  riskLevel!: RiskLevel | null;
}
