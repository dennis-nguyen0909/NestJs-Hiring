import { Module } from '@nestjs/common';
import { OrganizationTypeService } from './organization_type.service';
import { OrganizationTypeController } from './organization_type.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OrganizationType,
  OrganizationTypeSchema,
} from './schema/organization_type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OrganizationType.name,
        schema: OrganizationTypeSchema,
      },
    ]),
  ],
  controllers: [OrganizationTypeController],
  providers: [OrganizationTypeService],
})
export class OrganizationTypeModule {}
