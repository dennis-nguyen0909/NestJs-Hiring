import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway(8080, {
  cors: {
    origin: 'http://localhost:5137', // Địa chỉ client ReactJS
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  // Hàm này chạy khi WebSocket server được khởi tạo
  afterInit(server: Server) {
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
