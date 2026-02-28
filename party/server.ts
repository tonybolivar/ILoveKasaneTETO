import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    // Relay position/state to all other clients
    this.room.broadcast(message, [sender.id]);
  }

  onClose(connection: Party.Connection) {
    // Tell everyone this peer disconnected
    this.room.broadcast(
      JSON.stringify({ type: "leave", id: connection.id })
    );
  }
}

Server satisfies Party.Worker;
