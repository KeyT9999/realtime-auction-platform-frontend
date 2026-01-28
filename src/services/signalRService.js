import * as signalR from '@microsoft/signalr';

const HUB_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5145').replace('/api', '') + '/auctionHub';

class SignalRService {
    constructor() {
        this.connection = null;
        this.callbacks = {};
    }

    async startConnection() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

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

        try {
            await this.connection.start();
            console.log('SignalR Connected');
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
        }
    }

    async joinAuction(auctionId) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke('JoinAuctionGroup', auctionId);
        }
    }

    async leaveAuction(auctionId) {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke('LeaveAuctionGroup', auctionId);
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
