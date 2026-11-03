# Thiết kế refactor backend theo DDD

> **Trạng thái:** Thiết kế đã được duyệt; triển khai theo từng vertical slice.
>
> **Phạm vi:** Backend NestJS/TypeScript hiện tại (`src/`), triển khai theo hướng **modular monolith**. Ưu tiên giữ nguyên API, schema dữ liệu và hành vi đang dùng; việc thay đổi ngoài các mục tiêu này cần được thống nhất riêng.

## 1. Mục tiêu và nguyên tắc

- Tập trung điều phối nghiệp vụ trong **Use Case**; controller chỉ nhận/trả HTTP, không chứa nghiệp vụ.
- Tách quy tắc miền khỏi NestJS, TypeORM, Redis và HTTP client.
- Mỗi bounded context sở hữu nghiệp vụ và hợp đồng của mình; hạn chế phụ thuộc vòng giữa các module.
- Persistence và dịch vụ bên ngoài được truy cập qua port/interface, cài đặt bằng adapter ở infrastructure.
- Chuyển đổi từng phần, có kiểm thử đặc trưng trước khi di chuyển nghiệp vụ; tránh viết lại toàn bộ trong một lần.
- Giữ tương thích API và dữ liệu trong các giai đoạn đầu; không tự ý đổi schema, authentication hay business rule.

## 2. Bảng kiến trúc đích

| Lớp | Vị trí đề xuất | Trách nhiệm | Được phép phụ thuộc | Không nên chứa |
|---|---|---|---|---|
| Presentation | `src/<context>/presentation/` | Controller, DTO HTTP, mapper request/response, guard/interceptor đặc thù transport | Application; shared presentation | Query DB, business rule, gọi trực tiếp API ngoài |
| Application | `src/<context>/application/` | Use Case, input/output models, điều phối domain và ports, transaction boundary | Domain; application ports | TypeORM/Nest HTTP details, SQL, quy tắc nghiệp vụ nằm rải rác ở controller |
| Domain | `src/<context>/domain/` | Entity/aggregate, value object, domain service, domain event, business invariant | Domain thuần | NestJS, TypeORM, Redis, HTTP, DTO |
| Infrastructure | `src/<context>/infrastructure/` | Repository adapter, ORM mapping, SQL/query adapter, Redis/client adapter, scheduler adapter | Application ports; Domain | Quyết định nghiệp vụ thay Use Case/Domain |
| Composition root | `src/app.module.ts`, module của context | Khai báo DI, cấu hình adapter và kết nối giữa các lớp | Các module/lớp cần khởi tạo | Nghiệp vụ hoặc truy vấn dữ liệu |
| Shared | `src/shared/` | Thành phần kỹ thuật dùng chung thật sự: clock, pagination, lỗi nền tảng | Không phụ thuộc ngược vào context | “God utility”, helper chứa logic thuộc một miền cụ thể |

Luồng phụ thuộc dự kiến:

```text
HTTP / Scheduler / Consumer
             |
             v
       Presentation -------> Application (Use Case)
                                  |          |
                                  v          v
                               Domain   Application Ports
                                             ^
                                             |
                                      Infrastructure
```

`Application Ports` được định nghĩa phía trong (application/domain tùy loại hợp đồng); adapter TypeORM/Redis/API ngoài triển khai các port đó. NestJS module chỉ nối các implementation với use case.

## 3. Bảng bounded context và phạm vi di chuyển

| Bounded context đề xuất | Module hiện tại | Use Case/luồng nghiệp vụ dự kiến tập trung tại Application | Ghi chú ranh giới |
|---|---|---|---|
| Identity & Access | `auth`, `user` (phần tài khoản/đăng nhập), `common/guard`, `common/decorators` | Đăng nhập, refresh session, đổi mật khẩu, quản lý người dùng, kiểm tra quyền | Giữ guard làm adapter xác thực HTTP; session/JWT/Redis qua port. Xác định lại phần `user` quản trị thuộc context này sau khi rà soát đầy đủ. |
| Link Management | `links`, phần link trong `app.service`, `monitoring` (cập nhật trạng thái link) | Tạo/cập nhật/xóa link, lọc danh sách, kiểm soát quyền sở hữu và giới hạn gói | `Link` là miền trọng tâm; policy gói/giới hạn cần được xác định nguồn sở hữu rõ ràng. |
| Comment & Phone | `comments`, `phone-customer` | Xử lý comment, tra cứu/đồng bộ số điện thoại, quản lý khách hàng | Quan hệ với Link nên qua khóa/hợp đồng; không gọi repository của context khác trực tiếp. |
| Social Integrations | `facebook`, `user-tiktok`, `group-facebook` | Các luồng Facebook/TikTok, chuyển đổi định dạng/ID, xử lý nhóm | API ngoài được bọc bằng adapter; quy tắc riêng theo nền tảng nằm trong domain/application tương ứng. |
| Organization & Publishing | `group`, `page` | Quản lý nhóm/trang, gắn nội dung và quyền truy cập | Cần xác nhận ranh giới Page/Group với Link trước khi chuyển aggregate. |
| Resource Operations | `proxy`, `cookie`, `token`, `vps`, `monitoring` (health check VPS) | Quản lý tài nguyên, chọn tài nguyên, cập nhật tình trạng và kiểm tra sức khỏe | Có thể giữ các context riêng; gom vào một nhóm ở mức kiến trúc, không gộp domain tùy tiện. |
| Billing & Orders | `order`, `transaction` | Tạo/xử lý đơn, ghi nhận giao dịch và tổng hợp doanh thu/chi phí | Cần làm rõ source of truth và nguyên tắc transaction/idempotency trước khi thay đổi. |
| Configuration & Notifications | `config`, `notification` | Cập nhật cấu hình và gửi thông báo | Tách gửi thông báo thành port; không để use case phụ thuộc nhà cung cấp cụ thể. |
| Dashboard & Support | `app.controller.ts`, `app.service.ts` (dashboard, support, export, tổng hợp) | Lấy thống kê dashboard, quản lý yêu cầu hỗ trợ, export link, tổng hợp dữ liệu | Đây là các use case ứng dụng, không nên gom thành một domain `App`; báo cáo có thể dùng read/query adapter riêng. |
| Shared Infrastructure | `redis`, `infra/socket`, `common/utils`, cấu hình `app.module.ts` | Kết nối kỹ thuật, websocket, bootstrap, mapping tiện ích nền | Chỉ giữ utility thực sự dùng chung; hàm chứa business rule phải chuyển về context sở hữu. |

> Bảng trên là phân nhóm ban đầu theo tên và cấu trúc hiện tại. Trước khi di chuyển từng context cần rà soát luồng gọi, entity relations, API contract và quyền sở hữu dữ liệu để xác nhận ranh giới.

## 4. Cấu trúc thư mục mẫu

```text
src/
  app.module.ts
  main.ts
  shared/
    domain/
    application/
    infrastructure/
    presentation/
  modules/
    links/
      domain/
        entities/
        value-objects/
        repositories/
        services/
        events/
      application/
        ports/
        use-cases/
        dto/
      infrastructure/
        persistence/
          typeorm/
        clients/
      presentation/
        http/
          controllers/
          dto/
      links.module.ts
    auth/
    comments/
    ...
```

Tên `modules/` có thể được giữ nguyên để giảm phạm vi di chuyển; mục tiêu là tổ chức theo context và layer, không phải đổi tên toàn bộ đường dẫn ngay lập tức. Entity TypeORM hiện tại không mặc định trở thành domain entity: mapping domain ↔ persistence chỉ thêm khi đem lại ranh giới rõ ràng và có thể chuyển đổi an toàn.

## 5. Quy ước Use Case

| Quy ước | Áp dụng |
|---|---|
| Một hành động nghiệp vụ | Một class Use Case có tên động từ rõ nghĩa, ví dụ `CreateLinkUseCase`, `RefreshSessionUseCase`. |
| Input/output tường minh | Use Case nhận input độc lập HTTP; trả output ổn định, controller chịu trách nhiệm mapping sang response API. |
| Nghiệp vụ tập trung | Điều kiện quyền, policy, trình tự ghi dữ liệu và phối hợp context nằm trong Use Case/domain, không phân tán giữa controller/interceptor/service. |
| Hạ tầng qua port | Use Case phụ thuộc interface như repository, clock, transaction runner hoặc external client; adapter triển khai interface đó. |
| Truy vấn đọc | Query phức tạp/report có thể dùng query port/read model riêng; vẫn được gọi từ application handler, không nhét SQL vào controller. |
| Lỗi rõ ràng | Lỗi nghiệp vụ có loại/ý nghĩa ổn định; presentation ánh xạ sang HTTP status. Không nuốt lỗi hoặc trả kết quả thành công giả. |
| Transaction | Application xác định ranh giới transaction; adapter chịu trách nhiệm thực thi bằng TypeORM/DataSource. |

## 6. Kế hoạch triển khai theo giai đoạn

| Giai đoạn | Phạm vi | Kết quả và điều kiện hoàn tất |
|---|---|---|
| 0. Chốt thiết kế | Xác nhận bounded context, thứ tự ưu tiên, nguyên tắc tương thích | Thống nhất tài liệu này và các quyết định còn mở trước khi đổi cấu trúc. |
| 1. Thiết lập nền | Thêm cấu trúc layer cho một context thử nghiệm, DI token/port và convention lỗi | Build thành công; API thử nghiệm giữ response/authorization hiện có; có test use case và adapter phù hợp. |
| 2. Context rủi ro thấp | Chọn một luồng đơn giản, có ranh giới rõ (đề xuất `config` hoặc `cookie`) | Chuyển vertical slice end-to-end; không tạo thay đổi schema ngoài yêu cầu. |
| 3. Nghiệp vụ cốt lõi | Chuyển lần lượt `auth/user`, `links`, `comments` và các quan hệ liên quan | Mỗi luồng có test cho business rules, quyền truy cập, dữ liệu và API contract trước khi xóa implementation cũ. |
| 4. Tích hợp & tác vụ nền | Chuyển social integrations, tài nguyên, scheduler, websocket và notifications | External calls, cron và socket được kích hoạt qua application contract/port; lỗi được quan sát và xử lý rõ ràng. |
| 5. Billing, báo cáo, dọn dẹp | Chuyển order/transaction/dashboard/support; loại bỏ service cũ và dependency vòng | Toàn bộ luồng đã chuyển, kiểm thử phù hợp chạy qua; không còn đường gọi song song không chủ đích. |

Mỗi giai đoạn cần có thể build/deploy độc lập. Không xóa service/module hiện tại cho đến khi các call site đã chuyển và hành vi tương đương được kiểm chứng.

### Tiến độ triển khai

| Context | Tiến độ | Ghi chú |
|---|---|---|
| Configuration | Đã chuyển | Controller gọi Use Case; port/TypeORM adapter; transaction và lan truyền cấu hình reseller được giữ trong luồng ứng dụng. |
| Cookie | Đã chuyển | CRUD qua Use Case/port; TypeORM và event emitter nằm sau adapter; giữ API hiện tại. |
| Auth | Đã chuyển | Sign-in/refresh thành Use Case; JWT/Redis adapter và scheduled session cleanup được tách khỏi controller/application. |
| Comments | Đã chuyển | Search, detail và cập nhật trạng thái qua Use Case/port; SQL chuyển sang adapter và bind tham số truy vấn. |
| Transactions | Đã chuyển | CRUD qua Use Case/port; `OrderService` gọi trực tiếp `CreateTransactionUseCase`. |
| Notifications | Đã chuyển | Danh sách và đánh dấu đã đọc qua Use Case/Postgres adapter. |
| Group Facebook | Đã chuyển | CRUD và quyền lọc danh sách theo admin/user qua Use Case/port. |
| Phone Customer | Đã chuyển | Danh sách, chi tiết, cập nhật click qua Use Case/port. |
| Group | Đã chuyển | Quyền sở hữu/kiểm tra userId nằm trong Use Case; truy vấn và ghi qua adapter. |
| VPS | Đã chuyển | Parse/validate trùng lặp và restart orchestration qua Use Case; TypeORM/HTTP qua adapter. |
| Monitoring | Đã chuyển | Process update và điều phối health-check qua Use Case/adapter. |
| Page | Đã chuyển | Kiểm tra quota/ownership, xóa liên kết theo page và CRUD/list qua Use Case/adapter. |
| TikTok Users | Đã chuyển | Quota, ownership, danh sách công khai và xóa liên kết qua Use Case/adapter; query filter bind parameter. |
| Token | Đã chuyển | Controller CRUD qua Use Case/adapter; không còn `TokenService` cũ. |
| Proxy | Đã chuyển | Controller CRUD qua Use Case/port/adapter; service legacy đã được loại bỏ sau khi xác nhận không còn call site. |
| Links | Đã chuyển | Controller CRUD, quota, truy vấn, thao tác Page/TikTok qua Use Case/port/adapter; legacy `LinkService` và các interceptor không còn dùng đã được loại bỏ. |
| Facebook Integration | Đã chuyển | HTTP endpoints và event tạo thông tin cookie qua Use Case/adapter; listener chỉ chuyển event vào application. |
| User | Đã chuyển | Tạo tài khoản, quản trị/tra cứu, renewal và helper cho Auth/guard/context khác qua Use Case/port/adapter; `UserService` legacy đã được loại bỏ. |
| Order | Đã chuyển | Controller gọi Use Case; port/TypeORM adapter xử lý persistence và transaction. |
| Dashboard & Support | Đã chuyển | Controller gọi Use Case; truy vấn, export và tích hợp ngoài nằm sau application port/infrastructure adapter. |
| Shared Infrastructure | Giữ lại có chủ đích | Redis, bootstrap, guards, decorators và các adapter kỹ thuật còn lại không phải service nghiệp vụ; cần được rà soát riêng nếu thay đổi runtime/configuration. |

## 7. Tiêu chí nghiệm thu

- Use Case là điểm vào duy nhất cho mỗi luồng nghiệp vụ; controller chỉ validate/mapping/gọi Use Case.
- Domain không import NestJS, TypeORM hoặc thư viện transport/infrastructure.
- Application không truy cập trực tiếp Repository/DataSource/Redis/HTTP client cụ thể.
- Không có phụ thuộc vòng giữa bounded context; giao tiếp qua port, application contract hoặc event khi phù hợp.
- API hiện hữu, quyền truy cập và schema được giữ nguyên trừ khi có quyết định thay đổi được ghi nhận.
- Build, lint và test mục tiêu chạy được; test use case bao phủ các nhánh nghiệp vụ trọng yếu trước khi chuyển luồng.

## 8. Quyết định cần thống nhất trước khi triển khai

| Quyết định | Đề xuất mặc định | Cần xác nhận |
|---|---|---|
| Kiểu DDD | Modular monolith, không tách microservice | Có đồng ý giữ chung một ứng dụng NestJS không? |
| Tính tương thích | Giữ API, schema và nghiệp vụ hiện tại; thay đổi theo migration riêng | Có endpoint/schema nào được phép đổi trong đợt refactor không? |
| Trình tự | Một context thử nghiệm nhỏ, sau đó xử lý Auth/User và Links | Context nào cần ưu tiên vì yêu cầu sản phẩm? |
| Domain entity | Chỉ tách khỏi TypeORM khi giúp bảo vệ invariant/ranh giới; không chuyển đổi máy móc mọi entity | Có yêu cầu domain model thuần cho toàn bộ entity không? |
| Kiểm thử | Bổ sung test theo từng luồng khi di chuyển, không trì hoãn đến cuối | Có môi trường/test data hiện có cần tuân theo không? |

**Bước kế tiếp:** tiếp tục chuyển các context còn lại theo thứ tự trong kế hoạch; không gộp thành một lần viết lại lớn.
