import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { signalRService } from '../services/signalRService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

function AuctionDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        loadAuction();

        // Setup Real-time
        const setupSignalR = async () => {
            await signalRService.startConnection();
            await signalRService.joinAuction(id);

            signalRService.on('UpdateBid', (data) => {
                console.log('Bid Update:', data);
                setAuction(prev => ({
                    ...prev,
                    currentPrice: data.currentPrice,
                    winnerId: data.winnerId, // masked or ID depending on backend
                    endTime: data.endTime || prev.endTime
                }));
                toast.info(`New highest bid: ${data.currentPrice.toLocaleString()} VND`);
            });

            signalRService.on('AuctionEnded', (data) => {
                setAuction(prev => ({ ...prev, status: data.status }));
                toast.info('Auction ended!');
            });

            signalRService.on('TimeExtended', (data) => {
                setAuction(prev => ({ ...prev, endTime: data.newEndTime }));
                toast.warning('Auction time extended by 2 minutes!');
            });
        };

        setupSignalR();

        return () => {
            signalRService.leaveAuction(id);
            signalRService.off('UpdateBid');
            signalRService.off('AuctionEnded');
            signalRService.off('TimeExtended');
        };
    }, [id]);

    useEffect(() => {
        // Timer logic
        if (!auction?.endTime) return;

        const timer = setInterval(() => {
            const end = new Date(auction.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('ENDED');
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [auction]);

    const loadAuction = async () => {
        try {
            const data = await auctionService.getAuctionById(id);
            setAuction(data);
            if (data) {
                // Suggest next bid
                const step = data.stepPrice?.$numberDecimal ? parseFloat(data.stepPrice.$numberDecimal) : data.stepPrice;
                const current = data.currentPrice?.$numberDecimal ? parseFloat(data.currentPrice.$numberDecimal) : data.currentPrice || data.startPrice; // Handle decimal128 from Mongo

                // Helper to parse Decimal128 or number
                const parseMoney = (val) => val?.$numberDecimal ? parseFloat(val.$numberDecimal) : (val || 0);

                const nextMin = parseMoney(data.currentPrice) > 0
                    ? parseMoney(data.currentPrice) + parseMoney(data.stepPrice)
                    : parseMoney(data.startPrice);

                setBidAmount(nextMin);
            }
        } catch (err) {
            toast.error('Failed to load auction');
        } finally {
            setLoading(false);
        }
    };

    const handleBid = async () => {
        if (!user) {
            toast.error('Please login to bid');
            return;
        }
        try {
            await auctionService.placeBid(id, bidAmount);
            toast.success('Bid placed successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to place bid');
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!auction) return <div className="text-center py-10">Auction not found</div>;

    // Helper to parse Decimal128
    const parseMoney = (val) => val?.$numberDecimal ? parseFloat(val.$numberDecimal) : (val || 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        {auction.imageUrls && auction.imageUrls.length > 0 ? (
                            <img src={auction.imageUrls[0]} alt={auction.title} className="max-h-full max-w-full object-contain" />
                        ) : (
                            <span className="text-gray-400">No Image</span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-800">{auction.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                    ${auction.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {auction.status}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-6">{auction.description}</p>

                    <div className="border-t border-b border-gray-100 py-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Current Price</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {parseMoney(auction.currentPrice).toLocaleString()} VND
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Time Left</p>
                                <p className="text-2xl font-bold text-red-500">{timeLeft}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Start Price</p>
                                <p className="font-medium">{parseMoney(auction.startPrice).toLocaleString()} VND</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Step Price</p>
                                <p className="font-medium">{parseMoney(auction.stepPrice).toLocaleString()} VND</p>
                            </div>
                        </div>
                    </div>

                    {/* Bidding Section */}
                    {auction.status === 'Active' && timeLeft !== 'ENDED' ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Place your bid</label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(Number(e.target.value))}
                                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleBid}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                                    disabled={!user}
                                >
                                    Place Bid
                                </button>
                            </div>
                            {!user && <p className="text-sm text-red-500 mt-2">Login to bid</p>}
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
                            Bidding has ended
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuctionDetail;
