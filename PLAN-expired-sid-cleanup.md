# Kế hoạch: dọn các SID hết hạn

## Hiện trạng

- `AuthService.signIn()` tạo `sid` bằng UUID và lưu cặp `accessToken`/`refreshToken` vào Redis qua `setJson()`, hiện không đặt TTL cho khóa.
- Access token hết hạn sau 1 ngày; refresh token hết hạn sau 7 ngày. Khi refresh thành công, cặp token mới được lưu lại cùng `sid` và refresh token có thời hạn 7 ngày mới.
- `AuthGuard` đọc dữ liệu Redis theo `sid`; `refreshToken()` xác thực refresh token và từ chối phiên hết hạn.
- Dự án đã cài `@nestjs/schedule`, gọi `ScheduleModule.forRoot()` trong `AppModule` và đang có ví dụ `@Cron` trong `MonitoringService`.

## Mục tiêu

Tự động xóa khỏi Redis các khóa phiên đăng nhập có refresh token hết hạn; không xóa phiên chỉ vì access token hết hạn, và không ảnh hưởng các khóa Redis không phải phiên.

## Các bước triển khai

1. **Bổ sung API quét Redis dùng `SCAN`**
   - Mở rộng `RedisService` để duyệt khóa theo lô bằng `SCAN`, tránh lệnh `KEYS` có thể chặn Redis khi keyspace lớn.
   - Với mỗi khóa, đọc và kiểm tra dữ liệu có cấu trúc phiên hợp lệ (`refreshToken`); bỏ qua khóa không phải phiên hoặc dữ liệu không đọc/parse được.
2. **Xác định phiên hết hạn**
   - Đọc `exp` từ refresh token và so sánh với thời điểm hiện tại.
   - Chỉ xóa SID khi refresh token đã hết hạn; không dùng thời hạn access token làm tiêu chí dọn.
   - Khi xóa, chỉ xóa khóa đã kiểm tra là phiên hết hạn; xử lý theo lô để tránh tạo tải đột biến.
3. **Tạo scheduled job cho auth**
   - Thêm phương thức cleanup vào `AuthService`, đánh dấu bằng `@Cron` và chạy định kỳ mỗi giờ.
   - Đảm bảo `AuthModule` dùng được `ScheduleModule` đã được khởi tạo toàn cục trong `AppModule`.
   - Ghi log số phiên đã xóa và lỗi quét Redis; không để lỗi một khóa làm dừng toàn bộ lượt quét.
4. **Kiểm tra và xác nhận**
   - Không bổ sung unit test theo yêu cầu.
   - Chạy `npm run build` và rà soát thay đổi; xác nhận job chỉ xóa khóa phiên hết hạn và có thể chạy lặp lại an toàn.
   - Xác nhận job chỉ xóa khóa phiên hết hạn và có thể chạy lặp lại an toàn.

## Phạm vi dự kiến chỉnh sửa

- `src/modules/redis/redis.service.ts`: bổ sung khả năng quét Redis theo lô.
- `src/modules/auth/auth.service.ts`: xử lý cleanup và lịch chạy.
- `src/modules/auth/auth.service.spec.ts` (hoặc test phù hợp hiện có): kiểm tra hành vi cleanup.

Không thay đổi cách phát hành cookie hay token trong `login` ngoài phạm vi yêu cầu; không thêm TTL tại thời điểm đăng nhập trong bước này.
