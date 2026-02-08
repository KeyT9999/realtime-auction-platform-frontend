import { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import { reviewService } from '../../services/reviewService';
import './ReviewModal.css';

function ReviewModal({ isOpen, onClose, orderId, targetName, targetRole, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const MAX_COMMENT_LENGTH = 500;

    const getRatingText = (r) => {
        const texts = {
            1: 'Rất tệ',
            2: 'Tệ',
            3: 'Bình thường',
            4: 'Tốt',
            5: 'Xuất sắc',
        };
        return texts[r] || '';
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        try {
            setSubmitting(true);
            await reviewService.createReview(orderId, rating, comment.trim() || null);
            toast.success('Đánh giá thành công!');
            onSuccess?.();
            handleClose();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setHoverRating(0);
        setComment('');
        onClose();
    };

    const charCountClass = comment.length > 450
        ? (comment.length > MAX_COMMENT_LENGTH ? 'error' : 'warning')
        : '';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Đánh giá ${targetRole}`}
        >
            <div className="review-modal-content">
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                    Đánh giá <strong>{targetName}</strong> cho giao dịch này
                </p>

                {/* Star Rating */}
                <span className="rating-label">Điểm đánh giá *</span>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`star-button ${(hoverRating || rating) >= star ? 'filled' : 'empty'}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            ★
                        </button>
                    ))}
                    {(hoverRating || rating) > 0 && (
                        <span className="rating-text">{getRatingText(hoverRating || rating)}</span>
                    )}
                </div>

                {/* Comment */}
                <span className="rating-label">Nhận xét (tùy chọn)</span>
                <textarea
                    className="comment-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    rows={4}
                />
                <div className={`char-count ${charCountClass}`}>
                    {comment.length}/{MAX_COMMENT_LENGTH}
                </div>

                {/* Actions */}
                <div className="review-actions">
                    <button
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ReviewModal;
