# Kế hoạch rà soát và gia cố request throttling

## Kết quả rà soát hiện tại

Security review đã kiểm tra phạm vi `ThrottlerModule`, guards, proxy/IP tracking và các route annotation. Kết quả được trả về: **chưa phát hiện lỗ hổng bảo mật cụ thể** trong phạm vi đã rà soát.

Kết quả này không đồng nghĩa với việc đã kiểm thử tải hoặc xác nhận chính sách giới hạn request phù hợp với mọi endpoint và môi trường triển khai.

## Mục tiêu

- Xác nhận giới hạn request được áp dụng đúng ở các endpoint cần bảo vệ.
- Đảm bảo giới hạn hoạt động nhất quán khi chạy nhiều instance backend.
- Xác định đúng client IP khi backend đứng sau reverse proxy.
- Có kiểm thử hồi quy và theo dõi được các request bị giới hạn.

## Các bước đề xuất

1. **Chốt chính sách rate limit**
   - Liệt kê các nhóm endpoint: đăng nhập/đăng ký, webhook, thao tác ghi dữ liệu và endpoint đọc.
   - Xác nhận ngưỡng và thời gian giới hạn phù hợp cho từng nhóm; không áp dụng override rộng hơn nếu chưa có lý do nghiệp vụ.
   - Ghi rõ endpoint nào được miễn giới hạn và lý do.

2. **Xác nhận cấu hình chạy thực tế**
   - Kiểm tra global guard có được đăng ký trong module khởi động và có áp dụng trong môi trường production.
   - Xác nhận storage của bộ đếm phù hợp khi chạy nhiều process/instance; nếu mỗi instance giữ bộ đếm riêng, chuyển sang storage dùng chung.
   - Kiểm tra cấu hình trusted proxy và cách lấy client IP. Chỉ tin header proxy do load balancer đáng tin cậy ghi đè; không tin header do client tự gửi.

3. **Bổ sung kiểm thử**
   - Kiểm thử request trong giới hạn được chấp nhận và request vượt giới hạn nhận HTTP `429`.
   - Kiểm thử các route có `@Throttle`/ngoại lệ để bảo đảm override không vô tình bỏ qua global limit.
   - Nếu triển khai nhiều instance, kiểm thử bộ đếm được chia sẻ giữa các instance.
   - Kiểm thử client IP qua reverse proxy để tránh dùng chung một khóa cho mọi người dùng hoặc cho phép giả mạo IP.

4. **Theo dõi sau triển khai**
   - Ghi nhận số lượng response `429` theo route và khoảng thời gian, tránh log dữ liệu nhạy cảm.
   - Theo dõi tỷ lệ chặn bất thường và điều chỉnh ngưỡng dựa trên lưu lượng thực tế.
   - Đảm bảo phản hồi lỗi giới hạn có thông tin chờ thử lại phù hợp nếu chính sách hiện tại hỗ trợ.

## Tiêu chí hoàn tất

- Có bảng chính sách giới hạn cho endpoint/nhóm endpoint.
- Kiểm thử xác nhận hành vi `429`, override, proxy IP và storage đa instance (nếu môi trường chạy nhiều instance).
- Cấu hình production được xác nhận dùng đúng guard, storage và trusted proxy.
- Có cách quan sát các request bị giới hạn sau khi triển khai.

## Trạng thái

- Rà soát bảo mật: hoàn tất, chưa có finding cụ thể được báo cáo.
- Kế hoạch kiểm chứng/gia cố: chờ thực hiện; đây không phải danh sách lỗi đã xác nhận.
