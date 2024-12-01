import { Module } from '@nestjs/common';
import { DegreeTypeService } from './degree-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DegreeType, DegreeTypeSchema } from './schema/degree-type.schema';
import { DegreeTypeController } from './degree-type.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DegreeType.name,
        schema: DegreeTypeSchema,
      },
    ]),
  ],
  controllers: [DegreeTypeController],
  providers: [DegreeTypeService],
})
export class DegreeTypeModule {}
