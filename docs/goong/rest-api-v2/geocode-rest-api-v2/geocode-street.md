---
title: "GEOCODE STREET (V2)"
source: https://help.goong.io/kb/rest-api-v2/geocode-rest-api-v2/geocode-street/
updated: 2025-07-18T16:20:06
categories: ["GEOCODE V2"]
---
# GEOCODE STREET (V2)

> Nguồn: [https://help.goong.io/kb/rest-api-v2/geocode-rest-api-v2/geocode-street/](https://help.goong.io/kb/rest-api-v2/geocode-rest-api-v2/geocode-street/)

# **TỔNG QUAN**

**Geocode Street API của [Goong](http://GOONG.IO)** cho phép truy xuất **tên đường từ tọa độ lat/lng (vĩ độ, kinh độ)**, đồng thời trả về các thông tin địa lý liên quan đến tuyến đường đó. Khi truyền vào một cặp tọa độ, API sẽ xác định tên đường tại vị trí tương ứng, sau đó truy xuất về các dữ liệu như vị trí trung tâm của đường, mã vùng, đơn vị hành chính cấp xã và tỉnh/thành phố của đường tị vị trí đó.

API này hỗ trợ hiệu quả cho các tác vụ như ánh xạ tuyến đường vào khu vực hành chính, phân loại điểm giao nhận, phân tích dữ liệu vận hành theo địa bàn hoặc đồng bộ hóa dữ liệu bản đồ. Việc sử dụng Geocode Street giúp hệ thống xác định rõ một vị trí cụ thể thuộc tuyến đường nào và nằm trong phạm vi quản lý của địa phương nào – điều đặc biệt quan trọng trong bối cảnh thay đổi địa giới hành chính hiện nay, khi thông tin địa lý cần được cập nhật kịp thời và chính xác tuyệt đối.

# **CÁCH SỬ DỤNG GEOCODE STREET**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** **https://rsapi.goong.io/v2/geocode/street**

**Phương thức: GET**

**Định nghĩa**

Geocode street là quá trình chuyển đổi từ tọa độ (vĩ độ và kinh độ) thành địa chỉ đường cụ thể

**Thông số bắt buộc**

-   latlng: Tọa độ điểm cần lấy thông tin.

**Tham số trong request truyền vào:**

**https://rsapi.goong.io/v2/geocode/street?api\_key={YOUR\_API\_KEY}&latlng=21.030145,105.811122&has\_deprecated\_administrative\_unit=true**

<table><tbody><tr><td style="text-align: center;"><b>Tham số</b></td><td style="text-align: center;"><b>Mô tả</b></td><td style="text-align: center;"><b>Ví dụ</b></td></tr><tr><td style="text-align: left;"><b>latlng</b></td><td style="text-align: left;">Tọa độ địa điểm cần truy vấn, gồm lat,long</td><td style="text-align: left;">21.120678,106.397301</td></tr><tr><td style="text-align: left;"><b>has_deprecated_administrative_unit</b></td><td><p style="text-align: left;">Là tham số boolean dùng trong API V2, để hiển thị thêm thông tin địa giới hành chính trước khi sáp nhập.</p><p style="text-align: left;">&nbsp;True: Kết quả vẫn theo địa giới mới, nhưng có thêm trường deprecated_description và deprecated_compound chứa tên địa phương cũ.</p><p>&nbsp;False hoặc mặc định: Chỉ trả về địa giới mới, không kèm thông tin cũ..</p></td><td style="text-align: left;">True</td></tr><tr><td style="text-align: left;"><b>api_key</b></td><td style="text-align: left;">Mã khóa API của bạn để xác thực với hệ thống</td><td style="text-align: left;">API key của bạn</td></tr></tbody></table>

**Tham số trong response trả về:**

**{**

  **"results": \[**

    **{**

      **"address\_components": \[**

        **{**

          **"long\_name": "Kim Mã",**

          **"short\_name": "Kim Mã"**

        **},**

        **{**

          **"long\_name": "Giảng Võ",**

          **"short\_name": "Giảng Võ"**

        **},**

        **{**

          **"long\_name": "Hà Nội",**

          **"short\_name": "Hà Nội"**

        **}**

      **\],**

      **"formatted\_address": "Kim Mã, Giảng Võ, Hà Nội",**

      **"geometry": {**

        **"location": {**

          **"lat": 21.030145,**

          **"lng": 105.811122**

        **},**

        **"boundary": "anj\_CenydSx@tH"**

      **},**

      **"place\_id": "gqXMe8N2ZLdLtl-brGZ7twebS0PDeopXeJ2tRqxmoi57i9lNP-naGtlKmUCqBTJXVZMBAQ7Vknf5SwSsD",**

      **"reference": "gqXMe8N2ZLdLtl-brGZ7twebS0PDeopXeJ2tRqxmoi57i9lNP-naGtlKmUCqBTJXVZMBAQ7Vknf5SwSsD",**

      **"plus\_code": null,**

      **"compound": {**

        **"commune": "Giảng Võ",**

        **"province": "Hà Nội"**

      **},**

      **"types": \[\],**

      **"name": "Kim Mã",**

      **"address": "Giảng Võ, Hà Nội",**

      **"deprecated\_description": "Kim Mã, Ngọc Khánh, Ba Đình, Hà Nội",**

      **"deprecated\_compound": {**

        **"district": "Ba Đình",**

        **"commune": "Ngọc Khánh",**

        **"province": "Hà Nội"**

      **}**

    **}**

  **\],**

  **"status": "OK"**

**}**

<table><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><b>Tên tham số</b></span></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Mô tả chi tiết</b></span></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Ví dụ&nbsp;</b></span></td></tr><tr><td style="text-align: left;"><b>results</b></td><td style="text-align: left;">Mảng chứa các kết quả địa điểm phù hợp với tọa độ hoặc truy vấn đầu vào. Mỗi phần tử trong mảng là thông tin chi tiết của một địa điểm.</td><td>{<p></p><p style="text-align: left;">“address_components”: [</p><p>{</p><p style="text-align: left;">“long_name”: “Duy Xuyên”,</p><p>“short_name”: “Duy Xuyên”</p><p>},</p><p>{</p><p>“long_name”: “Đà Nẵng”,</p><p>“short_name”: “Đà Nẵng”</p><p><b>}</b></p></td></tr><tr><td style="text-align: left;"><b>address_components</b></td><td style="text-align: left;">Danh sách các thành phần tạo nên địa chỉ, từ chi tiết nhỏ nhất (số nhà, đường) đến cấp hành chính lớn hơn (phường, quận, tỉnh).</td><td style="text-align: left;">“long_name”: “Duy Xuyên”,</td></tr><tr><td style="text-align: left;"><b>formatted_address</b></td><td style="text-align: left;">Địa chỉ đầy đủ, đã được định dạng rõ ràng và sắp xếp theo thứ tự từ nhỏ đến lớn. Thường dùng để hiển thị cho người dùng cuối.</td><td style="text-align: left;">“Duy Xuyên, Đà Nẵng”,</td></tr><tr><td style="text-align: left;"><b>location.lat</b></td><td style="text-align: left;">Vĩ độ (latitude) của địa điểm – tọa độ theo hướng Bắc – Nam.</td><td style="text-align: left;">15.765075</td></tr><tr><td style="text-align: left;"><b>location.lng</b></td><td style="text-align: left;">Kinh độ (longitude) của địa điểm – tọa độ theo hướng Đông – Tây.</td><td style="text-align: left;">108.204474</td></tr><tr><td style="text-align: left;"><b>boundary</b></td><td style="text-align: left;">Đa giác (polygon) biểu diễn ranh giới hành chính hoặc khu vực địa lý của địa điểm. Nếu không có, sẽ là null.</td><td style="text-align: left;">“io`_Bee_sS}[wAmM_AgLy@uGMuGNaJfBeH~DkCdBy@null</td></tr><tr><td style="text-align: left;"><b>place_id</b></td><td style="text-align: left;">Mã định danh duy nhất cho địa điểm. Dùng để tham chiếu hoặc tìm kiếm lại địa điểm trong các API khác.</td><td style="text-align: left;">drtqhLmKubt1uUEJoVZFi3Wrd5ijaE10ar…</td></tr><tr><td style="text-align: left;"><b>reference</b></td><td style="text-align: left;">Trường tham chiếu địa điểm, thường trùng với place_id. Giữ lại để tương thích với phiên bản cũ.</td><td style="text-align: left;">drtqhLmKubt1uUEJoVZFi3Wrd5ijaE10ar</td></tr><tr><td><b>compound_code</b></td><td style="text-align: left;">Mã định vị địa phương dạng Plus Code (mã mở), cho phép xác định vị trí chính xác trong khu vực hành chính<b>.</b></td><td></td></tr><tr><td style="text-align: left;"><b>global_code</b></td><td style="text-align: left;">Mã định vị toàn cầu dạng Plus Code. Dùng trong các hệ thống không cần địa chỉ hành chính.</td><td style="text-align: left;">“MXUP+BMKDMI”</td></tr><tr><td style="text-align: left;"><b>province</b></td><td style="text-align: left;">Tên tỉnh/thành phố nơi địa điểm tọa lạc. Dữ liệu này đã được cập nhật theo đơn vị hành chính mới nhất.</td><td style="text-align: left;">Đà Nẵng</td></tr><tr><td style="text-align: left;"><b>district</b></td><td style="text-align: left;">Tên quận/huyện hoặc thành phố cấp huyệnĐà Nẵng</td><td style="text-align: left;">Duy Xuyên</td></tr><tr><td style="text-align: left;"><b>commune</b></td><td style="text-align: left;">Tên phường/xã/thị trấn.</td><td style="text-align: left;">Duy Sơn</td></tr><tr><td style="text-align: left;"><b>types</b></td><td style="text-align: left;">Danh sách loại địa điểm theo phân loại hệ thống (nếu có), ví dụ: route, house_number, locality,… Có thể rỗng nếu không xác định.</td><td style="text-align: left;">[]</td></tr><tr><td style="text-align: left;"><b>name</b></td><td style="text-align: left;">Tên chính của địa điểm hoặc phần mô tả ngắn gọn, ví dụ: tên cửa hàng, số nhà, địa danh.</td><td style="text-align: left;">Duy Xuyên</td></tr><tr><td style="text-align: left;"><b>address</b></td><td style="text-align: left;">Địa chỉ hành chính không bao gồm tên cụ thể hay số nhà, thường là cụm “xã/phường, huyện/quận, tỉnh/thành”.</td><td style="text-align: left;">Đà Nẵng</td></tr><tr><td style="text-align: left;"><b>status</b></td><td style="text-align: left;">Trạng thái phản hồi của API. “OK” nghĩa là thành công, “INVALID_REQUEST” là sai định dạng truy vấn…</td><td style="text-align: left;">“OK”</td></tr><tr><td style="text-align: left;"><b>deprecated_description</b></td><td style="text-align: left;">Chuỗi mô tả đầy đủ địa chỉ với thông tin cũ.</td><td style="text-align: left;">Duy Sơn, Duy Xuyên, Quảng Nam</td></tr><tr><td style="text-align: left;"><b>deprecated_compound</b></td><td style="text-align: left;">Thông tin địa giới hành chính xã/phường, quận/huyện và tỉnh/thành phố.</td><td style="text-align: left;">{“commune”: “Duy Sơn”, “district”: “Duy Xuyên”, “province”: “Quảng Nam”}</td></tr></tbody></table>
