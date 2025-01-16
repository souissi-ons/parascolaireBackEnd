import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({
    description: 'The number of the classroom',
    example: '101', // Déjà compatible avec MongoDB
  })
  @IsString()
  @IsNotEmpty({ message: 'Le num de salle est obligatoire.' })
  num: string;

  @ApiProperty({
    description: 'The capacity of the classroom (number of people it can hold)',
    example: 30, // Déjà compatible avec MongoDB
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'La capacité de salle est obligatoire.' })
  capacity: number;

  @ApiProperty({
    description: 'Whether the classroom is available for booking',
    example: true, // Déjà compatible avec MongoDB
    default: true,
    required: false,
  })
  @IsBoolean()
  available?: boolean = true;
}
