import { IsString, MinLength } from 'class-validator';

/** Body for POST /api/ai/ask — a single natural-language question. */
export class AskDto {
  @IsString()
  @MinLength(1)
  question!: string;
}
