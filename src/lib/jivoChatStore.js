const MAX_MESSAGES_PER_SESSION = 200;

const getStore = () => {
  if (!globalThis.__jivoChatStore) {
    globalThis.__jivoChatStore = new Map();
  }
  return globalThis.__jivoChatStore;
};

const getOrCreateSession = (clientId) => {
  const store = getStore();
  if (!store.has(clientId)) {
    store.set(clientId, {
      started: false,
      messages: [],
      updatedAt: Date.now(),
      profile: null,
    });
  }
  return store.get(clientId);
};

export const upsertSessionProfile = (clientId, profile = {}) => {
  const session = getOrCreateSession(clientId);
  session.profile = {
    ...(session.profile || {}),
    ...profile,
  };
  session.updatedAt = Date.now();
  return session.profile;
};

export const isSessionStarted = (clientId) => {
  const session = getOrCreateSession(clientId);
  return Boolean(session.started);
};

export const markSessionStarted = (clientId) => {
  const session = getOrCreateSession(clientId);
  session.started = true;
  session.updatedAt = Date.now();
};

export const addSessionMessage = (clientId, message) => {
  const session = getOrCreateSession(clientId);
  session.messages.push({
    id: message.id || crypto.randomUUID(),
    direction: message.direction || "incoming",
    text: message.text || "",
    createdAt: message.createdAt || Date.now(),
    author: message.author || null,
    type: message.type || "text",
  });
  if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    session.messages.splice(0, session.messages.length - MAX_MESSAGES_PER_SESSION);
  }
  session.updatedAt = Date.now();
};

export const getSessionMessages = (clientId) => {
  const session = getOrCreateSession(clientId);
  return session.messages;
};
