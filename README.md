# Xứ Sở Thần Tiên

Game phiêu lưu 2D silhouette chạy trên trình duyệt, lấy cảm hứng từ Limbo, bối cảnh Thất Sơn, An Giang. Thuộc dự án **Vinh làm game**.

> Dành tặng những tâm hồn yêu gia đình tha thiết, dẫu mang muôn vàn thương tổn vẫn kiên cường sống và dịu dàng yêu lấy cuộc đời.

Bản hiện tại: trang chào, cảnh mở đầu (nhà bên đồng) và Vùng 1 Đồng thốt nốt, kết thúc bằng cảnh gặp Người Thốt Nốt.

## Chơi thử trên máy

Mở `index.html` bằng Chrome hoặc Edge. Nếu trình duyệt chặn nhạc khi mở file trực tiếp, chạy một server tĩnh trong thư mục này, ví dụ `npx serve .` hoặc `python -m http.server`, rồi mở địa chỉ nó in ra.

Điều khiển: ← → đi · Space nhảy · giữ Shift để nắm, kéo · Esc tạm dừng. Trên điện thoại có nút cảm ứng.

## Đưa lên GitHub và Vercel

1. Tạo repository mới trên GitHub, đẩy toàn bộ thư mục này lên (dùng GitHub Desktop hoặc `git`; giao diện web chỉ nhận tối đa 100 file mỗi lần kéo thả).
2. Trên Vercel chọn **Add New → Project**, import repository vừa tạo.
3. Framework Preset: **Other**. Không cần Build Command, Output Directory để trống (thư mục gốc).
4. Deploy. `.vercelignore` loại `source_assets/` và `tools/` khỏi bản deploy nên trang nhẹ, còn GitHub vẫn lưu đủ nguồn.

## Cấu trúc

```
index.html            khung trang, trang chào, menu, thẻ ủng hộ
js/game.js            game: mở đầu, Vùng 1, trang chào múa rối, âm thanh, menu
js/encounter.js       cảnh cuối Vùng 1: Người Thốt Nốt đùa giỡn với cậu bé
js/support.js         thẻ ủng hộ, tạo mã VietQR theo số tiền chọn
js/data.js            vị trí từng khung hình trong các dải sprite
js/vendor/qrcode.js   thư viện tạo QR (qrcode-generator 1.4.4, MIT, Kazuhiko Arase)
a/                    ảnh đã tách nền (webp), QR gốc, a/music/ nhạc
source_assets/        ảnh gốc ChatGPT, nhạc, prompt, bản thiết kế, ASSET_MAP.md
tools/                script Python xử lý ảnh
```

## Ủng hộ

Thẻ ủng hộ dựng mã VietQR Vietcombank ngay trong trang. Khi người chơi chọn số tiền, mã chuyển sang VietQR động có sẵn số tiền và nội dung "Ung ho Xu So Than Tien". `a/qr_ung_ho.png` là ảnh dự phòng khi thư viện QR không tải được.

## Vinh làm game

Script `vlg.js` gắn ở cuối `index.html` với `data-game="xu-so-than-tien"`. Nếu slug trên trang Vinh làm game khác thì sửa giá trị này.

## Bản quyền nhạc

Nhạc trong `a/music/` do tác giả tự tìm và tạo. Kiểm tra giấy phép sử dụng của từng bản trước khi phát hành công khai.
