/*
  Lightweight client-side data service that mimics the database API using
  localStorage (or in-memory storage when running server-side). This allows the
  Vite client bundle to avoid loading Node-specific modules such as
  better-sqlite3.
*/

const isBrowser = typeof window !== 'undefined';

export type ID = string;

type StoredDate = string;

type StoredUser = {
  id: ID;
  name: string;
  email: string;
  avatar?: string;
  createdAt: StoredDate;
  updatedAt: StoredDate;
};

type StoredChatSession = {
  id: ID;
  userId: ID;
  title?: string;
  startedAt: StoredDate;
  endedAt?: StoredDate;
  messageCount: number;
  createdAt: StoredDate;
};

type StoredChatMessage = {
  id: ID;
  sessionId: ID;
  userId: ID;
  content: string;
  role: 'user' | 'assistant';
  timestamp: StoredDate;
};

type StoredAudioCall = {
  id: ID;
  userId: ID;
  startedAt: StoredDate;
  endedAt?: StoredDate;
  duration: number;
  status: 'completed' | 'missed' | 'cancelled';
  notes?: string;
  createdAt: StoredDate;
};

type StoredMeditationSession = {
  id: ID;
  userId: ID;
  meditationTitle: string;
  duration: number;
  completedAt: StoredDate;
  rating?: number;
  notes?: string;
  createdAt: StoredDate;
};

type StoredQuote = {
  id: ID;
  text: string;
  author: string;
  category: string;
  createdAt: StoredDate;
};

type StoredQuoteView = {
  id: ID;
  userId: ID;
  quoteId: ID;
  viewedAt: StoredDate;
  liked: boolean;
};

type StoredUserStats = {
  id: ID;
  userId: ID;
  totalChatSessions: number;
  totalAudioCalls: number;
  totalMeditationMinutes: number;
  totalQuotesViewed: number;
  lastActivity?: StoredDate;
  createdAt: StoredDate;
  updatedAt: StoredDate;
};

type DataStore = {
  users: Record<ID, StoredUser>;
  chatSessions: Record<ID, StoredChatSession>;
  chatMessages: Record<ID, StoredChatMessage>;
  audioCalls: Record<ID, StoredAudioCall>;
  meditationSessions: Record<ID, StoredMeditationSession>;
  quotes: Record<ID, StoredQuote>;
  quoteViews: Record<ID, StoredQuoteView>;
  userStats: Record<ID, StoredUserStats>;
  subscriptions: Record<ID, StoredSubscription>;
};

const STORAGE_KEY = 'zen-mind-mate-data-v1';

let memoryStore: DataStore | null = null;

const defaultQuoteSeed = [
  {
    text: 'Единственный способ сделать что-то хорошо — полюбить то, что вы делаете.',
    author: 'Стив Джобс',
    category: 'Мотивация',
  },
  {
    text: 'Жизнь — это то, что происходит с вами, пока вы строите другие планы.',
    author: 'Джон Леннон',
    category: 'Жизнь',
  },
  {
    text: 'Путь в тысячу миль начинается с первого шага.',
    author: 'Лао-цзы',
    category: 'Начинания',
  },
  {
    text: 'Не важно, как медленно вы идете, главное — не останавливаться.',
    author: 'Конфуций',
    category: 'Настойчивость',
  },
  {
    text: 'Счастье — это не цель, а способ жить.',
    author: 'Далай-лама',
    category: 'Счастье',
  },
  {
    text: 'Будьте тем изменением, которое хотите видеть в мире.',
    author: 'Махатма Ганди',
    category: 'Вдохновение',
  },
  {
    text: 'Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сейчас.',
    author: 'Китайская пословица',
    category: 'Действие',
  },
  {
    text: 'Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма.',
    author: 'Уинстон Черчилль',
    category: 'Успех',
  },
  {
    text: 'Ваше время ограничено, не тратьте его на жизнь чужой жизнью.',
    author: 'Стив Джобс',
    category: 'Аутентичность',
  },
  {
    text: 'Единственная невозможная вещь — это та, которую вы не попытались сделать.',
    author: 'Неизвестный автор',
    category: 'Возможности',
  },
  {
    text: 'Падать — это нормально. Подниматься — обязательно.',
    author: 'Конфуций',
    category: 'Стойкость',
  },
  {
    text: 'Мудрость приходит с опытом, а опыт — с ошибками.',
    author: 'Оскар Уайльд',
    category: 'Мудрость',
  },
];

function createDefaultStore(): DataStore {
  const now = new Date().toISOString();

  const quotes: Record<ID, StoredQuote> = {};
  defaultQuoteSeed.forEach((quote, index) => {
    const id = `quote_${index + 1}`;
    quotes[id] = {
      id,
      ...quote,
      createdAt: now,
    };
  });

  return {
    users: {},
    chatSessions: {},
    chatMessages: {},
    audioCalls: {},
    meditationSessions: {},
    quotes,
    quoteViews: {},
    userStats: {},
  };
}

function loadStore(): DataStore {
  if (!isBrowser) {
    if (!memoryStore) {
      memoryStore = createDefaultStore();
    }
    return structuredClone(memoryStore);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const store = createDefaultStore();
    saveStore(store);
    return store;
  }

  try {
    return JSON.parse(raw) as DataStore;
  } catch (error) {
    console.error('Failed to parse stored data. Resetting store.', error);
    const store = createDefaultStore();
    saveStore(store);
    return store;
  }
}

function saveStore(store: DataStore) {
  if (!isBrowser) {
    memoryStore = structuredClone(store);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

const delay = () => Promise.resolve();

function generateId(prefix = 'id'): ID {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function toDate(value?: StoredDate): Date | undefined {
  return value ? new Date(value) : undefined;
}

function toDateRequired(value: StoredDate): Date {
  return new Date(value);
}

export type User = Omit<StoredUser, 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
};

export type ChatSession = Omit<StoredChatSession, 'startedAt' | 'endedAt' | 'createdAt'> & {
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
};

export type ChatMessage = Omit<StoredChatMessage, 'timestamp'> & {
  timestamp: Date;
};

export type AudioCall = Omit<StoredAudioCall, 'startedAt' | 'endedAt' | 'createdAt'> & {
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
};

export type MeditationSession = Omit<StoredMeditationSession, 'completedAt' | 'createdAt'> & {
  completedAt: Date;
  createdAt: Date;
};

export type Quote = Omit<StoredQuote, 'createdAt'> & {
  createdAt: Date;
};

export type QuoteView = Omit<StoredQuoteView, 'viewedAt'> & {
  viewedAt: Date;
};

export type UserStat = Omit<StoredUserStats, 'lastActivity' | 'createdAt' | 'updatedAt'> & {
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const convertUser = (user: StoredUser): User => ({
  ...user,
  createdAt: toDateRequired(user.createdAt),
  updatedAt: toDateRequired(user.updatedAt),
});

const convertChatSession = (session: StoredChatSession): ChatSession => ({
  ...session,
  startedAt: toDateRequired(session.startedAt),
  endedAt: toDate(session.endedAt),
  createdAt: toDateRequired(session.createdAt),
});

const convertChatMessage = (message: StoredChatMessage): ChatMessage => ({
  ...message,
  timestamp: toDateRequired(message.timestamp),
});

const convertAudioCall = (call: StoredAudioCall): AudioCall => ({
  ...call,
  startedAt: toDateRequired(call.startedAt),
  endedAt: toDate(call.endedAt),
  createdAt: toDateRequired(call.createdAt),
});

const convertMeditationSession = (session: StoredMeditationSession): MeditationSession => ({
  ...session,
  completedAt: toDateRequired(session.completedAt),
  createdAt: toDateRequired(session.createdAt),
});

const convertQuote = (quote: StoredQuote): Quote => ({
  ...quote,
  createdAt: toDateRequired(quote.createdAt),
});

const convertQuoteView = (view: StoredQuoteView): QuoteView => ({
  ...view,
  viewedAt: toDateRequired(view.viewedAt),
});

const convertUserStats = (stats: StoredUserStats): UserStat => ({
  ...stats,
  createdAt: toDateRequired(stats.createdAt),
  updatedAt: toDateRequired(stats.updatedAt),
  lastActivity: toDate(stats.lastActivity),
});

async function refreshUserStats(userId: ID) {
  await userStatsService.updateUserStats(userId);
}

export const userService = {
  async getUserById(id: ID): Promise<User | undefined> {
    await delay();
    const store = loadStore();
    const user = store.users[id];
    return user ? convertUser(user) : undefined;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    await delay();
    const store = loadStore();
    const user = Object.values(store.users).find((u) => u.email === email);
    return user ? convertUser(user) : undefined;
  },

  async updateUser(id: ID, data: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    await delay();
    const store = loadStore();
    const user = store.users[id];
    if (!user) {
      return undefined;
    }

    const updatedUser: StoredUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    store.users[id] = updatedUser;
    saveStore(store);

    await refreshUserStats(id);

    return convertUser(updatedUser);
  },

  async getOrCreateUser(email: string, name: string): Promise<User> {
    await delay();
    const store = loadStore();
    let user = Object.values(store.users).find((u) => u.email === email);

    if (!user) {
      const id = generateId('user');
      const now = new Date().toISOString();
      user = {
        id,
        name,
        email,
        createdAt: now,
        updatedAt: now,
      };

      store.users[id] = user;

      store.userStats[id] = {
        id: generateId('user_stat'),
        userId: id,
        totalChatSessions: 0,
        totalAudioCalls: 0,
        totalMeditationMinutes: 0,
        totalQuotesViewed: 0,
        createdAt: now,
        updatedAt: now,
      };

      saveStore(store);
    }

    return convertUser(user);
  },
};

export const chatService = {
  async createChatSession(userId: ID, title?: string): Promise<ChatSession> {
    await delay();
    const store = loadStore();
    const id = generateId('chat_session');
    const now = new Date().toISOString();

    const session: StoredChatSession = {
      id,
      userId,
      title,
      startedAt: now,
      createdAt: now,
      messageCount: 0,
    };

    store.chatSessions[id] = session;
    saveStore(store);

    await refreshUserStats(userId);

    return convertChatSession(session);
  },

  async endChatSession(sessionId: ID): Promise<ChatSession | undefined> {
    await delay();
    const store = loadStore();
    const session = store.chatSessions[sessionId];
    if (!session) {
      return undefined;
    }

    session.endedAt = new Date().toISOString();
    store.chatSessions[sessionId] = session;
    saveStore(store);

    await refreshUserStats(session.userId);

    return convertChatSession(session);
  },

  async addChatMessage(
    sessionId: ID,
    userId: ID,
    content: string,
    role: 'user' | 'assistant',
  ): Promise<ChatMessage | undefined> {
    await delay();
    const store = loadStore();
    const session = store.chatSessions[sessionId];
    if (!session) {
      return undefined;
    }

    const id = generateId('chat_message');
    const now = new Date().toISOString();

    const message: StoredChatMessage = {
      id,
      sessionId,
      userId,
      content,
      role,
      timestamp: now,
    };

    store.chatMessages[id] = message;
    session.messageCount += 1;
    store.chatSessions[sessionId] = session;
    saveStore(store);

    await refreshUserStats(userId);

    return convertChatMessage(message);
  },

  async getChatMessages(sessionId: ID): Promise<ChatMessage[]> {
    await delay();
    const store = loadStore();
    return Object.values(store.chatMessages)
      .filter((message) => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map(convertChatMessage);
  },

  async getUserChatSessions(userId: ID, limit = 10): Promise<ChatSession[]> {
    await delay();
    const store = loadStore();
    return Object.values(store.chatSessions)
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map(convertChatSession);
  },
};

export const audioCallService = {
  async createAudioCall(userId: ID): Promise<AudioCall> {
    await delay();
    const store = loadStore();
    const id = generateId('audio_call');
    const now = new Date().toISOString();

    const call: StoredAudioCall = {
      id,
      userId,
      startedAt: now,
      createdAt: now,
      duration: 0,
      status: 'completed',
    };

    store.audioCalls[id] = call;
    saveStore(store);

    await refreshUserStats(userId);

    return convertAudioCall(call);
  },

  async endAudioCall(callId: ID, duration: number): Promise<AudioCall | undefined> {
    await delay();
    const store = loadStore();
    const call = store.audioCalls[callId];
    if (!call) {
      return undefined;
    }

    call.endedAt = new Date().toISOString();
    call.duration = duration;
    store.audioCalls[callId] = call;
    saveStore(store);

    await refreshUserStats(call.userId);

    return convertAudioCall(call);
  },

  async getUserAudioCalls(userId: ID, limit = 10): Promise<AudioCall[]> {
    await delay();
    const store = loadStore();
    return Object.values(store.audioCalls)
      .filter((call) => call.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map(convertAudioCall);
  },
};

export const meditationService = {
  async createMeditationSession(
    userId: ID,
    meditationTitle: string,
    duration: number,
    rating?: number,
    notes?: string,
  ): Promise<MeditationSession> {
    await delay();
    const store = loadStore();
    const id = generateId('meditation');
    const now = new Date().toISOString();

    const session: StoredMeditationSession = {
      id,
      userId,
      meditationTitle,
      duration,
      completedAt: now,
      rating,
      notes,
      createdAt: now,
    };

    store.meditationSessions[id] = session;
    saveStore(store);

    await refreshUserStats(userId);

    return convertMeditationSession(session);
  },

  async getUserMeditationSessions(userId: ID, limit = 20): Promise<MeditationSession[]> {
    await delay();
    const store = loadStore();
    return Object.values(store.meditationSessions)
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, limit)
      .map(convertMeditationSession);
  },

  async getUserMeditationStats(userId: ID): Promise<{
    totalSessions: number;
    totalMinutes: number;
    avgRating: number;
  }> {
    await delay();
    const store = loadStore();
    const sessions = Object.values(store.meditationSessions).filter((session) => session.userId === userId);

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
    const ratings = sessions
      .map((session) => session.rating)
      .filter((rating): rating is number => rating !== undefined);

    const avgRating = ratings.length > 0 ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length : 0;

    return {
      totalSessions,
      totalMinutes,
      avgRating,
    };
  },
};

export const quoteService = {
  async getAllQuotes(): Promise<Quote[]> {
    await delay();
    const store = loadStore();
    return Object.values(store.quotes)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(convertQuote);
  },

  async viewQuote(userId: ID, quoteId: ID, liked = false): Promise<QuoteView> {
    await delay();
    const store = loadStore();
    const id = generateId('quote_view');
    const now = new Date().toISOString();

    const view: StoredQuoteView = {
      id,
      userId,
      quoteId,
      viewedAt: now,
      liked,
    };

    store.quoteViews[id] = view;
    saveStore(store);

    await refreshUserStats(userId);

    return convertQuoteView(view);
  },

  async toggleQuoteLike(userId: ID, quoteId: ID): Promise<QuoteView> {
    await delay();
    const store = loadStore();

    const views = Object.values(store.quoteViews)
      .filter((view) => view.userId === userId && view.quoteId === quoteId)
      .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt));

    let target = views[0];

    if (!target) {
      target = {
        id: generateId('quote_view'),
        userId,
        quoteId,
        viewedAt: new Date().toISOString(),
        liked: true,
      };
    } else {
      target = {
        ...target,
        liked: !target.liked,
        viewedAt: new Date().toISOString(),
      };
    }

    store.quoteViews[target.id] = target;
    saveStore(store);

    await refreshUserStats(userId);

    return convertQuoteView(target);
  },

  async getUserQuoteViews(userId: ID, limit = 20): Promise<{ view: QuoteView; quote: Quote }[]> {
    await delay();
    const store = loadStore();

    return Object.values(store.quoteViews)
      .filter((view) => view.userId === userId)
      .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
      .slice(0, limit)
      .map((view) => ({
        view: convertQuoteView(view),
        quote: convertQuote(store.quotes[view.quoteId]),
      }));
  },

  async getUserQuoteStats(userId: ID): Promise<{ totalViewed: number; totalLiked: number }> {
    await delay();
    const store = loadStore();
    const views = Object.values(store.quoteViews).filter((view) => view.userId === userId);

    return {
      totalViewed: views.length,
      totalLiked: views.filter((view) => view.liked).length,
    };
  },

  async getUserLikedQuotes(userId: ID, limit = 50): Promise<{ quote: Quote; view: QuoteView }[]> {
    await delay();
    const store = loadStore();

    return Object.values(store.quoteViews)
      .filter((view) => view.userId === userId && view.liked)
      .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
      .slice(0, limit)
      .map((view) => ({
        quote: convertQuote(store.quotes[view.quoteId]),
        view: convertQuoteView(view),
      }));
  },
};

export const userStatsService = {
  async updateUserStats(userId: ID): Promise<void> {
    await delay();
    const store = loadStore();

    const chatSessions = Object.values(store.chatSessions).filter((session) => session.userId === userId);
    const audioCalls = Object.values(store.audioCalls).filter((call) => call.userId === userId);
    const meditationSessions = await meditationService.getUserMeditationStats(userId);
    const quoteStats = await quoteService.getUserQuoteStats(userId);

    const now = new Date().toISOString();

    const stats = store.userStats[userId] ?? {
      id: generateId('user_stat'),
      userId,
      totalChatSessions: 0,
      totalAudioCalls: 0,
      totalMeditationMinutes: 0,
      totalQuotesViewed: 0,
      createdAt: now,
      updatedAt: now,
    };

    stats.totalChatSessions = chatSessions.length;
    stats.totalAudioCalls = audioCalls.length;
    stats.totalMeditationMinutes = meditationSessions.totalMinutes;
    stats.totalQuotesViewed = quoteStats.totalViewed;
    stats.lastActivity = now;
    stats.updatedAt = now;

    store.userStats[userId] = stats;
    saveStore(store);
  },

  async getUserStats(userId: ID): Promise<UserStat> {
    await delay();
    const store = loadStore();
    let stats = store.userStats[userId];

    if (!stats) {
      const now = new Date().toISOString();
      stats = {
        id: generateId('user_stat'),
        userId,
        totalChatSessions: 0,
        totalAudioCalls: 0,
        totalMeditationMinutes: 0,
        totalQuotesViewed: 0,
        createdAt: now,
        updatedAt: now,
      };
      store.userStats[userId] = stats;
      saveStore(store);
    }

    return convertUserStats(stats);
  },
};
