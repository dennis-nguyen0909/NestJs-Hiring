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
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private configService: ConfigService) {}
  // Hàm này chạy khi WebSocket server được khởi tạo
  afterInit(server: Server) {
    const websocketPort = this.configService.get<number>(
      'WEBSOCKET_PORT',
      8080,
    ); // Lấy biến môi trường với giá trị mặc định là 8080
    console.log('WebSocket server initialized on port:', websocketPort);
    console.log('WebSocket initialized');
  }

  // Hàm này chạy khi có client kết nối
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Hàm này chạy khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Hàm phát thông báo cho ứng viên khi nhà tuyển dụng xem hồ sơ
  async sendNotificationToCandidate(candidateId: string, message: string) {
    this.server.to(candidateId.toString()).emit('notification', message);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { userId: number }) {
    // Client join vào "room" riêng của họ (phòng theo ID của ứng viên)
    client.join(data.userId + '');
    console.log(`Client ${client.id} joined room: ${data.userId}`);
  }
}
