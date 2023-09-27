import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards/auth.guard";
import { AuthService } from "./auth.service";
import { AuthForgetDTO } from "./dto/auth-forget.dto";
import { AuthLoginDTO } from "./dto/auth-login.dto";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { AuthResetDTO } from "./dto/auth-reset.dto";
import { User } from "src/decorators/user.decorator";

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService
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
}