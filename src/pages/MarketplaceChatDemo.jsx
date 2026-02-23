import React, { useState } from 'react';
import MarketplaceChat from '../components/Chat/MarketplaceChat';
import { useAuth } from '../contexts/AuthContext';

const MarketplaceChatDemo = () => {
    const { user } = useAuth();
    const [showChat, setShowChat] = useState(true);

    // Mock product data - Cho Tot style
    const mockProduct = {
        id: '1',
        title: 'Xe máy Honda Wave RSX 2020 - Xe đẹp, chạy êm',
        price: '15.000.000',
        thumbnail: 'https://images.unsplash.com/photo-1558980664-1db506751c6c?w=100&h=100&fit=crop&q=80',
        seller: {
            id: '2',
            firstName: 'Nguyễn',
            lastName: 'Văn A'
        }
    };

    if (!showChat) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Marketplace Chat Demo
                    </h1>
                    <p className="text-gray-600 mb-6">
                        High-fidelity mobile marketplace chat interface similar to Cho Tot or Carousell
                    </p>
                    <button
                        onClick={() => setShowChat(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                        Open Chat Interface
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-900 flex items-center justify-center">
            {/* Mobile Frame Simulation */}
            <div className="relative w-full max-w-md h-full max-h-[900px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    <MarketplaceChat 
                        product={mockProduct} 
                        onClose={() => setShowChat(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketplaceChatDemo;

