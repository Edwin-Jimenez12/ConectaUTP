export interface ChatProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface ChatConversationRow {
  id: string;
  service_id: string | null;
  participant_one_id: string;
  participant_two_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation extends ChatConversationRow {
  otherProfile: ChatProfile | null;
  serviceTitle: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string | null;
  service_id: string | null;
  sender_id: string;
  body: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}
