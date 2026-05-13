import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

const emptyStringToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class CreateLiveDto {
  @IsUUID()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsOptional()
  @Transform(emptyStringToNull)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime?: string | null;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  liveUrl: string;

  @IsOptional()
  @Transform(emptyStringToNull)
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  replayUrl?: string | null;

  @IsOptional()
  @Transform(emptyStringToNull)
  @IsString()
  @MaxLength(2048)
  coverImageUrl?: string | null;
}
