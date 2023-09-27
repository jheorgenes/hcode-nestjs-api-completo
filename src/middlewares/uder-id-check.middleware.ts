import { BadRequestException, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

export class UserIdCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {

    console.log('userIdCheckMiddleware', 'antes');
    
    
    if(isNaN(Number(req.params.id)) || Number(req.params.id) <= 0) {
      throw new BadRequestException('Id inválido!');
    }

    console.log('userIdCheckMiddleware', 'depois');

    next();
  }
}