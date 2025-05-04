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
import { CvUploadModule } from './modules/cv-upload/cv-upload.module';
import { ApplicationModule } from './modules/application/application.module';
import { AuthProviderModule } from './modules/auth-provider/auth-provider.module';
import { FollowModule } from './modules/follow/follow.module';
import { LevelModule } from './modules/level/level.module';
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
import { PrizeModule } from './modules/prize/prize.module';
import { CourseModule } from './modules/course/course.module';
import { ProjectModule } from './modules/project/project.module';
import { CvModule } from './modules/cv/cv.module';
import { FavoriteJobModule } from './modules/favorite-job/favorite-job.module';
import { JobTypeModule } from './modules/job-type/job-type.module';
import { JobContractTypeModule } from './modules/job-contract-type/job-contract-type.module';
import { DegreeTypeModule } from './modules/degree-type/degree-type.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { SocialLinkModule } from './modules/social_link/social_link.module';
import { OrganizationTypeModule } from './modules/organization_type/organization_type.module';
import { IndustryTypeModule } from './modules/industry_type/industry_type.module';
import { TeamsizeModule } from './modules/teamsize/teamsize.module';
import { NotificationGateway } from './notification/notification.gateway';
import { NotificationModule } from './notification/notification.module';
import { LogModule } from './log/log.module';
import { PackageModule } from './modules/package/package.module';
import { PurchaseHistoryModule } from './modules/purchase-history/purchase-history.module';
import { MonthlyUsageModule } from './modules/monthly-usage/monthly-usage.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');

        // Log URI ra terminal để kiểm tra
        console.log('MongoDB URI:', uri);

        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   connectionName: logConnection,
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGODB_URI_LOG'),
    //   }),
    //   inject: [ConfigService],
    // }),

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
    CvUploadModule,
    ApplicationModule,
    AuthProviderModule,
    FollowModule,
    LevelModule,
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
    PrizeModule,
    CourseModule,
    ProjectModule,
    CvModule,
    FavoriteJobModule,
    JobTypeModule,
    JobContractTypeModule,
    DegreeTypeModule,
    CurrenciesModule,
    SocialLinkModule,
    OrganizationTypeModule,
    IndustryTypeModule,
    TeamsizeModule,
    NotificationModule,
    LogModule,
    PackageModule,
    PurchaseHistoryModule,
    MonthlyUsageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    NotificationGateway,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TransformInterceptor,
    // },
  ],
})
export class AppModule {}
