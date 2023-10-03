import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  forwardRef,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserIdCheckMiddleware } from './middlewares/uder-id-check.middleware';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    ConfigModule.forRoot(), //Pra usar o .env
    ThrottlerModule.forRoot({
      //Modulo regulador de pressão (Sobrecarga de acesso a rotas ou ataque DDS)
      ttl: 60, //tempo de um recurso a outro
      limit: 100, //Limite de quantidade de acessos
      // ignoreUserAgents: [/googlebot/gi] //Ignorando indexação do googlebot por exemplo
    }),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    MailerModule.forRoot({
      // transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      // defaults: {
      //   from: '"nest-modules" <modules@nestjs.com>'
      // },
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'cora.damore86@ethereal.email',
          pass: 'Cm8u9TTqgxX1UmqyD3',
        },
      },
      defaults: {
        from: '"Hcode" <cora.damore86@ethereal.email>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      //Configuração de providers para regular (Throttler) todas as rotas, limitando a quantidade de acessos conforme definido na importação desse módulo
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //Aplicando middleware para consumo
    consumer
      .apply(UserIdCheckMiddleware) //Aplicando esse middleware
      .forRoutes({
        //Para todas as rotas que atende a condição abaixo
        path: 'users/:id', //Que tenha essa rota
        method: RequestMethod.ALL, //E tenha todos esses métodos
      });
  }
}
