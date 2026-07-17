# PR Test Seed (US3-US6)

Thư mục seed độc lập tại cấp `seeders/pr-test/` để phục vụ test US3-US6 và Lark Scheduler.

---

## 🚀 1. Chạy Toàn Bộ Seed (Full Database Seed)
*Script này sẽ tự động reset database sạch sẽ rồi nạp lại toàn bộ dữ liệu mẫu (Users, PR Cycles, Forms, bilateral-meetings, roundtables, ngoại trừ Lark Calendar).*

> [!NOTE]
> Script này cố ý KHÔNG seed Lark Calendar để tránh việc gọi Lark API làm chậm quá trình reset dữ liệu. Hãy chạy script ở mục 2 dưới đây để seed lịch Lark một cách độc lập.

### Cách A: Từ thư mục gốc dự án (`d:\Workspace\Ehub-Backend\`)
```bash
node seeders/pr-test/run.js
```

### Cách B: Từ thư mục `seeders/pr-test/`
```bash
node run.js
```

---

## 📅 2. Chỉ Seed Lịch Lark (Lark Calendar Events Only)
*Script này chỉ chạy phần seed sự kiện lịch Lark (nhanh và độc lập, không reset database hay ảnh hưởng đến các dữ liệu khác).*

### Cách A: Từ thư mục gốc dự án (`d:\Workspace\Ehub-Backend\`)
```bash
node seeders/pr-test/run-lark-only.js
```

### Cách B: Từ thư mục `seeders/pr-test/`
```bash
node run-lark-only.js
```
