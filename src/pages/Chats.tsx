import { useCallback, useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { getPublicService } from '../lib/services';
import { getOrCreateConversation, listChatConversations, listChatMessages, markChatMessagesRead, profileDisplayName, searchChatUsers, sendChatMessage, SERVICE_REQUEST_MESSAGE, subscribeToChat } from '../lib/chat';
import type { ChatConversation, ChatMessage, ChatProfile } from '../types/chat';

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-PA', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function Chats({ initialServiceId = '' }: { initialServiceId?: string }) {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ChatProfile[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;

  const refreshConversations = useCallback(async (selectFirst = false) => {
    if (!session) return;
    const result = await listChatConversations(session.user.id);
    if (result.error) setStatus('No se pudieron cargar tus conversaciones.');
    setConversations(result.data);
    if (selectFirst && result.data[0]) setSelectedId(result.data[0].id);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void listChatConversations(session.user.id).then((result) => {
      if (!active) return;
      setConversations(result.data);
      if (result.error) setStatus('No se pudieron cargar tus conversaciones.');
      setSelectedId((current) => current || result.data[0]?.id || '');
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!session || search.trim().length < 2) {
      return undefined;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      void searchChatUsers(search, session.user.id).then((result) => {
        if (active) setResults(result.data ?? []);
      });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [search, session]);

  useEffect(() => {
    if (!session || !initialServiceId) return;
    let active = true;
    void getPublicService(initialServiceId).then(async ({ data }) => {
      if (!active || !data) return;
      if (data.owner_id === session.user.id) {
        setStatus('No puedes solicitar tu propio servicio.');
        return;
      }
      const result = await getOrCreateConversation(session.user.id, data.owner_id, data.id);
      if (!active || result.error || !result.data) {
        setStatus('No se pudo abrir la solicitud de servicio.');
        return;
      }
      if (result.created) await sendChatMessage(result.data, session.user.id, SERVICE_REQUEST_MESSAGE);
      setSelectedId(result.data.id);
      await refreshConversations();
    });
    return () => { active = false; };
  }, [initialServiceId, refreshConversations, session]);

  useEffect(() => {
    if (!session || !selectedId) {
      return undefined;
    }
    let active = true;
    const loadMessages = async () => {
      const result = await listChatMessages(selectedId);
      if (!active) return;
      setMessages(result.data ?? []);
      await markChatMessagesRead(selectedId, session.user.id);
      await refreshConversations();
    };
    void loadMessages();
    const unsubscribe = subscribeToChat(selectedId, () => { void loadMessages(); });
    return () => { active = false; unsubscribe(); };
  }, [refreshConversations, selectedId, session]);

  async function openDirectChat(profile: ChatProfile) {
    if (!session) return;
    const result = await getOrCreateConversation(session.user.id, profile.id);
    if (result.error || !result.data) {
      setStatus('No se pudo abrir la conversación.');
      return;
    }
    setSelectedId(result.data.id);
    setSearch('');
    setResults([]);
    await refreshConversations();
  }

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !selected || !draft.trim()) return;
    setIsSending(true);
    const result = await sendChatMessage(selected, session.user.id, draft.trim());
    if (result.error) setStatus('No se pudo enviar el mensaje.');
    else setDraft('');
    setIsSending(false);
    await refreshConversations();
    const latest = await listChatMessages(selected.id);
    setMessages(latest.data ?? []);
  }

  if (!session) return null;

  return (
    <section className="mx-auto min-h-[700px] w-[calc(100%-48px)] max-w-7xl py-10">
      <div className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b32ca]">Comunicación directa</p><h1 className="mt-2 text-4xl font-bold max-sm:text-3xl">Tus chats</h1><p className="mt-2 max-w-2xl text-base text-[#676878]">Solicita servicios, conversa con estudiantes y mantén tus conversaciones organizadas.</p></div>
      {status && <p className="mb-4 rounded-lg bg-[#f0edff] p-3 text-sm text-[#6040b5]" role="status">{status}</p>}
      <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-[#faf9ff] p-4">
          <label className="text-sm font-semibold" htmlFor="chat-search">Buscar usuario</label>
          <input className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" id="chat-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o username" />
          {search.trim().length >= 2 && results.length > 0 && <div className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-white p-2">{results.map((profile) => <button className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left hover:bg-[#f0edff]" key={profile.id} type="button" onClick={() => void openDirectChat(profile)}>{profile.avatar_url ? <img className="h-9 w-9 rounded-full object-cover" src={profile.avatar_url} alt="" /> : <span className="h-9 w-9 rounded-full bg-[#e8e1ff]" /> }<span><strong className="block text-sm">{profileDisplayName(profile)}</strong><small className="text-xs text-[#676878]">@{profile.username ?? 'usuario'}</small></span></button>)}</div>}
          <div className="mt-6 flex items-center justify-between"><h2 className="text-sm font-semibold">Conversaciones</h2><span className="text-xs text-[#676878]">{conversations.length}</span></div>
          <div className="mt-2 space-y-1">{isLoading ? <p className="p-3 text-sm text-[#676878]">Cargando chats...</p> : conversations.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-[#676878]">Busca un usuario o solicita un servicio para iniciar una conversación.</p> : conversations.map((conversation) => <button className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left ${selectedId === conversation.id ? 'bg-[#eeeaff]' : 'hover:bg-[#f0edff]'}`} key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)}>{conversation.otherProfile?.avatar_url ? <img className="h-10 w-10 rounded-full object-cover" src={conversation.otherProfile.avatar_url} alt="" /> : <span className="h-10 w-10 rounded-full bg-[#ddd5f8]" />}<span className="min-w-0"><strong className="block truncate text-sm">{profileDisplayName(conversation.otherProfile)}</strong><small className="block truncate text-xs text-[#676878]">{conversation.serviceTitle ?? 'Mensaje directo'}</small></span>{conversation.unreadCount > 0 && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7b32ca] px-1 text-[10px] font-semibold text-white">{conversation.unreadCount}</span>}</button>)}</div>
        </aside>
        <article className="flex min-h-[560px] min-w-0 flex-col">
          {selected ? <><header className="flex items-center gap-3 border-b border-slate-200 p-5">{selected.otherProfile?.avatar_url ? <img className="h-11 w-11 rounded-full object-cover" src={selected.otherProfile.avatar_url} alt="" /> : <span className="h-11 w-11 rounded-full bg-[#e8e1ff]" />}<div><h2 className="font-semibold">{profileDisplayName(selected.otherProfile)}</h2><p className="text-sm text-[#676878]">{selected.serviceTitle ? `Solicitud: ${selected.serviceTitle}` : 'Conversación directa'}</p></div></header><div className="flex-1 space-y-3 overflow-y-auto bg-[#fcfbff] p-5">{messages.length === 0 ? <p className="py-16 text-center text-sm text-[#676878]">Escribe el primer mensaje de esta conversación.</p> : messages.map((message) => <div className={`flex ${message.sender_id === session.user.id ? 'justify-end' : 'justify-start'}`} key={message.id}><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === session.user.id ? 'rounded-br-sm bg-[#7b32ca] text-white' : 'rounded-bl-sm border border-slate-200 bg-white'}`}><p className="whitespace-pre-wrap">{message.body}</p><time className={`mt-1 block text-[10px] ${message.sender_id === session.user.id ? 'text-white/70' : 'text-[#676878]'}`}>{formatTime(message.created_at)}</time></div></div>)}</div><form className="flex gap-3 border-t border-slate-200 p-4 max-sm:flex-col" onSubmit={submitMessage}><textarea className="min-h-12 flex-1 resize-none rounded-lg border border-slate-200 p-3 text-sm" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} required placeholder="Escribe un mensaje..." /><Button className="self-end max-sm:w-full" type="submit" disabled={isSending}>{isSending ? 'Enviando...' : 'Enviar'}</Button></form></> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#7b32ca]"><Mail aria-hidden="true" className="h-8 w-8" /></div><h2 className="mt-5 text-xl font-semibold">Selecciona una conversación</h2><p className="mt-2 max-w-sm text-sm text-[#676878]">Busca a otro estudiante por su nombre o username para comenzar.</p></div>}
        </article>
      </div>
    </section>
  );
}
