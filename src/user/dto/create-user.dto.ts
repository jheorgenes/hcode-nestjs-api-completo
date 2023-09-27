import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsStrongPassword } from "class-validator";
import { Role } from "src/enums/role.enum";


export class CreateUserDTO {

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  //Decorando password para validar somente se a senha tem 6 dígitos
  @IsString()
  @IsStrongPassword({
    minLength: 6,
    minNumbers: 0,
    minLowercase: 0,
    minUppercase: 0,
    minSymbols: 0
  })
  password: string;

  @IsOptional()
  @IsDateString()
  birthAt: string

  @IsOptional()
  @IsEnum(Role)
  role: number;

}