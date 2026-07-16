---
title: "DISTANCE MATRIX – MA TRẬN KHOẢNG CÁCH"
source: https://help.goong.io/kb/rest-api/distance-matrix/distace-matrix-ma-tran-khoang-cach/
updated: 2024-10-20T21:36:36
categories: ["DISTANCE MATRIX"]
---
# DISTANCE MATRIX – MA TRẬN KHOẢNG CÁCH

> Nguồn: [https://help.goong.io/kb/rest-api/distance-matrix/distace-matrix-ma-tran-khoang-cach/](https://help.goong.io/kb/rest-api/distance-matrix/distace-matrix-ma-tran-khoang-cach/)

## **TỔNG QUAN**

### Định nghĩa

**Distance Matrix** hay còn gọi là ma trận khoảng cách, là một loại API cho phép người dùng tính toán khoảng cách và thời gian di chuyển giữa nhiều địa điểm khác nhau.

API này cung cấp thông tin về khoảng cách đường đi giữa các điểm, thời gian di chuyển dự kiến và thậm chí cả thông tin về tuyến đường khác nhau. Distance Matrix API có tính năng cung cấp thời gian và khoảng cách cho một ma trận gồm nhiều điểm trên lộ trình.

**Distance Matrix** của [Goong](http://Goong.io) thường được sử dụng trong lập kế hoạch định tuyến, vận chuyển hàng hóa, quản lý đội xe, và trong các ứng dụng liên quan đến di chuyển và định vị. Nó cung cấp thông tin cụ thể để tối ưu hóa hành trình và quản lý tài nguyên di chuyển.

Việc tích hợp API này mang lại nhiều lợi ích cho các ứng dụng và dịch vụ, đặc biệt trong việc quản lý lộ trình giao nhận hàng hóa, đón trả hành, logistics, kế hoạch du lịch và nhiều ứng dụng khác.

![](https://help.goong.io/wp-content/uploads/2024/08/Group-106.png)

### Lý do nên sử dụng Distance Matrix API

-   **Tối ưu hóa lộ trình:** Distance Matrix API giúp tính toán khoảng cách và thời gian di chuyển giữa các điểm, hỗ trợ tối ưu hóa lộ trình. Điều này quan trọng trong việc giảm thời gian và chi phí vận chuyển cho các dịch vụ cần phải di chuyển hàng hóa hoặc người.
-   **Lập kế hoạch chuyến đi:** Cung cấp thông tin về khoảng cách và thời gian di chuyển giữa các điểm đến, giúp người dùng lập kế hoạch chuyến đi hiệu quả hơn.
-   **Tối ưu quản lý logistics:** Cung cấp thông tin chi tiết về khoảng cách và thời gian di chuyển, hỗ trợ các doanh nghiệp trong việc quản lý và lập kế hoạch logistics hiệu quả. Các công ty logistics có thể sử dụng API để phân tích và tối ưu hóa các tuyến đường phân phối hàng hóa, giúp giảm chi phí và tăng cường hiệu quả hoạt động.

## **CÁCH TẠO MỘT YÊU CẦU DISTANCE MATRIX**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

Hãy bắt đầu bằng cách nhập url vào trình duyệt web của bạn – sau đó thay thế YOUR\_API\_KEY bằng API key mà bạn đã tạo. Phản hồi về sẽ cho biết khoảng cách và thời lượng giữa các điểm gốc và đích đến được chỉ định.

**URL:** /distancematrix

**Phương thức:** **GET**

**Ví dụ về request:**

curl "https://rsapi.goong.io/distancematrix?origins=20.981971,105.864323&destinations=21.031011,105.783206%7C21.022328,105.790480%7C21.016665, 105.788774&vehicle=car&api\_key={YOUR\_API\_KEY}"

<table><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><b>Tham số</b></span></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Mô tả</b></span></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Ví dụ</b></span></td></tr><tr><td style="text-align: left;"><strong>origins</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Danh sách (chuỗi) các điểm xuất phát (bắt buộc).</span></td><td style="text-align: left;"><span style="font-weight: 400;">20.981971,105.864323</span></td></tr><tr><td style="text-align: left;"><strong>destinations</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Danh sách (chuỗi) các điểm đến(bắt buộc).</span></td><td style="text-align: left;"><span style="font-weight: 400;">21.031011,105.783206 | 21.022328,105.790480 | 21.016665,105.788774</span></td></tr><tr><td style="text-align: left;"><strong><span style="color: #000000;">vehicle</span></strong></td><td style="text-align: left;"><span style="font-weight: 400;">Loại phương tiện, bao gồm: ô tô (car), xe đạp (bike), taxi, xe tải (truck), hd (cho các phương tiện gọi xe).</span></td><td style="text-align: left;"><span style="font-weight: 400;">car</span></td></tr></tbody></table>

**Ví dụ về response:**

application/json

{
  "rows": \[
    {
      "elements": \[
        {
          "status": "OK",
          "duration": {
             "text": "33 phút",
             "value": 1983
          },
          "distance": {
            "text": "16 km",
            "value": 15962
          }
        },
        {
          "status": "OK",
          "duration": {
            "text": "32 phút",
            "value": 1914
          },
          "distance": {
            "text": "15 km",
            "value": 14627
          }
        },
        {
          "status": "OK",
          "duration": {
            "text": "29 phút",
            "value": 1749
          },
          "distance": {
            "text": "14 km",
            "value": 13556
          }
         }
       \]
     }
   \]
 }

<table dir="ltr" style="height: 743px;" border="1" width="859" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="135"> <col width="396"> <col width="338"></colgroup><tbody><tr><td style="text-align: center;"><strong><span style="color: #0000ff;">Tham số</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td style="text-align: left;"><strong>rows</strong></td><td style="text-align: left;">Là một mảng gồm các đối tượng chứa các quãng <span style="font-family: inherit; font-size: inherit;">đường, mỗi hàng tương ứng với một cặp bắt đầu và kết thúc, quãng đường đi gồm trạng thái, thời gian và khoảng cách.</span></td><td style="text-align: left;"><span class="hljs-punctuation">{</span><p></p><p style="padding-left: 40px;"><span class="hljs-attr">“elements”</span><span class="hljs-punctuation">:</span> <span class="hljs-punctuation">[</span></p><p style="padding-left: 40px;"><span class="hljs-punctuation">{</span></p><p style="padding-left: 80px;"><span class="hljs-attr">“distance”</span><span class="hljs-punctuation">:</span> <span class="hljs-punctuation">{</span><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span></p><p style="padding-left: 80px;"><span class="hljs-attr">“duration”</span><span class="hljs-punctuation">:</span> <span class="hljs-punctuation">{</span><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span></p><p style="padding-left: 80px;"><span class="hljs-attr">“status”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“OK”</span></p><p style="padding-left: 80px;"><span class="hljs-punctuation">}</span></p><p style="padding-left: 40px;"><span class="hljs-punctuation">]</span></p><p><span class="hljs-punctuation">}</span></p></td></tr><tr><td style="text-align: left;"><strong>elements</strong></td><td style="text-align: left;">Là phần tử con của rows và tương ứng với một cặp điểm bắt đầu với từng đích đến. Các bảng này chứa thông tin về trạng thái, thời gian (đơn vị: giây) và khoảng cách (đơn vị: mét) cho từng đoạn nhỏ trong cặp bắt đầu và kết thúc.</td><td><p style="text-align: left;"><span class="hljs-punctuation">{</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-attr">“distance”</span><span class="hljs-punctuation">:</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-punctuation">{</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-attr">“text”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“16.60 km”</span><span class="hljs-punctuation">,</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-attr">“value”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">16602</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-attr">“duration”</span><span class="hljs-punctuation">:</span> <span class="hljs-punctuation">{</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-attr">“text”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“53 phút”</span><span class="hljs-punctuation">,</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-attr">“value”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">3160</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span></p><p style="text-align: left; padding-left: 40px;"><span class="hljs-attr">“status”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“OK”</span></p><p style="text-align: left;"><span class="hljs-punctuation">}</span></p></td></tr><tr><td style="text-align: left;"><strong>status</strong></td><td style="text-align: left;">Mã trạng thái “ok” nghĩa là thành công.</td><td style="text-align: left;">ok</td></tr><tr><td style="text-align: left;"><strong>duration</strong></td><td style="text-align: left;">Khoảng cách về “thời gian” mỗi địa điểm đi qua (thời gian dưới dạng text, còn value là thời gian khi đi trên đoạn đường đó – đơn vị là phút).</td><td style="text-align: left;">33 phút</td></tr><tr><td style="text-align: left;"><strong>distance</strong></td><td style="text-align: left;">Khoảng cách về “km” mỗi địa điểm đi qua (khoảng cách dưới dạng text, còn value là giá trị – đơn vị là km).</td><td style="text-align: left;">15 km</td></tr></tbody></table>
