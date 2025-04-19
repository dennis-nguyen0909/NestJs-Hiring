import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsHexColor,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyStatusDto {
  @ApiProperty({
    description: 'Name of the status',
    example: 'Review CV',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of what this status means',
    example: 'CV is being reviewed by the hiring team',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Order in which this status appears in the workflow',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: 'Color code for the status (for UI display)',
    example: '#FF0000',
    required: false,
  })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Whether this status is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
