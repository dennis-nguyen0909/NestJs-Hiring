import { Module } from '@nestjs/common';
import { SocialLinkService } from './social_link.service';
import { SocialLinkController } from './social_link.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialLink, SocialLinkSchema } from './schema/social_link.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SocialLink.name,
        schema: SocialLinkSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [SocialLinkController],
  providers: [SocialLinkService],
})
export class SocialLinkModule {}
