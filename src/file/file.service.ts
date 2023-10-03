import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';

@Injectable()
export class FileService {
  async upload(file: Express.Multer.File, path: string) {
    //Salvando o arquivo no diretório passado
    return writeFile(path, file.buffer); //Informando o caminho e o file.buffer (que é o arquivo em sí)
  }
}
