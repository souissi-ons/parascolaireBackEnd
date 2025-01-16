import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { generateRandomPassword } from 'src/utils/password.util';
import { sendEmail } from 'src/utils/email.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Types } from 'mongoose';
import { User } from './schemas/user.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // Créer un utilisateur
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this email or phone number already exists',
      );
    }

    // Générer un mot de passe aléatoire
    const randomPassword = generateRandomPassword();

    // Hasher le mot de passe avant de le sauvegarder
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
    createUserDto.password = hashedPassword;

    const newUser = new this.userModel(createUserDto);
    await newUser.save();
    await sendEmail(
      createUserDto.email,
      'Welcome! Here is your password',
      `Welcome to our platform! Your auto-generated password is: ${randomPassword}`,
    );
    return newUser;
  }

  // Récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Récupérer tous les étudiants
  async findStudents(): Promise<User[]> {
    return this.userModel.find({ role: 'student' }).exec();
  }

  // Récupérer tous les clubs
  async findClubs(): Promise<User[]> {
    return this.userModel.find({ role: 'club' }).exec();
  }

  // Récupérer un utilisateur par son ID
  async findOne(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userModel.findById(new Types.ObjectId(id)).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  // Récupérer un utilisateur par son email
  async findEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  // Mettre à jour un utilisateur
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if ('password' in updateUserDto || 'role' in updateUserDto) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: 'Updating password or role is not allowed. ',
          },
          HttpStatus.CONFLICT,
        );
      }
      const existingUser = await this.findOne(id);

      if (updateUserDto.email) {
        const otherUser = await this.userModel.findOne({
          email: updateUserDto.email,
          _id: { $ne: id },
        });

        if (otherUser) {
          throw new HttpException(
            {
              status: HttpStatus.CONFLICT,
              message: 'User with this email already exists. ',
            },
            HttpStatus.CONFLICT,
          );
        }
      }
      const updatedUser = await this.userModel
        .findByIdAndUpdate(new Types.ObjectId(id), updateUserDto, { new: true })
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return updatedUser;
    } catch (error) {
      console.log('Error updating user:', error.message);
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  // Supprimer un utilisateur
  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  // Changer le mot de passe d'un utilisateur
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    const user = await this.findOne(id);

    // Valider le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Vérifier que le nouveau mot de passe correspond à la confirmation
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );

    // Mettre à jour le mot de passe
    user.password = hashedNewPassword;
    await user.save();

    return 'Password successfully updated';
  }

  // Ajouter un membre à un club
  async addMember(
    clubId: string,
    studentId: string,
    memberRole: string = 'member', // Rôle par défaut
  ): Promise<User> {
    const club = await this.findOne(clubId);
    if (club.role !== 'club') {
      throw new HttpException(
        'User must have the role "club" to add members',
        HttpStatus.CONFLICT,
      );
    }

    const student = await this.findOne(studentId);
    if (student.role !== 'student') {
      throw new HttpException(
        'User must have the role "student" to be added as a member',
        HttpStatus.CONFLICT,
      );
    }

    // Vérifier si l'étudiant est déjà membre du club
    const isMember = club.members.some(
      (member) => member.memberId.toString() === studentId,
    );
    if (isMember) {
      throw new HttpException(
        'Student is already a member of this club',
        HttpStatus.CONFLICT,
      );
    }

    // Convertir student._id en ObjectId
    let memberId: Types.ObjectId;
    if (typeof student._id === 'string') {
      memberId = new Types.ObjectId(student._id);
    } else if (student._id instanceof Types.ObjectId) {
      memberId = student._id;
    } else {
      throw new HttpException(
        'Invalid student ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Ajouter l'étudiant comme membre
    club.members.push({
      memberId,
      memberRole,
      memberSince: new Date(),
    });

    return club.save();
  }

  // Retirer un membre d'un club
  async removeMember(clubId: string, studentId: string): Promise<User> {
    const club = await this.findOne(clubId);
    if (club.role !== 'club') {
      throw new HttpException(
        'User must have the role "club" to remove members',
        HttpStatus.CONFLICT,
      );
    }

    // Retirer l'étudiant de la liste des membres
    club.members = club.members.filter(
      (member) => member.memberId.toString() !== studentId,
    );

    return club.save();
  }

  // Récupérer les membres d'un club
  async getMembers(clubId: string): Promise<User[]> {
    const club = await this.findOne(clubId);
    if (club.role !== 'club') {
      throw new HttpException(
        'User must have the role "club" to get members',
        HttpStatus.CONFLICT,
      );
    }

    // Récupérer les membres du club
    const memberIds = club.members.map((member) => member.memberId);
    return this.userModel.find({ _id: { $in: memberIds } }).exec();
  }

  // Récupérer les étudiants qui ne sont pas membres d'un club
  async getNonMembers(clubId: string): Promise<User[]> {
    const club = await this.findOne(clubId);
    if (club.role !== 'club') {
      throw new HttpException(
        'User must have the role "club" to get non-members',
        HttpStatus.CONFLICT,
      );
    }

    // Récupérer tous les étudiants
    const students = await this.findStudents();

    // Récupérer les membres du club
    const memberIds = club.members.map((member) => member.memberId.toString());

    // Filtrer les étudiants qui ne sont pas membres
    return students.filter(
      (student) => !memberIds.includes(student._id.toString()),
    );
  }

  // Récupérer les clubs auxquels un étudiant appartient
  async getClubsByUserId(studentId: string): Promise<User[]> {
    const student = await this.findOne(studentId);
    if (student.role !== 'student') {
      throw new HttpException(
        'User must have the role "student" to get clubs',
        HttpStatus.CONFLICT,
      );
    }

    // Récupérer les clubs où l'étudiant est membre
    return this.userModel
      .find({ role: 'club', 'members.memberId': student._id })
      .exec();
  }

  // Uploader une image pour un club
  async uploadImage(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Créer le dossier "uploads" s'il n'existe pas
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, file.buffer);

    // Mettre à jour l'URL de l'image dans la base de données
    user.clubLogo = `/uploads/${fileName}`;
    return user.save();
  }
}
