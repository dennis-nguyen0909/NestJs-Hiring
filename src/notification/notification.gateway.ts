import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5137',
      'https://frontend-hiring-minhduys-projects.vercel.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'], // Sử dụng transport WebSocket
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private configService: ConfigService) {}

  // Chạy khi WebSocket server được khởi tạo
  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  // Chạy khi có client kết nối
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Chạy khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Phát thông báo cho ứng viên khi nhà tuyển dụng xem hồ sơ
  async sendNotificationToCandidate(candidateId: string, message: string) {
    this.server.to(candidateId.toString()).emit('notification', message);
  }

  async sendNotificationToEmployer(employerId: string, message: string) {
    this.server
      .to(employerId.toString())
      .emit('notification-employer', message);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { userId: number }) {
    client.join(data.userId + '');
    console.log(`Client ${client.id} joined room: ${data.userId}`);
  }
}
