---
title: "GEOCODE – LẤY THÔNG TIN ĐỊA CHỈ"
source: https://help.goong.io/kb/rest-api/geocode/geocodeding-ma-hoa-dia-ly/
updated: 2026-03-16T16:13:46
categories: ["GEOCODE"]
---
# GEOCODE – LẤY THÔNG TIN ĐỊA CHỈ

> Nguồn: [https://help.goong.io/kb/rest-api/geocode/geocodeding-ma-hoa-dia-ly/](https://help.goong.io/kb/rest-api/geocode/geocodeding-ma-hoa-dia-ly/)

## TỔNG QUAN

**Geocode** là API chuyển đổi địa chỉ (địa chỉ nhà, cửa hàng…) thành tọa độ địa lý (kinh độ, vĩ độ ) và place\_id hoặc ngược lại. API này cho phép bạn chuyển đổi địa chỉ hoặc tọa độ địa lý thành thông tin địa lý khác nhau như vị trí, mã vùng, quận và thậm chí là địa điểm kinh doanh.

**Goong Geocode API có 3 hình thức chính:**

-   **Reverse geocode:** Chuyển đổi từ tọa độ địa lý (kinh độ, vĩ độ) sang địa chỉ
-   **Forward geocode:** Chuyển đổi từ địa chỉ ra tọa độ
-   **Nhận thông tin chi tiết về địa điểm** theo place\_id

### **Lý do sử dụng **Geocode****

Geocode được sử dụng cho trang web hoặc ứng dụng di động khi bạn cần chuyển đổi địa chỉ thành tọa độ để hiển thị trên bản đồ hoặc ngược lại chuyển đổi tọa độ thành địa chỉ, nhằm giúp hiển thị nội dung ứng dụng trên các bản đồ thuộc nền tảng [Goong](http://goong.io).

Bạn có thể sử dụng Geocode API khi đã có địa chỉ đầy đủ, ví dụ như “226 Vạn Phúc, Liễu Giai, Ba Đình, Hà Nội”.

### **Geocode hoạt động như thế nào?**

-   **Forward geocode:** Chuyển đổi các địa chỉ như “226 Vạn Phúc, Liễu Giai, Ba Đình, Hà Nội” thành tọa độ vĩ độ và kinh độ. Bạn có thể sử dụng những tọa độ này để đặt điểm đánh dấu trên bản đồ hoặc căn giữa hay định vị lại bản đồ trong khung xem.
-   **Reverse geocode:** Chuyển đổi vĩ độ/kinh độ hoặc place\_id thành địa chỉ có thể đọc được. Bạn có thể sử dụng địa chỉ cho nhiều trường hợp, bao gồm cả giao hàng hoặc đến lấy hàng.

**Cách sử dụng Geocode**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** /geocode

**Phương thức: GET**

## **CHUYỂN ĐỔI TỪ ĐỊA CHỈ SANG TỌA ĐỘ FORWARD GEOCODE**

### **Định nghĩa**

**Forward geocode** là quá trình chuyển đổi một địa chỉ cụ thể thành tọa độ địa lý (vĩ độ và kinh độ). Khi bạn nhập một địa chỉ vào hệ thống, dịch vụ Geocode sẽ tìm kiếm và trả về các tọa độ tương ứng với địa chỉ đó.

### **Cách thức hoạt động của Forward geocode** 

Khi bạn nhập một địa chỉ, hệ thống sẽ thực hiện quá trình chuyển đổi thông tin văn bản đó thành các tọa độ địa lý (vĩ độ, kinh độ) trên bản đồ. Quá trình này bao gồm:

-   **Chuẩn hóa dữ liệu:** Hệ thống sẽ làm sạch dữ liệu đầu vào, loại bỏ các từ thừa và sắp xếp thông tin địa chỉ theo một cấu trúc nhất định.
-   **Tìm kiếm trong cơ sở dữ liệu:** Hệ thống sẽ so sánh địa chỉ đã chuẩn hóa với các thông tin địa lý có sẵn trong cơ sở dữ liệu của mình.
-   **Trả về kết quả:** Khi tìm thấy kết quả phù hợp, hệ thống sẽ trả về các tọa độ địa lý tương ứng cùng với các thông tin bổ sung như tên đường, quận, huyện…

**Ví dụ:**

Đầu vào: `91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội`

Kết quả đầu ra: `21.0137443130001,105.798346108`

### **Cách thức tạo một yêu cầu Forward geocode**

**Thông số bắt buộc**

-   address – Địa chỉ muốn lấy tọa độ.

**Ví dụ về request:**

curl 'https://rsapi.goong.io/geocode?address=91%20Trung%20K%C3%ADnh%2C%20Trung%20H%C3%B2a%2C%20C%E1%BA%A7u%20Gi%E1%BA%A5y%2C%20H%C3%A0%20N%E1%BB%99i&api\_key={YOUR\_API\_KEY}'

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="135"> <col width="235"> <col width="338"></colgroup><tbody><tr><td style="text-align: center;"><strong><span style="color: #0000ff;">Tham số</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td style="text-align: left;"><strong>address</strong></td><td style="text-align: left;">Địa chỉ muốn lấy tọa độ</td><td style="text-align: left;">91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội</td></tr></tbody></table>

**Ví dụ về response:**

application/json

{
  "plus\_code": {},
  "results": \[
    {
      "address\_components": \[
        {
          "long\_name": "Sảnh đón/trả khách",
          "short\_name": "Sảnh đón/trả khách"
        },
        {
          "long\_name": "Tòa nhà Bluesea",
          "short\_name": "Tòa nhà Bluesea"
        },
        {
          "long\_name": "91 Trung Kính",
          "short\_name": "91 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Sảnh đón/trả khách, Tòa nhà Bluesea, 91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.0137210140001,
          "lng": 105.798261367
        }
      },
      "place\_id": "ycg/XqGmIbYRNpFn61oPzIloTKrtDcs/jGfpESyuqFaYonQl1TEh63TyXS0HXUeN2zAqvsElmxtFcuPT6Ca4/A==.bm9ybWFs",
      "reference": "C0x/fNfYy5guordl7DF4fTotMNqwqC82TT0EKXo1olSmGFMYBQ2fOG60iRY\_G8r3TTnv1RM0LdHVFW3R1B/uNw==.bm9ybWFs",
      "plus\_code": {
        "compound\_code": "+J4VO Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+J4VO"
      },
      "types": \[\]
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
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Công ty Cổ phần Công nghệ và Truyền thông Biển Xanh, Tầng 6, Tòa nhà BlueSea, 91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.013693996,
          "lng": 105.79826308
        }
      },
      "place\_id": "lurFHQGTOE3WAR1zyIeXmSYmz/KufpERlwXh6PY8XFdCeu1a47r2pTRDo2/wEoAv7Z5lbZA20CRMqOtNMoTfYw==.bm9ybWFs",
      "reference": "pg7nOP5oMqoWSUJ9lF1baRaEw8Zw7O1GYsLuYIH/z2c6xNZpmKasJ1zmNjfwRF5w/foeeffqrVZ1wi8arP3FEQ==.bm9ybWFs",
      "plus\_code": {
        "compound\_code": "+2AHY Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+2AHY"
      },
      "types": \[\]
    },
    {
      "address\_components": \[
        {
          "long\_name": "Công ty CP Công nghệ bản đồ số Imap",
          "short\_name": "Công ty CP Công nghệ bản đồ số Imap"
        },
        {
          "long\_name": "Tầng 5",
          "short\_name": "Tầng 5"
        },
        {
          "long\_name": "Tòa nhà Bluesea",
          "short\_name": "Tòa nhà Bluesea"
        },
        {
          "long\_name": "91 Trung Kính",
          "short\_name": "91 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Công ty CP Công nghệ bản đồ số Imap, Tầng 5, Tòa nhà Bluesea, 91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.0136939070001,
          "lng": 105.798255672
        }
      },
      "place\_id": "7RjkxCbg/ilVed0U8BDQvPbBepxqvUw5Eu\_ESr\_S\_kC/PNKRxe5CA6UFaagaro5NBc5TLLA\_V21uDgIgfB0Byw==.bm9ybWFs",
      "reference": "",
      "plus\_code": {
        "compound\_code": "+J4VP Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+J4VP"
      },
      "types": \[\]
    },
    {
      "address\_components": \[
        {
          "long\_name": "91 Trung Kính",
          "short\_name": "91 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.0137625240001,
          "lng": 105.798267363
        }
      },
      "place\_id": "Hobn8WqBW6rsKtKq2PDrVKp4BJNRtiILxTQbB\_\_muXgRB3v8GRDTfkp\_6lc4cbLw/5PUgWrMDrSI/xlqDBt5XA==.bm9ybWFs",
      "reference": "o/QzXNc\_eBKsOWX6kdbOcABtO4zUQz0lzdK1jpi0R\_\_J2vFKeRAM2VSYo38AfaShP/7qpUhrwc0l/t/AIYwRnQ==.bm9ybWFs",
      "plus\_code": {
        "compound\_code": "+6DW1G Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1G"
      },
      "types": \[\]
    },
    {
      "address\_components": \[
        {
          "long\_name": "Phở Lý Quốc Sư",
          "short\_name": "Phở Lý Quốc Sư"
        },
        {
          "long\_name": "89 Trung Kính",
          "short\_name": "89 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Phở Lý Quốc Sư, 89 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.0137443130001,
          "lng": 105.798346108
        }
      },
      "place\_id": "CRdosr1ubzGqZwEhsJV2xKkCmeNrXbNmYY\_3IMQoaBxeuLQhZqYnZDX92dmu1\_EUr7SNa9oZcEdGn0w6Ln5J1A==.bm9ybWFs",
      "reference": "hvQsDQGiINkZG7D82VhHBzyFnHdPRTtU3Gg6Xek6b\_LPmrVmPWd6XSZgVEHZtrTX/lV8FICmrhROonRV5FHT4yE==.bm9ybWFs",
      "plus\_code": {
        "compound\_code": "+4V0P Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+4V0P"
      },
      "types": \[\]
    }
  \],
  "status": "OK"
}

Khi Geocode trả về kết quả sẽ đặt các kết quả đó vào một mảng Results (JSON). Ngay cả khi Geocode không trả về kết quả nào (chẳng hạn như khi địa chỉ không tồn tại), Geocode vẫn trả về một Results (JSON) với lỗi tương ứng. 

<table><tbody><tr><td style="padding-left: 40px;"><span style="color: #0000ff;"><b>Tham số</b></span></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Mô tả</b></span></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Ví dụ</b></span></td></tr><tr><td style="text-align: left;"><b>pluscode</b></td><td><p style="text-align: left;">Plus Code là một mã địa chỉ toàn cầu được sử dụng để xác định vị trí chính xác của một địa điểm. Nó có thể được sử dụng để tìm kiếm địa điểm trên các ứng dụng bản đồ hoặc chia sẻ vị trí với người khác, trong đó compound_code – Mã Plus Code đầy đủ, bao gồm cả tên địa điểm và mã địa lý, global_code – Mã Plus Code toàn cầu, chỉ chứa mã địa lý.</p><p style="text-align: left;"><span style="font-weight: 400;">API không phải lúc nào cũng trả về mã cộng.</span></p></td><td><div><div style="text-align: left;">{</div><div style="text-align: left;">&nbsp; &nbsp;“compound_code”: “+6DW1G Trung Hòa, Cầu Giấy, Hà Nội”,</div><div style="text-align: left;">&nbsp; &nbsp;“global_code”: “LOC1+6DW1G”</div><div style="text-align: left;">}</div></div></td></tr><tr><td style="text-align: left;"><b>type</b></td><td style="text-align: left;"><span style="font-weight: 400;">Loại kết quả được trả về. </span><span style="font-weight: 400;">Mảng này chứa một tập hợp danh mục giúp xác định loại tính năng được trả về trong kết quả.</span></td><td><div><div style="text-align: left;">[</div><div style="text-align: left;">&nbsp; &nbsp;“house_number”</div><div style="text-align: left;">]</div></div></td></tr><tr><td style="text-align: left;"><strong>reference</strong></td><td style="text-align: left;">Là một mã nhận diện có thể được sử dụng để tra cứu chi tiết của địa điểm cụ thể trong hệ thống Google Maps.</td><td style="text-align: left;"><span style="color: #000000;"><span class="hljs-string">hvQsDQGiINkZG7D82VhHBzyFnHdPRTtU3<br>Gg6Xek6b_</span></span><span style="color: #000000;"><span class="hljs-string">LPmrVmPWd6XSZgVEHZtrTX/lV8FICmrh<br>ROonRV5FHT4yE==</span></span><span style="color: #000000;"><span class="hljs-string">.bm9ybWFs</span></span></td></tr><tr><td style="text-align: left;"><strong>formatted_address&nbsp;</strong></td><td><p style="text-align: left;"><span style="font-weight: 400;">Là một chuỗi ký tự mô tả một địa chỉ cụ thể dưới dạng đã định dạng để dễ đọc và hiểu.</span></p><p style="text-align: left;"><span style="font-weight: 400;">Bao gồm tất cả các thông tin cần thiết như số nhà, tên đường, quận/huyện, thành phố,/tỉnh và quốc gia.</span></p><p style="text-align: left;"><span style="font-weight: 400;">Thường được sử dụng để hiển thị thông tin chi tiết về vị trí hoặc địa chỉ người dùng.</span></p></td><td style="text-align: left;"><span style="font-weight: 400;">Tầng 17, Nhà khách La Thành 226, Vạn Phúc, Liễu Giai, Ba Đình, Hà Nội</span></td></tr><tr><td><span style="color: #000000;"><strong>address_components</strong></span></td><td><p style="text-align: left;">Là mảng các đối tượng, mỗi đối tượng đại diện cho một thành phần của địa chỉ, với tên đầy đủ (long_name) và tên rút gọn (short_name).</p></td><td><div><div style="text-align: left;">[</div><div style="text-align: left;">&nbsp; &nbsp;{</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “long_name”: “Tòa nhà Blue Sea”,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “short_name”: “Tòa nhà Blue Sea”</div><div style="text-align: left;">&nbsp; &nbsp;},</div><div style="text-align: left;">&nbsp; &nbsp;{</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “long_name”: “91 Trung Kính”,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “short_name”: “91 Trung Kính”</div><div style="text-align: left;">&nbsp; &nbsp;},</div><div style="text-align: left;">&nbsp; &nbsp;…</div><div style="text-align: left;">]</div></div></td></tr><tr><td style="text-align: left;"><strong><span style="color: #000000;">place_id</span></strong></td><td style="text-align: left;"><span style="font-weight: 400;">Là một giá trị nhận dạng duy nhất được sử dụng trong các API của Goong Maps để xác định một địa điểm hoặc đối tượng cụ thể trên bản đồ. Mỗi địa điểm trên Goong Maps sẽ có một place_id riêng, giúp xác định và truy xuất thông tin chi tiết về địa điểm đó.</span></td><td style="text-align: left;"><span style="color: #000000;"><span class="hljs-string">CRdosr1ubzGqZwEhsJV2xKkCmeNrXbNmYY_</span></span><br><span style="color: #000000;"><span class="hljs-string">3IMQoaBxeuLQhZqYnZDX92dmu1_EUr7SNa9oZ</span></span><br><span style="color: #000000;"><span class="hljs-string">cEdGn0w6Ln5J1A==.bm9ybWFs</span></span></td></tr><tr><td style="text-align: left;"><strong><span style="color: #000000;">geometry</span></strong></td><td style="text-align: left;"><span style="font-weight: 400;">Geometry là một phần dữ liệu mô tả vị trí địa lý của một đối tượng, gồm tọa độ (kinh độ và vĩ độ) và viền đối tương (boundary, trả về dưới dạng encoded polyline, nén dữ liệu để lưu trữ các chuỗi tọa độ một cách hiệu quả), viền không phải lúc nào cũng có kết quả.</span></td><td><div><div style="text-align: left;">{</div><div style="text-align: left;">&nbsp; &nbsp;“location”: {</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “lat”: 21.013672808000024,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; &nbsp;“lng”: 105.79825090900005</div><div style="text-align: left;">&nbsp; &nbsp;},</div><div style="text-align: left;">&nbsp; &nbsp;“boundary”: “ofg_CuvvdSjBLCf@kBMBg@”</div><div style="text-align: left;">}</div></div></td></tr></tbody></table>

## **CHUYỂN ĐỔI TỪ TỌA ĐỘ SANG ĐỊA CHỈ REVERSE GEOCODE**

### **Định nghĩa**

**Reverse geocode** là quá trình chuyển đổi từ tọa độ (vĩ độ và kinh độ) thành địa chỉ cụ thể hoặc các thông tin mô tả vị trí như tên đường, thành phố, quốc gia. Dịch vụ này thường được sử dụng trong nhiều trường hợp khi có tọa độ của một vị trí nhất định, nhưng cần tìm hiểu địa chỉ hoặc thông tin cụ thể về địa điểm đó.

### **Cách thức hoạt động của Reverse geocode**

Khác với Forward geocode, Reverse geocode thực hiện quá trình chuyển đổi ngược lại: từ một cặp tọa độ địa lý (vĩ độ, kinh độ) thành một địa chỉ cụ thể. Khi bạn cung cấp một vị trí (kinh độ, vĩ độ), hệ thống sẽ tìm kiếm trong cơ sở dữ liệu địa lý để xác định địa chỉ gần nhất với vị trí đó. Kết quả trả về có thể bao gồm số nhà, tên đường, thành phố và các thông tin chi tiết khác.

### **Cách thức tạo yêu cầu Reverse geocode**

**Thông số bắt buộc**

-   **latlng:** Tọa độ điểm cần lấy thông tin.

**Ví dụ về request:**

curl 'https://rsapi.goong.io/geocode?latlng=20.981971%2C105.864323&api\_key={YOUR\_API\_KEY}'

<table style="height: 133px;" width="825"><tbody><tr><td style="text-align: center;" width="95"><strong>Tham số</strong></td><td style="text-align: center;" width="211"><strong>Mô tả</strong></td><td style="text-align: center;" width="155"><strong>Ví dụ</strong></td></tr><tr><td><strong>Latlng</strong></td><td>Tọa độ điểm cần lấy thông tin.</td><td>&nbsp;20.981971,105.864323</td></tr><tr><td><strong>api_key</strong></td><td>&nbsp;Khóa API cá nhân của bạn dùng để xác thực.</td><td>AbC1234xyzXYZ</td></tr></tbody></table>

**Ví dụ về response:**

{
  "plus\_code": {},
  "results": \[
    {
      "address\_components": \[
        {
          "long\_name": "91 Trung Kính",
          "short\_name": "91 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.0137625240001,
          "lng": 105.798267363
        }
      },
      "place\_id": "Hobn8WqBW6rsKtKq2PDrVKp4BJNRtiILxTQbB\_\_muXgRB3v8GRDTfkp\_6lc4cbLw/5PUgWrMDrSI/xlqDBt5XA==",
      "reference": "o/QzXNc\_eBKsOWX6kdbOcABtO4zUQz0lzdK1jpi0R\_\_J2vFKeRAM2VSYo38AfaShP/7qpUhrwc0l/t/AIYwRnQ==",
      "plus\_code": {
        "compound\_code": "+6DW1G Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1G"
      },
      "types": \[\]
    },
    {
      "address\_components": \[
        {
          "long\_name": "91 Ngõ 43 Trung Kính",
          "short\_name": "91 Ngõ 43 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "91 Ngõ 43 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.01178451,
          "lng": 105.796537474
        }
      },
      "place\_id": "ytdKslLHBd1\_mSnLu\_bQHGu1yZyLeBt9haGgyFDN1EIOy7I9uEQyTmRkyNZL3BRpT\_Knj31YK/Irv3KkEIIZqw==",
      "reference": "nP7fBjweFzWzkU8gq/ki\_xEAF3fpVoZ3aQcfXx4ZRHX7QaQPNBPpNToMKx1KZw09gWUhpnSdXJSLowB4qFlCMg==",
      "plus\_code": {
        "compound\_code": "+63G73 Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+63G73"
      },
      "types": \[\]
    },
    {
      "address\_components": \[
        {
          "long\_name": "Trung Kính",
          "short\_name": "Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.01200742,
          "lng": 105.798556266
        }
      },
      "place\_id": "4PhN5GTxC3Txq1qu\_KZ\_Wb0/fTn7CqblD5melLEhPCrWDoxqkBxTsLTWmYCJnM8gAREUdOKZVNHyHTYAelWOZw==",
      "reference": "Ltd3mU697w2W10zYKNvWxB6aK8CT45xU8y2B7hzpgt8M0an4e4G3tz7WFP27QH56DCOVFFR1IAT0McC5hJtSmA==",
      "plus\_code": {
        "compound\_code": "+ALSA Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+ALSA"
      },
      "types": \[\]
    },
    {
      "address\_components": \[
        {
          "long\_name": "95 Trung Kính",
          "short\_name": "95 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "95 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.0138168300001,
          "lng": 105.79788971
        }
      },
      "place\_id": "mUuwMwTPf5/1WFznDr94rtLvQffNhj1NzWQqDJqgsdUfCqTZdUcHTTav64BxPOC6dSdgZ9WUmwARwQlhmYonvA==",
      "reference": "lPHbKnLx64d2Ikp35RrFcdRphjayJn2rjapjNhjPuBmPxB9GzirgM6NT0OH65gG2Mf4qGswZXQ8d6U4XBfltjQ==",
      "plus\_code": {
        "compound\_code": "+6DW1M Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1M"
      },
      "types": \[\]
    },
    {
      "address\_components": \[
        {
          "long\_name": "93 Trung Kính",
          "short\_name": "93 Trung Kính"
        },
        {
          "long\_name": "Trung Hòa",
          "short\_name": "Trung Hòa"
        },
        {
          "long\_name": "Cầu Giấy",
          "short\_name": "Cầu Giấy"
        },
        {
          "long\_name": "Hà Nội",
          "short\_name": "Hà Nội"
        }
      \],
      "formatted\_address": "93 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "geometry": {
        "location": {
          "lat": 21.0138434450029,
          "lng": 105.798052001
        }
      },
      "place\_id": "xFchTd18UNmq7/rWipBrI6LtqEcDdReZ8cGV3mxeK4yxmmL7hZat/i8cLBdGhdaeNYFQLk4H5AuP2ntIHfS7EQ==",
      "reference": "dMG3Lmo6Rux8NsEd9lwoDGUOH22aZbMdzDiMy1RhS73mM/uA0rZsX2M0y0Wm990nx4PGw1jd54YkUeqLzySwaQ==",
      "plus\_code": {
        "compound\_code": "+6DW1I Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1I"
      },
      "types": \[\]
    }
  \],
  "status": "OK"
}

<table><tbody><tr><td><b>Tham số</b></td><td><b>Mô tả</b></td><td><b>Ví dụ</b></td></tr><tr><td><b>pluscode</b></td><td>Plus Code là một mã địa chỉ toàn cầu được sử dụng để xác định vị trí chính xác của một địa điểm. Nó có thể được sử dụng để tìm kiếm địa điểm trên các ứng dụng bản đồ hoặc chia sẻ vị trí với người khác, trong đó compound_code – Mã Plus Code đầy đủ, bao gồm cả tên địa điểm và mã địa lý, global_code – Mã Plus Code toàn cầu, chỉ chứa mã địa lý.<p></p><p>API không phải lúc nào cũng trả về mã cộng.</p></td><td><div><div>{</div><div>&nbsp; &nbsp;“compound_code”: “+6DW1G Trung Hòa, Cầu Giấy, Hà Nội”,</div><div>&nbsp; &nbsp;“global_code”: “LOC1+6DW1G”</div><div>}</div></div></td></tr><tr><td><b>type</b></td><td>Loại kết quả được trả về.&nbsp;Mảng này chứa một tập hợp danh mục giúp xác định loại tính năng được trả về trong kết quả.</td><td><div><div>[</div><div>&nbsp; &nbsp;“house_number”</div><div>]</div></div></td></tr><tr><td><strong>reference</strong></td><td>Là một mã nhận diện có thể được sử dụng để tra cứu chi tiết của địa điểm cụ thể trong hệ thống Google Maps.</td><td><span class="hljs-string">hvQsDQGiINkZG7D82VhHBzyFnHdPRTtU3<br>Gg6Xek6b_</span><span class="hljs-string">LPmrVmPWd6XSZgVEHZtrTX/lV8FICmrh<br>ROonRV5FHT4yE==</span><span class="hljs-string">.bm9ybWFs</span></td></tr><tr><td><strong>formatted_address&nbsp;</strong></td><td>Là một chuỗi ký tự mô tả một địa chỉ cụ thể dưới dạng đã định dạng để dễ đọc và hiểu.<p></p><p>Bao gồm tất cả các thông tin cần thiết như số nhà, tên đường, quận/huyện, thành phố,/tỉnh và quốc gia.</p><p>Thường được sử dụng để hiển thị thông tin chi tiết về vị trí hoặc địa chỉ người dùng.</p></td><td>Tầng 17, Nhà khách La Thành 226, Vạn Phúc, Liễu Giai, Ba Đình, Hà Nội</td></tr><tr><td><strong>address_components</strong></td><td>Là mảng các đối tượng, mỗi đối tượng đại diện cho một thành phần của địa chỉ, với tên đầy đủ (long_name) và tên rút gọn (short_name).</td><td><div><div>[</div><div>&nbsp; &nbsp;{</div><div>&nbsp; &nbsp; &nbsp; “long_name”: “Tòa nhà Blue Sea”,</div><div>&nbsp; &nbsp; &nbsp; “short_name”: “Tòa nhà Blue Sea”</div><div>&nbsp; &nbsp;},</div><div>&nbsp; &nbsp;{</div><div>&nbsp; &nbsp; &nbsp; “long_name”: “91 Trung Kính”,</div><div>&nbsp; &nbsp; &nbsp; “short_name”: “91 Trung Kính”</div><div>&nbsp; &nbsp;},</div><div>&nbsp; &nbsp;…</div><div>]</div></div></td></tr><tr><td><strong>place_id</strong></td><td>Là một giá trị nhận dạng duy nhất được sử dụng trong các API của Goong Maps để xác định một địa điểm hoặc đối tượng cụ thể trên bản đồ. Mỗi địa điểm trên Goong Maps sẽ có một place_id riêng, giúp xác định và truy xuất thông tin chi tiết về địa điểm đó.</td><td><span class="hljs-string">CRdosr1ubzGqZwEhsJV2xKkCmeNrXbNmYY_</span><br><span class="hljs-string">3IMQoaBxeuLQhZqYnZDX92dmu1_EUr7SNa9oZ</span><br><span class="hljs-string">cEdGn0w6Ln5J1A==.bm9ybWFs</span></td></tr><tr><td><strong>geometry</strong></td><td>Geometry là một phần dữ liệu mô tả vị trí địa lý của một đối tượng, gồm tọa độ (kinh độ và vĩ độ) và viền đối tương (boundary, trả về dưới dạng encoded polyline, nén dữ liệu để lưu trữ các chuỗi tọa độ một cách hiệu quả), viền không phải lúc nào cũng có kết quả.</td><td><div><div>{</div><div>&nbsp; &nbsp;“location”: {</div><div>&nbsp; &nbsp; &nbsp; “lat”: 21.013672808000024,</div><div>&nbsp; &nbsp; &nbsp; &nbsp;“lng”: 105.79825090900005</div><div>&nbsp; &nbsp;},</div><div>&nbsp; &nbsp;“boundary”: “ofg_CuvvdSjBLCf@kBMBg@”</div><div>}</div></div></td></tr><tr><td></td><td></td><td><div><pre></pre></div></td></tr></tbody></table>
