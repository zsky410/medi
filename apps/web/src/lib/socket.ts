"use client";

import { useEffect } from "react";
import type { io as socketIo, Socket } from "socket.io-client";
import type { TripRealtimeEvent } from "@medi/types";
import { DIRECT_API_URL, getAccessToken, setCurrentSocketId } from "./api";

let socket: Socket | null = null;
let socketPromise: Promise<Socket> | null = null;

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    setCurrentSocketId(undefined);
  }
  socketPromise = null;
}

async function getSocket(): Promise<Socket> {
  if (!socket) {
    socketPromise ??= import("socket.io-client/dist/socket.io.js").then((mod) => {
      const io = mod.default as typeof socketIo;
      const nextSocket = io(`${DIRECT_API_URL}/trips`, {
        auth: { token: getAccessToken() },
        transports: ["websocket"],
      });
      nextSocket.on("connect", () => setCurrentSocketId(nextSocket.id));
      nextSocket.on("disconnect", () => setCurrentSocketId(undefined));
      socket = nextSocket;
      return nextSocket;
    });
  }

  return socket ?? socketPromise!;
}

/** Joins the trip room and invokes the handler for every realtime event on the trip. */
export function useTripRealtime(tripId: string | undefined, onEvent: (event: TripRealtimeEvent) => void) {
  useEffect(() => {
    if (!tripId || !getAccessToken()) return;
    let active = true;
    let s: Socket | null = null;
    let join: (() => void) | null = null;
    let handler: ((msg: { tripId: string; event: TripRealtimeEvent }) => void) | null = null;

    void getSocket().then((nextSocket) => {
      if (!active) return;
      s = nextSocket;
      join = () => nextSocket.emit("trip:join", tripId);
      handler = (msg: { tripId: string; event: TripRealtimeEvent }) => {
        if (msg.tripId === tripId) onEvent(msg.event);
      };

      if (nextSocket.connected) join();
      nextSocket.on("connect", join);
      nextSocket.on("trip:event", handler);
    });

    return () => {
      active = false;
      if (!s || !join || !handler) return;
      s.emit("trip:leave", tripId);
      s.off("connect", join);
      s.off("trip:event", handler);
    };
  }, [tripId, onEvent]);
}
