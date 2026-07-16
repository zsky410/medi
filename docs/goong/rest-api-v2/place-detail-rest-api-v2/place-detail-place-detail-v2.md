---
title: "PLACE DETAIL (V2)"
source: https://help.goong.io/kb/rest-api-v2/place-detail-rest-api-v2/place-detail-place-detail-v2/
updated: 2025-07-09T15:40:50
categories: ["PLACE DETAIL V2"]
---
# PLACE DETAIL (V2)

> Nguồn: [https://help.goong.io/kb/rest-api-v2/place-detail-rest-api-v2/place-detail-place-detail-v2/](https://help.goong.io/kb/rest-api-v2/place-detail-rest-api-v2/place-detail-place-detail-v2/)

# TỔNG QUAN

**Place Detail API V2** của Goong là phiên bản nâng cấp cho phép truy xuất thông tin chi tiết của một địa điểm, bao gồm: tên, địa chỉ, vị trí tọa độ, loại hình dịch vụ, giờ hoạt động và các thuộc tính liên quan.

Khác với phiên bản trước, **V2 đã cập nhật dữ liệu theo đơn vị hành chính mới**, phản ánh các thay đổi sau quá trình sáp nhập tỉnh, huyện, xã trên toàn quốc theo chủ trương của Chính phủ. Điều này giúp đảm bảo thông tin trả về phù hợp với hệ thống địa giới hành chính hiện hành – đặc biệt quan trọng với các hệ thống cần phân tích, quản lý hoặc hiển thị dữ liệu địa lý theo ranh giới hành chính mới.

API trả dữ liệu dưới dạng **JSON**, dễ tích hợp vào các hệ thống bản đồ số, ứng dụng logistics, phần mềm điều hành giao thông, nền tảng chính phủ số và các hệ thống quản lý có yêu cầu cao về tính chính xác của địa chỉ.

# CÁCH THỨC TÍCH HỢP GOONG PLACE DETAIL

**Bắt đầu:**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** https://rsapi.goong.io/v2/place/detail

**Phương thức: GET**

**Tham số trong request truyền vào:** 

https://rsapi.goong.io/v2/place/detail?place\_id=ceemb00pVO95sWtNulG-8kaxRbG6WjCYdY94iKIH79BASozdSlnGY8EaIRS-VTZzjQbCmEmdwnJN0iJEJp1qivHrWTT2XY4iOdLBGUl1gkPl1ipAGVQaAkHeiXS2QB-vQ&api\_key={YOUR\_API\_KEY}&has\_deprecated\_administrative\_unit=true

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="207"> <col width="473"> <col width="342"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td><strong>place_id</strong></td><td>ID duy nhất của địa điểm, dùng để truy vấn thông tin chi tiết của địa điểm đó.</td><td>Hobn8WqBW6rsKtKq2PDrVKp4BJNRti</td></tr><tr><td><strong>api_key</strong></td><td>Khóa truy cập API cá nhân của bạn, dùng để xác thực khi gọi API.</td><td>api_key của bạn</td></tr><tr><td><strong>has_deprecated_administrative_unit</strong></td><td>Là tham số boolean dùng trong API V2, để hiển thị thêm thông tin địa giới hành chính&nbsp;trước khi sáp nhập.<p></p><p>True: Kết quả vẫn theo địa giới&nbsp;mới, nhưng có thêm trường&nbsp;deprecated_description&nbsp;và&nbsp;deprecated_compound&nbsp;chứa tên địa phương&nbsp;cũ.</p><p>False hoặc mặc định: Chỉ trả về địa giới&nbsp;mới, không kèm thông tin cũ.</p><p>Dữ liệu chính không thay đổi, param này chỉ để&nbsp;tham chiếu địa danh cũ&nbsp;nếu cần</p></td><td>&nbsp; true</td></tr></tbody></table>

**Tham số trong response trả về:**

{
    "result": {
        "place\_id": "ceemb00pVO95sWtNulG-8kaxRbG6WjCYdY94iKIH79BASozdSlnGY8EaIRS-VTZzjQbCmEmdwnJN0iJEJp1qivHrWTT2XY4iOdLBGUl1gkPl1ipAGVQaAkHeiXS2QB-vQ",
        "formatted\_address": "2/31 Ngô Gia Khảm, Bồ Đề, Hà Nội",
        "geometry": {
            "location": {
                "lat": 21.048178407000023,
                "lng": 105.87687658000004
            }
        },
        "plus\_code": {
            "compound\_code": "+6XTFW Ngọc Lâm, Long Biên, Hà Nội",
            "global\_code": "LOEJ+6XTFW"
        },
        "compound": {
            "commune": "Bồ Đề",
            "province": "Hà Nội"
        },
        "name": "2/31 Ngô Gia Khảm",
        "url": "https://maps.goong.io/?pid=ceemb00pVO95sWtNulG-8kaxRbG6WjCYdY94iKIH79BASozdSlnGY8EaIRS-VTZzjQbCmEmdwnJN0iJEJp1qivHrWTT2XY4iOdLBGUl1gkPl1ipAGVQaAkHeiXS2QB-vQ",
        "types": \[
            "house\_number"
        \],
        "deprecated\_description": "31 Ngõ 2 Ngô Gia Khảm, Ngọc Lâm, Long Biên, Hà Nội",
        "deprecated\_compound": {
            "district": "Long Biên",
            "commune": "Ngọc Lâm",
            "province": "Hà Nội"
        }
    },
    "status": "OK"
}

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><tbody><tr><td><strong>Tham số</strong></td><td><strong>Mô tả</strong></td><td><strong>Ví dụ</strong></td></tr><tr><td><strong>place_id</strong></td><td>Mã định danh duy nhất của địa điểm trong hệ thống Goong</td><td>Hobn8WqBW6rsKtKq2…xlqDBt5XA==.ZXhwYW5kMA==</td></tr><tr><td><strong>compound</strong></td><td>Thông tin địa giới hành chính xã/phường và tỉnh/thành phố</td><td>{“commune”: “Bồ Đề”, “province”: “Hà Nộ”}</td></tr><tr><td>f<strong>ormatted_address</strong></td><td>Địa chỉ đầy đủ của địa điểm, đã được cập nhật theo địa giới hành chính mới nếu có</td><td><div><div>“+6XTFW Ngọc Lâm, Bồ Đề, Hà Nội”</div></div></td></tr><tr><td><strong>location.lat</strong></td><td>Vĩ độ (latitude) của địa điểm</td><td>21.122.345.678</td></tr><tr><td><strong>location.lng</strong></td><td>Kinh độ (longitude) của địa điểm</td><td>106.315.678.901</td></tr><tr><td><strong>name</strong></td><td>Tên của địa điểm</td><td>“91 Nguyễn Trãi”</td></tr><tr><td><strong>status</strong></td><td>Trạng thái phản hồi API (OK nếu thành công, lỗi khác nếu thất bại)</td><td>“OK”</td></tr><tr><td><span style="color: #dede50;"><strong>deprecated_description</strong></span></td><td>Chuỗi mô tả đầy đủ địa chỉ với thông tin cũ.</td><td><div><div>31 Ngõ 2 Ngô Gia Khảm, Ngọc Lâm, Long Biên, Hà Nội</div></div></td></tr><tr><td><span style="color: #e3e35b;"><strong>deprecated_compound</strong></span></td><td>Thông tin địa giới hành chính xã/phường, quận/huyện và tỉnh/thành phố.</td><td>&nbsp;{“commune”: “Bồ Đề”, “district”: “Long Biên”,“province”: “Hà Nộ”}</td></tr></tbody></table>
