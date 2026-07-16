---
title: "SPEED LIMIT – CẢNH BÁO GIỚI HẠN TỐC ĐỘ"
source: https://help.goong.io/kb/rest-api/speed-limit/speed-limit-canh-bao-gioi-han-toc-do/
updated: 2025-01-20T17:26:21
categories: ["SPEED LIMIT"]
---
# SPEED LIMIT – CẢNH BÁO GIỚI HẠN TỐC ĐỘ

> Nguồn: [https://help.goong.io/kb/rest-api/speed-limit/speed-limit-canh-bao-gioi-han-toc-do/](https://help.goong.io/kb/rest-api/speed-limit/speed-limit-canh-bao-gioi-han-toc-do/)

## **TỔNG QUAN VỀ SPEED LIMIT API** 

**Speed Limit API** là một công cụ giúp người dùng truy xuất thông tin về giới hạn tốc độ tại các vị trí cụ thể. Người dùng chỉ cần cung cấp tọa độ vĩ độ (lat) và kinh độ (lon) cùng với một API key hợp lệ để nhận được các thông tin chi tiết, bao gồm giới hạn tốc độ tối đa, hướng di chuyển (bearing), khoảng cách đến điểm có dữ liệu gần nhất và danh sách các camera giám sát tốc độ. 

Tham số **bearing**”: giúp Speed Limit API hoạt động chính xác hơn trong các trường hợp có hướng di chuyển khác nhau, đặc biệt là khi xử lý các đoạn đường hai chiều hoặc những nơi có giới hạn tốc độ khác nhau theo từng hướng. Điều này rất hữu ích trong các ứng dụng dẫn đường, quản lý phương tiện, và các hệ thống giao thông thông minh

## **LÝ DO NÊN SỬ DỤNG SPEED LIMIT API**

**Truy xuất giới hạn tốc độ chi tiết**:  Speed Limit API cung cấp thông tin về giới hạn tốc độ, hệ thống biển báo, camera giao thông tại các vị trí cụ thể. Bạn có thể sử dụng để tích hợp, ứng dụng vào nhiều mục đích khác nhau, từ hỗ trợ lái xe cá nhân đến các hệ thống giám sát vận hành xe trong đội. 

**Ứng dụng được trong nhiều lĩnh vực:** Speed Limit API có thể được tích hợp vào các ứng dụng an toàn giao thông, website, và các hệ thống quản lý giao thông, phù hợp với nhiều nhu cầu.

**Phù hợp với đặc thù giao thông phức tạp tại Việt Nam:** Hệ thống dữ liệu được tối ưu hóa cho môi trường giao thông Việt Nam, bao gồm các tuyến đường nội đô phức tạp, đường cao tốc và đường giao thông liên tỉnh ở các địa phương.

**Dữ liệu cập nhật thường xuyên:** Goong cam kết cung cấp dữ liệu được cập nhật liên tục, theo định kỳ dựa trên thông tin giao thông  mới nhất tại Việt Nam.

## **ỨNG DỤNG THỰC TẾ**

**Ứng dụng hỗ trợ lái xe an toàn:** Dữ liệu từ API giúp các ứng dụng cảnh báo tài xế khi họ vượt quá giới hạn tốc độ, các biển báo như cấm dừng đỗ, đèn tín hiệu giao thông, vạch kẻ người qua đường… nhằm giảm thiểu vi phạm luật và giảm nguy cơ tai nạn giao thông.

**Quản lý đội xe:** [Goong Speed Limit API](http://goong.io) giúp các doanh nghiệp vận tải giám sát vận hành của xe trong đội, bảo đảm tài xế tuân thủ quy định về tốc độ.

**Nghiên cứu giao thông:** hỗ trợ các nhà quy hoạch giao thông phân tích mức độ phù hợp của quy định hiện tại và đề xuất cải tiến.

## **CÁCH THỨC TÍCH HỢP** 

Đầu tiên, để có thể tích hợp API Speed limit vào hệ thống/ ứng dụng của mình bạn cần phải có tài khoản Goong và một API key của [Goong](http://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**Link gọi:** 

**Phương thức: GET**

Ví dụ về request:

-   **Trường hợp không truyền tham số  “bearing”, bạn truy vấn theo link sau:** 

https://speedlimit.goong.io/api/v1/speedlimit?lat=21.03055204166129&lon=105.80106320002825&api\_key={YOUR\_API\_KEY}'

-   **Trường hợp truyền tham số  “bearing”, bạn truy vấn theo link sau:**

https://speedlimit.goong.io/api/v1/speedlimit?lat=21.03055204166129&lon=105.80106320002825&bearing=290.70792&api\_key={YOUR\_API\_KEY}'

<table style="height: 346px;" width="1003"><tbody><tr><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Tham số</b></span></p></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Kiểu dữ liệu</b></span></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Yêu cầu</b></span></td><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Ví dụ</b></span></p></td></tr><tr><td><b>lat</b></td><td><span style="font-weight: 400;">Vĩ độ của vị trí&nbsp;</span></td><td><span style="font-weight: 400;">Bắt buộc</span></td><td><span style="font-weight: 400;">21.005048</span></td></tr><tr><td><b>lon</b></td><td><span style="font-weight: 400;">Kinh độ của vị trí</span></td><td><span style="font-weight: 400;">Bắt buộc</span></td><td><span style="font-weight: 400;">105.792468</span></td></tr><tr><td><b>bearing</b></td><td><span style="font-weight: 400;">Hướng di chuyển hiện tại của người dùng tính bằng độ</span></td><td><span style="font-weight: 400;">Không bắt buộc</span></td><td><span style="font-weight: 400;">20</span></td></tr><tr><td><b>api_key</b></td><td><span style="font-weight: 400;">API Key của bạn để xác thực</span></td><td><span style="font-weight: 400;">Bắt buộc</span></td><td></td></tr></tbody></table>

Tham số **“bearing**” được truyền vào nhằm mục đích xác định rõ hướng di chuyển chính của bạn, đây là tham số không bắt buộc.

Trường hợp **không truyền tham số “bearing”** khi truy vấn, kết quả  trả về sẽ bao gồm cả thông tin hướng chính **“max\_speed**” và thông tin hướng ngược lại **“re\_speed”** của tuyến đường mà bạn đang di chuyển

**Trường hợp truyền tham số “bearing”**, kết quả API trả về chỉ có thông tin của hướng chính “max\_speed”.

Bạn có thể tham khảo kết quả trả về của cả hai trường hợp qua ví dụ dưới đây:

**Ví dụ về response:**

-   **Khi đầu vào không truyền tham số “bearing”**

{
    "name": "Quan Hoa",
    "bearing": 39.258904,
    "latitude": 21.03048783700288,
    "longitude": 105.80114400599984,
    "id\_sy": 66479,
    "max\_speed": 50,
    "re\_speed": 50,
    "distance": 11.013874646176397
}

-   **Khi đầu vào có truyền tham số**  **“bearing”:**

{
    "name": "Cầu Giấy",
    "bearing": 304.41342,
    "latitude": 21.030470130002836,
    "longitude": 105.8011716979998,
    "id\_sy": 17453,
    "max\_speed": 60,
    "distance": 14.483243740388113
}

<table style="height: 633px;" width="993"><tbody><tr><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Tham số</b></span></p></td><td style="text-align: center;"><span style="color: #0000ff;"><b>Kiểu dữ liệu</b></span></td><td><p style="text-align: center;"><span style="color: #0000ff;"><b>Ví dụ</b></span></p></td></tr><tr><td><b>name</b></td><td><span style="font-weight: 400;">Tên của địa điểm</span></td><td><span style="font-weight: 400; color: #000000;">Cầu Giấy</span></td></tr><tr><td><b>bearing</b></td><td><span style="font-weight: 400;">Hướng của địa điểm tính bằng độ&nbsp;</span></td><td><span style="font-weight: 400; color: #000000;">304.41342</span></td></tr><tr><td><b>latitude</b></td><td><span style="font-weight: 400;">Vĩ độ của địa điểm</span></td><td><span style="font-weight: 400; color: #000000;">21.030470130002836</span></td></tr><tr><td><b>longitude</b></td><td><span style="font-weight: 400;">Kinh độ của địa điểm</span></td><td><span style="font-weight: 400; color: #000000;">105.8011716979998</span></td></tr><tr><td><b>id_sy</b></td><td><span style="font-weight: 400;">ID hệ thống liên kết với địa điểm&nbsp;</span></td><td><span style="font-weight: 400; color: #000000;">17453</span></td></tr><tr><td><b>max_speed</b></td><td><span style="font-weight: 400;">Tốc độ tối đa cho phép theo hướng chính</span></td><td><span style="font-weight: 400;">60</span></td></tr><tr><td><b>re_speed</b></td><td><span style="font-weight: 400;">Tốc độ tối đa cho phép theo hướng ngược lại</span><p></p><p><span style="font-weight: 400;">&nbsp;(Thông tin này sẽ xuất hiện khi đầu vào không truyền tham số bearing)</span></p></td><td></td></tr><tr><td><b>distance</b></td><td><span style="font-weight: 400;">Khoảng cách từ điểm truy vấn đến địa điểm tính bằng kilomet&nbsp;</span></td><td><span style="font-weight: 400; color: #000000;">14.483243740388113</span></td></tr></tbody></table>

## LÀM THẾ NÀO ĐỂ CÓ THỂ SỬ DỤNG SPEED LIMIT API?

Bạn có nhu cầu sử dụng và tích hợp **Speed limit API** của [Goong](http://goong.io), hãy liên hệ với chúng tôi ngay để được hỗ trợ.

Thông tin liên hệ như sau:

Email: admin@goong.io

SĐT(zalo): [0904522538](tel:0904522538) – [0869697502](tel:0869697502)
