---
title: "GEOCODE (V2)"
source: https://help.goong.io/kb/rest-api-v2/geocode-rest-api-v2/geocode-v2/
updated: 2026-03-16T15:17:01
categories: ["GEOCODE V2"]
---
# GEOCODE (V2)

> Nguồn: [https://help.goong.io/kb/rest-api-v2/geocode-rest-api-v2/geocode-v2/](https://help.goong.io/kb/rest-api-v2/geocode-rest-api-v2/geocode-v2/)

# TỔNG QUAN

**Geocode** là API chuyển đổi địa chỉ (ví dụ: địa chỉ nhà, cửa hàng…) thành **tọa độ địa lý** (kinh độ, vĩ độ)  và ngược lại. API này cho phép người dùng lấy được thông tin địa lý chi tiết như vị trí, mã vùng, quận/huyện, và thậm chí là các địa điểm kinh doanh.

**Geocode API** có 3 chức năng chính:

-   **Forward geocode**: Chuyển đổi từ địa chỉ sang tọa độ
    
-   **Reverse geocode**: Chuyển đổi từ tọa độ địa lý (kinh độ, vĩ độ) sang địa chỉ
    
-   **Tra cứu theo place\_id**: Nhận thông tin chi tiết về địa điểm qua mã place\_id
    

Điểm nổi bật của **V2** là khả năng **cập nhật chính xác tên địa phương mới** theo các quyết định **sáp nhập, điều chỉnh địa giới hành chính**. Ví dụ, các địa chỉ thuộc huyện cũ sẽ tự động được gán đúng vào đơn vị hành chính mới (đã sáp nhập), giúp đảm bảo kết quả luôn khớp với thực tế hiện hành.

# CÁCH SỬ DỤNG GEOCODE

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** https://rsapi.goong.io/v2/geocode

**Phương thức: GET**

## **Chuyển đổi từ địa chỉ sang tọa độ Forward Geocode**

**Định nghĩa**

**Forward Geocode** là quá trình chuyển đổi một địa chỉ cụ thể thành tọa độ địa lý (vĩ độ và kinh độ). Khi bạn nhập một địa chỉ vào hệ thống, dịch vụ Geocode sẽ tìm kiếm và trả về các tọa độ tương ứng với địa chỉ đó.

**Cách thức hoạt động của Forward geocode** 

Khi bạn nhập một địa chỉ, hệ thống sẽ thực hiện quá trình chuyển đổi thông tin văn bản đó thành các tọa độ địa lý (vĩ độ, kinh độ) trên bản đồ. Quá trình này bao gồm:

-   **Chuẩn hóa dữ liệu:** Hệ thống sẽ làm sạch dữ liệu đầu vào, loại bỏ các từ thừa và sắp xếp thông tin địa chỉ theo một cấu trúc nhất định.
-   **Tìm kiếm trong cơ sở dữ liệu:** Hệ thống sẽ so sánh địa chỉ đã chuẩn hóa với các thông tin địa lý có sẵn trong cơ sở dữ liệu của mình.
-   **Trả về kết quả:** Khi tìm thấy kết quả phù hợp, hệ thống sẽ trả về các tọa độ địa lý tương ứng cùng với các thông tin bổ sung như tên đường, quận, huyện…

**Cách thức tạo một yêu cầu Forward geocode**

**Thông số bắt buộc**

-   address – Địa chỉ muốn lấy tọa độ.

**Tham số về request truyền vào:**

https://rsapi.goong.io/v2/geocode?address=91%20Trung%20K%C3%ADnh%2C%20Trung%20H%C3%B2a%2C%20C%E1%BA%A7u%20Gi%E1%BA%A5y%2C%20H%C3%A0%20N%E1%BB%99i&api\_key={YOUR\_API\_KEY}

<table dir="ltr" style="height: 207px;" border="1" width="970" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="142"> <col width="315"> <col width="299"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td><strong>address</strong></td><td style="text-align: left;">Địa chỉ cần chuyển đổi sang tọa độ và place_id. Có thể là tên đường, số nhà, phường, quận.</td><td><p dir="auto">91 Ngõ 43 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội</p></td></tr><tr><td><strong>api_key</strong></td><td style="text-align: left;">Khóa API cá nhân của bạn dùng để xác thực.</td><td>AbC1234xyzXYZ</td></tr><tr><td><strong>has_deprecated_administrative_unit</strong></td><td><p style="text-align: left;" data-start="0" data-end="146">Là tham số boolean dùng trong API V2, để hiển thị thêm thông tin địa giới hành chính&nbsp;<strong data-start="121" data-end="143" data-is-only-node="">trước khi sáp nhập</strong>.</p><p style="text-align: left;" data-start="149" data-end="296">&nbsp;True: Kết quả vẫn theo địa giới&nbsp;<strong data-start="187" data-end="194">mới</strong>, nhưng có thêm trường&nbsp;<code data-start="217" data-end="241">deprecated_description</code>&nbsp;và&nbsp;<code data-start="245" data-end="266">deprecated_compound</code>&nbsp;chứa tên địa phương&nbsp;<strong data-start="287" data-end="293">cũ</strong>.</p><p style="text-align: left;" data-start="299" data-end="386">&nbsp;False hoặc mặc định: Chỉ trả về địa giới&nbsp;<strong data-start="352" data-end="359">mới</strong>, không kèm thông tin cũ.</p><p style="text-align: left;" data-start="389" data-end="471" data-is-last-node="">&nbsp;Dữ liệu chính không thay đổi, param này chỉ để&nbsp;<strong data-start="436" data-end="462">tham chiếu địa danh cũ</strong>&nbsp;nếu cần.</p></td><td></td></tr></tbody></table>

**Tham số trong response trả về:**

{
  "results": \[
    {
      "address\_components": \[
        {
          "long\_name": "91 Trung Kính",
          "short\_name": "91 Trung Kính"
        },
        {
          "long\_name": "Yên Hòa",
          "short\_name": "Yên Hòa"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "91 Trung Kính, Yên Hòa, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.013672808000024,
          "lng": 105.79825090900005
        },
        "boundary": null
      },
      "place\_id": "mSyZlrHISyhtoltUuEyJ-EG9ZhCvc6P6R4tiF7tjdOidiX40u1pvcG-iPyAolJEHcK1EmS1zXJR41bDJl3CN93WnRFWhXeTLvdZdHU5Fhkfh0i1S9pweBkXYHXKORBurR",
      "reference": "mSyZlrHISyhtoltUuEyJ-EG9ZhCvc6P6R4tiF7tjdOidiX40u1pvcG-iPyAolJEHcK1EmS1zXJR41bDJl3CN93WnRFWhXeTLvdZdHU5Fhkfh0i1S9pweBkXYHXKORBurR",
      "plus\_code": {
        "compound\_code": "+6DW1G Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1G"
      },
      "compound": {
        "commune": "Yên Hòa",
        "province": "Hà Nội"
      },
      "types": \[
        "house\_number"
      \],
      "name": "91 Trung Kính",
      "address": "Yên Hòa, Hà Nội",
      "deprecated\_description": "91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "deprecated\_compound": {
        "district": "Cầu Giấy",
        "commune": "Trung Hòa",
        "province": "Hà Nội"
      }
    },
    {
      "address\_components": \[
        {
          "long\_name": "Bluesea",
          "short\_name": "Bluesea"
        },
        {
          "long\_name": "91 Trung Kính",
          "short\_name": "91 Trung Kính"
        },
        {
          "long\_name": "Yên Hòa",
          "short\_name": "Yên Hòa"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Bluesea, 91 Trung Kính, Yên Hòa, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.013672808000024,
          "lng": 105.79825090900005
        },
        "boundary": "ofg\_CuvvdSjBLCf@kBMBg@"
      },
      "place\_id": "SjvkG73jqUpihXomJx3ys9GeATVutC5OdeLNKP7Z-l\_5-25deqAqcVna-2bO0bqW-fjhWr5lVwOxPr0oAoX\_kfmKjbAS25eBte79JXZ9vn\_Z6hVoJqQlSn3itjyKfCFLf",
      "reference": "SjvkG73jqUpihXomJx3ys9GeATVutC5OdeLNKP7Z-l\_5-25deqAqcVna-2bO0bqW-fjhWr5lVwOxPr0oAoX\_kfmKjbAS25eBte79JXZ9vn\_Z6hVoJqQlSn3itjyKfCFLf",
      "plus\_code": {
        "compound\_code": "+J4VN Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+J4VN"
      },
      "compound": {
        "commune": "Yên Hòa",
        "province": "Hà Nội"
      },
      "types": \[
        "building"
      \],
      "name": "Bluesea",
      "address": "91 Trung Kính, Yên Hòa, Hà Nội",
      "deprecated\_description": "Tòa nhà Bluesea, 91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "deprecated\_compound": {
        "district": "Cầu Giấy",
        "commune": "Trung Hòa",
        "province": "Hà Nội"
      }
    },
    {
      "address\_components": \[
        {
          "long\_name": "Công ty Cổ phần Công nghệ và Truyền thông Biển Xanh",
          "short\_name": "Công ty Cổ phần Công nghệ và Truyền thông Biển Xanh"
        },
        {
          "long\_name": "Tầng 6",
          "short\_name": "Tầng 6"
        },
        {
          "long\_name": "Tòa nhà BlueSea",
          "short\_name": "Tòa nhà BlueSea"
        },
        {
          "long\_name": "91 Trung Kính",
          "short\_name": "91 Trung Kính"
        },
        {
          "long\_name": "Yên Hòa",
          "short\_name": "Yên Hòa"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Công ty Cổ phần Công nghệ và Truyền thông Biển Xanh, Tầng 6, Tòa nhà BlueSea, 91 Trung Kính, Yên Hòa, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.01369399600003,
          "lng": 105.79826308000008
        },
        "boundary": null
      },
      "place\_id": "EmOMgxKlzGVlilFHPXY8R\_3m2d4NFSZxkZqh3Bq3bhPZknFJCgRP7xqh5Kwu1dabEp8F0BLJniIZtp2MktGuU-nnBWQe2EffdYKRSskZhhO10nkGEsmGUhGO2STmEE\_\_E",
      "reference": "EmOMgxKlzGVlilFHPXY8R\_3m2d4NFSZxkZqh3Bq3bhPZknFJCgRP7xqh5Kwu1dabEp8F0BLJniIZtp2MktGuU-nnBWQe2EffdYKRSskZhhO10nkGEsmGUhGO2STmEE\_\_E",
      "plus\_code": {
        "compound\_code": "+2AHY Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+2AHY"
      },
      "compound": {
        "commune": "Yên Hòa",
        "province": "Hà Nội"
      },
      "types": \[
        "company"
      \],
      "name": "Công ty Cổ phần Công nghệ và Truyền thông Biển Xanh",
      "address": "Tầng 6, Tòa nhà BlueSea, 91 Trung Kính, Yên Hòa, Hà Nội",
      "deprecated\_description": "Công ty Cổ phần Công nghệ và Truyền thông Biển Xanh, Tầng 6, Tòa nhà BlueSea, 91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "deprecated\_compound": {
        "district": "Cầu Giấy",
        "commune": "Trung Hòa",
        "province": "Hà Nội"
      }
    },
    {
      "address\_components": \[
        {
          "long\_name": "43/91 Trung Kính",
          "short\_name": "43/91 Trung Kính"
        },
        {
          "long\_name": "Yên Hòa",
          "short\_name": "Yên Hòa"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "43/91 Trung Kính, Yên Hòa, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.01178451000004,
          "lng": 105.79653747400005
        },
        "boundary": null
      },
      "place\_id": "EE6Xj5zYnp-zfmwqrn2fxrOub1q0JfpydTtkxJ6lwl8JOhWh6tm\_gqRp-Y2LtgCaoeAlGuaEJMZhIkUYlrFKfvn6RQgO2CuCce79JXZ9vn\_Z6hVoJUgmPqXitUiKfCOTf",
      "reference": "EE6Xj5zYnp-zfmwqrn2fxrOub1q0JfpydTtkxJ6lwl8JOhWh6tm\_gqRp-Y2LtgCaoeAlGuaEJMZhIkUYlrFKfvn6RQgO2CuCce79JXZ9vn\_Z6hVoJUgmPqXitUiKfCOTf",
      "plus\_code": {
        "compound\_code": "+63G73 Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+63G73"
      },
      "compound": {
        "commune": "Yên Hòa",
        "province": "Hà Nội"
      },
      "types": \[
        "house\_number"
      \],
      "name": "43/91 Trung Kính",
      "address": "Yên Hòa, Hà Nội",
      "deprecated\_description": "91 Ngõ 43 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "deprecated\_compound": {
        "district": "Cầu Giấy",
        "commune": "Trung Hòa",
        "province": "Hà Nội"
      }
    },
    {
      "address\_components": \[
        {
          "long\_name": "Cửa hàng 91",
          "short\_name": "Cửa hàng 91"
        },
        {
          "long\_name": "91 Ngõ 43 Trung Kính",
          "short\_name": "91 Ngõ 43 Trung Kính"
        },
        {
          "long\_name": "Yên Hòa",
          "short\_name": "Yên Hòa"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Cửa hàng 91, 91 Ngõ 43 Trung Kính, Yên Hòa, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.011780584000064,
          "lng": 105.79652819400008
        },
        "boundary": null
      },
      "place\_id": "kb8rgRCehm5Ih0ioXX6G5HuHcZ-fbLKdYydDU6tTe8HtEYYwr2F4Inn6BRxyvboLieYZuHphhlddJkGUxqG6S9k-uSyF\_lr-oer5IXH\_Vnvd7hFsIqAiOnnmsUyOeCeXe",
      "reference": "kb8rgRCehm5Ih0ioXX6G5HuHcZ-fbLKdYydDU6tTe8HtEYYwr2F4Inn6BRxyvboLieYZuHphhlddJkGUxqG6S9k-uSyF\_lr-oer5IXH\_Vnvd7hFsIqAiOnnmsUyOeCeXe",
      "plus\_code": {
        "compound\_code": "+40BD Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+40BD"
      },
      "compound": {
        "commune": "Yên Hòa",
        "province": "Hà Nội"
      },
      "types": \[
        "grocery\_store"
      \],
      "name": "Cửa hàng 91",
      "address": "91 Ngõ 43 Trung Kính, Yên Hòa, Hà Nội",
      "deprecated\_description": "Cửa hàng 91, 91 Ngõ 43 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "deprecated\_compound": {
        "district": "Cầu Giấy",
        "commune": "Trung Hòa",
        "province": "Hà Nội"
      }
    }
  \],
  "status": "OK"
}

<table dir="ltr" style="height: 996px;" border="1" width="1293" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><tbody><tr><td style="text-align: center;"><strong>Tham số</strong></td><td style="text-align: center;"><strong>Mô tả</strong></td><td style="text-align: center;"><strong>Ví dụ</strong></td></tr><tr><td><strong>plus_code</strong></td><td>Plus Code là một mã địa chỉ toàn cầu giúp xác định vị trí chính xác của một địa điểm, đặc biệt hữu ích trong khu vực không có địa chỉ chính thức.<br>Bao gồm:<br>– compound_code: Mã + địa danh<br>– global_code: Mã toàn cầu</td><td><pre>{
"compound_code": "+63G73 Trung Hòa, Cầu Giấy, Hà Nội",
"global_code": "LOC1+63G73"
},</pre></td></tr><tr><td><strong>type</strong></td><td>Mảng các loại địa điểm mà kết quả phản ánh. Dùng để phân loại đối tượng như địa chỉ, doanh nghiệp, điểm mốc…</td><td>[“house_number”]</td></tr><tr><td><strong>reference</strong></td><td>Mã tham chiếu nội bộ, dùng để truy vấn hoặc kiểm tra lại địa điểm trong hệ thống.</td><td><pre>"poiuyTREWqazx09876MNB==.bm9ybWFs"</pre></td></tr><tr><td>f<strong>ormatted_address</strong></td><td>Địa chỉ đã được chuẩn hóa, hiển thị dưới dạng dễ đọc, đầy đủ các cấp hành chính. Dùng để hiển thị cho người dùng cuối.</td><td>“Thời trang Bim, 91 Ngõ 43 Trung Kính, Yên Hòa, Hà Nội”,</td></tr><tr><td><strong>address_components</strong></td><td>Mảng các thành phần địa chỉ riêng lẻ. Mỗi phần gồm long_name (đầy đủ) và short_name (rút gọn).</td><td><pre> {
"long_name": "Thời trang Bim",
"short_name": "Thời trang Bim"
},
{
"long_name": "91 Ngõ 43 Trung Kính",
"short_name": "91 Ngõ 43 Trung Kính"
},
{
"long_name": "Yên Hòa",
"short_name": "Yên Hòa"
},
{
"long_name": "Hà Nội",
"short_name": "Hà Nội"
}</pre></td></tr><tr><td>p<strong>lace_id</strong></td><td>Mã định danh duy nhất cho một địa điểm trong hệ thống bản đồ, dùng để tham chiếu nhanh, lưu cache, hoặc tìm chi tiết thông tin khác về địa điểm đó.</td><td><pre>"CRdosr1ubzGqZwEhsJV2xKkCmeNrXbNmYY_3IMQoaBxeuLQhZq
YnZDX92dmu1_EUr.."</pre></td></tr><tr><td><strong>geometry</strong></td><td>Thông tin định vị địa lý, bao gồm:<br>– location: Tọa độ (vĩ độ, kinh độ)<br>– boundary: (không bắt buộc) đường viền đối tượng dạng polyline nén</td><td><pre>"location": {
"lat": 21.01178451000004,
"lng": 105.79653747400005
},</pre></td></tr><tr><td><span style="color: #000000;"><strong>deprecated_description</strong></span></td><td>Chuỗi mô tả đầy đủ địa chỉ với thông tin cũ.</td><td><div><div>91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội</div></div></td></tr><tr><td><span style="color: #000000;"><strong>deprecated_compound</strong></span></td><td>Thông tin địa giới hành chính xã/phường, quận/huyện và tỉnh/thành phố.</td><td>&nbsp;{“commune”: “Sao Đỏ”, “district”: “Chí Linh”, “province”: “Hải Phòng”}</td></tr></tbody></table>

## **Chuyển đổi từ tọa độ sang địa chỉ Reverse Geocode**

**Định nghĩa**

**Reverse Geocode** là quá trình chuyển đổi từ tọa độ (vĩ độ và kinh độ) thành địa chỉ cụ thể hoặc các thông tin mô tả vị trí như tên đường, thành phố, quốc gia. Dịch vụ này thường được sử dụng trong nhiều trường hợp khi có tọa độ của một vị trí nhất định, nhưng cần tìm hiểu địa chỉ hoặc thông tin cụ thể về địa điểm đó.

**Cách thức hoạt động của Reverse geocode**

Khác với Forward geocode, Reverse geocode thực hiện quá trình chuyển đổi ngược lại: từ một cặp tọa độ địa lý (vĩ độ, kinh độ) thành một địa chỉ cụ thể. Khi bạn cung cấp một vị trí (kinh độ, vĩ độ), hệ thống sẽ tìm kiếm trong cơ sở dữ liệu địa lý để xác định địa chỉ gần nhất với vị trí đó. Kết quả trả về có thể bao gồm số nhà, tên đường, thành phố và các thông tin chi tiết khác.

**Cách thức tạo yêu cầu Reverse geocode**

**Thông số bắt buộc**

-   **latlng:** Tọa độ điểm cần lấy thông tin.

**Tham số trong request truyền vào:**

https://rsapi.goong.io/v2/geocode?latlng=15.765075, 108.204474&limit=5&api\_key={YOUR\_API\_KEY}&has\_deprecated\_administrative\_unit=true

<table dir="ltr" style="height: 378px;" border="1" width="1079" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="142"> <col width="315"> <col width="299"></colgroup><tbody><tr><td style="text-align: center;"><strong><span style="color: #0000ff;">Tham số</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td style="text-align: left;"><strong>latlng</strong></td><td style="text-align: left;">Tọa độ địa điểm cần truy vấn, gồm lat,long</td><td style="text-align: left;">21.120678,106.397301</td></tr><tr><td style="text-align: left;"><strong>has_deprecated_administrative_unit</strong></td><td><p style="text-align: left;" data-start="0" data-end="146">Là tham số boolean dùng trong API V2, để hiển thị thêm thông tin địa giới hành chính&nbsp;<strong data-start="121" data-end="143" data-is-only-node="">trước khi sáp nhập</strong>.</p><p data-start="149" data-end="296">&nbsp;True: Kết quả vẫn theo địa giới&nbsp;<strong data-start="187" data-end="194">mới</strong>, nhưng có thêm trường&nbsp;<code data-start="217" data-end="241">deprecated_description</code>&nbsp;và&nbsp;<code data-start="245" data-end="266">deprecated_compound</code>&nbsp;chứa tên địa phương&nbsp;<strong data-start="287" data-end="293">cũ</strong>.</p><p data-start="299" data-end="386">&nbsp;False hoặc mặc định: Chỉ trả về địa giới&nbsp;<strong data-start="352" data-end="359">mới</strong>, không kèm thông tin cũ.</p><p data-start="389" data-end="471" data-is-last-node="">&nbsp;Dữ liệu chính không thay đổi, param này chỉ để&nbsp;<strong data-start="436" data-end="462">tham chiếu địa danh cũ</strong>&nbsp;nếu cần.</p></td><td>&nbsp;True</td></tr><tr><td style="text-align: left;">has_vnid</td><td style="text-align: left;">Tham số tùy chọn. Khi đặt true, API sẽ trả về thêm mã đơn vị hành chính Việt Nam (VNID) bao gồm mã xã/phường, quận/huyện và tỉnh/thành phố tương ứng với tọa độ.</td><td style="text-align: left;">True</td></tr></tbody></table>

**Tham số trong response trả về:**

{
  "results": \[
    {
      "address\_components": \[
        {
          "long\_name": "Siêu thị Thế Giới Di Động",
          "short\_name": "Siêu thị Thế Giới Di Động"
        },
        {
         "long\_name": "Đường 25 tháng 5",
         "short\_name": "Đường 25 tháng 5"
        },
        {
         "long\_name": "Thanh Hà",
         "short\_name": "Thanh Hà"
        },
        {
         "long\_name": "Hải Phòng",
         "short\_name": "Hải Phòng"
        }
        \],
          "formatted\_address": "Siêu thị Thế Giới Di Động, Đường 25 tháng 5, Thanh Hà, Hải Phòng",
      "geometry": {
        "location": {
          "lat": 20.8975369,
          "lng": 106.427671
       },
       "boundary": null
     },
      "place\_id": "auAmTWGkCHC\_uYDyaUQoH7ku4fdZa4SGj7tFTV5CiIq4lyMxdmr3zaG0fDNee678vrhZMlp7i4iPl1JPYmmuzYirc0psRabqiKheSm14iOG-kk0ebx6Yi4Ii-RTVsuvPI",
      "reference": "auAmTWGkCHC\_uYDyaUQoH7ku4fdZa4SGj7tFTV5CiIq4lyMxdmr3zaG0fDNee678vrhZMlp7i4iPl1JPYmmuzYirc0psRabqiKheSm14iOG-kk0ebx6Yi4Ii-RTVsuvPI",
      "plus\_code": {
        "compound\_code": "+CX0PND Đường 25 tháng 5, TT. Thanh Hà, Hải Dương 170000",
        "global\_code": "MY5P+CX0PND"
      },
       "compound": {
        "commune": "Thanh Hà",
        "province": "Hải Phòng"
      },
      "types": \[\],
      "name": "Siêu thị Thế Giới Di Động",
      "address": "Đường 25 tháng 5, Thanh Hà, Hải Phòng",
      "deprecated\_description": "Siêu thị Thế Giới Di Động, Đường 25 tháng 5, TT. Thanh Hà, Hải Dương",
      "deprecated\_compound": {
        "district": "Thanh Hà",
        "commune": "Thanh Hà",
        "province": "Hải Dương"
     },
     "deprecated\_compound\_id": {
        "district": 294,
        "commune": 10813,
        "province": 30
      }
    }
  \]
}

<table dir="ltr" border="1" width="1199" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><tbody><tr><td><strong>Tên tham số</strong></td><td><strong>Mô tả chi tiết</strong></td><td><strong>Ví dụ&nbsp;</strong></td></tr><tr><td><strong>results</strong></td><td>Mảng chứa các kết quả địa điểm phù hợp với tọa độ hoặc truy vấn đầu vào. Mỗi phần tử trong mảng là thông tin chi tiết của một địa điểm.</td><td><pre>{
"address_components": [
{
"long_name": "Duy Xuyên",
"short_name": "Duy Xuyên"
},
{
"long_name": "Đà Nẵng",
"short_name": "Đà Nẵng"
}</pre></td></tr><tr><td><strong>address_components</strong></td><td>Danh sách các thành phần tạo nên địa chỉ, từ chi tiết nhỏ nhất (số nhà, đường) đến cấp hành chính lớn hơn (phường, quận, tỉnh).</td><td>“long_name”: “Duy Xuyên”,</td></tr><tr><td><strong>formatted_address</strong></td><td>Địa chỉ đầy đủ, đã được định dạng rõ ràng và sắp xếp theo thứ tự từ nhỏ đến lớn. Thường dùng để hiển thị cho người dùng cuối.</td><td>“Duy Xuyên, Đà Nẵng”,</td></tr><tr><td><strong>location.lat</strong></td><td>Vĩ độ (latitude) của địa điểm – tọa độ theo hướng Bắc – Nam.</td><td>15.765075</td></tr><tr><td><strong>location.lng</strong></td><td>Kinh độ (longitude) của địa điểm – tọa độ theo hướng Đông – Tây.</td><td>108.204474</td></tr><tr><td><strong>boundary</strong></td><td>Đa giác (polygon) biểu diễn ranh giới hành chính hoặc khu vực địa lý của địa điểm. Nếu không có, sẽ là null.</td><td>“io`_Bee_sS}[wAmM_AgLy@uGMuGNaJfBeH~DkCdBy@null</td></tr><tr><td><strong>place_id</strong></td><td>Mã định danh duy nhất cho địa điểm. Dùng để tham chiếu hoặc tìm kiếm lại địa điểm trong các API khác.</td><td><pre>drtqhLmKubt1uUEJoVZFi3Wrd5ijaE10ar...</pre></td></tr><tr><td><strong>reference</strong></td><td>Trường tham chiếu địa điểm, thường trùng với place_id. Giữ lại để tương thích với phiên bản cũ.</td><td>drtqhLmKubt1uUEJoVZFi3Wrd5ijaE10ar</td></tr><tr><td><strong>compound_code</strong></td><td>Mã định vị địa phương dạng Plus Code (mã mở), cho phép xác định vị trí chính xác trong khu vực hành chính.</td><td></td></tr><tr><td><strong>global_code</strong></td><td>Mã định vị toàn cầu dạng Plus Code. Dùng trong các hệ thống không cần địa chỉ hành chính.</td><td>“MXUP+BMKDMI”</td></tr><tr><td><strong>province</strong></td><td>Tên tỉnh/thành phố nơi địa điểm tọa lạc. Dữ liệu này đã được cập nhật theo đơn vị hành chính mới nhất.</td><td>Đà Nẵng</td></tr><tr><td><strong>district</strong></td><td>Tên quận/huyện hoặc thành phố cấp huyệnĐà Nẵng</td><td>Duy Xuyên</td></tr><tr><td><strong>commune</strong></td><td>Tên phường/xã/thị trấn.</td><td>Duy Sơn</td></tr><tr><td><strong>types</strong></td><td>Danh sách loại địa điểm theo phân loại hệ thống (nếu có), ví dụ: route, house_number, locality,… Có thể rỗng nếu không xác định.</td><td>[]</td></tr><tr><td><strong>name</strong></td><td>Tên chính của địa điểm hoặc phần mô tả ngắn gọn, ví dụ: tên cửa hàng, số nhà, địa danh.</td><td>Duy Xuyên</td></tr><tr><td><strong>address</strong></td><td>Địa chỉ hành chính không bao gồm tên cụ thể hay số nhà, thường là cụm “xã/phường, huyện/quận, tỉnh/thành”.</td><td>Đà Nẵng</td></tr><tr><td><strong>status</strong></td><td>Trạng thái phản hồi của API. “OK” nghĩa là thành công, “INVALID_REQUEST” là sai định dạng truy vấn…</td><td>“OK”</td></tr><tr><td><strong>deprecated_description</strong></td><td>Chuỗi mô tả đầy đủ địa chỉ với thông tin cũ.</td><td>Duy Sơn, Duy Xuyên, Quảng Nam</td></tr><tr><td><strong>deprecated_compound</strong></td><td>Thông tin địa giới hành chính xã/phường, quận/huyện và tỉnh/thành phố.</td><td>{“commune”: “Duy Sơn”, “district”: “Duy Xuyên”, “province”: “Quảng Nam”}</td></tr><tr><td><strong>deprecated_compound_id</strong></td><td>Mã định danh đơn vị hành chính theo cấu trúc dữ liệu cũ của hệ thống, bao gồm mã tỉnh/thành phố, quận/huyện và xã/phường. Trường này được giữ lại để đảm bảo tương thích với các hệ thống đang sử dụng API phiên bản trước.</td><td>&nbsp;“deprecated_compound_id”: {<p></p><p>“district”: <span class="ͼb">19</span>,</p><p>“commune”: <span class="ͼb">637</span>,</p><p>“province”: <span class="ͼb">1</span></p><p>}</p><p>}</p></td></tr></tbody></table>
