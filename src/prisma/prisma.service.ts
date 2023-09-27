import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  async onModuleInit() {
    await this.$connect();
  }

  //Fechando a conexão
  async enableShutdownHooks(app: INestApplication) { //Usando a aplicação que foi criada (que é um INestApplication)
    process.on('beforeExit', async () => { //Antes de finalizar o prismaClient
      await app.close(); //Fecha a conexão com o banco
    });
  }

}