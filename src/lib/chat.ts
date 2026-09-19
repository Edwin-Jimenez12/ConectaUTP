import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { ChatConversation, ChatConversationRow, ChatMessage, ChatProfile } from '../types/chat';

export const SERVICE_REQUEST_MESSAGE = 'Hola, me interesa el servicio, ¿podría darme más información?';

export async function searchChatUsers(query: string, currentUserId: string) {
  const safeQuery = query.trim().replace(/[%,()]/g, ' ');
  if (safeQuery.length < 2) return { data: [] as ChatProfile[], error: null };

  return supabase
    .from('public_profiles')
    .select('id, username, first_name, last_name, avatar_url')
    .neq('id', currentUserId)
    .or(`username.ilike.%${safeQuery}%,first_name.ilike.%${safeQuery}%,last_name.ilike.%${safeQuery}%`)
    .limit(12) as unknown as Promise<PostgrestSingleResponse<ChatProfile[]>>;
}

export async function listChatConversations(userId: string) {
  const result = await supabase
    .from('chat_conversations')
    .select('*')
    .or(`participant_one_id.eq.${userId},participant_two_id.eq.${userId}`)
    .order('updated_at', { ascending: false }) as unknown as PostgrestSingleResponse<ChatConversationRow[]>;
  if (result.error) return { data: [] as ChatConversation[], error: result.error };

  const rows = result.data ?? [];
  const profileIds = rows.map((row) => row.participant_one_id === userId ? row.participant_two_id : row.participant_one_id);
  const serviceIds = rows.flatMap((row) => row.service_id ? [row.service_id] : []);
  const conversationIds = rows.map((row) => row.id);
  const [profilesResult, servicesResult] = await Promise.all([
    profileIds.length ? supabase.from('public_profiles').select('id, username, first_name, last_name, avatar_url').in('id', profileIds) : Promise.resolve({ data: [], error: null }),
    serviceIds.length ? supabase.from('services').select('id, title').in('id', serviceIds) : Promise.resolve({ data: [], error: null }),
  ]);
  const unreadResult = conversationIds.length
    ? await supabase.from('service_messages').select('conversation_id').in('conversation_id', conversationIds).neq('sender_id', userId).eq('status', 'unread')
    : { data: [], error: null };
  const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile as ChatProfile]));
  const services = new Map((servicesResult.data ?? []).map((service) => [service.id, service.title as string]));
  const unreadCounts = new Map<string, number>();
  for (const message of unreadResult.data ?? []) unreadCounts.set(message.conversation_id, (unreadCounts.get(message.conversation_id) ?? 0) + 1);

  return {
    data: rows.map((row) => {
      const otherId = row.participant_one_id === userId ? row.participant_two_id : row.participant_one_id;
      return { ...row, otherProfile: profiles.get(otherId) ?? null, serviceTitle: row.service_id ? services.get(row.service_id) ?? 'Servicio solicitado' : null, unreadCount: unreadCounts.get(row.id) ?? 0 };
    }),
    error: profilesResult.error ?? servicesResult.error ?? unreadResult.error,
  };
}

async function findConversation(oneId: string, twoId: string, serviceId: string | null) {
  const [participantOneId, participantTwoId] = [oneId, twoId].sort();
  const query = supabase
    .from('chat_conversations')
    .select('*')
    .eq('participant_one_id', participantOneId)
    .eq('participant_two_id', participantTwoId);
  return (serviceId ? query.eq('service_id', serviceId) : query.is('service_id', null)).maybeSingle() as unknown as Promise<PostgrestSingleResponse<ChatConversationRow>>;
}

export async function getOrCreateConversation(userId: string, otherUserId: string, serviceId: string | null = null) {
  const existing = await findConversation(userId, otherUserId, serviceId);
  if (existing.error && existing.error.code !== 'PGRST116') return { data: null, created: false, error: existing.error };
  if (existing.data) return { data: existing.data, created: false, error: null };

  const [participantOneId, participantTwoId] = [userId, otherUserId].sort();
  const created = await supabase.from('chat_conversations').insert({
    service_id: serviceId,
    participant_one_id: participantOneId,
    participant_two_id: participantTwoId,
  }).select().single() as unknown as PostgrestSingleResponse<ChatConversationRow>;
  if (!created.error) return { data: created.data, created: true, error: null };
  if (created.error.code === '23505') {
    const concurrent = await findConversation(userId, otherUserId, serviceId);
    return { data: concurrent.data, created: false, error: concurrent.error };
  }
  return { data: null, created: false, error: created.error };
}

export function listChatMessages(conversationId: string) {
  return supabase
    .from('service_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at') as unknown as Promise<PostgrestSingleResponse<ChatMessage[]>>;
}

export function sendChatMessage(conversation: ChatConversationRow, senderId: string, body: string) {
  return supabase.from('service_messages').insert({
    conversation_id: conversation.id,
    service_id: conversation.service_id,
    sender_id: senderId,
    body,
  });
}

export function markChatMessagesRead(conversationId: string, userId: string) {
  return supabase
    .from('service_messages')
    .update({ status: 'read' })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('status', 'unread');
}

export function subscribeToChat(conversationId: string, onChange: () => void) {
  const channel = supabase
    .channel(`chat-${conversationId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_messages', filter: `conversation_id=eq.${conversationId}` }, () => onChange())
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}

export function profileDisplayName(profile: ChatProfile | null) {
  if (!profile) return 'Usuario';
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || `@${profile.username ?? 'usuario'}`;
}
