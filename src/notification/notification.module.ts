import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
