const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');
const volService = require('../api/vol/vol.service');

var gIo = null;

function connectSockets(http, session) {
  gIo = require('socket.io')(http);
  gIo.on('connection', (socket) => {
    console.log('New socket', socket.id);
    socket.on('disconnect', (socket) => {
      console.log('Someone disconnected');
    });
    socket.on('chat topic', (topic) => {
      if (socket.myTopic === topic) return;
      if (socket.myTopic) {
        socket.leave(socket.myTopic);
      }
      socket.join(topic);
      socket.myTopic = topic;
    });
    socket.on('chat newMsg', (msg) => {
      gIo.to(socket.myTopic).emit('chat addMsg', msg);
      volService.addMsg(msg, socket.myTopic);
    });
    socket.on('stoppedTyping', () => {
      gIo.to(socket.myTopic).emit('stoppedTyping');
    });
    socket.on('user-watch', (userId) => {
      socket.join('watching:' + userId);
    });
    socket.on('isTyping', (fullname) => {
      gIo.to(socket.myTopic).emit('getTyping', fullname);
    });
    socket.on('new volunteer', ({ vol, user }) => {
      console.log('new volunteer:', user._id, 'in:', vol._id);
      socket.broadcast.emit('got volunteer', { vol, user });
      
    });
    socket.on('set-user-socket', (userId) => {
      logger.debug(`Setting socket.userId = ${userId}`);
      socket.userId = userId;
    });
    socket.on('unset-user-socket', () => {
      delete socket.userId;
    });
  });
}

function emitToAll(type, data) {
  gIo.emit(type, data);
}

function emitTo({ type, data, label }) {
  if (label) gIo.to('watching:' + label).emit(type, data);
  else gIo.emit(type, data);
}

function emitToUser({ type, data, userId }) {
  logger.debug('Emiting to user socket: ' + userId);
  const socket = _getUserSocket(userId);
  if (socket) socket.emit(type, data);
  else {
    console.log('User socket not found');
    _printSockets();
  }
}

// Send to all sockets BUT not the current socket
function broadcast({ type, data, room = null, userId }) {
  const excludedSocket = _getUserSocket(userId);
  if (!excludedSocket) {
    logger.debug('Shouldnt happen, socket not found');
    _printSockets();
    return;
  }
  logger.debug('broadcast to all but user: ', userId);
  if (room) {
    excludedSocket.broadcast.to(room).emit(type, data);
  } else {
    excludedSocket.broadcast.emit(type, data);
  }
}

function _getUserSocket(userId) {
  const sockets = _getAllSockets();
  const socket = sockets.find((s) => s.userId == userId);
  return socket;
}
function _getAllSockets() {
  const socketIds = Object.keys(gIo.sockets.sockets);
  const sockets = socketIds.map((socketId) => gIo.sockets.sockets[socketId]);
  return sockets;
}

function _printSockets() {
  const sockets = _getAllSockets();
  console.log(`Sockets: (count: ${sockets.length}):`);
  sockets.forEach(_printSocket);
}
function _printSocket(socket) {
  console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`);
}

module.exports = {
  connectSockets,
  emitTo,
  emitToUser,
  broadcast,
  emitToAll,
};
