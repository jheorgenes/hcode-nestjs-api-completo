import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {

  private issuer = "login";
  private audience = "users";

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  //O parâmetro User é do tipo @prisma/client, pois no schema do Prisma há um User (tabela) especificada.
  createToken(user: User) {
    return {
      accessToken: this.jwtService.sign(
        { //payload
          id: user.id,
          name: user.name,
          email: user.email
        }, 
        { //optionals
          expiresIn: process.env.JWT_EXPIRES_IN, //Data de expiração do token
          subject: String(user.id), //Identificação do usuário
          issuer: this.issuer, //Qual é o emissor (iss: quem criou e assinou esse token)
          audience: this.audience, //Qual é o público (aud: a quem ou a que se destina o token)
          //notBefore: Math.ceil((Date.now() + 1000 * 60 * 60) / 1000) //Token válido somente depois de 1 hora a partir da hora atual
        }
      )
    }
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(
        token, 
        { //optionals do token
          issuer: this.issuer, //Verificando se o token possui esse mesmo emissor
          audience: this.audience, //Verificando se o token  possui o mesmo tipo de publico
        }
      );
      return data;
    } catch(e) {
      throw new BadRequestException(e);
    }
    
  }

  /** Validando o token */
  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email
      }
    });

    if(!user) {
      throw new UnauthorizedException('Email e/ou senha incorretos.');
    }

    // Verifica se a senha digitada é igual a senha que foi criptografada no banco
    if(!await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Email e/ou senha incorretos.');
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email
      }
    });

    if(!user) {
      throw new UnauthorizedException('Email incorreto.');
    }

    // TO DO: Enviar o e-mail

    return true;
  }

  async reset(password: string, token: string) {
    // TO DO: Validar o token..

    const id = 0;

    const user = await this.prisma.user.update({
      where: {
        id
      },
      data: {
        password
      }
    });

    return this.createToken(user);
  }

  // Registra o usuário, gera o token e retorna o mesmo
  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user); //Já está authenticado
  }
}