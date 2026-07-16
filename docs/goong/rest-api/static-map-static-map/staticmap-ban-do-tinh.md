---
title: "STATIC MAPS – BẢN ĐỒ TĨNH"
source: https://help.goong.io/kb/rest-api/static-map-static-map/staticmap-ban-do-tinh/
updated: 2024-10-21T10:33:45
categories: ["Static Maps"]
---
# STATIC MAPS – BẢN ĐỒ TĨNH

> Nguồn: [https://help.goong.io/kb/rest-api/static-map-static-map/staticmap-ban-do-tinh/](https://help.goong.io/kb/rest-api/static-map-static-map/staticmap-ban-do-tinh/)

## TỔNG QUAN

**Static Maps** (hay còn được gọi là bản đồ tĩnh) cung cấp bản đồ dưới dạng hình ảnh, là một loại bản đồ không thể tương tác trực tiếp từ phía người dùng, nghĩa là bạn không thể thu/phóng, di chuyển, xoay, nghiêng hoặc thực hiện các thao tác trên bản đồ này. Thay vào đó, bản đồ tĩnh thường được sử dụng để hiển thị một hình ảnh tĩnh của một khu vực cụ thể, thường áp dụng vào mục đích hiển thị thông tin hoặc hướng dẫn.

Static Maps của [Goong](http://Goong.io) thường được sử dụng trong các ứng dụng hoặc trang web để hiển thị vị trí, hành trình hoặc dữ liệu địa lý một cách trực quan.

![](https://help.goong.io/wp-content/uploads/2024/08/Static-Map.png)

## CÁCH TÍCH HỢP STATICMAP

**Đường link:** /staticmap/route

**Phương thức:** **GET**

**Ví dụ về request:**

curl "https://rsapi.goong.io/staticmap/route?origin=20.981971,105.864323&destination=21.03876,105.79810&vehicle=car&api\_key={YOUR\_API\_KEY}"

<table><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td style="text-align: left;"><strong>origin</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Chuỗi tọa độ điểm xuất phát (bắt buộc).</span></td><td style="text-align: left;"><span style="font-weight: 400;">20.981971,105.864323</span></td></tr><tr><td style="text-align: left;"><strong>destination</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Chuỗi tọa độ điểm đến (bắt buộc).</span></td><td style="text-align: left;"><span style="font-weight: 400;">21.03876,105.79810</span></td></tr><tr><td style="text-align: left;"><strong>width</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Chiều rộng của hình ảnh trả về. Mặc định là 600(px).</span></td><td style="text-align: left;"><span style="font-weight: 400;">600</span></td></tr><tr><td style="text-align: left;"><strong>height</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Chiều cao của hình ảnh trả về. Mặc định là 400(px).</span></td><td style="text-align: left;"><span style="font-weight: 400;">400</span></td></tr><tr><td style="text-align: left;"><strong>vehicle</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Loại phương tiện. Bao gồm: ô tô (car), xe đạp (bike), taxi, xe tải (truck), hd (cho các phương tiện gọi xe).</span></td><td style="text-align: left;"><span style="font-weight: 400;">car</span></td></tr><tr><td style="text-align: left;"><strong>type</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Các kiểu dẫn đường. Bao gồm: <code>fastest</code>,&nbsp;<code>shortest</code>.&nbsp; Mặc định là <code>fastest</code>.</span></td><td style="text-align: left;"><span style="font-weight: 400;">fastest</span></td></tr><tr><td style="text-align: left;"><strong>color</strong></td><td style="text-align: left;"><span style="font-weight: 400;">Màu của đường đi. Mặc định là #253494.</span></td><td style="text-align: left;"><span style="font-weight: 400;">#253494</span></td></tr></tbody></table>

**Ví dụ về response:**

Response trả về là một hình ảnh bản đồ tại vị trí như tọa độ đã thiết lập. Bản đồ này chỉ hiển thị cho người dùng xem được vị trí chứ không thể tương tác xoay, nghiêng hay phóng to, thu nhỏ…

![](https://help.goong.io/wp-content/uploads/2024/08/2024-10-17_1-44-58-300x172.png)
