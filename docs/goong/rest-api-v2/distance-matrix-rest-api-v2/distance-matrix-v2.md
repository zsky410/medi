---
title: "DISTANCE MATRIX (V2)"
source: https://help.goong.io/kb/rest-api-v2/distance-matrix-rest-api-v2/distance-matrix-v2/
updated: 2025-07-10T15:35:47
categories: ["DISTANCE MATRIX V2"]
---
# DISTANCE MATRIX (V2)

> Nguồn: [https://help.goong.io/kb/rest-api-v2/distance-matrix-rest-api-v2/distance-matrix-v2/](https://help.goong.io/kb/rest-api-v2/distance-matrix-rest-api-v2/distance-matrix-v2/)

# TỔNG QUAN

**Distance Matrix API v2** là công cụ hỗ trợ tính toán khoảng cách và thời gian di chuyển giữa nhiều cặp điểm cùng lúc. Được ứng dụng phổ biến trong các bài toán tối ưu vận hành như: lập kế hoạch giao hàng, điều phối xe theo lộ trình tối ưu, gọi xe theo thời gian thực, hay quản lý năng lực vận chuyển trong hệ thống logistics phức tạp.

Phiên bản **v2** được nâng cấp với nhiều cải tiến quan trọng.

API vẫn duy trì cấu trúc phản hồi **JSON** quen thuộc, đảm bảo khả năng tích hợp nhanh chóng với các hệ thống hiện có trong lĩnh vực logistics, điều hành giao thông, du lịch, quản lý hạ tầng đô thị và nhiều ứng dụng phân tích không gian khác. Tốc độ phản hồi được tối ưu hóa, giúp giảm đáng kể thời gian tính toán ngay cả khi xử lý hàng trăm điểm đầu – cuối trong một lần gọi API.

# **CÁCH TẠO MỘT YÊU CẦU DISTANCE MATRIX**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

Hãy bắt đầu bằng cách nhập url vào trình duyệt web của bạn – sau đó thay thế YOUR\_API\_KEY bằng API key mà bạn đã tạo. Phản hồi về sẽ cho biết khoảng cách và thời lượng giữa các điểm gốc và đích đến được chỉ định.

**URL:** https://rsapi.goong.io/v2/distancematrix

**Phương thức:** **GET**

**Tham số trong request truyền vào:**

curl "https://rsapi.goong.io/v2/distancematrix?origins=20.981971,105.864323&destinations=21.031011,105.783206%7C21.022328,105.790480%7C21.016665,105.788774&vehicle=car&api\_key={YOUR\_API\_KEY}"

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="234"> <col width="344"> <col width="318"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ giá trị</strong></span></td></tr><tr><td><strong>origins</strong></td><td>Tọa độ điểm bắt đầu của tuyến đường. Viết theo định dạng vĩ độ,kinh độ (latitude, longitude)</td><td>21.046623224000029,105.790168203000060</td></tr><tr><td><strong>destinations</strong></td><td>Tọa độ điểm đến (hoặc nhiều điểm), phân cách bằng dấu `</td><td>21.031011,105.783206 | 21.022328,105.790480 | 21.016665,105.788774</td></tr><tr><td><strong>vehicle</strong></td><td>Loại phương tiện di chuyển. Các giá trị hỗ trợ gồm: car (ô tô), bike (xe đạp), motorcycle (xe máy), truck (xe tải)</td><td>car</td></tr><tr><td><strong>api_key</strong></td><td>Mã khóa xác thực người dùng. Bắt buộc để sử dụng API</td><td>API của bạn</td></tr></tbody></table>

**Tham số trong response trả về:**

{
    "rows": \[
        {
            "elements": \[
                {
                    "distance": {
                        "text": "11.99 km",
                        "value": 11988
                    },
                    "duration": {
                        "text": "34 phút",
                        "value": 2016
                    },
                    "status": "OK"
                },
                {
                    "distance": {
                        "text": "10.76 km",
                        "value": 10762
                    },
                    "duration": {
                        "text": "30 phút",
                        "value": 1786
                    },
                    "status": "OK"
                },
                {
                    "distance": {
                        "text": "13.57 km",
                        "value": 13571
                    },
                    "duration": {
                        "text": "30 phút",
                        "value": 1796
                    },
                    "status": "OK"
                }
            \]
        }
    \]
}

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="142"> <col width="315"> <col width="299"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td><strong>rows</strong></td><td>Là một mảng chứa các đối tượng, mỗi đối tượng đại diện cho một điểm bắt đầu. Bên trong mỗi row là trường elements, mô tả thông tin khoảng cách và thời gian đến các điểm đích tương ứng.</td><td style="text-align: left;"><pre><span class="hljs-punctuation"> {</span>
<span class="hljs-attr">  “elements”</span><span class="hljs-punctuation">:</span>&nbsp;<span class="hljs-punctuation">[</span>
<span class="hljs-punctuation"> {</span>
<span class="hljs-attr">  “distance”</span><span class="hljs-punctuation">:</span>&nbsp;<span class="hljs-punctuation">{</span><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span>
<span class="hljs-attr">  “duration”</span><span class="hljs-punctuation">:</span>&nbsp;<span class="hljs-punctuation">{</span><span class="hljs-punctuation">}</span><span class="hljs-punctuation">,</span>
<span class="hljs-attr">  “status”</span><span class="hljs-punctuation">:</span>&nbsp;<span class="hljs-string">“OK”</span>
<span class="hljs-punctuation"> }</span>
<span class="hljs-punctuation"> ]</span>
<span class="hljs-punctuation">}</span></pre></td></tr><tr><td><strong>elements</strong></td><td>Mảng con nằm trong mỗi phần tử của rows. Mỗi element tương ứng với một cặp điểm bắt đầu → điểm kết thúc, chứa thông tin chi tiết: khoảng cách (distance), thời gian (duration) và trạng thái (status).</td><td style="text-align: left;"><pre>"elements": [ 
{ "status": "<span style="color: #0000ff;">OK</span>",
 "duration": 
{ "text": "<span style="color: #0000ff;">36 phút</span>",
 "value": <span style="color: #0000ff;">2150</span> 
},</pre></td></tr><tr><td><strong>status</strong></td><td>Trạng thái của từng cặp điểm. “OK” nghĩa là tính toán thành công. Có thể trả về “NOT_FOUND” hoặc “ZERO_RESULTS” nếu không tìm được tuyến đường phù hợp.</td><td>ok</td></tr><tr><td><strong>duration</strong></td><td>Thời gian di chuyển giữa hai điểm:<br>– text: hiển thị dạng người đọc (giờ, phút)<br>– value: đơn vị là giây, phục vụ tính toán</td><td><pre>"duration": { 
"text": "<span style="color: #0000ff;">35 phú</span>t", 
"value": <span style="color: #0000ff;">2089</span></pre></td></tr><tr><td><strong>distance</strong></td><td>Khoảng cách di chuyển giữa hai điểm:<br>– text: dạng hiển thị cho người dùng (km, m)<br>– value: đơn vị là mét</td><td><pre>"distance": { 
"text": "<span style="color: #0000ff;">15.1</span> km", 
"value": <span style="color: #0000ff;">15110</span></pre></td></tr></tbody></table>
