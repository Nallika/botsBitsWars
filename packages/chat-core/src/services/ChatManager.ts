import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Subject, Observable, fromEvent } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import {
  ChatMessageType,
  SocketError,
  SendMessagePayload,
  ConnectionStatus,
} from '@repo/shared-types';
import { ChatManagerConfig } from '../types';

/**
 * ChatManager handles WebSocket connections and provides reactive streams
 * for real-time chat communication using RxJS observables
 */
export class ChatManager {
  private socket: Socket | null = null;
  private destroy$ = new Subject<void>();

  // Reactive streams
  private messageSubject = new Subject<ChatMessageType>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(
    ConnectionStatus.connected
  );
  private errorSubject = new Subject<Error>();

  private url: string;
  private sessionId: string;
  private autoConnect: boolean = false;

  constructor({ url, sessionId, autoConnect = false }: ChatManagerConfig) {
    this.url = url;
    this.sessionId = sessionId;
    this.autoConnect = autoConnect;

    if (this.autoConnect) {
      this.connect();
    }
  }

  /**
   * Establish socket connection with sessionId authentication
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    console.log('Connecting to socket server', {
      url: this.url,
      sessionId: this.sessionId,
    });

    this.connectionStatusSubject.next(ConnectionStatus.connected);

    try {
      this.socket = io(this.url!, {
        auth: {
          sessionId: this.sessionId,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventHandlers();
    } catch (error) {
      this.handleError(
        new Error(
          `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
    }
  }

  /**
   * Disconnect from socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.connectionStatusSubject.next(ConnectionStatus.connected);
    this.sessionId = '';
  }

  /**
   * Send a message via socket
   */
  sendMessage(content: string): void {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Socket not connected');
    }

    if (!this.sessionId) {
      throw new Error('No active session');
    }

    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    const payload: SendMessagePayload = {
      content: content.trim(),
      sessionId: this.sessionId,
    };

    this.socket.emit('chat:send_message', payload);
  }

  /**
   * Set current session ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Set up socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    fromEvent(this.socket, 'connect')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.connectionStatusSubject.next(ConnectionStatus.connected);
      });

    fromEvent(this.socket, 'disconnect')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.connectionStatusSubject.next(ConnectionStatus.connected);
      });

    fromEvent(this.socket, 'connect_error')
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: any) => {
        this.connectionStatusSubject.next(ConnectionStatus.error);
        this.handleError(new Error(`Connection error: ${error}`));
      });

    // Chat message events
    fromEvent<ChatMessageType>(this.socket, 'chat:message')
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: ChatMessageType) => {
        this.messageSubject.next(message);
      });

    // Error events
    fromEvent<SocketError>(this.socket, 'chat:error')
      .pipe(takeUntil(this.destroy$))
      .subscribe((errorData: SocketError) => {
        this.handleError(new Error(errorData.error));
      });

    // Reconnection events
    fromEvent(this.socket, 'reconnect')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.connectionStatusSubject.next(ConnectionStatus.connected);
      });

    fromEvent(this.socket, 'reconnect_error')
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: any) => {
        this.handleError(new Error(`Reconnection failed: ${error}`));
      });
  }

  /**
   * Handle errors and emit to error stream
   */
  private handleError(error: Error): void {
    this.errorSubject.next(error);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();

    this.messageSubject.complete();
    this.connectionStatusSubject.complete();
    this.errorSubject.complete();
  }

  // Public observables for reactive programming

  /**
   * Observable stream of incoming chat messages
   */
  get messages$(): Observable<ChatMessageType> {
    return this.messageSubject.asObservable();
  }

  /**
   * Observable stream of connection status changes
   */
  get connectionStatus$(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Observable stream of connection state (boolean)
   */
  get connected$(): Observable<boolean> {
    return this.connectionStatusSubject.pipe(
      map((status: ConnectionStatus) => status === 'connected')
    );
  }

  /**
   * Observable stream of errors
   */
  get errors$(): Observable<Error> {
    return this.errorSubject.asObservable();
  }

  /**
   * Get current connection status
   */
  get connectionStatus(): ConnectionStatus {
    return this.connectionStatusSubject.value;
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.connectionStatusSubject.value === 'connected';
  }
}
