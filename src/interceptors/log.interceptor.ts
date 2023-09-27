import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

export class LogInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {

    const dt = Date.now();

    return next
            .handle() //Executando o manipulador da rota
            .pipe( //Depois vai executar..
              tap(() => { //Pegar o retorno, passa pelo tubo e depois continua retornando o mesmo código do manipulador de rota
                const request = context.switchToHttp().getRequest();

                console.log(`URL: ${request.url}`);
                console.log(`METHOD: ${request.method}`);
                console.log(`Execução levou:  ${Date.now() - dt} millisegundos.`);
              }
            ));

  }
  
}