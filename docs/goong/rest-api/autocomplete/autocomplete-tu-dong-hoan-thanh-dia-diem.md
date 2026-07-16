---
title: "AUTOCOMPLETE (GỢI Ý ĐỊA ĐIỂM)"
source: https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/
updated: 2024-10-21T21:31:47
categories: ["AUTOCOMPLETE"]
---
# AUTOCOMPLETE (GỢI Ý ĐỊA ĐIỂM)

> Nguồn: [https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/](https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/)

## TỔNG QUAN

**Autocomplete** **API** là dịch vụ tự động gợi ý tìm kiếm nhanh địa chỉ, địa điểm dựa trên từ khóa người dùng nhập giúp dễ dàng chọn lựa và chọn đúng kết quả cần tìm kiếm. Khi người dùng nhập từ khóa, dịch vụ sẽ trả về danh sách gợi ý phù hợp, có thể kèm theo giới hạn địa lý nếu cần. Dịch vụ này hỗ trợ hiển thị các gợi ý như tên doanh nghiệp, địa chỉ hoặc các địa điểm yêu thích… dựa trên vị trí địa lý liên quan đến nội dung tìm kiếm.

[Goong](http://goong.io) cho phép các nhà phát triển tích hợp tính năng Autocomplete vào nền tảng hoặc ứng dụng của họ. Khi người dùng nhập thông tin, API sẽ tự động đề xuất các kết quả tiềm năng dựa trên dữ liệu đã nhập. Điều này giúp người dùng dễ dàng và nhanh chóng tìm kiếm, chọn lựa địa điểm chính xác từ danh sách gợi ý đưa ra.

Bạn có thể thêm tính năng Autocomplete vào ứng dụng hoặc trang web của mình bằng cách sử dụng tiện ích Autocomplete địa điểm từ việc tạo một trường nhập dữ liệu văn bản.

Khi người dùng nhập văn bản, tính năng **Autocomplete** sẽ trả về các cụm từ gợi ý địa điểm dưới dạng một danh sách chọn. Khi người dùng chọn một địa điểm trong danh sách, thông tin về địa điểm đó sẽ được trả về và ứng dụng của bạn có thể truy xuất thông tin địa điểm này.

![](https://help.goong.io/wp-content/uploads/2024/08/2024-08-13_0-20-31-1024x580.png)

### **Điều kiện bắt buộc**

Để sử dụng Autocomplete API, bạn phải có tài khoản đã được kích hoạt và có API key để bắt đầu tích hợp.

### **Các tính năng hỗ trợ**

Tính năng Autocomplete được thiết kế tối ưu nhất cho người dùng theo các cách như sau:

-   _Được thiết kế phù hợp với đặc trưng khu vực người dùng Việt Nam, bao gồm cả ngôn ngữ vùng miền, chữ viết tắt, viết sai chính tả…_
-   _Hiệu suất ngày càng được cải thiện, độ chính xác cao và dữ liệu gợi ý chi tiết đến tận các vùng ngoại ô, rìa thành phố, vùng nông thôn và các cột sân bay, cổng, sảnh trung tâm thương mại…._

## **CÁCH THỨC TÍCH HỢP AUTOCOMPLETE**

Bạn có thể tích hợp Autocomplete API vào ứng dụng/trang web của bạn trên cả nền bản đồ của Goong hoặc các nền bản đồ khác.

**Cách thêm**

Trước khi bắt đầu sử dụng dịch vụ Autocomplete API của Goong, bạn cần đảm bảo rằng đã có API Key của mình. 

Bạn có thể tham khảo cách **đăng ký tài khoản** và **tạo key** chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** /place/autocomplete

**Phương thức: GET**

**Ví dụ về request:**

curl 'https://rsapi.goong.io/place/autocomplete?input=aqua&location=10.700920276971795%2C%20106.73296613898738&limit=10&radius=10&api\_key={YOUR\_API\_KEY}'

<table><tbody><tr><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Tham số</b></span></p></td><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Mô tả</b></span></p></td><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Ví dụ</b></span></p></td></tr><tr><td><p style="text-align: left;"><b>input</b></p></td><td style="text-align: left;"><span style="font-weight: 400;">Từ khóa tìm kiếm (bắt buộc).</span></td><td style="text-align: left;"><p style="text-align: left;"><span style="font-weight: 400;">ho hoan kiem</span></p></td></tr><tr><td><p style="text-align: left;"><b>location</b></p></td><td style="text-align: left;"><span style="font-weight: 400;">Tọa độ tìm kiếm ưu tiên.</span></td><td style="text-align: left;"><span style="font-weight: 400;">20.981971,105.864323</span></td></tr><tr><td><p style="text-align: left;"><b>limit</b></p></td><td style="text-align: left;"><span style="font-weight: 400;">Giới hạn số lượng kết quả trả ra, mặc định là 10.</span></td><td><p style="text-align: left;"><span style="font-weight: 400;">20</span></p></td></tr><tr><td><p style="text-align: left;"><b>radius</b></p></td><td style="text-align: left;"><span style="font-weight: 400;">Giới hạn tìm kiếm trong phạm vi bán kính từ vị trí đã chỉ định (đơn vị km). Mặc định là 50.</span></td><td><p style="text-align: left;"><span style="font-weight: 400;">2000</span></p></td></tr><tr><td style="text-align: left;"><b>more_compound</b></td><td style="text-align: left;"><span style="font-weight: 400;">Boolean. Nếu là true, Autocomplete sẽ trả về các trường thông tin: quận, xã, tỉnh. Mặc định là false.</span></td><td><p style="text-align: left;"><span style="font-weight: 400;">true</span></p></td></tr></tbody></table>

**Ví dụ về response:**

application/json
{
  "predictions": \[
    {
      "description": "91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "matched\_substrings": \[\],
      "place\_id": "Hobn8WqBW6rsKtKq2PDrVKp4BJNRtiILxTQbB\_\_muXgRB3v8GRDTfkp\_6lc4cbLw/5PUgWrMDrSI/xlqDBt5XA==.ZXhwYW5kMA==",
      "reference": "o/QzXNc\_eBKsOWX6kdbOcABtO4zUQz0lzdK1jpi0R\_\_J2vFKeRAM2VSYo38AfaShP/7qpUhrwc0l/t/AIYwRnQ==.ZXhwYW5kMA==",
      "structured\_formatting": {
        "main\_text": "91 Trung Kính",
        "secondary\_text": "Trung Hòa, Cầu Giấy, Hà Nội"
      },
      "terms": \[\],
      "has\_children": false,
      "display\_type": "expand0",
      "score": 633.7587,
      "plus\_code": {
        "compound\_code": "+6DW1G Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1G"
      }
    },
    {
      "description": "43/91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "matched\_substrings": \[\],
      "place\_id": "ytdKslLHBd1\_mSnLu\_bQHGu1yZyLeBt9haGgyFDN1EIOy7I9uEQyTmRkyNZL3BRpT\_Knj31YK/Irv3KkEIIZqw==.ZXhwYW5kMA==",
      "reference": "nP7fBjweFzWzkU8gq/ki\_xEAF3fpVoZ3aQcfXx4ZRHX7QaQPNBPpNToMKx1KZw09gWUhpnSdXJSLowB4qFlCMg==.ZXhwYW5kMA==","structured\_formatting": {
        "main\_text": "43/91 Trung Kính",
        "secondary\_text": "Trung Hòa, Cầu Giấy, Hà Nội"
      },
      "terms": \[\],
      "has\_children": false,
      "display\_type": "expand0",
      "score": 597.5509,
      "plus\_code": {
        "compound\_code": "+63G73 Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+63G73"
      }
    },
    {
      "description": "95 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "matched\_substrings": \[\],
      "place\_id": "mUuwMwTPf5/1WFznDr94rtLvQffNhj1NzWQqDJqgsdUfCqTZdUcHTTav64BxPOC6dSdgZ9WUmwARwQlhmYonvA==.ZXhwYW5kMA==",
      "reference": "lPHbKnLx64d2Ikp35RrFcdRphjayJn2rjapjNhjPuBmPxB9GzirgM6NT0OH65gG2Mf4qGswZXQ8d6U4XBfltjQ==.ZXhwYW5kMA==",
      "structured\_formatting": {
        "main\_text": "95 Trung Kính",
        "secondary\_text": "Trung Hòa, Cầu Giấy, Hà Nội"
      },
      "terms": \[\],
      "has\_children": false,
      "display\_type": "expand0",
      "score": 358.45456,
      "plus\_code": {
        "compound\_code": "+6DW1M Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1M"
      }
    },
    {
      "description": "93 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "matched\_substrings": \[\],
      "place\_id": "xFchTd18UNmq7/rWipBrI6LtqEcDdReZ8cGV3mxeK4yxmmL7hZat/i8cLBdGhdaeNYFQLk4H5AuP2ntIHfS7EQ==.ZXhwYW5kMA==",
      "reference": "dMG3Lmo6Rux8NsEd9lwoDGUOH22aZbMdzDiMy1RhS73mM/uA0rZsX2M0y0Wm990nx4PGw1jd54YkUeqLzySwaQ==.ZXhwYW5kMA==",
      "structured\_formatting": {
        "main\_text": "93 Trung Kính",
        "secondary\_text": "Trung Hòa, Cầu Giấy, Hà Nội"
      },
      "terms": \[\],
      "has\_children": false,
      "display\_type": "expand0",
      "score": 358.1594,
      "plus\_code": {
        "compound\_code": "+6DW1I Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1I"
      }
    },
    {
      "description": "89 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội",
      "matched\_substrings": \[\],
      "place\_id": "OTzyxbl3DUoqV90GZW8D\_2FCVMaEizDWVmAhzTc2d8KmYL/h2cPpfE97BmSabHzliRz3GSgjXWVRxI0bZMxqew==.ZXhwYW5kMA==",
      "reference": "7ESn5kbjYSJJfOstrAkpIRG26bEQi1atPuZKWKyymY9Q7raTcScHyAFeWejvoiu\_aa46E/IYxOvOPsmkZgYfOQ==.ZXhwYW5kMA==",
      "structured\_formatting": {
        "main\_text": "89 Trung Kính",
        "secondary\_text": "Trung Hòa, Cầu Giấy, Hà Nội"
      },
      "terms": \[\],
      "has\_children": false,
      "display\_type": "expand0",
      "score": 358.14783,
      "plus\_code": {
        "compound\_code": "+6DW1E Trung Hòa, Cầu Giấy, Hà Nội",
        "global\_code": "LOC1+6DW1E"
      }
    }
  \],
  "executed\_time": 61,
  "executed\_time\_all": 63,
  "status": "OK"
}

<table><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td style="text-align: left;"><strong>predictions</strong></td><td style="text-align: left;">Là một mảng, chứa danh sách các địa điểm gợi ý phù hợp với thông tin nhập của người dùng, mỗi phần tử chứa các thông tin như: <span style="font-weight: 400;">description (tên đầy đủ), structured_formatting (cấu trúc tên bao gồm main_text (tên chính) và secondary_text (bổ sung)),…</span></td><td><div><div style="text-align: left;">{</div><div style="text-align: left;">&nbsp; &nbsp;“description”: “91 Trung Kính, Phường Trung Hòa, Quận Cầu Giấy, Thành phố Hà Nội”,</div><div style="text-align: left;">&nbsp; &nbsp;“place_id”: “<span style="font-weight: 400;">Hobn8WqBW6…</span>“,</div><div style="text-align: left;">&nbsp; &nbsp;“reference”: “c1OLm3XsXS5rpI9Svkpg_k…….”,</div><div style="text-align: left;">&nbsp; &nbsp;“structured_formatting”:…</div><div style="text-align: left;">…</div></div></td></tr><tr><td style="text-align: left;"><strong>description</strong></td><td style="text-align: left;">Địa điểm được trả về từ các tìm kiếm.</td><td style="text-align: left;">95 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội</td></tr><tr><td style="text-align: left;"><strong>matched_substrings</strong></td><td style="text-align: left;">Các phần của chuỗi tìm kiếm ban đầu hoặc một phần của địa điểm đã được khớp với kết quả trả về từ API.</td><td><div></div><div style="text-align: left;">{</div><div style="text-align: left;">&nbsp; &nbsp;“length”: 2,</div><div style="text-align: left;">&nbsp; &nbsp;“offset”: 0</div><div style="text-align: left;">}</div></td></tr><tr><td style="text-align: left;"><strong>place_id</strong></td><td style="text-align: left;">Mã định danh duy nhất của một địa điểm trên hệ thống được cung cấp bởi Goong, dùng id này để lấy thông tin chi tiết của địa chỉ thông qua <a href="https://help.goong.io/kb/rest-api/place-detail/place-detail-thong-tin-chi-tiet-dia-diem/">Place Detail API</a> hoặc <a href="https://help.goong.io/kb/rest-api/geocoding/geocodeding-ma-hoa-dia-ly/#nhan_chi_tiet_dia_diem_place_id">Geocode API</a>.</td><td style="text-align: left;"><span style="font-weight: 400;">Hobn8WqBW6rsKtKq2PDrVKp4BJNRtiILx</span><p></p><p><span style="font-weight: 400;">TQbB__</span><span style="font-weight: 400;">muXgRB3v8GRDTfkp_6lc4cbLw/ 5PUgWrMDrSI/xlqDBt5XA==.ZXhwYW5kMA==</span></p></td></tr><tr><td style="text-align: left;"><strong>reference</strong></td><td style="text-align: left;">Là một chuỗi ký tự đại diện cho một địa điểm duy nhất trên bản đồ.</td><td><p style="text-align: left;"><span style="font-weight: 400;">7ESn5kbjYSJJfOstrAkpIRG26bEQi1atPuZKWK</span></p><p style="text-align: left;"><span style="font-weight: 400;">yymY9Q7raTcScHyAFeWejvoiu_ aa46E/IYxOvOPsmkZgYfOQ==.ZXhwYW5kMA==</span></p></td></tr><tr><td style="text-align: left;"><strong>structured_formatting&nbsp;&nbsp;</strong></td><td style="text-align: left;">Chứa thông tin định dạng của địa điểm (gồm thông tin chính và thông tin bổ sung), giúp bạn hiển thị các gợi ý địa điểm một cách dễ hiểu và dễ đọc.</td><td><div style="text-align: left;">{</div><div style="text-align: left;">&nbsp; &nbsp;“main_text”: “Tòa nhà Blue Sea”,</div><div style="text-align: left;">&nbsp; &nbsp;“secondary_text”: “91 Trung Kính, Trung Hòa, Cầu Giấy, Hà Nội”</div><div style="text-align: left;">}</div></td></tr><tr><td style="text-align: left;"><strong>main_text</strong></td><td style="text-align: left;">Tên chính của địa điểm được tìm thấy.</td><td style="text-align: left;">91 Trung Kính</td></tr><tr><td style="text-align: left;"><strong>secondary_text</strong></td><td style="text-align: left;">Chứa các thông tin phụ về vị trí địa lý hoặc vùng khu vực mà địa điểm (main text) đó thuộc về.</td><td style="text-align: left;">Trung Hòa, Cầu Giấy, Hà Nội</td></tr><tr><td style="text-align: left;"><strong>terms</strong></td><td style="text-align: left;">Mảng chứa các object gồm từ khóa mô tả địa điểm đến địa điểm (value) và vị trí của từ đó (offset).</td><td><div><div style="text-align: left;">{</div><div style="text-align: left;">&nbsp; &nbsp;“offset”: 15,</div><div style="text-align: left;">&nbsp; &nbsp;“value”: “Phường Trung Hòa”</div><div style="text-align: left;">}</div></div></td></tr><tr><td style="text-align: left;"><strong>has_children</strong></td><td style="text-align: left;">Thông tin về các địa điểm con, nếu có giá trị là true, thì có thể dùng place_id này để gọi những địa điểm con (địa điểm nằm bên trong khu vục của địa điểm này, như sân bay có các địa điểm con là từng cửa vào) thông qua <a href="https://help.goong.io/kb/rest-api/autocomplete/child-id-nhan-chi-tiet-dia-diem-theo-id/">Child ID API</a>.</td><td style="text-align: left;">true</td></tr><tr><td style="text-align: left;"><strong>display_type</strong></td><td style="text-align: left;">Cung cấp thông tin về loại hiển thị của địa điểm hoặc kết quả được trả về.</td><td style="text-align: left;">expand0</td></tr><tr><td style="text-align: left;"><strong>score</strong></td><td style="text-align: left;">Thuộc tính thường được sử dụng để biểu thị mức độ liên quan hoặc độ chính xác của kết quả so với truy vấn của người dùng, giúp đánh giá và xếp hạng các kết quả tìm kiếm nhằm hiển thị những kết quả phù hợp nhất lên trên cùng.</td><td style="text-align: left;">633.7587</td></tr><tr><td style="text-align: left;"><strong>compound_code</strong></td><td style="text-align: left;">Mã địa phương đi kèm với mã khu vực, cho phép xác định chính xác một vị trí địa lý cụ thể.</td><td style="text-align: left;">+6DW1G Trung Hòa, Cầu Giấy, Hà Nội</td></tr><tr><td style="text-align: left;"><strong>global_code</strong></td><td style="text-align: left;">Mã toàn cầu có thể xác định vị trí chính xác ở mức độ thành phố hoặc khu vực.</td><td style="text-align: left;">LOC1+6DW1G</td></tr></tbody></table>

## GIỚI HẠN CÁC CỤM TỪ GỢI Ý CỦA AUTOCOMPLE

Theo mặc định, tính năng Autocomplete sẽ hiển thị tất cả các địa điểm có liên quan đến các cụm tìm kiếm dẫn đến nhiều địa điểm không chuẩn. Chính vì vậy, ta có thể đặt các tuỳ chọn gợi ý về địa điểm để đưa ra thông tin gợi ý phù hợp hơn bằng cách hạn chế kết quả tìm kiếm.

Việc hạn chế kết quả sẽ khiến tiện ích Autocomplete bỏ qua các kết quả nằm ngoài vùng hạn chế. Một phương pháp phổ biến là giới hạn kết quả trong một phạm vi bán kính nhất định. Kết quả của Autocomplete trả về sẽ chỉ hiển thị kết quả trong khu vực được chỉ định:

-   Hạn chế tìm kiếm địa điểm theo bán kính (radius).
-   Gợi ý tìm kiếm xung quanh địa chỉ cụ thể (location).

**Ví dụ:**

-   Khi người dùng nhập input là “aqua” và không sử dụng thêm tính năng giới hạn:

curl 'https://rsapi.goong.io/place/autocomplete?input=aqua&api\_key={YOUR\_API\_KEY}'

Kết quả trả về sẽ ưu tiên các kết quả gần Hà Nội:

{
   "predictions": \[
       {
          "description": "Aqua, 30 Phan Bội Châu, Phường Cửa Nam, Quận Hoàn Kiếm, Thành phố Hà Nội",
         ...
       },
       {
          "description": "AQUA Cafe, Phường Cổ Nhuế 1, Quận Bắc Từ Liêm, Thành phố Hà Nội",
          ...
       },
        ....
   \],
   "execution\_time": "",
    "status": "OK"
}

-   Khi người dùng nhập input tương tự “aqua” nhưng thêm địa chỉ (location ở Hồ Chí Minh, 10.700920276971795, 106.73296613898738) và bán kính (radius, 10):

curl 'https://rsapi.goong.io/place/autocomplete?input=aqua&api\_key={YOUR\_API\_KEY}&location=10.700920276971795%2C%20106.73296613898738'

Kết quả trả về sẽ là các địa điểm ở Hồ Chí Minh:

{
   "predictions": \[
        {
            "description": "Aqua Clinic, 67 Nguyễn Trãi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh",
            ...
        },
        {
            "description": "Aqua Day spa, Khách sạn Sheraton Sài Gòn, 88 Đồng Khởi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
            ...
        },
        {
            "description": "Aqua sport wear, Chung cư Ngô Gia Tự, 28 Lô L Hòa Hảo, Phường 2, Quận 10, Thành phố Hồ Chí Minh",
            ...
        },
        {
            "description": "Aqua Hotel, 25 Hẻm 207 Nguyễn Văn Đậu, Phường 11, Quận Bình Thạnh, Thành phố Hồ Chí Minh",
            ...
        },
        {
            "description": "Aquarium Cafe, 1117 Phan Văn Trị, Phường 10, Quận Gò Vấp, Thành phố Hồ Chí Minh",
            ...
        }
   \],...
}
