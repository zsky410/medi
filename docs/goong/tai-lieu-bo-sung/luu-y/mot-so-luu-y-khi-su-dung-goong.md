---
title: "MỘT SỐ LƯU Ý KHI SỬ DỤNG GOONG"
source: https://help.goong.io/kb/tai-lieu-bo-sung/luu-y/mot-so-luu-y-khi-su-dung-goong/
updated: 2024-10-22T15:58:13
categories: ["Lưu ý"]
---
# MỘT SỐ LƯU Ý KHI SỬ DỤNG GOONG

> Nguồn: [https://help.goong.io/kb/tai-lieu-bo-sung/luu-y/mot-so-luu-y-khi-su-dung-goong/](https://help.goong.io/kb/tai-lieu-bo-sung/luu-y/mot-so-luu-y-khi-su-dung-goong/)

## **GIỚI HẠN URL/IP**

Nhằm đảm bảo cho **API Key của mình an toàn và bảo mật hơn**, bạn có thể cài đặt **giới hạn các đường dẫn (URL) hoặc địa chỉ IP** cụ thể có thể sử dụng được Key bạn đã tạo để kiểm soát các trang web, địa chỉ IP nào có thể sử dụng API Key của mình.

Có thể cài đặt giới hạn cho từng Key, khi đó API Key sẽ chỉ hoạt động đối với các yêu cầu từ các trang web hoặc địa chỉ IP bạn chỉ định. Yêu cầu từ các trang web hoặc địa chỉ IP khác sẽ trả về kết quả lỗi với mã trạng thái **403: Forbidden.**

API Key **không hạn chế** sẽ hoạt động đối với các **yêu cầu bắt nguồn từ bất kỳ trang web hay địa chỉ IP nào.**

Ví dụ:

http\*://example.com/\*

http\*://\*.example.com/\*

http\*://subdomain.example.com/\*

**Bạn có thể tham khảo cách giới hạn đường dẫn, địa chỉ IP cho Key như sau:**

-   **Bước 1:** Tại thẻ **“Tạo Key”**, sau khi nhập thông tin Key → chọn tab **“Giới hạn”** → Sau đó tích chọn **“Liên kết http (trang web) hoặc IP”.**
-   **Bước 2:** Nhập link trang web hoặc địa chỉ IP bạn muốn giới hạn.
-   **Bước 3:** Ấn **“Tạo API Key”** để hoàn thành.

[![](https://help.goong.io/wp-content/uploads/2024/08/2024-08-12_14-37-46-1024x623.png)](https://account.goong.io/)

## **THÔNG KÊ SỬ DỤNG**

Bạn có thể xem **số liệu thống kê** sử dụng cho tất cả các API của mình tại bất cứ thời điểm nào, trên trang [Thống kê](https://account.goong.io/statistics) tài khoản Goong của bạn.

Tại đây, bạn có thể theo dõi **tổng quan, chi tiết số lượng request** của từng loại API đã sử dụng theo **ngày/tháng** dưới dạng biểu đồ đường, biểu đồ tròn một cách trực quan.

![](https://help.goong.io/wp-content/uploads/2024/10/9e1719d0-9550-411d-b095-625258d46792.jpg)

## **HOÁ ĐƠN – THANH TOÁN**

Bạn có thể theo dõi thông tin thanh toán cụ thể của mình tại mục hóa đơn.

Tại mục này, bạn có thể theo dõi về số tiền bạn phải thanh toán và tình trạng đã thanh toán hay chưa.

Ngoài ra, tại đây bạn cũng có thể theo dõi lượt gọi chi tiết và xuất về dưới dạng file excel (số lượng tối đa là 10.000 bản ghi). Nếu muốn xuất nhiều hơn số lượng này, bạn vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật của Goong để được hỗ trợ kịp thời.

-   **Hình thức thanh toán**

Để thanh toán hóa đơn, hiện tại Goong hỗ trợ hai hình thức thanh toán: Chuyển khoản, thanh toán qua VNpay (hỗ trợ xuất hóa đơn VAT cho mọi loại hình thanh toán).

**\+ Thanh toán chuyển khoản:**

Bạn có thể xem hướng dẫn và thông tin thanh toán ngay tại mục tổng quan và hóa đơn.

Ấn nút thanh toán sẽ hiển thị ra thông tin thanh toán bao gồm:

-   -   **Thông tin tài khoản của Goong:** Quý khách chuyển tiền chính xác theo số tài khoản mà [Goong](https://account.goong.io/billing) đã ghim trong phần này.
    -   **Nội dung chuyển khoản:** Bạn nhập nội dung theo hướng dẫn, **số nằm trong nội dung chuyển khoản** chính là **số ID của bạn** trên hệ thống Goong để phân biệt với các tài khoản khác. Goong sẽ xác nhận để cộng tiền vào tài khoản thanh toán của bạn theo số ID này. Vì vậy, thông tin này cũng lưu ý phải nhập đầy đủ và chính xác.

![](https://help.goong.io/wp-content/uploads/2024/08/2024-08-12_14-42-31.png)

Trong trường hợp bạn cần xuất hóa đơn VAT, bạn vui lòng tích chọn ” **Tôi muốn xuất hóa đơn VAT**” và nhập thông tin xuất hóa đơn.

Sau khi nhận được thanh toán, Goong sẽ thực hiện các bước xác nhận, cộng tiền vào tài khoản của bạn.

**+Thanh toán qua VNPAY:**

Để lựa chọn hình thức thanh toán này, bạn chọn mục **“Hóa Đơn”** → Tại mục **“Thông tin thanh toán”**, tích chọn “**Thanh toán qua VNPAY”**, sau đó ấn **“Nộp tiền”** và thực hiện theo hướng dẫn.

Đối với hình thức thanh toán này, ngay sau khi thanh toán, số dư tài khoản cùng với trạng thái tài khoản tương ứng với số tiền bạn nộp sẽ tự động được cập nhật mà không phải chờ đợi bộ phận kế toán Goong xác nhận. Tuy nhiên với hình thức thanh toán này, bạn sẽ mất 1,1% phí giao dịch +1650đ.

![](https://help.goong.io/wp-content/uploads/2024/08/2024-08-12_14-48-36.png)

-   **Quy trình thanh toán**

Sau khi số tiền được cộng vào tài khoản, ngày cuối cùng của tháng hệ thống Goong sẽ tự động thanh toán (trừ tiền) dịch vụ theo đúng hóa đơn thống kê sử dụng trong tài khoản của bạn.

Trường hợp số dư lớn hơn hóa đơn phải thanh toán: số tiền còn lại vẫn nằm trong số dư để sử dụng cho lần thanh toán kỳ tiếp theo.

Trường hợp số dư không đủ để thanh toán: Bạn phải tiếp tục nạp tiền vào tài khoản để hoàn thành việc thanh toán. Chậm nhất đến ngày 15 của tháng tiếp theo, nếu hóa đơn kỳ trước chưa được thanh toán, tài khoản của bạn sẽ bị vô hiệu hóa.

**Tham khảo các bước thanh toán chi tiết [tại đây](https://help.goong.io/kb/uncategorized/huong-dan-cac-buoc-thanh-toan-tren-goong-map/).**

\*_**Lưu ý**_: **_Bạn phải luôn duy trì số tiền tạm tính không được vượt quá 25% số dư hiện có trong tài khoản, trường hợp vượt quá, tài khoản của bạn sẽ bị vô hiệu hóa._**
