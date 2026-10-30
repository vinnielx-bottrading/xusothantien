# Công cụ xử lý ảnh

Các script Python đã dùng để biến ảnh vẽ bằng ChatGPT thành asset trong `a/`. Cần Python 3, Pillow, NumPy, SciPy.

- `proc.py`, `seg.py`, `export.py`: ảnh nền trắng (Vùng 1). Tách nền theo độ sáng, cắt các tấm bộ cảnh rời thành từng phần tử, xuất webp trong suốt.
- `sprites.py`: bảng khung hình nhân vật nền xanh. Tách nền xanh, tách từng khung, căn chân về cùng đường nền, chuẩn hoá chiều cao, xuất dải khung `boy_*.webp`, `sis_*.webp` và `sprites.json` (chép vào `js/data.js` dạng `window.SPR=...`).
- `misc.py`: nón lá, cỏ, thùng, hũ, nhà sàn, hoa văn, biểu tượng, ảnh trang chào.

Các script đọc ảnh từ thư mục `src/` và ghi ra `out/`; sửa đường dẫn ở đầu file nếu chạy lại.
