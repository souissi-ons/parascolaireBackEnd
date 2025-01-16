import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The full name of the user or club',
    example: 'Ahmed Ahmed',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est obligatoire.' })
  fullName: string;

  @ApiProperty({
    description: 'The phone number of the user (must contain exactly 8 digits)',
    example: '12345678',
  })
  @Matches(/^\d{8}$/, {
    message: 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
  })
  @IsNotEmpty({ message: 'Le numéro de téléphone est obligatoire.' })
  phone: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'ahmed.ahmed@example.com',
  })
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  @IsNotEmpty({ message: "L'email est obligatoire." })
  email: string;

  password: string;

  @ApiProperty({
    description: 'The role of the user (admin, student, or club)',
    example: 'admin',
    enum: ['admin', 'student', 'club'],
  })
  @IsNotEmpty({ message: 'Le rôle est obligatoire.' })
  @IsIn(['admin', 'student', 'club'], {
    message: 'Le rôle doit être soit admin, student ou club.',
  })
  role: string;
}
