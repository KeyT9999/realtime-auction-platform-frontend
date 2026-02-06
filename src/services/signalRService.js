import * as signalR from '@microsoft/signalr';

const HUB_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5145').replace('/api', '') + '/auctionHub';

class SignalRService {
    constructor() {
        this.connection = null;
        this.callbacks = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async startConnection() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff: 0s, 2s, 10s, 30s, then every 30s
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    return 30000;
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Setup event handlers
        this.connection.on('UpdateBid', (data) => {
            if (this.callbacks['UpdateBid']) {
                this.callbacks['UpdateBid'](data);
            }
        });

        this.connection.on('AuctionEnded', (data) => {
            if (this.callbacks['AuctionEnded']) {
                this.callbacks['AuctionEnded'](data);
            }
        });

        this.connection.on('TimeExtended', (data) => {
            if (this.callbacks['TimeExtended']) {
                this.callbacks['TimeExtended'](data);
            }
        });

        this.connection.on('ViewerCountUpdated', (data) => {
            if (this.callbacks['ViewerCountUpdated']) {
                this.callbacks['ViewerCountUpdated'](data);
            }
        });

        this.connection.on('UserOutbid', (data) => {
            if (this.callbacks['UserOutbid']) {
                this.callbacks['UserOutbid'](data);
            }
        });

        this.connection.on('AuctionAccepted', (data) => {
            if (this.callbacks['AuctionAccepted']) {
                this.callbacks['AuctionAccepted'](data);
            }
        });

        this.connection.on('AuctionBuyout', (data) => {
            if (this.callbacks['AuctionBuyout']) {
                this.callbacks['AuctionBuyout'](data);
            }
        });

        this.connection.on('AuctionCancelled', (data) => {
            if (this.callbacks['AuctionCancelled']) {
                this.callbacks['AuctionCancelled'](data);
            }
        });

        // Reconnection handlers
        this.connection.onreconnecting((error) => {
            console.warn('SignalR Reconnecting...', error);
            if (this.callbacks['Reconnecting']) {
                this.callbacks['Reconnecting']();
            }
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR Reconnected', connectionId);
            this.reconnectAttempts = 0;
            if (this.callbacks['Reconnected']) {
                this.callbacks['Reconnected']();
            }
        });

        this.connection.onclose((error) => {
            console.error('SignalR Connection Closed', error);
            if (this.callbacks['Disconnected']) {
                this.callbacks['Disconnected']();
            }
        });

        try {
            await this.connection.start();
            console.log('SignalR Connected');
            this.reconnectAttempts = 0;
            return true;
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                // Retry connection after a delay
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

    async stopConnection() {
        if (this.connection) {
            try {
                await this.connection.stop();
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

    on(event, callback) {
        this.callbacks[event] = callback;
    }

    off(event) {
        delete this.callbacks[event];
    }
}

export const signalRService = new SignalRService();
