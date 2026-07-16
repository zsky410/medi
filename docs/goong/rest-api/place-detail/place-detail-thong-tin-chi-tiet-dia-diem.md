---
title: "PLACE DETAIL – THÔNG TIN CHI TIẾT ĐỊA ĐIỂM"
source: https://help.goong.io/kb/rest-api/place-detail/place-detail-thong-tin-chi-tiet-dia-diem/
updated: 2024-10-21T10:34:50
categories: ["PLACE DETAIL"]
---
# PLACE DETAIL – THÔNG TIN CHI TIẾT ĐỊA ĐIỂM

> Nguồn: [https://help.goong.io/kb/rest-api/place-detail/place-detail-thong-tin-chi-tiet-dia-diem/](https://help.goong.io/kb/rest-api/place-detail/place-detail-thong-tin-chi-tiet-dia-diem/)

## **TỔNG QUAN**

**Place Detail API** là dịch vụ lấy thông tin chi tiết về một địa điểm. Thông tin này có thể bao gồm vị trí địa lý chính xác, địa chỉ, loại hình kinh doanh (nếu áp dụng), các tính năng đặc biệt của địa điểm đó như giá cả, đánh giá, thời gian hoạt động và thông tin liên hệ. **Goong Place Detail** **API** cho phép truy vấn thông tin chi tiết của một địa điểm dựa trên ID của địa điểm đó.

### **Vì sao nên sử dụng Place Detail**

Tạo các tính năng nhận biết vị trí để giúp người dùng của bạn dễ dàng lấy dữ liệu vị trí chi tiết. Dữ liệu có sẵn thông qua Place Detail được xây dựng trên một trong những mô hình địa điểm chính xác, mới nhất và toàn diện nhất của thế giới thực. Một số ứng dụng thực tế sau đây:

-   _Hiển thị thông tin chi tiết của nhà hàng, quán ăn, khách sạn, các dịch vụ công cộng về vị trí, tình trạng hoạt động, thông tin liên hệ, đánh giá và hình ảnh cụ thể. Cung cấp thông tin cho quá trình thực hiện kế hoạch một chuyến đi._
-   _Thêm thông tin chi tiết về địa điểm._

### **Ứng dụng thực tế của Place Detail**

Bạn có thể sử dụng Place Detail để lấy thông tin chi tiết được trả về về một địa điểm.

Nhiều API trên nền tảng Goong hỗ trợ lấy mã địa điểm, trong đó mã địa điểm sẽ giúp nhận dạng riêng một địa điểm trong cơ sở dữ liệu địa điểm của Goong và trên Goong Maps. Có nhiều cách để lấy mã địa điểm, bao gồm cả từ [Autocomplete API](https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/) và từ [Geocode API](https://help.goong.io/kb/rest-api/geocoding/geocodeding-ma-hoa-dia-ly/).

Sau khi có mã địa điểm, bạn có thể sử dụng Place Detail để yêu cầu thêm thông tin chi tiết về một cơ sở hoặc địa điểm yêu thích cụ thể, chẳng hạn như địa chỉ đầy đủ, số điện thoại, điểm xếp hạng của người dùng và bài đánh giá.

## CÁCH THỨC TÍCH HỢP GOONG PLACE DETAIL

**Bắt đầu:**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** /place/detail

**Phương thức: GET**

**Ví dụ về request:**

curl "https://rsapi.goong.io/place/detail?place\_id=Hobn8WqBW6rsKtKq2PDrVKp4BJNRtiILxTQbB\_\_muXgRB3v8GRDTfkp\_6lc4cbLw%2F5PUgWrMDrSI%2FxlqDBt5XA%3D%3D.ZXhwYW5kMA%3D%3D&api\_key={YOUR\_API\_KEY}"

<table style="height: 163px;" width="699"><tbody><tr><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Tham số</b></span></p></td><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Mô tả</b></span></p></td><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Ví dụ</b></span></p></td></tr><tr><td><p style="text-align: left;"><b>place_id</b></p></td><td style="text-align: left;">Id của địa điểm</td><td style="text-align: left;">lmlZtUpGewN1jaY0Pn2U_HamlVK-fabRXtBZAqNqmPW<p></p><p>4ZFEgv9O69WamQSG_dovSX7ebEKlpLXbcjr1dlEQbAm</p><p>aLbxW9cO-QZLRCVpRxlP0CjlECopyEc5SmWSmUcu_UO</p></td></tr></tbody></table>

**Ví dụ về response:**

application/json
{
   "result": {
      "place\_id": "Hobn8WqBW6rsKtKq2PDrVKp4BJNRtiILxTQbB\_\_muXgRB3v8GRDTfkp\_6lc4cbLw
                  /5PUgWrMDrSI/xlqDBt5XA==.ZXhwYW5kMA==",
      "formatted\_address": "Phường Trung Hòa, Quận Cầu Giấy, Thành phố Hà Nội",
      "geometry": {
         "location": {
            "lat": 21.0137625240001,
            "lng": 105.798267363
         }
      },
      "name": "91 Trung Kính"
   },
   "status": "OK"
}

<table width="779"><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td style="text-align: left;"><strong>result</strong></td><td style="text-align: left;">Chứa một mảng thông tin địa chỉ và thông tin hình học được mã hoá địa lý.</td><td></td></tr><tr><td style="text-align: left;"><strong>place_id</strong></td><td style="text-align: left;">Id của địa điểm.</td><td style="text-align: left;">0WmA4vbeody2J9AEvVM9YE3ZN85z7Mrw</td></tr><tr><td style="text-align: left;"><strong>formatted_address</strong></td><td><p style="text-align: left;">Bao gồm tất cả các thông tin cần thiết như số nhà, tên đường, quận/huyện, thành phố,/tỉnh và quốc gia.</p><p style="text-align: left;">Thường được sử dụng để hiển thị thông tin chi tiết về vị trí hoặc địa chỉ người dùng.</p></td><td style="text-align: left;">Phường Trung Hòa, Quận Cầu Giấy, Thành phố Hà Nội</td></tr><tr><td style="text-align: left;"><strong>geometry</strong></td><td style="text-align: left;">Là một phần dữ liệu mô tả vị trí địa lý của một đối tượng, bao gồm kinh độ và vĩ độ.</td><td><div><div style="text-align: left;">“geometry”: {</div><div style="text-align: left;">&nbsp; &nbsp;“location”: {</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “lat”: 20.954041207000046,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “lng”: 105.93929095700008</div><div style="text-align: left;">&nbsp; &nbsp;}</div><div style="text-align: left;">}</div></div></td></tr><tr><td style="text-align: left;"><strong>location</strong></td><td style="text-align: left;">Tọa độ điểm kinh độ và vĩ độ.</td><td><p style="text-align: left;">21.0137625240001,</p><p style="text-align: left;">105.798267363</p></td></tr><tr><td style="text-align: left;"><strong>name</strong></td><td style="text-align: left;">Tên địa điểm.</td><td style="text-align: left;">226 Vạn Phúc</td></tr><tr><td style="text-align: left;"><strong>status</strong></td><td style="text-align: left;">Mã trạng thái “ok” nghĩa là thành công, khác là thất bại.</td><td style="text-align: left;">ok</td></tr></tbody></table>
