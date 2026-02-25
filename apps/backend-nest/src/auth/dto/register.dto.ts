import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const MIN_PASSWORD_LENGTH = 6;
const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_PASSWORD_LENGTH)
  @Matches(PASSWORD_RULE, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters with uppercase, lowercase and number`,
  })
  password!: string;
}
