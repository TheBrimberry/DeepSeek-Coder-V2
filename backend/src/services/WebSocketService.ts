import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { AuthService } from './AuthService';
import { ChatModel } from '../models/ChatModel';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface WsMessage {
  type: string;
  payload: Record<string, unknown>;
}

export class WebSocketService {
  private static wss: WebSocketServer;
  private static clients = new Map<string, Set<AuthenticatedSocket>>();

  static init(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', async (ws: AuthenticatedSocket, req) => {
      // Authenticate via query param token
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      try {
        const payload = AuthService.verifyToken(token);
        ws.userId = payload.userId;
        ws.isAlive = true;

        // Track connected clients
        if (!this.clients.has(payload.userId)) {
          this.clients.set(payload.userId, new Set());
        }
        this.clients.get(payload.userId)!.add(ws);

        logger.debug(`WebSocket client connected: ${payload.userId}`);

        ws.on('pong', () => {
          ws.isAlive = true;
        });

        ws.on('message', async (data) => {
          try {
            const message: WsMessage = JSON.parse(data.toString());
            await this.handleMessage(ws, message);
          } catch (err) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
          }
        });

        ws.on('close', () => {
          if (ws.userId) {
            const userSockets = this.clients.get(ws.userId);
            if (userSockets) {
              userSockets.delete(ws);
              if (userSockets.size === 0) {
                this.clients.delete(ws.userId);
              }
            }
          }
          logger.debug(`WebSocket client disconnected: ${ws.userId}`);
        });

        // Send initial unread count
        const unreadCount = await ChatModel.getUnreadCount(payload.userId);
        ws.send(JSON.stringify({ type: 'unread_count', payload: { count: unreadCount } }));

      } catch {
        ws.close(4001, 'Invalid token');
      }
    });

    // Heartbeat interval
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedSocket) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });

    logger.info('WebSocket server initialized on /ws');
  }

  private static async handleMessage(ws: AuthenticatedSocket, message: WsMessage): Promise<void> {
    if (!ws.userId) return;

    switch (message.type) {
      case 'chat_message': {
        const { conversationId, body } = message.payload as { conversationId: string; body: string };
        if (!conversationId || !body) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'conversationId and body required' } }));
          return;
        }

        try {
          const msg = await ChatModel.sendMessage(conversationId, ws.userId, body as string);

          // Send to sender
          ws.send(JSON.stringify({ type: 'chat_message', payload: msg }));

          // Find the other participant and send to them
          const conversations = await ChatModel.getUserConversations(ws.userId, 1, 100);
          const conv = conversations.find((c: Record<string, unknown>) => c.id === conversationId);
          if (conv) {
            const otherUserId = conv.other_user_id as string;
            this.sendToUser(otherUserId, { type: 'chat_message', payload: msg });
          }
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Failed to send message' } }));
        }
        break;
      }

      case 'typing': {
        const { conversationId } = message.payload as { conversationId: string };
        // Notify the other participant
        const conversations = await ChatModel.getUserConversations(ws.userId, 1, 100);
        const conv = conversations.find((c: Record<string, unknown>) => c.id === conversationId);
        if (conv) {
          const otherUserId = conv.other_user_id as string;
          this.sendToUser(otherUserId, {
            type: 'typing',
            payload: { conversationId, userId: ws.userId },
          });
        }
        break;
      }

      case 'mark_read': {
        const { conversationId } = message.payload as { conversationId: string };
        await ChatModel.markAsRead(conversationId, ws.userId);
        ws.send(JSON.stringify({ type: 'read_confirmed', payload: { conversationId } }));
        break;
      }

      default:
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Unknown message type' } }));
    }
  }

  static sendToUser(userId: string, message: WsMessage): void {
    const sockets = this.clients.get(userId);
    if (sockets) {
      const data = JSON.stringify(message);
      sockets.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    }
  }

  static broadcastToAll(message: WsMessage): void {
    const data = JSON.stringify(message);
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }
}
