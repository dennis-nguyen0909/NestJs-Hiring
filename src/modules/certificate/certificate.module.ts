import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Certificate, CertificateSchema } from './schema/certificate.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
    ]),
    UsersModule,
  ],
  controllers: [CertificateController],
  providers: [CertificateService],
})
export class CertificateModule {}
