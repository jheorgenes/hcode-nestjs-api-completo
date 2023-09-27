import { ExecutionContext, NotFoundException, createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const request = context
                      .switchToHttp()
                      .getRequest();

                      
    //Se na requisição tiver o atributo usuário, retorna o usuário. Senão, retorna a exception
    if(request.user) {
      if(filter) {
        return request.user[filter];
      } else {
        return request.user;
      }
    } else {
      throw new NotFoundException("Usuário não encontrado no request. Use o AuthGuard para obter o usuário");
    }
  }
);