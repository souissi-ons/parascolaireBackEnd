import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestClassroomDto {
  @ApiProperty({
    description: 'Start date and time of the request',
    example: '2024-12-25 10:00',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty({ message: 'La date de début est obligatoire.' })
  startDateTime: Date;

  @ApiProperty({
    description: 'End date and time of the request',
    example: '2024-12-25 12:00',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty({ message: 'La date de fin est obligatoire.' })
  endDateTime: Date;

  @ApiProperty({
    description: 'ID of the requested room',
    example: '64f8b5e1e4b0d9a8f8f8f8f8', // Exemple d'ObjectId MongoDB
  })
  @IsString()
  @IsNotEmpty({ message: 'La salle est obligatoire.' })
  roomId: string; // Changé de number à string

  @ApiProperty({
    description: 'ID of the user making the request',
    example: '64f8b5e1e4b0d9a8f8f8f8f9', // Exemple d'ObjectId MongoDB
  })
  @IsString()
  @IsNotEmpty({ message: "L'utilisateur est obligatoire." })
  requestedBy: string; // Changé de number à string

  @ApiProperty({
    description: 'Reason for the classroom request',
    example: 'For a team meeting',
  })
  @IsString()
  @IsNotEmpty({ message: 'La raison de la demande est obligatoire.' })
  reason: string;

  @ApiProperty({
    description: 'Status of the request',
    example: 'pending',
    enum: ['pending', 'confirmed', 'canceled', 'refused'],
    default: 'pending',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'confirmed', 'canceled', 'refused'], {
    message:
      'Le statut doit être soit pending, confirmed, canceled ou refused.',
  })
  status?: string = 'pending';
}
