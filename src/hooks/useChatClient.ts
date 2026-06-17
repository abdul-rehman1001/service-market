'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conversation, Message } from '@/components/chat/types';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

interface UseChatClientOptions {
  initialBookingId?: string | null;
  cacheNamespace?: string;
}

interface UseChatClientResult {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  currentUserId: string;
  loading: boolean;
  sending: boolean;
  error: string | null;
  selectConversation: (conversationId: string) => void;
  sendMessage: (content: string, bookingId: string) => Promise<void>;
  refreshConversations: (force?: boolean) => Promise<void>;
}

const STALE_MS = 30_000; // how long before we refetch conversations

const isBrowser = () => typeof window !== 'undefined';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const getStorage = (): StorageLike | null => {
  if (!isBrowser()) {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn('Session storage unavailable:', error);
    return null;
  }
};

const readJSON = <T,>(storage: StorageLike | null, key: string, fallback: T): T => {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn('Failed to parse JSON from storage', { key, error });
    return fallback;
  }
};

const readString = (storage: StorageLike | null, key: string): string | null => {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch (error) {
    console.warn('Failed to read string from storage', { key, error });
    return null;
  }
};

const readNumber = (storage: StorageLike | null, key: string, fallback = 0): number => {
  const raw = readString(storage, key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const writeJSON = (storage: StorageLike | null, key: string, value: unknown) => {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to persist JSON to storage', { key, error });
  }
};

const writeString = (storage: StorageLike | null, key: string, value: string | null) => {
  if (!storage) return;
  try {
    if (value === null) {
      storage.removeItem(key);
      return;
    }
    storage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to persist string to storage', { key, error });
  }
};

const normalizeConversation = (conversation: Conversation): Conversation => ({
  ...conversation,
  bookings: Array.isArray(conversation.bookings) ? conversation.bookings : [],
});

const normalizeConversations = (items: Conversation[]): Conversation[] =>
  items.map(normalizeConversation);

export function useChatClient(options: UseChatClientOptions = {}): UseChatClientResult {
  const namespace = options.cacheNamespace ?? 'chat_v2';
  const storage = getStorage();

  const conversationsKey = `${namespace}:conversations`;
  const activeKey = `${namespace}:active`;
  const messagesKey = (conversationId: string) => `${namespace}:messages:${conversationId}`;
  const userKey = `${namespace}:user`;
  const lastFetchedKey = `${namespace}:lastFetched`;

  const initialConversations = isBrowser()
    ? normalizeConversations(readJSON<Conversation[]>(storage, conversationsKey, []))
    : [];
  const initialActiveId = isBrowser() ? readString(storage, activeKey) : null;
  const initialMessages =
    isBrowser() && initialActiveId
      ? readJSON<Message[]>(storage, messagesKey(initialActiveId), [])
      : [];
  const initialUserId = isBrowser() ? readString(storage, userKey) ?? '' : '';
  const initialLastFetched = isBrowser() ? readNumber(storage, lastFetchedKey, 0) : 0;

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialActiveId
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentUserId, setCurrentUserId] = useState<string>(initialUserId);
  const [loading, setLoading] = useState<boolean>(initialConversations.length === 0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFetchedRef = useRef<number>(initialLastFetched);
  const refreshTimeoutRef = useRef<number | null>(null);
  const initialBookingHandledRef = useRef<string | null>(null);
  const serverPollIntervalRef = useRef<number | null>(null);

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  const refreshConversations = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && lastFetchedRef.current && now - lastFetchedRef.current < STALE_MS) {
        if (refreshTimeoutRef.current === null && isBrowser()) {
          const delay = STALE_MS - (now - lastFetchedRef.current);
          refreshTimeoutRef.current = window.setTimeout(() => {
            refreshTimeoutRef.current = null;
            void refreshConversations(true);
          }, delay);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await authenticatedFetch('/api/chat/conversations', { cache: 'no-store' });
        if (res.status === 401) {
          setError('Please log in to view messages');
          setConversations([]);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await res.json();
        const normalizedConversations = normalizeConversations(data.conversations || []);
        setConversations(normalizedConversations);
        setError(null);
        lastFetchedRef.current = Date.now();
        writeString(storage, lastFetchedKey, String(lastFetchedRef.current));
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    },
    [lastFetchedKey, storage]
  );

  // Initial fetch & polling
  useEffect(() => {
    void refreshConversations(initialConversations.length === 0);
    if (!isBrowser()) return () => undefined;

    const interval = window.setInterval(() => {
      void refreshConversations(false);
    }, STALE_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [initialConversations.length, refreshConversations]);

  // Clear pending timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current !== null && isBrowser()) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Persist conversations & active IDs
  useEffect(() => {
    writeJSON(storage, conversationsKey, conversations);
  }, [conversations, conversationsKey, storage]);

  useEffect(() => {
    writeString(storage, activeKey, activeConversationId);
  }, [activeConversationId, activeKey, storage]);

  useEffect(() => {
    if (conversations.length === 0) {
      setActiveConversationId(null);
      return;
    }
    setActiveConversationId((prev) => {
      if (prev && conversations.some((conversation) => conversation.id === prev)) {
        return prev;
      }
      return conversations[0].id;
    });
  }, [conversations]);

  // Ensure current user id is populated
  useEffect(() => {
    if (currentUserId) return;

    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await authenticatedFetch('/api/user', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const id = data.user?.id || '';
        setCurrentUserId(id);
        if (id) {
          writeString(storage, userKey, id);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [currentUserId, storage, userKey]);

  // Focus conversation if bookingId query provided
  useEffect(() => {
    if (!options.initialBookingId) return;
    if (initialBookingHandledRef.current === options.initialBookingId) return;
    if (!conversations.length) return;
    const target = conversations.find((conversation) =>
      (conversation.bookings ?? []).some(
        (booking) => booking.id === options.initialBookingId
      )
    );
    if (target) {
      initialBookingHandledRef.current = options.initialBookingId;
      selectConversation(target.id);
    }
  }, [conversations, options.initialBookingId, selectConversation]);

  // Watch active conversation for realtime messages
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
    const fallbackBookingId = activeConversation?.bookings[0]?.id || '';

    const cached = readJSON<Message[]>(storage, messagesKey(activeConversationId), []);
    if (cached.length) {
      setMessages(cached);
    } else {
      setMessages([]);
    }

    const messagesRef = collection(db, 'conversations', activeConversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextMessages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          let timestamp = '';
          if (data.timestamp instanceof Timestamp) {
            timestamp = data.timestamp.toDate().toISOString();
          } else if (data.timestamp) {
            timestamp = data.timestamp;
          } else {
            timestamp = new Date().toISOString();
          }

          return {
            id: doc.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            timestamp,
            read: data.read || false,
            bookingId: data.bookingId || fallbackBookingId,
          };
        });

        setMessages(nextMessages);
        writeJSON(storage, messagesKey(activeConversationId), nextMessages);
      },
      (err) => {
        const code = (err as any)?.code || (err as any)?.message || '';
        const isPermissionDenied = String(code).includes('permission-denied');
        if (isPermissionDenied) {
          // Quietly warn for expected permission-denied errors (server fallback handles messages)
          console.warn('Realtime messages permission denied — falling back to server polling.');
          setError('Missing or insufficient permissions to read messages. Falling back to server polling.');
        } else {
          console.error('Realtime messages error:', err);
          setError('Realtime error loading messages');
        }

        // Fallback: if permission-denied, fetch messages from the server and poll periodically
        if (isPermissionDenied) {
          const fetchServerMessages = async () => {
            try {
              const res = await authenticatedFetch(`/api/chat/messages?conversationId=${activeConversationId}`);
              if (!res.ok) {
                console.error('Server messages fetch failed', res.status);
                return;
              }
              const data = await res.json();
              setMessages(data.messages || []);
              writeJSON(storage, messagesKey(activeConversationId), data.messages || []);
            } catch (fetchErr) {
              console.error('Server messages fetch error:', fetchErr);
            }
          };

          // initial fetch
          void fetchServerMessages();

          // start polling every 5s
          if (serverPollIntervalRef.current === null && isBrowser()) {
            serverPollIntervalRef.current = window.setInterval(() => {
              void fetchServerMessages();
            }, 5000) as unknown as number;
          }
        }
      }
    );

    return () => {
      unsubscribe();
      if (serverPollIntervalRef.current !== null && isBrowser()) {
        window.clearInterval(serverPollIntervalRef.current);
        serverPollIntervalRef.current = null;
      }
    };
  }, [activeConversationId, conversations, storage]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (!activeConversationId) return;
    const conversation = conversations.find((c) => c.id === activeConversationId);
    if (!conversation || conversation.unreadCount === 0) return;

    const markRead = async () => {
      try {
        await authenticatedFetch('/api/chat/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: conversation.id }),
        });
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };

    markRead();
  }, [activeConversationId, conversations]);

  const sendMessage = useCallback(
    async (content: string, bookingId: string) => {
      if (!activeConversationId || !content.trim() || sending) return;
      if (!bookingId) {
        alert('Select a booking before sending a message');
        return;
      }
      const trimmed = content.trim();
      const conversation = conversations.find((c) => c.id === activeConversationId);
      if (!conversation) return;
      const bookingMeta = (conversation.bookings ?? []).find((b) => b.id === bookingId);

      setSending(true);
      try {
        const res = await authenticatedFetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            content: trimmed,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          alert(errData.error || 'Failed to send message');
          return;
        }

        const nowISO = new Date().toISOString();
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  lastMessage: trimmed,
                  lastMessageAt: nowISO,
                  serviceName: bookingMeta?.serviceName ?? c.serviceName,
                  bookingStatus: bookingMeta?.status ?? c.bookingStatus,
                }
              : c
          )
        );
      } catch (err) {
        console.error('Error sending message:', err);
        alert('Failed to send message');
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, conversations, sending]
  );

  return {
    conversations,
    messages,
    activeConversationId,
    currentUserId,
    loading,
    sending,
    error,
    selectConversation,
    sendMessage,
    refreshConversations,
  };
}
