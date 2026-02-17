import { query } from '../config/database';

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: Date | null;
  created_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: Date;
}

export class ChatModel {
  static async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    // Check if conversation exists (in either direction)
    const existing = await query(
      `SELECT * FROM conversations
       WHERE (participant1_id = $1 AND participant2_id = $2)
          OR (participant1_id = $2 AND participant2_id = $1)`,
      [user1Id, user2Id]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await query(
      `INSERT INTO conversations (participant1_id, participant2_id) VALUES ($1, $2) RETURNING *`,
      [user1Id, user2Id]
    );
    return result.rows[0];
  }

  static async getUserConversations(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT c.*,
        CASE WHEN c.participant1_id = $1 THEN p2.display_name ELSE p1.display_name END as other_display_name,
        CASE WHEN c.participant1_id = $1 THEN u2.username ELSE u1.username END as other_username,
        CASE WHEN c.participant1_id = $1 THEN pr2.avatar_url ELSE pr1.avatar_url END as other_avatar_url,
        CASE WHEN c.participant1_id = $1 THEN c.participant2_id ELSE c.participant1_id END as other_user_id,
        m.body as last_message_body,
        m.sender_id as last_message_sender_id,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
       FROM conversations c
       LEFT JOIN users u1 ON u1.id = c.participant1_id
       LEFT JOIN users u2 ON u2.id = c.participant2_id
       LEFT JOIN profiles p1 ON p1.user_id = c.participant1_id
       LEFT JOIN profiles p2 ON p2.user_id = c.participant2_id
       LEFT JOIN profiles pr1 ON pr1.user_id = c.participant1_id
       LEFT JOIN profiles pr2 ON pr2.user_id = c.participant2_id
       LEFT JOIN LATERAL (
         SELECT body, sender_id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
       ) m ON true
       WHERE c.participant1_id = $1 OR c.participant2_id = $1
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify user is a participant
    const conv = await query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, userId]
    );
    if (conv.rows.length === 0) return null;

    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT m.*, u.username as sender_username
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return result.rows;
  }

  static async sendMessage(conversationId: string, senderId: string, body: string): Promise<Message> {
    // Verify sender is a participant
    const conv = await query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, senderId]
    );
    if (conv.rows.length === 0) {
      throw new Error('Not a participant in this conversation');
    }

    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, senderId, body]
    );

    await query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [conversationId]
    );

    return result.rows[0];
  }

  static async markAsRead(conversationId: string, userId: string): Promise<void> {
    await query(
      `UPDATE messages SET is_read = true
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
      [conversationId, userId]
    );
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
         AND m.sender_id != $1 AND m.is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  static async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
