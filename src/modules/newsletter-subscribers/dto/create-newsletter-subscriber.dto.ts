import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true;
  }
  if (value === false || value === 'false' || value === 0 || value === '0') {
    return false;
  }
  return value;
};

export class CreateNewsletterSubscriberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(240)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @Transform(toBoolean)
  @IsBoolean()
  @Equals(true, {
    message: 'L’acceptation des communications par e-mail est obligatoire',
  })
  acceptsEmails: boolean;

  @Transform(toBoolean)
  @IsBoolean()
  acceptsPrintMagazine: boolean;
}
