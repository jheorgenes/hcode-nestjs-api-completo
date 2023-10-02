import { Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { User } from "src/decorators/user.decorator";
import { FileService } from "src/file/file.service";
import { AuthGuard } from "src/guards/auth.guard";
import { AuthService } from "./auth.service";
import { AuthForgetDTO } from "./dto/auth-forget.dto";
import { AuthLoginDTO } from "./dto/auth-login.dto";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { AuthResetDTO } from "./dto/auth-reset.dto";

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDTO) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async reset(@Body() { password, token }: AuthResetDTO) {
    return this.authService.reset(password, token);
  }

  /** Vai executar o guard antes de fazer essa requisição e vai validar o token e retornar o usuário */
  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User('id') user) { //Decorator próprio, pode ou não receber parametros para filtrar
    return { user };
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Post('photo')
  async uploadPhoto(
    @User() user, 
    @UploadedFile(new ParseFilePipe({ //Pipe de validação de arquivos
      validators: [
        new FileTypeValidator({fileType: 'image/png'}), //Validação de tipo de arquivo
        new MaxFileSizeValidator({maxSize: 1024 * 50}) //Validação de tamanho do arquivo
      ]
    })
  ) photo: Express.Multer.File) { 
    // Para fazer um upload em uma API externa (amazon, google, etc)
    // Fazer a chamada (via axios ou outra ferramenta) e mandar o arquivo para ser salvo nessa requisição

    //Para fazer o upload em um diretório local
    const { path, fileName } = await this.authService.uploadPhoto(user, photo);
    return { sucess: true, path: path, fileName: fileName };
  }


  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Post('files')
  async uploadFiles(
    @User() user, 
    @UploadedFiles(new ParseFilePipe({
      validators: [
        new FileTypeValidator({fileType: '^(image/png|image/jpeg)$'}),
        new MaxFileSizeValidator({maxSize: 1024 * 50})
      ]
    })) files: Express.Multer.File[]
  ) { 
    let filesSaved = [];
    for(let file of files) {
      const { path, fileName } = await this.authService.uploadFile(user, file);
      filesSaved.push({ path, fileName });
    }
    return { sucess: true, files: filesSaved };
  }

  @UseInterceptors(FileFieldsInterceptor([
    {
      name: 'photo',
      maxCount: 1
    },
    {
      name: 'documents',
      maxCount: 10
    }
  ]))
  @UseGuards(AuthGuard)
  @Post('files-fields')
  async uploadFilesFields(
    @User() user, 
    @UploadedFiles() files: { photo: Express.Multer.File, documents: Express.Multer.File[] }
  ) { 

    const { photo, documents } = files;
    let filesSaved = [];
    // photo is array
    const { path, fileName } = await this.authService.uploadFile(user, photo[0]);
    filesSaved.push({ path, fileName });

    for(let file of documents) {
      const { path, fileName } = await this.authService.uploadFile(user, file);
      filesSaved.push({ path, fileName });
    }

    return { sucess: true, files: filesSaved };
  }
}