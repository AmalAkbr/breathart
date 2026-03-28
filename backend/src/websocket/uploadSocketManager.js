const UPLOAD_ROOM_PREFIX = 'upload:';

let ioInstance = null;

const uploadSessions = new Map();

const getRoomName = (uploadId) => `${UPLOAD_ROOM_PREFIX}${uploadId}`;

const ensureUploadSession = (uploadId) => {
  if (!uploadSessions.has(uploadId)) {
    uploadSessions.set(uploadId, {
      cancelled: false,
      cancelHandlers: new Set(),
      updatedAt: Date.now(),
    });
  }

  const session = uploadSessions.get(uploadId);
  session.updatedAt = Date.now();
  return session;
};

const emitToUploadRoom = (uploadId, event, payload = {}) => {
  if (!ioInstance || !uploadId) return;
  ioInstance.to(getRoomName(uploadId)).emit(event, {
    uploadId,
    timestamp: Date.now(),
    ...payload,
  });
};

export const setUploadSocketServer = (io) => {
  ioInstance = io;
};

export const joinUploadRoom = (socket, uploadId) => {
  if (!socket || !uploadId) return;
  ensureUploadSession(uploadId);
  socket.join(getRoomName(uploadId));
  emitToUploadRoom(uploadId, 'upload:stage', { stage: 'subscribed' });
};

export const emitUploadStage = (uploadId, stage, payload = {}) => {
  emitToUploadRoom(uploadId, 'upload:stage', { stage, ...payload });
};

export const emitUploadProgress = (uploadId, payload = {}) => {
  emitToUploadRoom(uploadId, 'upload:progress', payload);
};

export const emitUploadCompleted = (uploadId, payload = {}) => {
  emitToUploadRoom(uploadId, 'upload:completed', payload);
};

export const emitUploadError = (uploadId, payload = {}) => {
  emitToUploadRoom(uploadId, 'upload:error', payload);
};

export const registerUploadCancelHandler = (uploadId, handler) => {
  if (!uploadId || typeof handler !== 'function') {
    return () => {};
  }

  const session = ensureUploadSession(uploadId);
  session.cancelHandlers.add(handler);

  return () => {
    const current = uploadSessions.get(uploadId);
    current?.cancelHandlers.delete(handler);
  };
};

export const markUploadCancelled = (uploadId) => {
  if (!uploadId) return;

  const session = ensureUploadSession(uploadId);
  session.cancelled = true;

  for (const handler of session.cancelHandlers) {
    try {
      handler();
    } catch (error) {
      console.error('Cancel handler failed:', error.message);
    }
  }

  emitUploadStage(uploadId, 'cancelled', {
    message: 'Upload cancelled by user',
  });
};

export const isUploadCancelled = (uploadId) => {
  if (!uploadId) return false;
  return Boolean(uploadSessions.get(uploadId)?.cancelled);
};

export const clearUploadSession = (uploadId) => {
  if (!uploadId) return;
  uploadSessions.delete(uploadId);
};

setInterval(() => {
  const now = Date.now();
  const maxIdleMs = 20 * 60 * 1000;

  for (const [uploadId, session] of uploadSessions.entries()) {
    if (now - session.updatedAt > maxIdleMs) {
      uploadSessions.delete(uploadId);
    }
  }
}, 5 * 60 * 1000).unref();
