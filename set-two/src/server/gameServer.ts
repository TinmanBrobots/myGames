import { Server as SocketServer, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, OnlineRoom } from '../lib/types';
import {
  createRoom,
  getRoom,
  joinRoom,
  disconnectPlayer,
  setSession,
  getSessionSocketId,
  startGame,
  updateGameState,
  restartGame,
  removePlayer,
} from './roomManager';
import { toggleCardSelection, submitSelection, addColumnToBoard } from '../lib/game';
import { findFirstSet } from '../lib/validator';

type IO = SocketServer<ClientToServerEvents, ServerToClientEvents>;
type Sock = Socket<ClientToServerEvents, ServerToClientEvents>;

function broadcast(io: IO, roomId: string, room: OnlineRoom) {
  io.to(roomId).emit('room_update', room);
}

export function registerGameHandlers(io: IO) {
  io.on('connection', (socket: Sock) => {
    let myToken: string | null = null;
    let myRoomId: string | null = null;

    socket.on('join_room', ({ roomId, playerName, sessionToken }) => {
      myToken = sessionToken;

      const result = roomId
        ? joinRoom(roomId, sessionToken, playerName)
        : createRoom(sessionToken, playerName);

      if ('error' in result) {
        socket.emit('error', { message: result.error });
        return;
      }

      myRoomId = result.id;
      setSession(sessionToken, socket.id, result.id);
      socket.join(result.id);
      broadcast(io, result.id, result);
    });

    socket.on('start_game', () => {
      if (!myRoomId || !myToken) return;
      const room = getRoom(myRoomId);
      if (!room || room.hostToken !== myToken) return;

      const updated = startGame(myRoomId);
      if (updated) broadcast(io, myRoomId, updated);
    });

    socket.on('select_card', ({ boardIndex }) => {
      if (!myRoomId || !myToken) return;
      const room = getRoom(myRoomId);
      if (!room?.gameState || room.phase !== 'playing') return;

      const playerId = myToken;
      let state = room.gameState;
      if (state.phase !== 'playing') return;

      const currentSel = state.selections[playerId] ?? [];
      if (currentSel.length === 3) return; // already have 3 selected

      state = toggleCardSelection(state, playerId, boardIndex);

      if (state.selections[playerId].length === 3) {
        state = submitSelection(state, playerId);

        // Auto-add cards when no set remains
        if (state.phase === 'playing') {
          while (findFirstSet(state.board) === null && state.deckCursor < state.deck.length) {
            state = addColumnToBoard(state);
          }
          if (findFirstSet(state.board) === null) {
            state = { ...state, phase: 'over' };
          }
        }
      }

      updateGameState(myRoomId, state);
      const updated = getRoom(myRoomId);
      if (updated) broadcast(io, myRoomId, updated);
    });

    socket.on('restart_game', () => {
      if (!myRoomId) return;
      const updated = restartGame(myRoomId);
      if (updated) broadcast(io, myRoomId, updated);
    });

    socket.on('leave_room', () => {
      if (!myRoomId || !myToken) return;
      const result = removePlayer(myRoomId, myToken);
      if (result) {
        socket.leave(myRoomId);
        broadcast(io, myRoomId, result.room);
      }
      myToken = null;
      myRoomId = null;
    });

    socket.on('kick_player', ({ sessionToken: targetToken }) => {
      if (!myRoomId || !myToken) return;
      const room = getRoom(myRoomId);
      if (!room || room.hostToken !== myToken) return;
      if (targetToken === myToken) return; // can't kick yourself

      const targetSocketId = getSessionSocketId(targetToken);
      const result = removePlayer(myRoomId, targetToken);
      if (!result) return;

      // Notify and evict the kicked socket
      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.emit('removed_from_room');
          targetSocket.leave(myRoomId);
        }
      }

      broadcast(io, myRoomId, result.room);
    });

    socket.on('disconnect', () => {
      if (!myToken) return;
      const result = disconnectPlayer(myToken);
      if (result) broadcast(io, result.roomId, result.room);
    });
  });
}
