import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    PrismaModule, 
    forwardRef(() => AuthModule) //forwardRef previne dependencias em loop infinito (circular dependencies)
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}