import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from "class-validator";
import { Role } from "../../users/roles.enum";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
