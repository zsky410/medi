---
title: "AUTOCOMPLETE V2"
source: https://help.goong.io/kb/rest-api-v2/autocomplete-rest-api-v2/autocomplete-v2/
updated: 2026-02-24T16:11:21
categories: ["AUTOCOMPLETE V2"]
---
# AUTOCOMPLETE V2

> Nguồn: [https://help.goong.io/kb/rest-api-v2/autocomplete-rest-api-v2/autocomplete-v2/](https://help.goong.io/kb/rest-api-v2/autocomplete-rest-api-v2/autocomplete-v2/)

## TỔNG QUAN

Tính năng **Autocomplete** (gợi ý địa điểm theo từ khóa) không chỉ giúp rút ngắn thời gian nhập liệu mà còn giảm thiểu lỗi sai khi nhập địa chỉ, đặc biệt trong các hệ thống yêu cầu định vị chính xác như: giao hàng, gọi xe, tìm kiếm bất động sản, hoặc khai báo hành chính.

Với **Autocomplete API**, Goong cho phép các nhà phát triển dễ dàng tích hợp tính năng gợi ý địa điểm theo thời gian thực vào website hoặc ứng dụng. Chỉ cần người dùng bắt đầu gõ từ khóa, API sẽ tự động trả về danh sách địa điểm phù hợp – từ địa chỉ cụ thể, tên đường, đến các doanh nghiệp hay địa danh phổ biến – có thể giới hạn theo khu vực địa lý nếu cần.

Đặc biệt, trong bối cảnh **cả nước đang thực hiện điều chỉnh địa giới hành chính** theo các nghị quyết mới nhất của Trung ương, Goong đã **kịp thời cập nhật dữ liệu bản đồ** để đảm bảo mọi kết quả gợi ý luôn phản ánh đúng tên tỉnh, huyện, xã mới sau sáp nhập. Điều này giúp các nền tảng số luôn đồng bộ với hệ thống địa lý – hành chính hiện hành, hạn chế sai sót và tăng độ tin cậy.

Trong bài viết này, bạn sẽ được hướng dẫn chi tiết cách tích hợp tính năng Autocomplete vào hệ thống của mình – từ cấu hình cơ bản, xử lý kết quả trả về, đến các tùy chọn nâng cao giúp kiểm soát phạm vi tìm kiếm và hiển thị gợi ý theo ngữ cảnh ứng dụng.

## **CÁCH THỨC TÍCH HỢP AUTOCOMPLETE**

Trước khi bắt đầu sử dụng dịch vụ Autocomplete API của Goong, bạn cần đảm bảo rằng đã có API Key của mình.

Bạn có thể tham khảo cách **đăng ký tài khoản** và **tạo key** chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL: https://rsapi.goong.io/v2/place/autocomplete**

**Phương thức: GET**

 **Các tham số trong request truyền vào:**

[https://rsapi.goong.io/v2/place/autocomplete?input=298 ngoc lam long bien &location=21.0278,105.8342&api\_key={](https://rsapi-test.goong.io/v2/place/autocomplete?input=298%20ngoc%20lam%20long%20bien%20&location=21.0278,105.8342&api_key=BX2WaiHTHtuHbmtFacbBUUwpVVm5uqQP9c2leiZU&has_deprecated_administrative_unit=true)YOUR\_API\_KEY[}&has\_deprecated\_administrative\_unit=true](https://rsapi-test.goong.io/v2/place/autocomplete?input=298%20ngoc%20lam%20long%20bien%20&location=21.0278,105.8342&api_key=BX2WaiHTHtuHbmtFacbBUUwpVVm5uqQP9c2leiZU&has_deprecated_administrative_unit=true)

<table dir="ltr" border="1" width="945" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><tbody><tr><td style="text-align: center;"><strong>Tham số</strong></td><td style="text-align: center;"><strong>Mô tả</strong></td><td style="text-align: center;"><strong>Ví dụ</strong></td></tr><tr><td><strong>input</strong></td><td>Từ khóa tìm kiếm (bắt buộc).</td><td>ho hoan kiem</td></tr><tr><td><strong>location</strong></td><td>Tọa độ tìm kiếm ưu tiên.</td><td>20.981971,105.864323</td></tr><tr><td><strong>limit</strong></td><td>Giới hạn số lượng kết quả trả ra, mặc định là 05.</td><td>5</td></tr><tr><td><strong>radius</strong></td><td>Giới hạn tìm kiếm trong phạm vi bán kính từ vị trí đã chỉ định (đơn vị km). Mặc định là 50.</td><td>2000</td></tr><tr><td><strong>more_compound</strong></td><td>Boolean. Nếu là true, Autocomplete sẽ trả về các trường thông tin: quận, xã, tỉnh. Mặc định là false.</td><td>TRUE</td></tr><tr><td><p data-pm-slice="1 1 []"><strong>has_deprecated_administrative_unit</strong></p></td><td><p data-start="0" data-end="146">Là tham số boolean dùng trong API V2, để hiển thị thêm thông tin địa giới hành chính&nbsp;<strong data-start="121" data-end="143" data-is-only-node="">trước khi sáp nhập</strong>.</p><p data-start="149" data-end="296">&nbsp;True: Kết quả vẫn theo địa giới&nbsp;<strong data-start="187" data-end="194">mới</strong>, nhưng có thêm trường&nbsp;<code data-start="217" data-end="241">deprecated_description</code>&nbsp;và&nbsp;<code data-start="245" data-end="266">deprecated_compound</code>&nbsp;chứa tên địa phương&nbsp;<strong data-start="287" data-end="293">cũ</strong>.</p><p data-start="299" data-end="386">&nbsp;False hoặc mặc định: Chỉ trả về địa giới&nbsp;<strong data-start="352" data-end="359">mới</strong>, không kèm thông tin cũ.</p><p data-start="389" data-end="471" data-is-last-node="">&nbsp;Dữ liệu chính không thay đổi, param này chỉ để&nbsp;<strong data-start="436" data-end="462">tham chiếu địa danh cũ</strong>&nbsp;nếu cần.</p></td><td>&nbsp;TRUE</td></tr><tr><td><strong>origin</strong></td><td><p data-start="389" data-end="471" data-is-last-node="">Tham số <strong data-start="8" data-end="20"><code data-start="10" data-end="18" data-is-only-node="">origin</code></strong> cho phép xác định tọa độ điểm gốc để sắp xếp gợi ý theo độ gần. Khi truyền <code data-start="96" data-end="104">origin</code>, API sẽ trả thêm <strong data-start="122" data-end="143"><code data-start="124" data-end="141" data-is-only-node="">distance_meters</code></strong> – khoảng cách từ điểm gợi ý đến vị trí đó.</p></td><td></td></tr></tbody></table>

**Các tham số respose trả về**

{
    "predictions": \[
        {
            "description": "298 Ngọc Lâm, Bồ Đề, Hà Nội",
            "matched\_substrings": \[
                {
                    "length": 3,
                    "offset": 0
                },
                {
                    "length": 4,
                    "offset": 4
                },
                {
                    "length": 3,
                    "offset": 9
                }
            \],
            "place\_id": "lqtHcLCBkwdsiW1Vllir7TVywQSWmXb-wSLNMUnRxvY2i1WY0d1qP1HOnai6IYLfTcKA\_F7tiitdAskgjl0yd92-LVA24B6vvdbFHmZFhKFN0i1T4p5EHkXajXCyRBurR",
            "reference": "lqtHcLCBkwdsiW1Vllir7TVywQSWmXb-wSLNMUnRxvY2i1WY0d1qP1HOnai6IYLfTcKA\_F7tiitdAskgjl0yd92-LVA24B6vvdbFHmZFhKFN0i1T4p5EHkXajXCyRBurR",
            "structured\_formatting": {
                "main\_text": "298 Ngọc Lâm",
                "main\_text\_matched\_substrings": \[
                    {
                        "length": 3,
                        "offset": 0
                    },
                    {
                        "length": 4,
                        "offset": 4
                    },
                    {
                        "length": 3,
                        "offset": 9
                    }
                \],
                "secondary\_text": "Bồ Đề, Hà Nội",
                "secondary\_text\_matched\_substrings": \[\]
            },
            "has\_children": false,
            "plus\_code": {
                "compound\_code": "+69NYS Ngọc Lâm, Long Biên, Hà Nội",
                "global\_code": "LOEJ+69NYS"
            },
            "compound": {
                "commune": "Bồ Đề",
                "province": "Hà Nội"
            },
            "terms": \[
                {
                    "offset": 0,
                    "value": "298 Ngọc Lâm"
                },
                {
                    "offset": 16,
                    "value": "Bồ Đề"
                },
                {
                    "offset": 28,
                    "value": "Hà Nội"
                }
            \],
            "types": \[
                "house\_number"
            \],
            "distance\_meters": null,
            "deprecated\_description": "298 Ngọc Lâm, Phường Ngọc Lâm, Quận Long Biên, Thành phố Hà Nội",
            "deprecated\_compound": {
                "district": "Long Biên",
                "commune": "Ngọc Lâm",
                "province": "Hà Nội"
            }
        },
        {
            "description": "Ngõ 298 Ngọc Lâm, Bồ Đề, Hà Nội",
            "matched\_substrings": \[
                {
                    "length": 3,
                    "offset": 4
                },
                {
                    "length": 4,
                    "offset": 8
                },
                {
                    "length": 3,
                    "offset": 13
                }
            \],
            "place\_id": "T6yvDK69hfZcbNdOvJVIR2tG0kq9bfZibL\_GMbB\_\_1takohPs1CGVG27yzeSGpJEb4jFC1bBGoWJwpI80jRusdl2SiWikf5dbAq3kaY19jUhol40buxudQGq\_zTCNGvZA",
            "reference": "T6yvDK69hfZcbNdOvJVIR2tG0kq9bfZibL\_GMbB\_\_1takohPs1CGVG27yzeSGpJEb4jFC1bBGoWJwpI80jRusdl2SiWikf5dbAq3kaY19jUhol40buxudQGq\_zTCNGvZA",
            "structured\_formatting": {
                "main\_text": "Ngõ 298 Ngọc Lâm",
                "main\_text\_matched\_substrings": \[
                    {
                        "length": 3,
                        "offset": 4
                    },
                    {
                        "length": 4,
                        "offset": 8
                    },
                    {
                        "length": 3,
                        "offset": 13
                    }
                \],
                "secondary\_text": "Bồ Đề, Hà Nội",
                "secondary\_text\_matched\_substrings": \[\]
            },
            "has\_children": false,
            "plus\_code": {
                "compound\_code": "+5Z628 Ngọc Lâm, Long Biên, Hà Nội",
                "global\_code": "LOEJ+5Z628"
            },
            "compound": {
                "commune": "Bồ Đề",
                "province": "Hà Nội"
            },
            "terms": \[
                {
                    "offset": 0,
                    "value": "Ngõ 298 Ngọc Lâm"
                },
                {
                    "offset": 21,
                    "value": "Bồ Đề"
                },
                {
                    "offset": 33,
                    "value": "Hà Nội"
                }
            \],
            "types": \[
                "alley"
            \],
            "distance\_meters": null,
            "deprecated\_description": "Ngõ 298 Ngọc Lâm, Phường Ngọc Lâm, Quận Long Biên, Thành phố Hà Nội",
            "deprecated\_compound": {
                "district": "Long Biên",
                "commune": "Ngọc Lâm",
                "province": "Hà Nội"
            }
        },
        {
            "description": "Chung cư IDB Complex, Ngõ 298 Ngọc Lâm, Bồ Đề, Hà Nội",
            "matched\_substrings": \[
                {
                    "length": 3,
                    "offset": 26
                },
                {
                    "length": 4,
                    "offset": 30
                },
                {
                    "length": 3,
                    "offset": 35
                }
            \],
            "place\_id": "S2G9JKvaC6utYFgirVfv1qxMcj2sVI30vUtEGat-s8e9ULEdmAqC1nx8VBOsSp3hbndIXpxQldmxekQDq2\_u7755cgSufKfAvXhLvJVtX52HelidH9AuNna94UCCdCubd",
            "reference": "S2G9JKvaC6utYFgirVfv1qxMcj2sVI30vUtEGat-s8e9ULEdmAqC1nx8VBOsSp3hbndIXpxQldmxekQDq2\_u7755cgSufKfAvXhLvJVtX52HelidH9AuNna94UCCdCubd",
            "structured\_formatting": {
                "main\_text": "Chung cư IDB Complex",
                "main\_text\_matched\_substrings": \[\],
                "secondary\_text": "Ngõ 298 Ngọc Lâm, Bồ Đề, Hà Nội",
                "secondary\_text\_matched\_substrings": \[
                    {
                        "length": 3,
                        "offset": 4
                    },
                    {
                        "length": 4,
                        "offset": 8
                    },
                    {
                        "length": 3,
                        "offset": 13
                    }
                \]
            },
            "has\_children": true,
            "plus\_code": {
                "compound\_code": "+GNYN Ngọc Lâm, Long Biên, Hà Nội",
                "global\_code": "LOEJ+GNYN"
            },
            "compound": {
                "commune": "Bồ Đề",
                "province": "Hà Nội"
            },
            "terms": \[
                {
                    "offset": 0,
                    "value": "Chung cư IDB Complex"
                },
                {
                    "offset": 22,
                    "value": "Ngõ 298 Ngọc Lâm"
                },
                {
                    "offset": 44,
                    "value": "Bồ Đề"
                },
                {
                    "offset": 56,
                    "value": "Hà Nội"
                }
            \],
            "types": \[
                "building"
            \],
            "distance\_meters": null,
            "deprecated\_description": "Chung cư IDB Complex, Ngõ 298 Ngọc Lâm, Phường Ngọc Lâm, Quận Long Biên, Thành phố Hà Nội",
            "deprecated\_compound": {
                "district": "Long Biên",
                "commune": "Ngọc Lâm",
                "province": "Hà Nội"
            }
        },
        {
            "description": "Cổng đón/trả khách, Trường THCS Ái Mộ, Ngõ 298 Ngọc Lâm, Bồ Đề, Hà Nội",
            "matched\_substrings": \[
                {
                    "length": 3,
                    "offset": 43
                },
                {
                    "length": 4,
                    "offset": 47
                },
                {
                    "length": 3,
                    "offset": 52
                }
            \],
            "place\_id": "gUDax5FIeHd5hFQinFBjJHuHfJ-vbo0pT4dQJ7cLs-N6ULwctm2r-3hQZiTubqzuvL1qH5x9TJ6VhbEEqlevkdtAgzCaboXqeb1LX51tnfR4h1gHLqwuNnXqvUCCdCubd",
            "reference": "gUDax5FIeHd5hFQinFBjJHuHfJ-vbo0pT4dQJ7cLs-N6ULwctm2r-3hQZiTubqzuvL1qH5x9TJ6VhbEEqlevkdtAgzCaboXqeb1LX51tnfR4h1gHLqwuNnXqvUCCdCubd",
            "structured\_formatting": {
                "main\_text": "Cổng đón/trả khách",
                "main\_text\_matched\_substrings": \[\],
                "secondary\_text": "Trường THCS Ái Mộ, Ngõ 298 Ngọc Lâm, Bồ Đề, Hà Nội",
                "secondary\_text\_matched\_substrings": \[
                    {
                        "length": 3,
                        "offset": 23
                    },
                    {
                        "length": 4,
                        "offset": 27
                    },
                    {
                        "length": 3,
                        "offset": 32
                    }
                \]
            },
            "has\_children": false,
            "plus\_code": {
                "compound\_code": "+GPCG Ngọc Lâm, Long Biên, Hà Nội",
                "global\_code": "LOEJ+GPCG"
            },
            "compound": {
                "commune": "Bồ Đề",
                "province": "Hà Nội"
            },
            "terms": \[
                {
                    "offset": 0,
                    "value": "Cổng đón/trả khách"
                },
                {
                    "offset": 26,
                    "value": "Trường THCS Ái Mộ"
                },
                {
                    "offset": 51,
                    "value": "Ngõ 298 Ngọc Lâm"
                },
                {
                    "offset": 73,
                    "value": "Bồ Đề"
                },
                {
                    "offset": 85,
                    "value": "Hà Nội"
                }
            \],
            "types": \[
                "site"
            \],
            "distance\_meters": null,
            "deprecated\_description": "Cổng đón/trả khách, Trường THCS Ái Mộ, Ngõ 298 Ngọc Lâm, Phường Ngọc Lâm, Quận Long Biên, Thành phố Hà Nội",
            "deprecated\_compound": {
                "district": "Long Biên",
                "commune": "Ngọc Lâm",
                "province": "Hà Nội"
            }
        },
        {
            "description": "Sảnh đón/trả khách, Chung cư IDB Complex, Ngõ 298 Ngọc Lâm, Bồ Đề, Hà Nội",
            "matched\_substrings": \[
                {
                    "length": 3,
                    "offset": 46
                },
                {
                    "length": 4,
                    "offset": 50
                },
                {
                    "length": 3,
                    "offset": 55
                }
            \],
            "place\_id": "Oyx0RyVbUFSniEMxkHCR-XijT1e7cKPUeNVcpwdznfBv1lSwumGm8HayWL-6Y47Xc7JYFaxauNlsi34ekQewk0GOKGq4Y-qVdbGZU1xhkRTB0i5G9-AeBkXYHXKORBurR",
            "reference": "Oyx0RyVbUFSniEMxkHCR-XijT1e7cKPUeNVcpwdznfBv1lSwumGm8HayWL-6Y47Xc7JYFaxauNlsi34ekQewk0GOKGq4Y-qVdbGZU1xhkRTB0i5G9-AeBkXYHXKORBurR",
            "structured\_formatting": {
                "main\_text": "Sảnh đón/trả khách",
                "main\_text\_matched\_substrings": \[\],
                "secondary\_text": "Chung cư IDB Complex, Ngõ 298 Ngọc Lâm, Bồ Đề, Hà Nội",
                "secondary\_text\_matched\_substrings": \[
                    {
                        "length": 3,
                        "offset": 26
                    },
                    {
                        "length": 4,
                        "offset": 30
                    },
                    {
                        "length": 3,
                        "offset": 35
                    }
                \]
            },
            "has\_children": false,
            "plus\_code": {
                "compound\_code": "+GNYO Ngọc Lâm, Long Biên, Hà Nội",
                "global\_code": "LOEJ+GNYO"
            },
            "compound": {
                "commune": "Bồ Đề",
                "province": "Hà Nội"
            },
            "terms": \[
                {
                    "offset": 0,
                    "value": "Sảnh đón/trả khách"
                },
                {
                    "offset": 26,
                    "value": "Chung cư IDB Complex"
                },
                {
                    "offset": 49,
                    "value": "Ngõ 298 Ngọc Lâm"
                },
                {
                    "offset": 71,
                    "value": "Bồ Đề"
                },
                {
                    "offset": 83,
                    "value": "Hà Nội"
                }
            \],
            "types": \[
                "building"
            \],
            "distance\_meters": null,
            "deprecated\_description": "Sảnh đón/trả khách, Chung cư IDB Complex, Ngõ 298 Ngọc Lâm, Phường Ngọc Lâm, Quận Long Biên, Thành phố Hà Nội",
            "deprecated\_compound": {
                "district": "Long Biên",
                "commune": "Ngọc Lâm",
                "province": "Hà Nội"
            }
        }
    \],
    "execution\_time": "",
    "status": "OK"
}

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="207"> <col width="473"> <col width="293"></colgroup><tbody><tr><td><strong>Tham số</strong></td><td><strong>Mô tả</strong></td><td><strong>Ví dụ</strong></td></tr><tr><td><strong>predictions</strong></td><td>Mảng chứa các gợi ý địa điểm trả về từ truy vấn của người dùng</td><td>Gồm 5 địa chỉ tại đường Nguyễn Trãi, Sao Đỏ,&nbsp; Hải Phòng</td></tr><tr><td><strong>description</strong></td><td>Chuỗi mô tả đầy đủ địa chỉ</td><td>“91 Nguyễn Trãi, Sao Đỏ, Hải Phòng”</td></tr><tr><td><strong>compound</strong></td><td>Thông tin địa giới hành chính xã/phường và tỉnh/thành phố</td><td>{“commune”: “Sao Đỏ”, “province”: “Hải Phòng”}</td></tr><tr><td><strong>matched_substrings</strong></td><td>Các đoạn chuỗi trong kết quả khớp với từ khóa người dùng nhập vào (dùng để highlight)</td><td>[] (trống – tức không có phần nào cần highlight)</td></tr><tr><td><strong>place_id</strong></td><td>ID định danh duy nhất của địa điểm (dùng để truy xuất chi tiết từ Place Detail API hoặc Geocode API)</td><td>“Hobn8WqBW6r…/5PUgWrMDrSI/xlqDBt5XA==.ZXhwYW5kMA==”</td></tr><tr><td><strong>reference</strong></td><td>Chuỗi tham chiếu địa điểm – tương tự như place_id, phục vụ backend hoặc caching</td><td>“o/QzXNc_eBK…/t/AIYwRnQ==.ZXhwYW5kMA==”</td></tr><tr><td><strong>structured_formatting</strong></td><td>Định dạng chia nhỏ description gồm main_text và secondary_text để hiển thị rõ ràng hơn</td><td>{ “main_text”: “91 Nguyễn Trãi”, “secondary_text”: “Sao Đỏ, Hải Phòng” }</td></tr><tr><td><strong>main_text</strong></td><td>Phần địa chỉ chính – dùng làm tiêu đề khi render UI</td><td>“91 Nguyễn Trãi”</td></tr><tr><td><strong>secondary_text</strong></td><td>Phần địa chỉ phụ – địa danh hành chính đi kèm để xác định vị trí rõ ràng hơn</td><td>“Sao Đỏ, Hải Phòng”</td></tr><tr><td><strong>terms</strong></td><td>Mảng rỗng – trong một số hệ thống có thể chứa các thành phần địa chỉ dạng “value” và “offset”</td><td></td></tr><tr><td><strong>has_children</strong></td><td>Boolean cho biết địa điểm có chứa các địa điểm con không (ví dụ toà nhà có các văn phòng bên trong)</td><td>FALSE</td></tr><tr><td><strong>display_type</strong></td><td>Loại hiển thị – thường dùng để frontend xác định cách nhóm/kết quả</td><td>“expand0”</td></tr><tr><td><strong>score</strong></td><td>Điểm đánh giá độ phù hợp của kết quả (càng cao thì càng chính xác)</td><td>633.7587 (cao nhất ở entry đầu tiên, giảm dần về sau)</td></tr><tr><td><strong>plus_code.compound_code</strong></td><td>Mã vị trí kết hợp địa phương, thường để biểu diễn location rút gọn</td><td>“+6DW1G Sao Đỏ, Hải Phòng”</td></tr><tr><td><strong>plus_code.global_code</strong></td><td>Mã định vị toàn cầu theo chuẩn OLC (Open Location Code)</td><td>“LOC1+6DW1G”</td></tr><tr><td><strong>status</strong></td><td>Trạng thái phản hồi – “OK” nghĩa là thành công</td><td>“OK”</td></tr><tr><td><span style="color: #000000;"><strong>deprecated_description</strong></span></td><td>Chuỗi mô tả đầy đủ địa chỉ với thông tin cũ.</td><td>“91 Nguyễn Trãi, Sao Đỏ, Chí Linh, Hải Dương”</td></tr><tr><td><span style="color: #000000;"><strong>deprecated_compound</strong></span></td><td>Thông tin địa giới hành chính xã/phường, quận/huyện và tỉnh/thành phố.</td><td>&nbsp;{“commune”: “Sao Đỏ”, “district”: “Chí Linh”, “province”: “Hải Phòng”}</td></tr></tbody></table>

## GIỚI HẠN CÁC CỤM TỪ GỢI Ý CỦA AUTOCOMPLE

Theo mặc định, tính năng Autocomplete sẽ hiển thị tất cả các địa điểm có liên quan đến các cụm tìm kiếm dẫn đến nhiều địa điểm không chuẩn. Chính vì vậy, ta có thể đặt các tuỳ chọn gợi ý về địa điểm để đưa ra thông tin gợi ý phù hợp hơn bằng cách hạn chế kết quả tìm kiếm.

Việc hạn chế kết quả sẽ khiến tiện ích Autocomplete bỏ qua các kết quả nằm ngoài vùng hạn chế. Một phương pháp phổ biến là giới hạn kết quả trong một phạm vi bán kính nhất định. Kết quả của Autocomplete trả về sẽ chỉ hiển thị kết quả trong khu vực được chỉ định:

-   Hạn chế tìm kiếm địa điểm theo bán kính (radius).
-   Gợi ý tìm kiếm xung quanh địa chỉ cụ thể (location).
