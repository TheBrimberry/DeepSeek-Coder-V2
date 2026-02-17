import { Request, Response } from 'express';
import { ChatModel } from '../models/ChatModel';

export class ChatController {
  static async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const conversations = await ChatModel.getUserConversations(req.user!.userId, page, limit);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  static async startConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }
      if (userId === req.user!.userId) {
        res.status(400).json({ error: 'Cannot start conversation with yourself' });
        return;
      }

      const conversation = await ChatModel.getOrCreateConversation(req.user!.userId, userId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start conversation' });
    }
  }

  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const messages = await ChatModel.getMessages(req.params.conversationId, req.user!.userId, page, limit);
      if (messages === null) {
        res.status(403).json({ error: 'Not a participant in this conversation' });
        return;
      }

      // Mark messages as read
      await ChatModel.markAsRead(req.params.conversationId, req.user!.userId);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { body } = req.body;
      if (!body || !body.trim()) {
        res.status(400).json({ error: 'Message body is required' });
        return;
      }

      const message = await ChatModel.sendMessage(
        req.params.conversationId,
        req.user!.userId,
        body.trim()
      );
      res.status(201).json(message);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send message';
      res.status(400).json({ error: msg });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      await ChatModel.markAsRead(req.params.conversationId, req.user!.userId);
      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await ChatModel.getUnreadCount(req.user!.userId);
      res.json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }

  static async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await ChatModel.deleteConversation(req.params.conversationId, req.user!.userId);
      if (!deleted) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      res.json({ message: 'Conversation deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }
}
