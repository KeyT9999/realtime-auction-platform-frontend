import Card from '../common/Card';
import Input from '../common/Input';
import ImageUpload from '../common/ImageUpload';

/**
 * Shared auction fields form (title, description, images, pricing, times, reserve, optional category & buyout).
 * Used by CreateAuction and EditAuction.
 * formData: { title, description, images, startingPrice, bidIncrement, startTime, endTime, reservePrice, categoryId?, buyoutPrice? }
 * onChange: (fieldName, value) => void
 */
const AuctionForm = ({
  formData,
  onChange,
  validationErrors = {},
  categories = [],
  readOnly = false,
  canEditPricing = true,
  canEditTimes = true,
  canEditTitle = true,
  canEditCategory = true,
  showCategory = false,
  showBuyout = false,
  imageFieldLabel = 'ảnh đấu giá',
  sectionTitle = '2. Thông tin đấu giá',
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange(name, type === 'checkbox' ? checked : value);
  };

  const handleImagesChange = (images) => {
    onChange('images', images);
  };

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        {sectionTitle} <span className="text-red-500">*</span>
      </h2>
      <div className="space-y-4">
        <Input
          label="Tiêu đề đấu giá"
          name="title"
          value={formData.title ?? ''}
          onChange={handleChange}
          error={validationErrors.title}
          required
          disabled={readOnly || !canEditTitle}
          placeholder={readOnly ? undefined : 'Ví dụ: iPhone 13 Pro 128GB'}
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Mô tả đấu giá</label>
          <textarea
            name="description"
            value={formData.description ?? ''}
            onChange={handleChange}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md bg-background-primary text-text-primary ${
              validationErrors.description ? 'border-red-500' : 'border-border-primary'
            }`}
            rows="3"
            placeholder="Mô tả chi tiết về đấu giá..."
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
          )}
        </div>

        {!readOnly && (
          <ImageUpload
            images={formData.images ?? []}
            onChange={handleImagesChange}
            error={validationErrors.images || validationErrors.auctionImages}
            maxImages={5}
          />
        )}
        {readOnly && (formData.images?.length > 0) && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">{imageFieldLabel}</label>
            <div className="flex gap-2 flex-wrap">
              {formData.images.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-md" />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá khởi điểm (VND)"
            name="startingPrice"
            type="number"
            step="1000"
            min="1000"
            value={formData.startingPrice ?? ''}
            onChange={handleChange}
            error={validationErrors.startingPrice}
            placeholder="Tối thiểu 1,000 VND"
            required
            disabled={readOnly || !canEditPricing}
          />
          <Input
            label="Bước giá tối thiểu (VND)"
            name="bidIncrement"
            type="number"
            step="1000"
            min="1000"
            value={formData.bidIncrement ?? ''}
            onChange={handleChange}
            error={validationErrors.bidIncrement}
            placeholder="Tối thiểu 1,000 VND"
            required
            disabled={readOnly || !canEditPricing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Thời gian bắt đầu"
            name="startTime"
            type="datetime-local"
            value={formData.startTime ?? ''}
            onChange={handleChange}
            error={validationErrors.startTime}
            required
            disabled={readOnly || !canEditTimes}
          />
          <Input
            label="Thời gian kết thúc"
            name="endTime"
            type="datetime-local"
            value={formData.endTime ?? ''}
            onChange={handleChange}
            error={validationErrors.endTime}
            required
            disabled={readOnly || !canEditTimes}
          />
        </div>

        <Input
          label="Giá thấp nhất có thể chấp nhận được (VND)"
          name="reservePrice"
          type="number"
          step="1000"
          value={formData.reservePrice ?? ''}
          onChange={handleChange}
          placeholder="Tùy chọn"
          disabled={readOnly || !canEditPricing}
        />

        {showBuyout && (
          <Input
            label="Giá mua ngay (VND) – tối thiểu 1.5x giá khởi điểm"
            name="buyoutPrice"
            type="number"
            step="1000"
            value={formData.buyoutPrice ?? ''}
            onChange={handleChange}
            error={validationErrors.buyoutPrice}
            placeholder="Tùy chọn"
            disabled={readOnly || !canEditPricing}
          />
        )}

        {showCategory && categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Danh mục</label>
            <select
              name="categoryId"
              value={formData.categoryId ?? ''}
              onChange={handleChange}
              disabled={readOnly || !canEditCategory}
              className={`w-full px-3 py-2 border rounded-md bg-background-primary text-text-primary ${
                validationErrors.categoryId ? 'border-red-500' : 'border-border-primary'
              }`}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {validationErrors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.categoryId}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuctionForm;
