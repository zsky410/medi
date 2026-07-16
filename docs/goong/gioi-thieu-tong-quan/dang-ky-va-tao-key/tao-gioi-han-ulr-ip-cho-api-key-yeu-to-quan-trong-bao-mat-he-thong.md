---
title: "HƯỚNG DẪN CÁCH THIẾT LẬP GIỚI HẠN ULR/IP CHO API KEY"
source: https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/tao-gioi-han-ulr-ip-cho-api-key-yeu-to-quan-trong-bao-mat-he-thong/
updated: 2024-10-21T23:28:44
categories: ["Đăng ký và tạo key"]
---
# HƯỚNG DẪN CÁCH THIẾT LẬP GIỚI HẠN ULR/IP CHO API KEY

> Nguồn: [https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/tao-gioi-han-ulr-ip-cho-api-key-yeu-to-quan-trong-bao-mat-he-thong/](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/tao-gioi-han-ulr-ip-cho-api-key-yeu-to-quan-trong-bao-mat-he-thong/)

Thế giới công nghệ ngày càng phát triển, việc sử dụng các API để tích hợp dịch vụ và trao đổi dữ liệu đã trở nên vô cùng phổ biến. Điều này giúp các ứng dụng và hệ thống kết nối với nhau mượt mà hơn, đồng thời mang lại nhiều tiện ích cho người dùng. Tuy nhiên, sự phổ biến của API cũng đi kèm với một nguy cơ lớn – **an ninh mạng**. Một trong những lỗ hổng bảo mật phổ biến nhất mà các doanh nghiệp cần đặc biệt lưu ý là **việc quản lý và bảo mật API Key**. Trong bài viết này, [Goong](http://Goong.io) sẽ hướng dẫn bạn các bước để thiết lập giới hạn theo URL/IP cho API Key của mình.

## API Key là gì? Tại sao cần được bảo mật chặt chẽ?

**API Key** là một chuỗi ký tự độc nhất đóng vai trò như một chìa khóa xác thực, giúp các hệ thống nhận diện và kết nối với dịch vụ hoặc dữ liệu từ bên thứ ba. Khi một ứng dụng hoặc người dùng gửi yêu cầu đến API, API Key được sử dụng để xác định danh tính và phân quyền truy cập. Điều này đảm bảo rằng chỉ những người hoặc ứng dụng được ủy quyền mới có thể truy cập và sử dụng dịch vụ.

Trong hệ thống của [Goong](http://goong.io), khi người dùng đăng ký tài khoản, tạo API Key, hệ thống sẽ tự động sinh một chuỗi ký tự (chìa khóa) để bạn có thể truy cập hệ thống và sử dụng dữ liệu (các API) mà Goong cung cấp.

Tuy nhiên, nếu API Key bị lộ, nó có thể trở thành lỗ hổng bảo mật lớn. Những kẻ tấn công có thể lợi dụng API Key của bạn để:

-   **Tấn công từ bên ngoài**: Kẻ tấn công có thể gửi hàng loạt yêu cầu không hợp lệ đến hệ thống, làm quá tải máy chủ, khiến hệ thống bị chậm hoặc sập hoàn toàn.
-   **Lạm dụng tài nguyên**: Kẻ tấn công có thể sử dụng API Key của bạn để truy cập vào Goong và sử dụng API Key của bạn vào những mục đích khác nhau. Mặc dù bạn không sử dụng những lượng request tăng đột biến, dẫn đến thất thoát tài chính và lạm dụng tài nguyên hệ thống.

Vì những nguy cơ này, **việc tạo giới hạn URL/IP cho API Key** là yếu tố  vô cùng quan trọng để bảo vệ hệ thống. Nó giúp kiểm soát nguồn gốc các yêu cầu và ngăn chặn những truy cập không mong muốn, bảo vệ tài nguyên và dữ liệu khỏi những trường hợp bị lạm dụng.

## **Tầm quan trọng của việc tạo giới hạn URL/IP**

### **Bảo vệ khỏi các cuộc tấn công từ bên ngoài**

Một API Key không có giới hạn về URL hoặc địa chỉ IP sẽ rất dễ dàng trở thành mục tiêu cho các cuộc tấn công. Bất kỳ ai có được API Key này đều có thể sử dụng nó từ bất kỳ nguồn nào, gây nguy cơ xâm nhập dữ liệu nghiêm trọng. **Giới hạn URL/IP** chính là biện pháp mà Goong đưa ra nhằm ngăn chặn hiệu quả các cuộc tấn công từ bên ngoài, bằng cách chỉ cho phép các yêu cầu đến từ những địa chỉ cụ thể mà bạn đã xác định trước.

Ngoài ra, hệ thống của [Goong](http://goong.io) cũng có thiết lập cảnh báo, trong trường hợp nếu số lượt request từ một tài khoản hoặc một API Key nào đó tăng đột biến không rõ lý do, hệ tống sẽ tự động vô hiệu hóa key đó lại. [Goong](http://goong.io) sẽ làm việc trực tiếp với bạn để làm rõ nguyên nhân và có biện pháp cụ thể để bạn tiếp tục sử dụng dịch vụ bình thường.

### **Kiểm soát chặt chẽ quyền truy cập**

**Giới hạn URL** giúp bạn kiểm soát chính xác nguồn gốc của các yêu cầu gửi đến hệ thống của Goong. Điều này có nghĩa là chỉ những trang web hoặc hệ thống được chỉ định (đã được bạn thiết lập giới hạn) mới có thể sử dụng API Key để truy cập và sử dụng API của [Goong](http://goong.io). Điều này giảm thiểu rủi ro từ việc sử dụng API Key sai mục đích hoặc lạm dụng bởi các bên không được ủy quyền.

**Ví dụ:** Nếu API Key của bạn đã tạo chỉ được giới hạn cho một trang web hay một địa chỉ IP đã thiết lập, bạn có thể giới hạn các yêu cầu chỉ đến từ mạng nội bộ (IP cụ thể), hoặc từ các URL mà công ty quản lý. Bất kỳ yêu cầu nào từ bên ngoài sẽ bị chặn với **mã lỗi 403: Forbidden.**

## **Hậu quả của việc không giới hạn API Key**

Nếu API Key không được giới hạn, hậu quả đem đến có thể rất nghiêm trọng:

-   **Mất kiểm soát API**: Bạn không thể kiểm soát được ai đang sử dụng API Key của mình. Điều này có thể dẫn đến việc khai thác tài nguyên không mong muốn, gây tốn kém về tài chính và tài nguyên hệ thống.
-   **Rủi ro mất mát dữ liệu**: API Key của bạn có thể bị đánh cắp và sử dụng cho các mục đích xấu, dẫn đến thiệt hại về uy tín và vi phạm pháp luật.
-   **Thiệt hại tài chính**: Nếu các bên thứ ba không được phép sử dụng API Key của bạn để truy cập vào các dịch vụ mà bạn đang trả phí, điều này có thể dẫn đến tổn thất tài chính đáng kể.

## Các bước để tạo giới hạn API Key đơn giản

Để tạo giới hạn URL/IP cho API Key, bạn có thể làm theo các bước sau:

-   **Bước 1: Tạo API Key**: tại thẻ tạo key, sau khi nhập thông tin key → chọn tab “**Giới hạn**“
-   **Bước 2: Nhập  “Liên kết HTTP (trang web) hoặc IP”**: Xác định rõ các URL hoặc địa chỉ IP có quyền sử dụng API Key.

**Nhập URL hoặc IP cụ thể.** Ví dụ:

-   -   `http*://example.com/*`
    -   `http*://*.example.com/*`
    -   `http*://subdomain.example.com/*`
-   **Bước 3**: **Hoàn tất quá trình tạo API Key**: Nhấn “**Tạo API Key**” để hoàn thành.

![](https://help.goong.io/wp-content/uploads/2024/08/2024-08-12_14-37-46-1024x623.png)

## Kết luận

Việc **giới hạn URL/IP cho API Key** là một bước bảo mật quan trọng giúp bảo vệ hệ thống và dữ liệu của bạn khỏi các nguy cơ tiềm ẩn. Trong thời đại mà các cuộc tấn công mạng ngày càng tinh vi và phức tạp, việc tạo giới hạn này không chỉ bảo vệ API Key mà còn là một bước để đảm bảo an toàn cho toàn bộ hệ thống.

[Đăng ký Goong ngay](https://account.goong.io/) để trải nghiệm các dịch vụ MAP APIs miễn phí.

Xem hướng dẫn tạo tài khoản, tạo API Key [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).
