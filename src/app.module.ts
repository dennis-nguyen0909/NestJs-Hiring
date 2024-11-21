import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/passport/jwt-auth-guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { JobModule } from './modules/job/job.module';
import { CvModule } from './modules/cv/cv.module';
import { CvUploadModule } from './modules/cv-upload/cv-upload.module';
import { ApplicationModule } from './modules/application/application.module';
import { AuthProviderModule } from './modules/auth-provider/auth-provider.module';
import { FollowModule } from './modules/follow/follow.module';
import { LevelModule } from './modules/level/level.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RoleModule } from './modules/role/role.module';
import { SkillModule } from './modules/skill/skill.module';
import { WorkExperienceModule } from './modules/work-experience/work-experience.module';
import { EducationModule } from './modules/education/education.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SmsModule } from './sms/sms.module';
import { MajorModule } from './modules/major/major.module';
import { CitiesModule } from './modules/cities/cities.module';
import { WardsModule } from './modules/wards/wards.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { SkillEmployerModule } from './modules/skill_employer/skill.module';
import { SaveCandidatesModule } from './modules/save_candidates/save_candidates.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { CertificateModule } from './modules/certificate/certificate.module';
@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAILER_HOST'),
          port: configService.get<number>('MAILER_PORT'),
          secure: true,
          ignoreTLS: true,
          auth: {
            user: configService.get<string>('MAILER_USER'),
            pass: configService.get<string>('MAILER_PASS'),
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    JobModule,
    CvModule,
    CvUploadModule,
    ApplicationModule,
    AuthProviderModule,
    FollowModule,
    LevelModule,
    NotificationModule,
    RoleModule,
    SkillModule,
    WorkExperienceModule,
    EducationModule,
    CloudinaryModule,
    SmsModule,
    MajorModule,
    CitiesModule,
    WardsModule,
    DistrictsModule,
    SkillEmployerModule,
    SaveCandidatesModule,
    OrganizationModule,
    CertificateModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TransformInterceptor,
    // },
  ],
})
export class AppModule {}
