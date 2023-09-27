import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/user/user.service";


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    // @Inject(forwardRef(() => AuthService)) //Previnindo dependencias de módulos circulares
    private readonly authService: AuthService,
    // @Inject(forwardRef(() => UserService))
    private readonly userService: UserService  
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    try {
      const data = this.authService.checkToken((authorization ?? '').split(' ')[1]); //Separando o Bearer do token

      request.tokenPayload = data; //Criando um tokenPayload no objeto do request

      request.user = await this.userService.show(data.id); //Criando um user no objeto do request

      return true;
    } catch(e) {
      return false;
    }
  }
}