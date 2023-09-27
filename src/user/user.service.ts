import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdatePutUserDTO } from "./dto/update-put-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDTO) {

    const salt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, salt);

    return this.prisma.user.create({
      data
    });
  }

  async list() {
    return this.prisma.user.findMany();
  }

  async show(id: number) {

    await this.exitsUser(id);

    return this.prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  async update(id: number, { name, email, password, birthAt, role }: UpdatePutUserDTO) {

    await this.exitsUser(id);

    const salt = await bcrypt.genSalt();

    password = await bcrypt.hash(password, salt);
    
    return this.prisma.user.update({
      where: {
        id
      },
      data: { 
        name, 
        email, 
        password, 
        birthAt: birthAt ? new Date(birthAt) : null,
        role
      },
    });
  }

  async updatePartial(id: number,  { name, email, password, birthAt, role }: UpdatePatchUserDTO) {

    await this.exitsUser(id);

    const data: any = {};

    if(birthAt) {
      data.birthAt = new Date(birthAt);
    }

    if(email) {
      data.email = email;
    }

    if(name) {
      data.name = name;
    }

    if(password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(password, salt);
    }

    if(role) {
      data.role = role;
    }

    return this.prisma.user.update({
      where: {
        id
      },
      data
    });
  }

  async delete(id: number) {

    await this.exitsUser(id);

    return this.prisma.user.delete({
      where: {
        id
      }
    });
  }

  private async exitsUser(id: number) {

    /** verifica se no banco existe pelo menos 1 user com esse id. */
    if (!(await this.prisma.user.count({
      where: {
        id
      }
    }))) {
      throw new NotFoundException(`O usuário ${id} não existe.`);
    }
  }
}