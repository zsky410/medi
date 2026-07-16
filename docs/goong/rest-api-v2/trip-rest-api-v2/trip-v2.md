---
title: "TRIP (V2)"
source: https://help.goong.io/kb/rest-api-v2/trip-rest-api-v2/trip-v2/
updated: 2025-10-06T10:31:42
categories: ["TRIP V2"]
---
# TRIP (V2)

> Nguồn: [https://help.goong.io/kb/rest-api-v2/trip-rest-api-v2/trip-v2/](https://help.goong.io/kb/rest-api-v2/trip-rest-api-v2/trip-v2/)

# TỔNG QUAN

**Trip API** là công cụ định tuyến nâng cao, được thiết kế như một giải pháp kết hợp giữa hai tính năng cốt lõi: **Directions** (chỉ đường) và **Distance Matrix** (tính khoảng cách – thời gian). API này không chỉ cung cấp thông tin về quãng đường và thời gian di chuyển giữa nhiều điểm, mà còn tích hợp khả năng **tối ưu hóa lộ trình** theo từng loại phương tiện – từ xe máy, ô tô đến các phương tiện vận chuyển chuyên dụng.

Phiên bản mới hỗ trợ:

-   Dữ liệu cập nhật theo địa giới hành chính mới
    
-   Tham số **administrative\_unit** để chọn dữ liệu cũ hoặc mới
    
-   Giữ nguyên định dạng JSON cũ để dễ tích hợp
    
-   Hiệu suất phản hồi nhanh và ổn định hơn
    

Phù hợp cho các ứng dụng logistics, giao vận, gọi xe, điều phối tuyến và tối ưu hành trình

# **CÁCH TẠO MỘT YÊU CẦU TRIP**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io/) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** https://rsapi.goong.io/v2/trip

**Phương thức: Get**

**Tham số trong request truyền vào:**

curl "https://rsapi.goong.io/v2/trip?origin=21.03931,105.83997&waypoints=21.03303694945164,105.79131815992706;21.017654632470325,105.80350611785252;21.00755912449365,105.81105921853873;20.99834437409386,105.79148982130629;21.00507520431542,105.78814242441126;21.0191769116844,105.78822825510088;21.026948305457093,105.79466555682208;21.012767209964053,105.80256198026676;21.020619056604428,105.78925822337628;21.01028337649572,105.7894298847555&destination=21.01343,105.79855&api\_key={YOUR\_API\_KEY}"

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="207"> <col width="473"> <col width="342"></colgroup><tbody><tr><td style="text-align: center;"><strong><span style="color: #0000ff;">Tham số</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td><strong>origin</strong></td><td>Tọa độ điểm bắt đầu (vĩ độ, kinh độ)</td><td>21.03931,105.83997</td></tr><tr><td><strong>destination</strong></td><td>Tọa độ điểm kết thúc (vĩ độ, kinh độ)</td><td>21.01343,105.79855</td></tr><tr><td><strong>waypoints</strong></td><td>Danh sách các điểm đi qua giữa origin và destination, cách nhau bằng ;</td><td>21.03303,105.79131;21.01765,105.80350;…</td></tr><tr><td><strong>vehicle</strong></td><td>Loại phương tiện. Các lựa chọn là ô tô, xe máy, taxi, xe tải, hd (cho các phương tiện gọi xe). Tuỳ chọn, mặc định là ô tô.</td><td>car</td></tr><tr><td><strong>roundtrip</strong></td><td>Lộ trình trả về có vòng lại từ điểm kết thúc, cho phép quay lại bắt đầu – giá trị mặc định là true</td><td>true</td></tr><tr><td><strong>api_key</strong></td><td>Mã khóa truy cập API của bạn</td><td>&nbsp;API key của bạn</td></tr></tbody></table>

-   Nếu điểm xuất phát hoặc điểm đến không được chỉ định, một tọa độ tốt nhất từ các điểm dừng sẽ được chọn làm điểm xuất phát hoặc điểm đến.
-   Điểm xuất phát, các điểm dừng và điểm đến đều là tùy chọn, nhưng tổng số tọa độ phải ít nhất là 10 để có chuyến đi tối ưu.
-   Chuyến đi là chuyến khứ hồi (hành trình quay lại điểm xuất phát), điểm xuất phát và điểm đến phải khác nhau.

**Tham số trong response trả về:**

{
    "code": "Ok",
    "trips": \[
        {
            "distance": 33343.4,
            "duration": 10065.2,
            "geometry": "wfl\_Coz~dS{CUEb@zF\`@nAJzLz@tBPzM\`AbAFbJp@w@jH\]hDsArK\_@bECXEFCLOrAOtAGh@QhBOrA?H@FU~AEXKNJp@Ff@TlBB\\\\@HHpA?FDTDb@DVNtATbBHp@Hp@h@|ERbCdAnM\\\\jEh@bHt@bKZ~DTnCBj@Qv@\[\`Bo@\`EUtAId@Qz@Mz@Mn@Gd@YdBCL\_@lBUtA\]nBcAxFWzAQdAQ~@WrA\]\`B\_@lAs@zA\]j@s@bA\_AvAOTe@t@e@r@INUZY^GHSVyApBg@p@mA\`B\_ApAu@\`AiA|AmDzEeCjDUVs@\`AQZIZI^G^C^@b@BhABzABd@FzABLFLLzBH\`@HRLRBJBD|C~CLLHXD^@NBdACR@PDPFJFFLDN?LENIJOLGLCL?hATN@FAPDjBh@pAb@RFZJVHj@ZFD\`Ah@zBvA\`Al@|AfAs@lAjAr@CLBMkAs@r@mA}AgAaAm@{BwAaAi@Qk@Mq@F\]j@cC\`@kBXsATcAF\]Ja@\`@aB^sAN\[LUBEd@k@b@e@dCgC^a@x@}@r@x@ORv@~@hAjAt@z@|@\`AjA\`A@@b@ZZRRL^XXP\`DvBdCzA\`@w@P\_@l@Zh@Vd@Vn@No@Oe@Wi@Wm@\[JSBGR\_@FKTe@HQLWFKJSBILUVe@XeABI|@}BDOLa@L\_@Tm@TLxAn@p@Tx@RnARp@Dr@E\`@I\\\\MXOJI\\\\YrAaB~D}Ej@m@j@k@j@g@n@c@n@\]\`B{@lB{@TKbEgBnEgBjAg@l@\[lAs@hCeBfA}@v@q@fAoA\`@e@TWjEsEz@eA^k@fEwGfIyMv@mAVa@LS\`F{JpAiCJJ\`@\\\\d@\`@HHJHXVTRFD^\\\\NLTTTPNNNLHF??NJdAt@B@DBARCDc@\`@g@l@\_@d@IJHK^e@f@m@b@a@BE@SECCAeAu@OK??IGOMOOUQUUOM\_@\]GEUSYWKImErIqBxDKGq@g@MISOYSW\`@y@pAmAnBaBlCuCvEgExGQX\_@d@g@l@w@z@}A\`BML{@~@a@b@o@t@\[^uBbB\[T\_@VOJkAv@aAh@Ya@X\`@k@ZiAf@cA\`@kCdALZnEgBjAg@l@\[lAs@hCeBfA}@v@q@fAoAFFXX\\\\\`@LLb@d@FHJJ|BfCfBrBZ^DDv@~@~AfBn@t@zBfCj@n@PP\`@a@Y\]UUOQa@c@{DoEf@Yg@X\[\_@oAuAY\]gBuBaAiAaAgAIAQDIHARJJ|BfCfBrBZ^DDv@~@~AfBn@t@zBfCj@n@PPJL^\`@j@r@h@j@b@d@f@l@f@n@d@n@b@l@f@t@b@n@\\\\h@f@r@h@x@\`@j@d@r@RXnC\`ER\\\\\`AxAF\\\\FJrAnBHPzA~BT\`@Xp@x@~Bf@jA\\\\r@^v@zAvB|@rAnDzFBFBFaAb@OJ^n@dA\`BPFBH{BfByCzBeBoCaBiCKO}C\_F}AaCbE}Cb@\]\\\\ObBw@rAeAbAu@pAwAZ\[h@e@BCNMTQ~AkAXULKx@o@bAu@DCj@c@fDgC\`CgBVQxBcBb@\[tADbA\`BLR^n@RZFH\`A|AdDbFdBjCfAfBiAz@eA?iCV\_A\]k@JSRG^SRRSF\_@RSj@K~@\\\\hCWdA?hA{@VOsA\_CiEsHa@s@\_BkCGKcBoCCEa@o@k@}@k@b@eAv@oCrBgJ\`HiAz@e@\\\\}ErD\]XUPuAf@WRiCnByAbBWTQJuElDaBlAk@d@wB~AuCxBMOOKMA{@wAe@u@c@u@oAkBoAiBuCuEcFxDoEfD\_Ar@wEbDsEjDe@^sA~@}AhAyAdAw@j@eBnAq@gAc@w@S\[Yc@xAeAyAdAe@s@i@y@{@n@iAkBUk@I\]Im@AMIaBg@sAKUkAkCEIt@\_@hFoCjBaAb@Ut@\_@TKp@\]d@UlBaAt@\_@fCsAdAk@vAs@lBaAfAi@f@W\`B{@\`Ae@HIFODUBQ\\\\iCB\]@MDo@De@Be@JuA@KH}@Fy@@SBU@Kd@yEn@\_CD\[@M@EC\[AYG\_AWkEl@W~AfBn@t@zBfCj@n@PP\`@a@Y\]UUOQa@c@{DoE\[\_@oAuAY\]q@YeH\_I{AcBgCyC{A{A\[Yo@c@}@q@\_@Q}@c@wBcA\_CkAq@\[y@\_@{@c@\_@S{As@yAu@}BiAw@a@kB}@WMWM}EaC{Aw@{Ay@CA{Ao@\_Ac@YIoDq@WGmCg@oASSE{@SSEeBUy@MyAUc@IICaAQ\_@IaAUiBa@fAmGN\_ALiADUZ\_AZ{@Aq@WqD\[kEg@yGWsDYsDGk@MwAEk@Gs@IeAM\_BIy@KuAKiAEa@Em@M\_BGq@q@eGe@yDKw@Iq@Ea@AG?EAS?W@K@SHq@NmAFc@DWNaA\`@uBD\[\`@qBDUDW@CDQ?CH\_@F\[@GLm@Je@Lo@??FUDSF\]Nq@XyAVoAp@qDVqALo@?ABQt@wDd@aCHe@TcALq@KKSGcBQuC\[mIs@{AKyMaAuBO{L}@qAK}AK",
            "legs": \[
                {
                    "distance": 6795.3,
                    "duration": 1259.8,
                    "steps": \[\],
                    "summary": "",
                    "weight": 1259.8
                },
                {
                    "distance": 1792,
                    "duration": 669.6,
                    "steps": \[\],
                    "summary": "",
                    "weight": 669.6
                },
                {
                    "distance": 3498.2,
                    "duration": 732.7,
                    "steps": \[\],
                    "summary": "",
                    "weight": 732.7
                },
                {
                    "distance": 1885.2,
                    "duration": 385.6,
                    "steps": \[\],
                    "summary": "",
                    "weight": 385.6
                },
                {
                    "distance": 1641.7,
                    "duration": 297,
                    "steps": \[\],
                    "summary": "",
                    "weight": 297
                },
                {
                    "distance": 2794,
                    "duration": 2354.1,
                    "steps": \[\],
                    "summary": "",
                    "weight": 2354.1
                },
                {
                    "distance": 2208,
                    "duration": 1922.5,
                    "steps": \[\],
                    "summary": "",
                    "weight": 1922.5
                },
                {
                    "distance": 2359.7,
                    "duration": 516.6,
                    "steps": \[\],
                    "summary": "",
                    "weight": 516.6
                },
                {
                    "distance": 1501.2,
                    "duration": 332,
                    "steps": \[\],
                    "summary": "",
                    "weight": 332
                },
                {
                    "distance": 313.3,
                    "duration": 87.4,
                    "steps": \[\],
                    "summary": "",
                    "weight": 87.4
                },
                {
                    "distance": 1473.1,
                    "duration": 302.1,
                    "steps": \[\],
                    "summary": "",
                    "weight": 302.1
                },
                {
                    "distance": 7081.7,
                    "duration": 1205.8,
                    "steps": \[\],
                    "summary": "",
                    "weight": 1205.8
                }
            \],
            "weight": 10065.2,
            "weight\_name": "routability"
        }
    \],
    "waypoints": \[
        {
            "distance": 5.033847,
            "location": \[
                21.039316,
                105.839922
            \],
            "place\_id": "Wje8YryKNnGJQnIepgeqz2umeQ6wYJ-Ta6NAJKZhmJQ-j0AVuSm2k1mOblm7XYiXKJ6xFJZnbdbrsUAwuXOclTqxdAahXKL4RtB1UpCwkPlVYHcGpgaAkF2idS2SQmOsH",
            "trips\_index": 0,
            "waypoint\_index": 0
        },
        {
            "distance": 2.754927,
            "location": \[
                21.033061,
                105.791325
            \],
            "place\_id": "jUZejZKVlaVyv0lVcpOxkG0qv9YHBb3Rc2AQDdNescx3o2VgosnKh1Xqyb1S2cLXhd41WE65h4M5ydl5RonGL79VDXRyiX-yUd7NFUZNjk\_p2iV4FpQWDk3ShVi6bBOiT",
            "trips\_index": 0,
            "waypoint\_index": 1
        },
        {
            "distance": 22.416487,
            "location": \[
                21.017809,
                105.803366
            \],
            "place\_id": "UK\_AwD9vhlNnEGnCB2Oo\_EpCXJ-7TaDfY0KOqrNKmk97P-bCg1uFzWEaS4ixEZ5LeAKBp4BM\_XF7JiCnr2WKg1YQLKanSrfuYkRQsJx2hu9jtEO0sBCAWhmE7S6qGEf3G",
            "trips\_index": 0,
            "waypoint\_index": 4
        },
        {
            "distance": 31.015553,
            "location": \[
                21.007758,
                105.811269
            \],
            "place\_id": "UVaMc1-9c1F8hSWPrG8f2mLb7zGvfGD8S4SyW5t-RdR12G3kZt3N42JC8oqoTUFLYfn2cq6ywNt5-hYA7rX9Gnkq8kFihVkrreLycXpxsvfV5hpQKqgqcWXuu5yGcC1Hc",
            "trips\_index": 0,
            "waypoint\_index": 3
        },
        {
            "distance": 61.098363,
            "location": \[
                20.998716,
                105.791924
            \],
            "place\_id": "vEXVWT3U2j4xmvikvuEPw5m5qdw--o4PngWwkSohej0JZkI00v23wIWbJc7kBbIeuWb9esbl8qftdkFVIiG6pymWsGHSPQqHta69NTY9\_j-ZqlUoZuRmfj2i9Qm6PMvTP",
            "trips\_index": 0,
            "waypoint\_index": 7
        },
        {
            "distance": 43.717286,
            "location": \[
                21.005389,
                105.787887
            \],
            "place\_id": "cVEXsThxn\_KxoFuBRkuJUZ1nrUSyTcbnXGuYR4EVjemiYy8zhBby9Z5XTCa2FIGGoX1XDIBj-vKxfEQDtxSz9sdlTDW2YK\_ooWRXQ4FMgbebZksX6ESRt7NkTDyBFvrDB",
            "trips\_index": 0,
            "waypoint\_index": 6
        },
        {
            "distance": 15.681507,
            "location": \[
                21.019095,
                105.788105
            \],
            "place\_id": "Y06bDnkzVbFmgpgXqGdKvmXy0rhimd7brTrt4FaVUmOJ-hlEdqFWYx2XeM1uQaKaxSoc-DvB6g9FP3n0cqlSqm1GGtD6eabbffH-4WpghmPF9gl1ouQ6umH-qVSWID-PY",
            "trips\_index": 0,
            "waypoint\_index": 9
        },
        {
            "distance": 69.479722,
            "location": \[
                21.027187,
                105.795284
            \],
            "place\_id": "h0jCU8Z6Mpj14pUoEs0215FWmQUa3dJzdYLXEIrlJmMZgnAQ\_shKMxmXAXT61dJj7Y0mePrYQi4d6UXQLrahh875NeEOCw22GYLJSRqR0hO1hhEESshKUhGO2SWWEE\_85",
            "trips\_index": 0,
            "waypoint\_index": 2
        },
        {
            "distance": 22.595256,
            "location": \[
                21.012654,
                105.802381
            \],
            "place\_id": "h0BKVk2wZodutiEnS7b47j6Jf2Zk\_GLvi7QsQoC3B4VRmCk8ZbH43WGdcARksaHzUbdWq3SAhIdVPV2Yj8KhZm2kfEVKh6nlY6dRRXexh-5iBnUoREYeXh2C1QjoQprHH",
            "trips\_index": 0,
            "waypoint\_index": 5
        },
        {
            "distance": 23.80096,
            "location": \[
                21.020829,
                105.789209
            \],
            "place\_id": "ggycfY2jgmF\_xig3v0uvyWaxea6wivlIZjhIoYT2koV8s20nqGC0gmO-bQSZO7yHZU\_HFL8MrIFTX1smsUiaxVK-cS2HT2PLZqJUQIJymmfrmEEcUtBSSZ2WwTz-CFfnC",
            "trips\_index": 0,
            "waypoint\_index": 10
        },
        {
            "distance": 38.043008,
            "location": \[
                21.010007,
                105.789648
            \],
            "place\_id": "q6tIpMGsYEQKplNBZLZs-3i0TBl0ZYmHZ5xqR6x6icdiwFA8rxL-s2emSCDcZbuDeJptQ7dJv81SnViNrBOpBGG\_fvGDd7b6YaVTR4V1hexgn09ATsxOVhWK3SDiFEv7F",
            "trips\_index": 0,
            "waypoint\_index": 8
        },
        {
            "distance": 36.917935,
            "location": \[
                21.013758,
                105.798614
            \],
            "place\_id": "ek1XfVuqY5lXjlMatLq8Z0vZYzOw9I53V8JhCId5pPx7umkDgGWkw2G2U0WHTLj4e8I\_SLVnhtt7nkAGtrCNzWymcT9bhoqFp6ZQRIZ2Yu-GnEMQsBCWhmG0SzAuGEf3G",
            "trips\_index": 0,
            "waypoint\_index": 11
        }
    \]
}

<table dir="ltr" border="1" cellspacing="0" cellpadding="0" data-sheets-root="1" data-sheets-baot="1"><colgroup><col width="207"> <col width="473"> <col width="342"></colgroup><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Mô tả cụ thể</strong></span></td><td style="text-align: center;"><span style="color: #0000ff;"><strong>Ví dụ</strong></span></td></tr><tr><td><strong>distance</strong></td><td>Tổng chiều dài của một tuyến (trip) hoặc của một chặng nhỏ (leg), tính bằng mét.</td><td>5933.8 (leg), 29360.3 (trip)</td></tr><tr><td><strong>duration</strong></td><td>Thời gian ước lượng để đi hết một leg hoặc cả trip, tính bằng giây.</td><td>1224.4 (leg), 9207.8 (trip)</td></tr><tr><td><strong>weight</strong></td><td>Giá trị được sử dụng để tối ưu tuyến (thường trùng với duration nếu không có cấu hình khác).</td><td>1224.4</td></tr><tr><td><strong>weight_name</strong></td><td>Loại trọng số được sử dụng để tính toán tuyến</td><td>“routability”</td></tr><tr><td><strong>geometry</strong></td><td>Chuỗi polyline mã hóa (encoded polyline) đại diện cho đường đi trên bản đồ – dùng để vẽ tuyến.</td><td><pre> "wfl_Coz~dS{CUEb@jF^~ALzLz@tBPzM`AbAFbJp@w@jH]hDnCVFFHD
h@FRDFBbBbArCdB`Aj@h@|A..."</pre></td></tr><tr><td><strong>legs</strong></td><td>Mảng chứa các chặng nhỏ của hành trình, mỗi leg là đoạn giữa hai điểm (origin → waypoint hoặc waypoint → destination).</td><td><pre> {
"distance": 5933.8,
"duration": 1224.4,
"steps": [],
"summary": "",
"weight": 1224.4
},</pre></td></tr><tr><td><strong>steps</strong></td><td>Mảng chứa hướng dẫn chi tiết từng bước rẽ, ngã, tên đường…</td><td>[]</td></tr><tr><td><strong>summary</strong></td><td>Tóm tắt nhanh leg dựa trên tên đường chính hoặc đặc điểm nổi bật (thường để rỗng nếu không có tên đường rõ ràng).</td><td>“”</td></tr><tr><td><strong>waypoints</strong></td><td>Mảng chứa các địa điểm đi qua trong chuyến đi (gồm: tọa độ – kinh độ, vĩ độ, place_id, trip_index, waypoint_index).</td><td><pre>{
"distance": 5.136911,
"location": [21.039316, 105.839921],
"place_id": "Qeza2NKABQXYxSPKnN1jWej8f9qZunsn4_BW8Jy7USDaw1DBg4N_...",
"trips_index": 0,
"waypoint_index": 0
},</pre></td></tr><tr><td><strong>location</strong></td><td>Tọa độ điểm waypoint sau khi được điều chỉnh về đường chính (latitude, longitude).</td><td>[21.039316, 105.839921]</td></tr><tr><td><strong>place_id</strong></td><td>Mã định danh duy nhất của một địa điểm, do Goong sinh ra. Có thể dùng để tra cứu ngược địa điểm trong hệ thống của Goong.</td><td><pre>"Qeza2NKABQXYxSPKnN1jWej8f9qZunsn4_BW8Jy7USD..."</pre></td></tr><tr><td><strong>trips_index</strong></td><td>Chỉ số tuyến mà waypoint thuộc về (trong đa tuyến — thường là 0 nếu chỉ có 1 tuyến).</td><td>&nbsp; 0</td></tr><tr><td><strong>waypoint_index</strong></td><td>Thứ tự của điểm trong chuyến đi so với điểm gốc</td><td>&nbsp; 0, 4, 2, … tùy theo vị trí</td></tr></tbody></table>
