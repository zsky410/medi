---
title: "CHILDREN  ID (V2)"
source: https://help.goong.io/kb/rest-api-v2/autocomplete-rest-api-v2/child-id-v2/
updated: 2025-06-26T16:49:20
categories: ["AUTOCOMPLETE V2"]
---
# CHILDREN  ID (V2)

> Nguồn: [https://help.goong.io/kb/rest-api-v2/autocomplete-rest-api-v2/child-id-v2/](https://help.goong.io/kb/rest-api-v2/autocomplete-rest-api-v2/child-id-v2/)

# **TỔNG QUAN**

**Child ID** là một tính năng dùng để biểu thị mối quan hệ **cha – con giữa các địa điểm**, cho phép hệ thống phân tách và truy xuất thông tin chi tiết hơn trong phạm vi một địa điểm lớn.

Trong nhiều tình huống thực tế, một địa điểm tổng thể có thể bao gồm nhiều khu vực con — ví dụ như **cổng ra vào của sân bay**, **sảnh chờ từng tầng**, **khu vực bán lẻ trong trung tâm thương mại**, hay **bãi đón – trả khách trong bến xe liên tỉnh**. Việc định danh riêng cho từng khu vực này giúp tăng độ chính xác khi chỉ dẫn, gợi ý tìm kiếm hoặc điều phối di chuyển.

Ở phiên bản **V2**, hệ thống đã được **cập nhật hoàn toàn theo địa giới hành chính mới**, phản ánh đúng các thay đổi sau quá trình sáp nhập đơn vị hành chính cấp xã, huyện ở nhiều tỉnh thành. Cùng với đó, **Child ID** tiếp tục được duy trì như một lớp định danh con, liên kết trực tiếp với **`place_id` của địa điểm cha**, cho phép truy xuất linh hoạt theo cả cấu trúc hành chính và cấu trúc không gian thực tế.

Với định dạng phản hồi **JSON quen thuộc**, API V2 vừa đảm bảo tính tương thích khi tích hợp vào hệ thống hiện tại, vừa đáp ứng yêu cầu dữ liệu địa lý chính xác trong bối cảnh hành chính mới.

# **CÁCH THỨC TẠO MỘT YÊU CẦU CHILD ID**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](https://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** https://rsapi.goong.io/v2/place/children

**Phương thức**: **GET**

**Ví dụ về request truyền vào:**

https://rsapi.goong.io/v2/place/children?parent\_id=mkSTeXlgiYFUzS5Mu1-nwXuWbga8aInzZs8jS7hgq-FopXItor-FwbqqMFx3brv-aqoyT6Nja5MyBqEQIoF54wUWQRwS6bajPeaVfS4ls9uAfqUwfv26ZiR67RDSJbPLJ&api\_key={YOUR\_API\_KEY}&has\_deprecated\_administrative\_unit=false

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="207"> <col width="473"> <col width="342"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td style="text-align: left;"><strong>parent_id</strong></td><td style="text-align: left;">Mã định danh của địa điểm cha. Thường là các khu vực lớn như sân bay, trung tâm thương mại, tòa nhà lớn,…</td><td style="text-align: left;">ZIHxuGZP4kxPgHlamHaB436AaxeYRLWa</td></tr><tr><td style="text-align: left;"><strong>api_key</strong></td><td style="text-align: left;">API Key dùng để xác thực truy cập dịch vụ Goong API.</td><td>API key của bạn</td></tr><tr><td style="text-align: left;"><strong>has_deprecated_administrative_unit</strong></td><td><p style="text-align: left;" data-start="0" data-end="146">Là tham số boolean dùng trong API V2, để hiển thị thêm thông tin địa giới hành chính&nbsp;<strong data-start="121" data-end="143" data-is-only-node="">trước khi sáp nhập</strong>.</p><p style="text-align: left;" data-start="149" data-end="296">&nbsp;True: Kết quả vẫn theo địa giới&nbsp;<strong data-start="187" data-end="194">mới</strong>, nhưng có thêm trường&nbsp;<code data-start="217" data-end="241">deprecated_description</code>&nbsp;và&nbsp;<code data-start="245" data-end="266">deprecated_compound</code>&nbsp;chứa tên địa phương&nbsp;<strong data-start="287" data-end="293">cũ</strong>.</p><p style="text-align: left;" data-start="299" data-end="386">&nbsp;False hoặc mặc định: Chỉ trả về địa giới&nbsp;<strong data-start="352" data-end="359">mới</strong>, không kèm thông tin cũ.</p><p style="text-align: left;" data-start="389" data-end="471" data-is-last-node="">&nbsp;Dữ liệu chính không thay đổi, param này chỉ để&nbsp;<strong data-start="436" data-end="462">tham chiếu địa danh cũ</strong>&nbsp;nếu cần.</p></td><td>&nbsp;false</td></tr></tbody></table>

**Response trả về:**

{
    "predictions": \[
        {
            "description": "Cổng đón/trả khách, Trường THPT Nguyễn Bỉnh Khiêm, 78 Hoàng Hoa Thám, Tam Long, Hồ Chí Minh",
            "matched\_substrings": null,
            "place\_id": "oXe3tlO8AXFyj1sxpFqs6HPSalW6d53fcr9xFHNbls6l0V8vQXmk33e1nlSnZI55aNKTJ79bitZ0tlugFmbtz38vZdG8AJbfcqVAVJZmQlv9zjFMAoACGlnGkWyuWAe3W",
            "reference": "oXe3tlO8AXFyj1sxpFqs6HPSalW6d53fcr9xFHNbls6l0V8vQXmk33e1nlSnZI55aNKTJ79bitZ0tlugFmbtz38vZdG8AJbfcqVAVJZmQlv9zjFMAoACGlnGkWyuWAe3W",
            "structured\_formatting": {
                "main\_text": "Cổng đón/trả khách",
                "main\_text\_matched\_substrings": null,
                "secondary\_text": "Trường THPT Nguyễn Bỉnh Khiêm, 78 Hoàng Hoa Thám, Tam Long, Hồ Chí Minh",
                "secondary\_text\_matched\_substrings": null
            },
            "has\_children": false,
            "plus\_code": {
                "compound\_code": "+JKB1 Long Tâm, Bà Rịa, Bà Rịa-Vũng Tàu",
                "global\_code": "49ON8+JKB1"
            },
            "compound": {
                "commune": "Tam Long",
                "province": "Hồ Chí Minh"
            },
            "terms": \[
                {
                    "offset": 0,
                    "value": "Cổng đón/trả khách"
                },
                {
                    "offset": 26,
                    "value": "Trường THPT Nguyễn Bỉnh Khiêm"
                },
                {
                    "offset": 65,
                    "value": "78 Hoàng Hoa Thám"
                },
                {
                    "offset": 86,
                    "value": "Tam Long"
                },
                {
                    "offset": 96,
                    "value": "Hồ Chí Minh"
                }
            \],
            "types": \[
                "site"
            \],
            "distance\_meters": null
        }
    \],
    "execution\_time": "143.612µs",
    "status": "OK"
}

<table dir="ltr" style="height: 543px;" border="1" width="1108" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><tbody><tr><td><strong>Tham số</strong></td><td><strong>Mô tả</strong></td><td><strong>Ví dụ</strong></td></tr><tr><td><strong>description</strong></td><td>Địa chỉ hiển thị đầy đủ cho người dùng</td><td>“Cổng đón/trả khách, Trường THPT Nguyễn Bỉnh Khiêm, 78 Hoàng Hoa Thám, Tam Long, Hồ Chí Minh”</td></tr><tr><td><strong>place_id</strong></td><td>Mã định danh duy nhất cho địa điểm – dùng cho Place Detail API</td><td>“oXe3tlO8AXFyj1sxpFqs6HPSalW6d53f…”</td></tr><tr><td><strong>reference</strong></td><td>Mã tham chiếu nội bộ – giống place_id</td><td>“oXe3tlO8AXFyj1sxpFqs6HPSalW6d53f…”</td></tr><tr><td><strong>main_text</strong></td><td>Tên chính của địa điểm, phần nổi bật</td><td>“Cổng đón/trả khách”</td></tr><tr><td><strong>secondary_text</strong></td><td>Phần thông tin bổ sung (tên trường, đường, phường, tỉnh…)</td><td>“Trường THPT Nguyễn Bỉnh Khiêm, 78 Hoàng Hoa Thám, Tam Long, Hồ Chí Minh”</td></tr><tr><td><strong>has_children</strong></td><td>Địa điểm có cấp con không? (true/false)</td><td>FALSE</td></tr><tr><td><strong>plus_code.compound_code</strong></td><td>Mã địa phương hóa địa điểm (Open Location Code)</td><td>“+JKB1 Long Tâm, Bà Rịa, Bà Rịa-Vũng Tàu”</td></tr><tr><td><strong>plus_code.global_code</strong></td><td>Mã toàn cầu cho địa điểm</td><td>“49ON8+JKB1”</td></tr><tr><td><strong>compound.commune</strong></td><td>Xã/phường theo đơn vị hành chính mới</td><td>“Tam Long”</td></tr><tr><td><strong>compound.province</strong></td><td>Tỉnh/thành theo đơn vị hành chính mới</td><td>“Hồ Chí Minh”</td></tr><tr><td><strong>terms</strong></td><td>Danh sách các thành phần địa chỉ và vị trí bắt đầu trong chuỗi</td><td>[{ “offset”: 0, “value”: “Cổng đón/trả khách” }, …]</td></tr><tr><td><strong>types</strong></td><td>Loại địa điểm (site, building, street_address…)</td><td>[“site”]</td></tr><tr><td><strong>distance_meters</strong></td><td>Khoảng cách từ location đầu vào đến địa điểm này (nếu có truyền)</td><td>null</td></tr><tr><td><strong>execution_time</strong></td><td>Thời gian xử lý truy vấn (micro giây)</td><td>“143.612µs”</td></tr><tr><td><strong>status</strong></td><td>Trạng thái phản hồi</td><td>“OK”</td></tr><tr><td><span style="color: #dede5b;"><strong>deprecated_description</strong></span></td><td>Chuỗi mô tả đầy đủ địa chỉ với thông tin cũ.</td><td>Long Tâm, Bà Rịa, Bà Rịa-Vũng Tàu</td></tr><tr><td><span style="color: #dede5b;"><strong>deprecated_compound</strong></span></td><td>Thông tin địa giới hành chính xã/phường, quận/huyện và tỉnh/thành phố.</td><td>{“commune”: “Long Tâm”, “district”: “Bà Rịa”, “province”: “Bà Rịa-Vũng Tàu”}</td></tr></tbody></table>
