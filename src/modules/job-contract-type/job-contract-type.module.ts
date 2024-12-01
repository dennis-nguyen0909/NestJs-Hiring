import { Module } from '@nestjs/common';
import { JobContractTypeService } from './job-contract-type.service';
import { JobContractTypeController } from './job-contract-type.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobContractType,
  JobContractTypeSchema,
} from './schema/job-contract-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: JobContractType.name,
        schema: JobContractTypeSchema,
      },
    ]),
  ],
  controllers: [JobContractTypeController],
  providers: [JobContractTypeService],
})
export class JobContractTypeModule {}
