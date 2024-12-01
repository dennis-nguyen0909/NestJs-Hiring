import { PartialType } from '@nestjs/swagger';
import { CreateJobContractTypeDto } from './create-job-contract-type.dto';

export class UpdateJobContractTypeDto extends PartialType(CreateJobContractTypeDto) {}
