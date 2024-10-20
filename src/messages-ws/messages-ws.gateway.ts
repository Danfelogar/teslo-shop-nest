import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

// @WebSocketGateway({ cors: true }) //se agrega el cors para que se pueda conectar desde cualquier lado, el decorador sirve para definir un gateway de websocket donde getaway es un punto de entrada para la comunicación de websocket
@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      console.error({ error });
      client.disconnect();
      return;
    }

    // console.log({ payload });
    // console.log('client connected', client.id, { args });
    // this.messagesWsService.registerClient(client, payload.id);

    console.log({
      // connectedClients: this.messagesWsService.getConnectedClients(),
      // client: token,
      args,
    });
    // le voy a emitir a todo el mundo,entonces cada que un cliente se conecta le emitirá el servidor un evento a todos los clientes conectados
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('client disconnected', client.id);
    this.messagesWsService.removeClient(client.id);

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );

    // console.log({
    //   connectedClients: this.messagesWsService.getConnectedClients(),
    // });
  }

  //opción para escuchar eventos desde nestjs para que asi se escuchen eventos del cliente recuerda que el string que se le pasa debe ser único para que se pueda escuchar si tienes 2 eventos con el mismo nombre se tomara el primero que encuentre
  @SubscribeMessage('message-from-client')
  async onMessageFormCLient(client: Socket, payload: NewMessageDto) {
    // console.log({ clientId: client.id, payload });
    //para emitir al cliente que se conecto
    // client.emit('message-from-server', {
    //   fullName: `It's me, Danfelogar!`,
    //   message: payload.message,
    // });

    //message-from-server para regresar el mensaje al cliente, broadcast es para transmitirle a todo el mundo menos la persona que lo envió
    // client.broadcast.emit('message-from-server', {
    //   fullName: `It's me, Danfelogar!`,
    //   message: payload.message,
    // });

    //emitir a todos los clientes conectados
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'No message provided',
    });
  }
}
