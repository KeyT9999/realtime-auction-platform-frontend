import { useState, useRef } from 'react';
import { imageUploadService } from '../../services/imageUploadService';
import Button from './Button';
import Alert from './Alert';

const ImageUpload = ({ images = [], onChange, maxImages = 5, maxSizeMB = 5, error }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return 'Chỉ chấp nhận file ảnh: JPG, PNG, WEBP';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Kích thước file không được vượt quá ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    setUploadError(null);

    if (images.length + files.length > maxImages) {
      setUploadError(`Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate all files
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        return;
      }
    }

    try {
      setUploading(true);
      const uploadedUrls = await imageUploadService.uploadImages(files);
      
      if (uploadedUrls.urls && uploadedUrls.urls.length > 0) {
        const newImages = [...images, ...uploadedUrls.urls];
        onChange(newImages);
      }
    } catch (err) {
      setUploadError(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const event = { target: { files } };
      handleFileSelect(event);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-primary mb-2">
        Hình ảnh sản phẩm ({images.length}/{maxImages}) *
      </label>
      
      <div
        className="border-2 border-dashed border-border-primary rounded-lg p-6 text-center cursor-pointer hover:border-primary-blue transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        
        {uploading ? (
          <div className="text-text-secondary">Đang upload...</div>
        ) : images.length >= maxImages ? (
          <div className="text-text-secondary">Đã đạt tối đa {maxImages} ảnh</div>
        ) : (
          <div>
            <p className="text-text-secondary mb-2">
              Kéo thả ảnh vào đây hoặc click để chọn
            </p>
            <p className="text-sm text-text-secondary">
              Tối đa {maxImages} ảnh, mỗi ảnh tối đa {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Sản phẩm ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {(error || uploadError) && (
        <Alert
          type="error"
          message={error || uploadError}
          className="mt-2"
        />
      )}
    </div>
  );
};

export default ImageUpload;
