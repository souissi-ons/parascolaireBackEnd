import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'The name of the event',
    example: 'Tech Conference 2024',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The start date and time of the event',
    example: '2025-12-20 10:00',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  startDateTime: Date;

  @ApiProperty({
    description: 'The end date and time of the event',
    example: '2025-12-21 12:00',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  endDateTime: Date;

  @ApiProperty({
    description: 'URL of the event image',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    description: 'ID of the room where the event will take place',
    example: '64f8b5e1e4b0d9a8f8f8f8f8', // Exemple d'ObjectId MongoDB
  })
  @IsString()
  @IsNotEmpty()
  roomId: string; // Changé de number à string

  @ApiProperty({
    description: 'ID of the event organizer',
    example: '64f8b5e1e4b0d9a8f8f8f8f9', // Exemple d'ObjectId MongoDB
  })
  @IsString()
  @IsNotEmpty()
  organizerId: string; // Changé de number à string

  @ApiProperty({
    description: 'Description of the event',
    example: 'A conference about the latest in tech.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Status of the event',
    example: 'pending',
    enum: ['pending', 'confirmed', 'canceled', 'refused'],
    default: 'pending',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'confirmed', 'canceled', 'refused'], {
    message:
      'Le statut doit être soit pending, confirmed, canceled ou refused.',
  })
  status?: string = 'pending';

  @ApiProperty({
    description: 'Indicates whether the event is private or not',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  private: boolean = false;
}
