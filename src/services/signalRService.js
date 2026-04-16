// Mục đích tệp: Chua logic nghiep vu chinh cho phan signalRService.
import * as signalR from '@microsoft/signalr';
import { tokenService } from './tokenService';

const HUB_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5145').replace('/api', '') + '/auctionHub';
const LOG_LEVEL = import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning;

class SignalRService {
  constructor() {
    this.connection = null;
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async startConnection() {
    if (this.connection && (
      this.connection.state === signalR.HubConnectionState.Connected ||
      this.connection.state === signalR.HubConnectionState.Connecting ||
      this.connection.state === signalR.HubConnectionState.Reconnecting
    )) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => tokenService.getAccessToken() || '',
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(LOG_LEVEL)
      .build();

    const forward = (event) => (data) => this.emit(event, data);
    [
      'UpdateBid',
      'AuctionChatMessage',
      'AuctionEnded',
      'TimeExtended',
      'AuctionStatusChanged',
      'UserNotification',
      'AdminNotification',
      'SupportMessageReceived',
      'SupportMessageSent',
      'SupportReplyReceived',
      'SupportReplySent',
      'ViewerCountUpdated',
      'UserOutbid',
      'AuctionAccepted',
      'AuctionBuyout',
      'AuctionCancelled',
      'UserWon',
      'BalanceReleased',
      'EndingSoon',
    ].forEach((evt) => this.connection.on(evt, forward(evt)));

    this.connection.onreconnecting((error) => {
      console.warn('SignalR Reconnecting...', error);
      this.emit('Reconnecting', error);
    });

    this.connection.onreconnected(async (connectionId) => {
      console.log('SignalR Reconnected', connectionId);
      this.reconnectAttempts = 0;

      try {
        await this.connection.invoke('JoinUserGroup');
      } catch (err) {
        console.error('Error rejoining user group after reconnect:', err);
      }

      this.emit('Reconnected', connectionId);
    });

    this.connection.onclose((error) => {
      console.error('SignalR Connection Closed', error);
      this.emit('Disconnected', error);
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected');
      this.reconnectAttempts = 0;
      return true;
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      this.reconnectAttempts += 1;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.startConnection();
        }, 5000);
      }

      return false;
    }
  }

  async joinAuction(auctionId) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.startConnection();
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinAuctionGroup', auctionId);
        console.log(`Joined auction group: ${auctionId}`);
      } catch (err) {
        console.error('Error joining auction group:', err);
      }
    }
  }

  async leaveAuction(auctionId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveAuctionGroup', auctionId);
        console.log(`Left auction group: ${auctionId}`);
      } catch (err) {
        console.error('Error leaving auction group:', err);
      }
    }
  }

  async joinUserGroup() {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.startConnection();
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinUserGroup');
      } catch (err) {
        console.error('Error joining user group:', err);
      }
    }
  }

  async joinAdminGroup() {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.startConnection();
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinAdminGroup');
      } catch (err) {
        console.error('Error joining admin group:', err);
      }
    }
  }

  async stopConnection() {
    if (this.connection) {
      const connection = this.connection;
      this.connection = null;

      try {
        await connection.stop();
        console.log('SignalR Disconnected');
      } catch (err) {
        console.error('Error stopping connection:', err);
      }
    }
  }

  getConnectionState() {
    if (!this.connection) return 'Disconnected';

    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return 'Connected';
      case signalR.HubConnectionState.Connecting:
        return 'Connecting';
      case signalR.HubConnectionState.Reconnecting:
        return 'Reconnecting';
      case signalR.HubConnectionState.Disconnected:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  }

  async invoke(method, ...args) {
    await this.startConnection();
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection.invoke(method, ...args);
    }
    throw new Error('SignalR not connected');
  }

  emit(event, data) {
    const handlers = this.callbacks[event];
    if (!handlers) return;

    for (const callback of handlers) {
      try {
        callback(data);
      } catch (error) {
        console.error(`[SignalR] callback error for ${event}:`, error);
      }
    }
  }

  on(event, callback) {
    if (!this.callbacks[event]) this.callbacks[event] = new Set();
    this.callbacks[event].add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.callbacks[event]) return;
    if (!callback) {
      delete this.callbacks[event];
      return;
    }

    this.callbacks[event].delete(callback);
    if (this.callbacks[event].size === 0) {
      delete this.callbacks[event];
    }
  }
}

export const signalRService = new SignalRService();
