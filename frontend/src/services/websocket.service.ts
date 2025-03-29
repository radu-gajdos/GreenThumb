import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

export interface CheckUpdateEvent {
  status: string;
  checkId: number | null;
  message?: string;
  progress?: number;
  fields?: Record<string, any>;
  error?: boolean;
  result?: any;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private static instance: WebSocketService;

  // Observable that emits check updates
  private checkUpdateSubject = new BehaviorSubject<CheckUpdateEvent | null>(null);
  public checkUpdate$ = this.checkUpdateSubject.asObservable();

  // Connection status
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.socket) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.socket = io(`${process.env.REACT_APP_API_URL}/check`, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connectedSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connectedSubject.next(false);
    });

    // Listen for check updates
    this.socket.on('check-update', (update: CheckUpdateEvent) => {
      console.log('Received check update:', update);
      this.checkUpdateSubject.next(update);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedSubject.next(false);
    }
  }

  public startCheck(imei: string, isFullCheck: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit('start-check', { imei, isFullCheck }, (response: any) => {
        if (response.success) {
          resolve(response.jobId);
        } else {
          reject(new Error(response.message || 'Failed to start check'));
        }
      });
    });
  }
}

export default WebSocketService.getInstance();