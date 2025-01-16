import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth()
@Public()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Créer un utilisateur
  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Récupérer tous les utilisateurs
  @Get()
  @Roles('admin')
  findAll() {
    return this.userService.findAll();
  }

  // Récupérer tous les clubs
  @Get('clubs')
  findClubs() {
    return this.userService.findClubs();
  }

  // Récupérer tous les étudiants
  @Get('students')
  findStudents() {
    return this.userService.findStudents();
  }

  // Récupérer un utilisateur par son ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Mettre à jour un utilisateur
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // Supprimer un utilisateur
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Changer le mot de passe d'un utilisateur
  @Patch('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    return await this.userService.changePassword(id, changePasswordDto);
  }

  // Ajouter un membre à un club
  @Post(':clubId/members')
  @Roles('admin', 'club')
  async addMember(
    @Param('clubId') clubId: string,
    @Body('studentId') studentId: string,
    @Body('memberRole') memberRole?: string,
  ) {
    return this.userService.addMember(clubId, studentId, memberRole);
  }

  // Retirer un membre d'un club
  @Delete(':clubId/members/:studentId')
  @Roles('admin', 'club')
  async removeMember(
    @Param('clubId') clubId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.userService.removeMember(clubId, studentId);
  }

  // Récupérer les membres d'un club
  @Get(':clubId/members')
  @Public()
  async getMembers(@Param('clubId') clubId: string) {
    return this.userService.getMembers(clubId);
  }

  // Récupérer les étudiants qui ne sont pas membres d'un club
  @Get(':clubId/non-members')
  @Public()
  async getNonMembers(@Param('clubId') clubId: string) {
    return this.userService.getNonMembers(clubId);
  }

  // Récupérer les clubs auxquels un étudiant appartient
  @Get(':studentId/clubs')
  @Public()
  async getClubsByUserId(@Param('studentId') studentId: string) {
    return this.userService.getClubsByUserId(studentId);
  }

  // Uploader une image pour un club
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadImage(userId, file);
  }
}
