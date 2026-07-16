---
title: "DIRECTIONS (V2)"
source: https://help.goong.io/kb/rest-api-v2/directions-rest-api-v2/directions-v2/
updated: 2025-10-06T10:49:18
categories: ["DIRECTIONS V2"]
---
# DIRECTIONS (V2)

> Nguồn: [https://help.goong.io/kb/rest-api-v2/directions-rest-api-v2/directions-v2/](https://help.goong.io/kb/rest-api-v2/directions-rest-api-v2/directions-v2/)

# TỔNG QUAN

**Directions API V2** của Goong là phiên bản mới nhất của dịch vụ tính toán lộ trình, cho phép truy vấn đường đi giữa hai hoặc nhiều điểm với **địa giới hành chính cập nhật mới nhất** theo các quyết định sáp nhập địa phương trên toàn quốc. Bên cạnh các tính năng dẫn đường quen thuộc như khoảng cách, thời gian di chuyển, hướng dẫn rẽ cụ thể theo từng bước, phiên bản này **trả về địa chỉ các địa điểm theo đơn vị hành chính mới**, đảm bảo phù hợp với bản đồ thực tế đã được cập nhật.

### Vì sao nên sử dụng Directions?

-   **Địa chỉ chính xác theo lộ giới mới**: Trả về địa danh thuộc tỉnh, thành phố mới sau khi sáp nhập.
    
-   **Tối ưu trải nghiệm người dùng**: Thông tin tuyến đường đồng nhất với bản đồ hành chính thực tế, giúp doanh nghiệp và người dùng cuối tránh nhầm lẫn trong định vị và giao nhận.
    
-   **Đa dạng lựa chọn di chuyển**: Hỗ trợ nhiều phương tiện (ô tô, xe máy, xe tải, đi bộ) với tính toán thời gian và khoảng cách riêng biệt.
    
-   **Hướng dẫn chi tiết, dễ tích hợp**: Hỗ trợ hiển thị bản đồ và hướng dẫn lộ trình theo từng bước, phù hợp cho app giao hàng, gọi xe, dẫn đường nội bộ…
    

# CÁCH THỨC TÍCH HỢP DIRECTIONS

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** https://rsapi.goong.io/v2/direction

**Phương thức: GET**

**Tham số trong request truyền vào:**

https://rsapi.goong.io/v2/direction?origin=21.046623224000029,105.790168203000060&destination=21.046666732000062,105.790169569000060&vehicle=car&api\_key={YOUR\_API\_KEY}

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><tbody><tr><td><strong>Tham số</strong></td><td style="text-align: center;"><strong>Ý nghĩa</strong></td><td style="text-align: center;"><strong>Ví dụ giá trị</strong></td></tr><tr><td><strong>origin</strong></td><td>Tọa độ điểm bắt đầu của tuyến đường. Viết theo định dạng vĩ độ,kinh độ (latitude, longitude)</td><td>21.046623224000029,105.790168203000060</td></tr><tr><td><strong>destination</strong></td><td>Tọa độ điểm đến của tuyến đường. Cũng theo định dạng vĩ độ,kinh độ</td><td>21.046666732000062,105.790169569000060</td></tr><tr><td><strong>vehicle</strong></td><td>Loại phương tiện di chuyển. Các giá trị hỗ trợ gồm: car (ô tô), bike (xe đạp),</td><td>car</td></tr><tr><td><strong>alternatives</strong></td><td>Là tham số không bắt buộc.Nếu là true thì kết quả trả về có thể có nhiều tuyến đường.<p></p><p>Nếu là false hoặc không thêm thì kết quả trả về là một tuyến đường duy nhất.</p></td><td></td></tr><tr><td><strong>alternatives</strong></td><td>cho phép <strong data-start="36" data-end="72">hiển thị nhiều tuyến đường gợi ý</strong> giữa cùng một cặp điểm đi – điểm đến.<p></p><p>Khi đặt <strong data-start="119" data-end="142"><code data-start="121" data-end="140" data-is-only-node="">alternatives=true</code></strong>, API sẽ trả về <strong data-start="158" data-end="189">nhiều phương án tuyến đường</strong> khác nhau để người dùng lựa chọn.</p><p>Mặc định giá trị là <strong data-start="244" data-end="255"><code data-start="246" data-end="253" data-is-only-node="">false</code></strong></p></td><td></td></tr><tr><td><strong>api_key</strong></td><td>Mã khóa xác thực người dùng. Bắt buộc để sử dụng API</td><td>API của bạn</td></tr></tbody></table>

**Tham số trong response trả về:**

{

    “geocoded\_waypoints”: \[

        {

            “geocoder\_status”: “OK”,

            “place\_id”: “l6EBlad4uXJ3jmQUp3iE0WnQdzqka7b3QI91UJBO5N9-0HgSvGOY3EDQWxihWXLTqYR50VKI9dS51tl3Vpk2LMEG3XVOqQZvgn7dndrtVl3P-lwFSjVqHl3ClACqXWuzX”

        },

        {

            “geocoder\_status”: “OK”,

            “place\_id”: “qlBsbSYlYh952FV9qV6U7na\_e5S2GsL4gYVE6\_qzahNq9vzZfmUF19JCwWTO3bbqfe9tFeaIKjJsykkVLr1Gc432SQQC1UZ-deLwJXpxKnPV5hlkKqgqMnHuuUSGcC-fc”

        }

    \],

    “routes”: \[

        {

            “bounds”: {},

            “legs”: \[

                {

                    “distance”: {

                        “text”: “2.83 km”,

                        “value”: 2828

                    },

                    “duration”: {

                        “text”: “8 phút”,

                        “value”: 502

                    },

                    “end\_address”: “Starlake Project Secondary School, Xuân Tảo, Bắc Từ Liêm, Hà Nội”,

                    “end\_location”: {

                        “lat”: 21.05671,

                        “lng”: 105.79017

                    },

                    “start\_address”: “11 Trần Cung, Nghĩa Đô, Hà Nội”,

                    “start\_location”: {

                        “lat”: 21.04663,

                        “lng”: 105.79022

                    },

                    “steps”: \[

                        {

                            “distance”: {

                                “text”: “41 m”,

                                “value”: 41

                            },

                            “duration”: {

                                “text”: “10 giây”,

                                “value”: 10

                            },

                            “end\_location”: {

                                “lat”: 21.04626,

                                “lng”: 105.79026

                            },

                            “html\_instructions”: “Bắt đầu đi từ Trần Cung”,

                            “maneuver”: “right”,

                            “polyline”: {

                                “points”: “mtm\_C{cudSh@C^C”

                            },

                            “start\_location”: {

                                “lat”: 21.04663,

                                “lng”: 105.79022

                            },

                            “travel\_mode”: “DRIVING”

                        },

                        {

                            “distance”: {

                                “text”: “776 m”,

                                “value”: 776

                            },

                            “duration”: {

                                “text”: “2 phút”,

                                “value”: 95

                            },

                            “end\_location”: {

                                “lat”: 21.04607,

                                “lng”: 105.79752

                            },

                            “html\_instructions”: “Rẽ trái vào Hoàng Quốc Việt”,

                            “maneuver”: “left”,

                            “polyline”: {

                                “points”: “crm\_CcdudSh@C?o@A\[?oC?s@?mE?wBAuB@qCAwK?gB?iA”

                            },

                            “start\_location”: {

                                “lat”: 21.04626,

                                “lng”: 105.79026

                            },

                            “travel\_mode”: “DRIVING”

                        },

                        {

                            “distance”: {

                                “text”: “676 m”,

                                “value”: 676

                            },

                            “duration”: {

                                “text”: “2 phút”,

                                “value”: 97

                            },

                            “end\_location”: {

                                “lat”: 21.05191,

                                “lng”: 105.79775

                            },

                            “html\_instructions”: “Rẽ trái vào Xuân Tảo”,

                            “maneuver”: “left”,

                            “polyline”: {

                                “points”: “}pm\_CoqvdS?s@k@@aA@W?k@?cE@\_C?}@?iE@kAAkF?cA?Q?C?”

                            },

                            “start\_location”: {

                                “lat”: 21.04607,

                                “lng”: 105.79752

                            },

                            “travel\_mode”: “DRIVING”

                        },

                        {

                            “distance”: {

                                “text”: “767 m”,

                                “value”: 767

                            },

                            “duration”: {

                                “text”: “3 phút”,

                                “value”: 172

                            },

                            “end\_location”: {

                                “lat”: 21.05192,

                                “lng”: 105.79036

                            },

                            “html\_instructions”: “Rẽ trái”,

                            “maneuver”: “left”,

                            “polyline”: {

                                “points”: “mun\_C}rvdS?f@?dAE~L@hK@lO”

                            },

                            “start\_location”: {

                                “lat”: 21.05191,

                                “lng”: 105.79775

                            },

                            “travel\_mode”: “DRIVING”

                        },

                        {

                            “distance”: {

                                “text”: “554 m”,

                                “value”: 554

                            },

                            “duration”: {

                                “text”: “2 phút”,

                                “value”: 126

                            },

                            “end\_location”: {

                                “lat”: 21.05671,

                                “lng”: 105.79003

                            },

                            “html\_instructions”: “Hướng sang phải”,

                            “maneuver”: “slight right”,

                            “polyline”: {

                                “points”: “oun\_CwdudSGb@KPQHs@?qB@aG@wLAw@?”

                            },

                            “start\_location”: {

                                “lat”: 21.05192,

                                “lng”: 105.79036

                            },

                            “travel\_mode”: “DRIVING”

                        },

                        {

                            “distance”: {

                                “text”: “15 m”,

                                “value”: 15

                            },

                            “duration”: {

                                “text”: “1 phút”,

                                “value”: 67

                            },

                            “end\_location”: {

                                “lat”: 21.05671,

                                “lng”: 105.79017

                            },

                            “html\_instructions”: “Rẽ phải”,

                            “maneuver”: “right”,

                            “polyline”: {

                                “points”: “mso\_CubudS?\[“

                            },

                            “start\_location”: {

                                “lat”: 21.05671,

                                “lng”: 105.79003

                            },

                            “travel\_mode”: “DRIVING”

                        },

                            “end\_location”: {

                                “lat”: 21.05671,

                                “lng”: 105.79017

                            },

                            “html\_instructions”: “Bạn đã đến điểm đích”,

                            “maneuver”: “”,

                            “polyline”: {

                                “points”: “mso\_CqcudS”

                            },

                            “start\_location”: {

                                “lat”: 21.05671,

                                “lng”: 105.79017

                            },

                            “travel\_mode”: “DRIVING”

                        }

                    \]

                }

            \],

            “overview\_polyline”: {

                “points”: “mtm\_C{cudSh@C^Ch@C?o@A\[?oC?s@?mE?wBAuB@qCAwK?gB?iA?s@k@@aA@W?k@?cE@\_C?}@?iE@kAAkF?cA?Q?C??f@?dAE~L@hK@lOGb@KPQHs@?qB@aG@wLAw@??\[“

            },

            “summary”: “”,

            “warnings”: \[\],

            “waypoint\_order”: \[\]

        }

    \]

}

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="207"> <col width="473"> <col width="342"></colgroup><tbody><tr><td style="text-align: center;"><strong><span style="color: #0000ff;">Tham số</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ cụ thể</span></strong></td></tr><tr><td><strong>geocoded_waypoints</strong></td><td>Danh sách các điểm (origin, destination, waypoint…) đã được mã hóa</td><td>[] (không có waypoint trung gian nên mảng rỗng)</td></tr><tr><td><strong>routes</strong></td><td>Danh sách các tuyến đường trả về (1 hoặc nhiều tuyến nếu alternatives=true)</td><td><div>{</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “bounds”: {},</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “legs”: [</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “distance”: {</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “text”: “2.83 km”,</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “value”: 2828</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; },</div></td></tr><tr><td><strong>bounds</strong></td><td>Vùng giới hạn bao quanh toàn tuyến đường</td><td>{ “northeast”: { “lat”: 21.1, “lng”: 105.9 }, “southwest”: { “lat”: 20.9, “lng”: 105.7 } }</td></tr><tr><td><strong>legs</strong></td><td>Các chặng (leg) trong tuyến, thường 1 chặng nếu chỉ có origin &amp; destination</td><td>[ { … } ]</td></tr><tr><td><strong>distance.text</strong></td><td>Quãng đường giữa điểm đi và điểm đến (dạng chữ)</td><td>“1155.66 km”</td></tr><tr><td><strong>distance.value</strong></td><td>Quãng đường (đơn vị: mét)</td><td>1155660</td></tr><tr><td><strong>duration.text</strong></td><td>Thời gian di chuyển dự kiến (dạng chữ)</td><td>“22 giờ 10 phút”</td></tr><tr><td><strong>duration.value</strong></td><td>Thời gian di chuyển (đơn vị: giây)</td><td>79799 (tức khoảng 22 tiếng 10 phút)</td></tr><tr><td><strong>steps</strong></td><td>Các bước hướng dẫn chi tiết từng đoạn đường (turn-by-turn instructions)</td><td>[]</td></tr><tr><td><strong>overview_polyline.points</strong></td><td>Đường đi tổng thể đã được mã hóa bằng polyline (để vẽ trên bản đồ)</td><td>“mtm_C{cudSG@eAfDc@xAq@</td></tr><tr><td><strong>warnings</strong></td><td>Cảnh báo (nếu có đoạn đường bị hạn chế, cấm, hay thu phí…)</td><td></td></tr><tr><td><strong>waypoint_order</strong></td><td></td><td></td></tr></tbody></table>
