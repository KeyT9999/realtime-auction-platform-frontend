const API_KEY = 'AIzaSyB8KPcz_qV2ZC136UD0hng9ogooTOZCv_U';

const PROMPT = `Bạn là một chuyên gia thẩm định tài sản và trợ lý AI thông minh cho một nền tảng đấu giá trực tuyến chuyên nghiệp tại Việt Nam.
Nhiệm vụ của bạn là phân tích cực kỳ chi tiết các hình ảnh sản phẩm được cung cấp, nhận diện mọi đặc điểm, chữ viết, logo, tình trạng hao mòn để tự động điền thông tin sản phẩm có độ chính xác cao nhất (>=95%).

Hãy tuân thủ nghiêm ngặt các yêu cầu sau:

1. Trích xuất và Điền thông tin (JSON Output):
Vui lòng trả về kết quả dưới dạng một đối tượng JSON duy nhất, với các trường và định dạng cụ thể như sau:

{
  "thong_tin_chung": {
    "ten_san_pham": {
      "gia_tri": "",
      "ghi_chu": "Tên sản phẩm CHI TIẾT và ĐẦY ĐỦ nhất có thể. Format: [Thương hiệu] + [Tên dòng máy/Dòng sản phẩm] + [Mã Model/Phiên bản cụ thể] + [Dung lượng/Kích thước/Màu sắc nếu có]. Ví dụ: 'Điện thoại Apple iPhone 15 Pro Max 256GB Titan Tự nhiên', 'Đồng hồ nam Rolex Submariner Date 126610LN', 'Laptop Dell XPS 15 9520 Core i7'."
    },
    "mo_ta_tom_tat": {
      "gia_tri": "",
      "ghi_chu": "Mô tả hấp dẫn, chi tiết (3-5 câu). Phải bao gồm: 1. Nguồn gốc/Thương hiệu, 2. Đặc điểm nổi bật nhất nhìn thấy được (ví dụ: cụm camera, chất liệu dây đeo), 3. Tình trạng ngoại hình tinh vi (ví dụ: xước xát nhẹ ở góc, màn hình còn sáng đẹp, có hộp đi kèm hay không). Viết như một chuyên gia SEO bán hàng."
    },
    "danh_muc_san_pham": {
      "gia_tri": "",
      "ghi_chu": "Xác định danh mục CHÍNH XÁC NHẤT từ danh sách: 'Điện thoại', 'Máy tính bảng', 'Laptop', 'Đồng hồ', 'Đồ điện tử khác', 'Phụ kiện', 'Đồ gia dụng', 'Thời trang', 'Đồ sưu tầm', 'Nghệ thuật', 'Khác'."
    },
    "tinh_trang_san_pham": {
      "gia_tri": "",
      "ghi_chu": "Đánh giá NGHIÊM NGẶT tình trạng. Chọn MỘT trong: 'Mới nguyên hộp' (nếu còn seal/hộp chưa mở), 'Mới 99% (Đã qua sử dụng)' (không thấy tì vết), 'Đã qua sử dụng (Tốt)' (xước xát cực nhỏ, khó thấy), 'Đã qua sử dụng (Khá)' (xước, cấn móp rõ ràng), 'Hư hỏng/Cần sửa chữa' (vỡ kính, rách, thiếu linh kiện)."
    },
    "thuong_hieu": {
      "gia_tri": "",
      "ghi_chu": "Thương hiệu chính (VD: Apple, Samsung, Rolex, Honda). Nhận diện qua logo hoặc text."
    },
    "mau_ma_phien_ban": {
      "gia_tri": "",
      "ghi_chu": "Phiên bản hoặc số Model chính xác (VD: 'Pro Max', 'Series 9', 'Ref 116610', 'Air M2'). Đọc kỹ các dòng chữ nhỏ trên thiết bị."
    },
    "nam_san_xuat": {
      "gia_tri": null,
      "ghi_chu": "Trả về số nguyên (VD: 2023). Dựa vào kinh nghiệm về đời máy (iPhone 15 ra mắt năm 2023) hoặc tem mác trên ảnh."
    }
  },
  "thong_tin_dau_gia": {
    "gia_khoi_diem": {
      "gia_tri": null,
      "ghi_chu": "Giá khởi điểm bằng VNĐ (Số nguyên không chứa dấu x, VNĐ). Phân tích kỹ tình trạng cũ/mới để đưa ra mức giá khởi điểm thị trường đồ cũ tại Việt Nam rẻ hơn khoảng 20-30% so với giá trị thực tế để thu hút người đấu giá. (Ví dụ iPhone 15 Pro Max cũ thường giá trị 20-25 triệu -> Giá khởi điểm nên là 15000000)."
    },
    "buoc_gia_toi_thieu": {
      "gia_tri": null,
      "ghi_chu": "Bằng VNĐ. Nếu giá khởi điểm > 10 triệu: bước giá là 500000 hoặc 1000000. Nếu 1-10 triệu: 100000 hoặc 200000. Dưới 1 triệu: 50000 hoặc 10000."
    }
  }
}

2. Hướng dẫn ĐẶC BIỆT KỸ LƯỠNG:
- NHẬN DIỆN VĂN BẢN (OCR): Đặc biệt chú ý đọc mọi dòng chữ nhỏ xíu có trên tem, hộp, mặt lưng, màn hình thiết bị để lấy Model, IMEI, Serial, Dung lượng, Nước sản xuất.
- KẾT NỐI DỮ LIỆU: Phối hợp văn bản đọc được với hình dáng sản phẩm để tra cứu trong kho kiến thức của bạn. Ví dụ: Thấy 3 camera kiểu Apple + Viền Titan + chữ nhỏ trên hộp 256GB -> Kết luận chắc chắn đây là iPhone 15 Pro hoặc 15 Pro Max 256GB.
- KHÁCH QUAN & TRUNG THỰC: Bắt lỗi ngoại hình thật sắc bén. Nếu có xước, móp phải ghi vào phần mô tả và chọn tình trạng tương ứng. Không tâng bốc sản phẩm.
- HOÀN TOÀN BẰNG TIẾNG VIỆT: Mọi mô tả, nhận xét phải sử dụng tiếng Việt tự nhiên, phù hợp với văn phong thương mại, buôn bán đồ cũ/đấu giá.
- CHỈ TRẢ VỀ JSON: Tuyệt đối không có bất kỳ ký tự nào nằm ngoài đối tượng JSON.`;

const fileToGenerativePart = async (fileOrUrl) => {
  let blob = fileOrUrl;
  let mimeType = fileOrUrl.type;

  if (typeof fileOrUrl === 'string') {
    try {
      const response = await fetch(fileOrUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      blob = await response.blob();
      mimeType = blob.type || 'image/jpeg';
    } catch (error) {
      throw new Error(`Không thể tải ảnh từ URL để phân tích. (Lỗi CORS hoặc URL không hợp lệ: ${error.message})`);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64data,
          mimeType: mimeType
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeProductImage = async (images) => {
  if (!images || images.length === 0) return null;

  try {
    const imageParts = await Promise.all(images.map(fileToGenerativePart));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            ...imageParts
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to analyze image with Gemini: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Sometimes Gemini wraps JSON in markdown block even with responseMimeType
    let jsonStr = text;
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
