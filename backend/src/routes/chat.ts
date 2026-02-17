import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

router.get('/conversations', ChatController.getConversations);
router.post('/conversations', ChatController.startConversation);
router.get('/conversations/:conversationId/messages', ChatController.getMessages);
router.post('/conversations/:conversationId/messages', ChatController.sendMessage);
router.put('/conversations/:conversationId/read', ChatController.markAsRead);
router.delete('/conversations/:conversationId', ChatController.deleteConversation);
router.get('/unread', ChatController.getUnreadCount);

export default router;
