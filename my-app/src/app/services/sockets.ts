// Базовая обёртка над WebSocket для управления соединением
export class WebSocketService {
  private socket: WebSocket | null = null;

  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage: (event: MessageEvent) => void, onClose?: () => void) {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = onMessage;
    if (onClose) {
      this.socket.onclose = onClose;
    }
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
