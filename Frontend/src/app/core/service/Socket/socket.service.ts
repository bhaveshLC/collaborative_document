import { Injectable } from "@angular/core"
import { io, type Socket } from "socket.io-client"
import { BehaviorSubject, type Observable } from "rxjs"
import { apiUrl } from "../../../Environments/environment"

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket
  private connectionStatus = new BehaviorSubject<boolean>(false)
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.socket = io(apiUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
    })

    this.setupConnectionListeners()
  }

  private setupConnectionListeners(): void {
    this.socket.on("connect", () => {
      console.log("Connected to server")
      this.connectionStatus.next(true)
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason)
      this.connectionStatus.next(false)
    })

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
      this.connectionStatus.next(false)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached")
      }
    })

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts")
      this.connectionStatus.next(true)
      this.reconnectAttempts = 0
    })

    this.socket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error)
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  }

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect()
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect()
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn("Socket not connected. Cannot emit:", event)
      // Optionally queue the event to emit when reconnected
    }
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback)
  }

  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket.off(event, callback)
    } else {
      this.socket.off(event)
    }
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable()
  }

  isConnected(): boolean {
    return this.socket.connected
  }

  reconnect(): void {
    this.socket.disconnect()
    setTimeout(() => {
      this.socket.connect()
    }, 1000)
  }
}
