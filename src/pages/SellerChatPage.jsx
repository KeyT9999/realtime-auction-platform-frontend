import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { auctionService } from '../services/auctionService';
import ChatPage from './ChatPage';

const SellerChatPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useChat();

  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (hasStartedRef.current) {
        return;
      }

      if (!user?.id) return;
      if (!auctionId) return;

      try {
        setLoading(true);
        const auctionData = await auctionService.getAuctionById(auctionId);
        setAuction(auctionData);

        const sellerUser = {
          id: auctionData.sellerId,
          firstName:
            auctionData.seller?.firstName ||
            (auctionData.sellerName ? auctionData.sellerName.split(' ').slice(0, -1).join(' ') : 'Người'),
          lastName:
            auctionData.seller?.lastName ||
            (auctionData.sellerName ? auctionData.sellerName.split(' ').slice(-1).join(' ') : 'Bán'),
        };

        const title = auctionData.title || auctionData.product?.name || 'sản phẩm';
        const link = `${window.location.origin}/auction/${auctionId}`;
        const seedMessage = `Chào bạn, mình quan tâm đến sản phẩm "${title}". Bạn có thể cung cấp thêm thông tin không?\n${link}`;

        hasStartedRef.current = true;

        await startConversation(sellerUser, auctionId, {
          openWidget: false,
          seedMessage,
        });
      } catch (err) {
        toast.error(err?.message || 'Không thể mở chat với người bán');
        navigate(`/auction/${auctionId}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [auctionId, user?.id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-gray-600">Đang mở chat...</div>
      </div>
    );
  }

  return <ChatPage />;
};

export default SellerChatPage;

