import type { ServerWebSocket } from "bun";

const set = new Set<ServerWebSocket<{
    authToken: string;
}>>();
const dict = new Map<ServerWebSocket<{
    authToken: string;
}>,number>()
let count = 0
const server = Bun.serve<{ authToken: string }>({
    fetch(req, server) {
      const success = server.upgrade(req);
      if (success) {
        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }
  
    //   handle HTTP request normally
      return new Response("Hello world!");
    },
    websocket: {
        message(ws, message) {
            set.forEach(v => 
                v.send(JSON.stringify({ type:'message', message, user:dict.get(ws)}))
            )
        }, // a message is received
        open(ws) {
            count += 1;
            set.add(ws);
            dict.set(ws, count);
        }, // a socket is opened
        close(ws, code, message) {
            set.delete(ws);
            set.forEach(v => {
                v.send(JSON.stringify({type:'close', user:dict.get(ws)}))
            })
            dict.delete(ws);
        }, // a socket is closed
        drain(ws) {}, // the socket is ready to receive more data
    },
  });
  
  console.log(`Listening on localhost:${server.port}`);