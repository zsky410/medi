"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import type { TripRealtimeEvent } from "@medi/types";
import { API_URL, DIRECT_API_URL, getAccessToken, setCurrentSocketId } from "./api";

let socket: Socket | null = null;

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    setCurrentSocketId(undefined);
  }
}

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${DIRECT_API_URL}/trips`, {
      auth: { token: getAccessToken() },
      transports: ["websocket"],
    });
    socket.on("connect", () => setCurrentSocketId(socket?.id));
    socket.on("disconnect", () => setCurrentSocketId(undefined));
  }
  return socket;
}

/** Joins the trip room and invokes the handler for every realtime event on the trip. */
export function useTripRealtime(tripId: string | undefined, onEvent: (event: TripRealtimeEvent) => void) {
  useEffect(() => {
    if (!tripId || !getAccessToken()) return;
    const s = getSocket();
    const join = () => s.emit("trip:join", tripId);
    if (s.connected) join();
    s.on("connect", join);

    const handler = (msg: { tripId: string; event: TripRealtimeEvent }) => {
      if (msg.tripId === tripId) onEvent(msg.event);
    };
    s.on("trip:event", handler);

    return () => {
      s.emit("trip:leave", tripId);
      s.off("connect", join);
      s.off("trip:event", handler);
    };
  }, [tripId, onEvent]);
}
