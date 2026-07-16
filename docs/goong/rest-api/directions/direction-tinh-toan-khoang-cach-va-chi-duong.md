---
title: "DIRECTIONS – TÍNH TOÁN KHOẢNG CÁCH VÀ CHỈ ĐƯỜNG"
source: https://help.goong.io/kb/rest-api/directions/direction-tinh-toan-khoang-cach-va-chi-duong/
updated: 2024-10-18T12:00:37
categories: ["DIRECTIONS"]
---
# DIRECTIONS – TÍNH TOÁN KHOẢNG CÁCH VÀ CHỈ ĐƯỜNG

> Nguồn: [https://help.goong.io/kb/rest-api/directions/direction-tinh-toan-khoang-cach-va-chi-duong/](https://help.goong.io/kb/rest-api/directions/direction-tinh-toan-khoang-cach-va-chi-duong/)

## TỔNG QUAN

**Directions** **API** cung cấp thông tin về định hướng và dẫn đường giữa hai địa điểm. Thông tin này thường bao gồm tuyến đường đề xuất, khoảng cách, thời gian dự kiến, hướng dẫn chi tiết về lộ trình và các thông tin khác liên quan đến chuyến đi. 

![](https://help.goong.io/wp-content/uploads/2024/08/Group-81.png)

### Lý do nên sử dụng Directions

-   **Tính toán đa dạng phương tiện:** Dễ dàng so sánh lộ trình đi bộ, đi xe máy, lái ô tô để chọn phương án phù hợp nhất.
-   **Ưu tiên thời gian di chuyển:** API sẽ giúp bạn tìm ra tuyến đường ngắn nhất và nhanh nhất để đến đích.
-   **Cân nhắc nhiều yếu tố:** Ngoài thời gian, bạn cũng có thể xem xét các yếu tố khác như khoảng cách, số lần rẽ để đưa ra quyết định tối ưu.
-   **Thông tin chi tiết:** API cung cấp thông tin chi tiết về từng đoạn đường, bao gồm khoảng cách, thời gian di chuyển dự kiến và hướng đi.

Directions API là công cụ đắc lực, giúp người dùng tiết kiệm thời gian và tìm được lộ trình tốt nhất.

## CÁCH THỨC TÍCH HỢP DIRECTIONS

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** /direction

**Phương thức: GET**

**Ví dụ về request:**

curl 'https://rsapi.goong.io/direction?origin=21.046623224000029%2C105.790168203000060&destination=21.046666732000062%2C105.790169569000060&vehicle=car&api\_key={YOUR\_API\_KEY}'

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="135"> <col width="396"> <col width="338"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td style="text-align: left;"><strong>origin</strong></td><td style="text-align: left;">Tọa độ điểm xuất phát (bắt buộc).</td><td style="text-align: left;">20.981971,105.864323</td></tr><tr><td style="text-align: left;"><strong>destination</strong></td><td style="text-align: left;">Tọa độ điểm đến. Ngăn cách bằng dấu chấm phẩy (;) nếu có nhiều hơn 2 điểm đến (bắt buộc).</td><td style="text-align: left;">21.03876,105.79810</td></tr><tr><td style="text-align: left;"><strong>vehicle</strong></td><td style="text-align: left;">Loại phương tiện. Các tùy chọn bao gồm: xe hơi (car), xe đạp (bike), taxi, xe tải (truck), hd (cho các phương tiện thuê xe).</td><td style="text-align: left;">car</td></tr></tbody></table>

**Ví dụ về response:**

application/json
{
  "geocoded\_waypoints": \[\],
  "routes": \[
    {
      "bounds": {},
      "legs": \[
        {
          "distance": {
            "text": "1155.66 km",
            "value": 1155660
          },
          "duration": {
            "text": "22 giờ 10 phút",
            "value":  79799         
          },
        "steps": \[\]
       }
     \],
     "overview\_polyline": {
       "points": "mtm\_C{cudSG@..."
     },
     "warnings": \[\],
     "waypoint\_order": \[\]
    }
  \]
}

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="186"> <col width="468"> <col width="338"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td style="text-align: left;"><strong>geocoded_</strong><strong>waypoints</strong></td><td style="text-align: left;">Trả về thông tin về các điểm được mã hóa địa lý trong yêu cầu tìm đường. Bao gồm thông tin về vị trí địa lý của điểm, bao gồm tọa độ vĩ độ và kinh độ, địa chỉ, loại địa điểm…<br>Có thể được sử dụng để hiển thị các điểm trên bản đồ, hoặc để xác định vị trí cụ thể của các địa điểm trong quá trình tìm đường.</td><td style="text-align: left;">{<p></p><p style="padding-left: 40px;">“geocoder_status”: “OK”,<br>“place_id”: “lGhaene03U5OqGM2s3m-…”</p><p>}</p></td></tr><tr><td style="text-align: left;"><strong>legs</strong></td><td style="text-align: left;">Các phần của tuyến đường hoặc đường đi giữa hai điểm địa lý cụ thể trên một tuyến đường bao gồm: khoảng cách, thời gian đi lại, địa chỉ xuất phát và đích, các hướng dẫn chi tiết về cách đi giữa hai điểm và các thông tin khác liên quan.</td><td style="text-align: left;"><span class="hljs-punctuation" style="color: #000000;">{</span><p></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“distance”</span><span class="hljs-punctuation">:</span> <span class="hljs-punctuation">{</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“text”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“1155.66 km”</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“value”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">1155660</span></span></p><p><span style="color: #000000;"><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“duration”</span><span class="hljs-punctuation">:</span> <span class="hljs-punctuation">{</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“text”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“22 giờ 10 phút”</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“value”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">79799</span></span></p><p><span style="color: #000000;"><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“end_address”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“Cửa khẩu Lý Vạn, Lý Quốc, Hạ Lang”</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“end_location”</span><span class="hljs-punctuation">:</span><span style="font-family: inherit; font-size: inherit;">{</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“lat”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">22.81667</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“lng”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">106.82254</span></span></p><p><span style="color: #000000;"><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“start_address”</span><span class="hljs-punctuation">:</span> <span class="hljs-string">“58 Nguyễn Công Trứ, Hội An, Quảng Nam”</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“start_location”</span><span class="hljs-punctuation">:</span><span style="font-family: inherit; font-size: inherit;">{</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“lat”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">15.88553</span><span class="hljs-punctuation">,</span></span></p><p style="padding-left: 40px;"><span style="color: #000000;"><span class="hljs-attr">“lng”</span><span class="hljs-punctuation">:</span> <span class="hljs-number">108.3271</span></span></p><p style="padding-left: 40px;"><span class="hljs-punctuation" style="color: #000000;">}</span></p><p><span style="color: #000000;"><span class="hljs-punctuation">}</span></span></p></td></tr><tr><td style="text-align: left;"><strong>overview_polyline</strong></td><td style="text-align: left;">Được sử dụng để trả về một tuyến đường hoặc đường đi dưới dạng một chuỗi đường dẫn được mã hóa (Encoded polyline).<br>Để hiển thị đoạn đường đó lên bản đồ, cần giải mã ra thành một mảng các tọa độ và gán chúng lên bản đồ.</td><td style="text-align: left;">“points”: ”<p></p><div><div>qs}_BksdtSkAfBuCgBc@W_Aw@_Ak@OGgFiBiBs@mCeA</div><div>qDwAcBk@YOo@q@[k@_@gA<span style="font-family: inherit; font-size: inherit;">…</span></div></div></td></tr></tbody></table>
