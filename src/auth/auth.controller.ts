import { BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { join } from 'path';
import { User } from "src/decorators/user.decorator";
import { FileService } from "src/file/file.service";
import { AuthGuard } from "src/guards/auth.guard";
import { v4 as uuid } from 'uuid';
import { AuthService } from "./auth.service";
import { AuthForgetDTO } from "./dto/auth-forget.dto";
import { AuthLoginDTO } from "./dto/auth-login.dto";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { AuthResetDTO } from "./dto/auth-reset.dto";

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDTO) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async reset(@Body() { password, token }: AuthResetDTO) {
    return this.authService.reset(password, token);
  }

  /** Vai executar o guard antes de fazer essa requisição e vai validar o token e retornar o usuário */
  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User('id') user) { //Decorator próprio, pode ou não receber parametros para filtrar
    return { user };
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Post('photo')
  async uploadPhoto(@User() user, @UploadedFile() photo: Express.Multer.File) { 

    // Para fazer um upload em uma API externa (amazon, google, etc)
    // Fazer a chamada (via axios ou outra ferramenta) e mandar o arquivo para ser salvo nessa requisição

    //Para fazer o upload em um diretório local
    const nameFile = `photo-${uuid()}-userId-${user.id}.png`;
    const path = join(__dirname, '..', '..', 'storage', 'photos', nameFile);

    try {
      await this.fileService.upload(photo, path);
    } catch (e) {
      throw new BadRequestException(e);
    }

    return { sucess: true, path: path, nameFile: nameFile };
  }
}