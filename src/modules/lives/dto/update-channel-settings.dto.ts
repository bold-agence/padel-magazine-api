import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

const emptyStringToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class UpdateChannelSettingsDto {
  @IsOptional()
  @Transform(emptyStringToNull)
  @IsString()
  @MaxLength(240)
  channelName?: string | null;

  @IsOptional()
  @Transform(emptyStringToNull)
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  channelUrl?: string | null;
}
