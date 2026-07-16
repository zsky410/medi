---
title: "HƯỚNG DẪN CÀI ĐẶT PLUGIN BẢN ĐỒ  GOONG MAP TRÊN WORDPRESS"
source: https://help.goong.io/kb/website-javascrip-api/plugin-map-plugin-map/huong-dan-cai-dat-plugin-ban-do-tren-wordpress/
updated: 2025-01-23T15:49:02
categories: ["PLUGIN MAP"]
---
# HƯỚNG DẪN CÀI ĐẶT PLUGIN BẢN ĐỒ  GOONG MAP TRÊN WORDPRESS

> Nguồn: [https://help.goong.io/kb/website-javascrip-api/plugin-map-plugin-map/huong-dan-cai-dat-plugin-ban-do-tren-wordpress/](https://help.goong.io/kb/website-javascrip-api/plugin-map-plugin-map/huong-dan-cai-dat-plugin-ban-do-tren-wordpress/)

## TỔNG QUAN

Bản đồ trên website ngày nay không còn chỉ là một tiện ích mà đã trở thành một phần không thể thiếu, đặc biệt trên các trang “Liên hệ” hay giới thiệu địa chỉ của doanh nghiệp . Thay vì chỉ liệt kê địa chỉ dưới dạng một dòng text, một bản đồ có đính kèm vị trí sẽ giúp khách hàng dễ dàng định vị và tìm đường đến doanh nghiệp của bạn.

Hiện nay, với sự hỗ trợ từ các plugin bản đồ trên WordPress, việc thêm bản đồ vào website đã trở nên vô cùng tiện lợi. Bạn không cần phải am hiểu lập trình, chỉ cần vài thao tác là đã có thể tích hợp bản đồ lên trên website của mình một cách dễ dàng.

Bài viết này [Goong](http://goong.io) sẽ hướng dẫn bạn cách cài đặt và tích hợp plugin bản đồ để website của bạn trở nên tiện ích hơn.

## CÁCH THIẾT LẬP BẢN ĐỒ GOONG MAP CHO WORDPRESS

**BƯỚC 1: TRUY CẬP THƯ VIỆN PLUGIN**

1.  Đăng nhập vào bảng quản trị WordPress của bạn.
2.  Ở menu bên trái, chọn **Plugins** > **Add New (Thêm mới)**.

![](https://help.goong.io/wp-content/uploads/2025/01/PL1-1.png)

**BƯỚC 2: CÀI ĐẶT PLUGIN**

**(Trường hợp trong thư viện của WordPress chưa có sẵn bản đồ Goong)**

Hiện tại Plugin của Goong chưa có sẵn trên thư viện của WordPress, vì vậy bạn sẽ được cung cấp một plugin có sẵn để cài đặt vào WordPrees của mình, các bước cụ thể như sau:

**Tải file Zip. Goong Plugin tại đây**  [goong-map (2)](https://help.goong.io/wp-content/uploads/2025/01/goong-map-2.zip) 

1.  Tại màn hình danh sách các Plugin, ấn chọn “**Tải plugin lên**“
2.  Nhấn chọn “**Choose File**” > tại cửa sổ chọn file, chọn file Plugin vừa tải  > Nhấn chọn “**Cài đặt ngay**“

![](https://help.goong.io/wp-content/uploads/2025/01/PL2.png)

3\. Sau khi file plugin được tải lên hoàn thiện > nhấn chọn “**Kích hoạt Plugin**” để kích hoạt bản đồ.

**(Trường hợp Plugin bản đồ của Goong đã có sẵn trên thư viện plugin của WordPress)**

1.  Tại màn hình dah sách thêm mới Plugin > Gõ tìm kiếm “**Goong Map**“
2.  Plugin bản đồ Goong Map xuất hiện > Nhấn nút “**Install Now”** (Cài đặt ngay) bên cạnh bản đồ Goong map vừa tìm được.
3.  Sau khi cài đặt hoàn tất >  nhấn **Active** (Kích hoạt) để kích hoạt bản đồ.

**Sau khi kích hoạt, bạn sẽ thấy Goong Map xuất hiện trong thanh chức năng WordPress, sẵn sàng để bạn tích hợp bản đồ vào bài viết hoặc trang của mình.**

**BƯỚC 3: THIẾT LẬP BẢN ĐỒ**

Nhấp vào “**Goong Map**” để xem hướng dẫn cách thiết lập một bản đồ mới.

Nhấp vào **“Maps**” để vào trang thiết lập và cấu hình bản đồ mới, xem và sửa bản đồ đã thiết lập. 

![](https://help.goong.io/wp-content/uploads/2025/01/PL4.png)

1.  **Thiết lập và cấu hình bản đồ mới.**

**Cách 1: Thêm mới tại màn hình danh sách bản đồ.**

Tại mục Goong Map, nhấp vào **“Maps**” để mở ra màn hình danh sách bản đồ, > Nhấn chọn “**Thêm bản đồ mới**”

![](https://help.goong.io/wp-content/uploads/2025/01/PL5.png)

Tại màn hình thêm mới, nhập tiêu đề cho bản đồ và các thông số cần thiết sau đó ấn nút “**Thêm bản đồ mới**” ở dưới cùng để lưu. Một bản đồ cơ bản đã được thiết lập. 

Và để có thể hiển thị bản đồ này ra trang hoặc bài viết mới của bạn, cần gán Maptiles Key. (Cách thức đăng ký tài khoản và tạo key Goong, tham khảo [TẠI ĐÂY)](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/)

Tại màn hình danh sách bản đồ, click chọn bản đồ cần add Key, sau đó thêm Maptiles key và API key đã tạo > Nhấn chọn “**Thêm bản đồ mới**”

![](https://help.goong.io/wp-content/uploads/2025/01/PL6-1.png)

\=> Như vậy một bản đồ mới cơ bản đã được thiết lập và sẵn sàng để hiển thị ra trang/ bài viết của bạn.

Ngoài ra, sau khi bản đồ được tạo, bạn có thể click vào chi tiết bản đồ, chọn **“Cài đặt”** để thiết lập lại các thông số cơ bản của bản đồ.

![](https://help.goong.io/wp-content/uploads/2025/01/PL7.png)

**Cách 2: Thêm mới trực tiếp khi tạo bài viết**

Tại bài viết mới, vị trí bạn cần thêm bản đồ, gõ **\[/\]** > Xuất hiện hộp thoại chứa danh sách các khối bạn có thể chèn vào bài viết > Bạn nhấn chọn “**Short code**”

Khối shortcode được hiển thị ra, bạn nhập vào đó dòng code **“\[goong\_map\_plugin name=”your\_map\_name”\]**

Trong đó “**your\_map\_name**” chính là tên bản đồ do bạn đặt.

![](https://help.goong.io/wp-content/uploads/2025/01/PL13-1.png)

Sau khi hoàn thành, bản đồ sẽ được tự động thêm vào danh sách, bạn quay lại màn hình **danh sách bản đồ** để thiết lập các thông số cần thiết như: kiểu bản đồ muốn hiển thị, kích thước, màu marker…. và add Key để bản đồ có thể hiển thị trong bài viết.

**(Trường hợp bạn đã tạo bản đồ trước đó, bạn chỉ cần copy paste tên bản đồ bạn đã tạo thay thế vào “your\_map\_name”)**

Như vậy, bước thiết lập bản đồ đã cơ bản được hoàn thành, bạn có thể ấn vào chi tiết bản đồ, chọn xem trước bản đồ sẽ hiển thị.

![](https://help.goong.io/wp-content/uploads/2025/01/PL8.png)

**BƯỚC 4: ADD MARKER (ĐỊA CHỈ) LÊN BẢN ĐỒ**

Sau khi đã thiết lập được nền bản đồ cơ bản, bạn có thể add vị trí lên trên bản đồ. Bạn có thể thêm trực tiếp từng địa điểm hoặc thêm hàng loạt theo danh sách.

1.  **Thêm trực tiếp từng điểm**

Click vào chi tiết bản đồ cần thêm mới > Nhấn chọn tab **Địa điểm**

![](https://help.goong.io/wp-content/uploads/2025/01/PL10.png)

Tại đây, màn hình danh sách địa điểm chưa toàn bộ thông tin các địa điểm đã được add lên bản đồ, để thêm địa điểm mới > nhấn chọn **Thêm địa điểm mới >** Hiển thị ra form thông tin thêm mới địa điểm.

Sau khi thêm tất cả thông tin theo form > nhấn chọn “**Thêm vị trí**” để hoàn thành.

![](https://help.goong.io/wp-content/uploads/2025/01/pl9.png)

2\. **Thêm địa điểm bằng danh sách**

Bạn có thể thêm danh sách địa điểm từ file Excel và CSV

Tại màn hình danh sách > chọn “**Nhập file**” > Chọn file excel hoặc CSV có thông tin địa điểm để tải lên

![](https://help.goong.io/wp-content/uploads/2025/01/PL11.png)

Sau khi địa điểm được thêm thành công > có thể kiểm tra thông tin địa điểm đã được add lên bản đồ.

![](https://help.goong.io/wp-content/uploads/2025/01/PL12.png)

Như vậy, bạn đã hoàn thành việc thiết lập bản đồ Goong Map cho trang WordPress của mình.
