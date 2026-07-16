---
title: "TRIP – TỐI ƯU TUYẾN ĐƯỜNG"
source: https://help.goong.io/kb/rest-api/trip/trip-toi-uu-tuyen-duong/
updated: 2024-10-21T21:50:54
categories: ["TRIP"]
---
# TRIP – TỐI ƯU TUYẾN ĐƯỜNG

> Nguồn: [https://help.goong.io/kb/rest-api/trip/trip-toi-uu-tuyen-duong/](https://help.goong.io/kb/rest-api/trip/trip-toi-uu-tuyen-duong/)

## **TỔNG QUAN**

Cung cấp thông tin về thời gian và khoảng cách dự kiến cho các lộ trình khác nhau, dựa trên phương tiện di chuyển và các ràng buộc địa phương để chọn lộ trình tối ưu nhất.

Đây được coi là phiên bản tiếp theo, được tối ưu hóa hiệu suất của Direction và Distance Matrix. Công cụ này giúp bạn tìm được tuyến đường lý tưởng từ A đến Z, tính toán giờ đến dự kiến và khoảng cách cho ma trận điểm xuất phát và vị trí đích.

### **Tại sao nên sử dụng TRIP**

Với TRIP,  bạn có thể nhận thông tin chính xác về tuyến đường và chuyến đi bằng cách sử dụng thông tin chi tiết về phương tiện giao thông, thông tin mới nhất về tình trạng giao thông, đường đi, cũng như các lựa chọn ưu tiên về tuyến đường như:

-   _Loại hình và các phương thức vận tải khác nhau_
-   _Hướng di chuyển của xe_
-   _Tình trạng đường bị đóng_
-   _Vấn đề về an toàn, chẳng hạn như tránh khu vực nguy hiểm hoặc cung cấp khu vực đón khách an toàn_
-   _Cân bằng giữa thời gian di chuyển, chất lượng chuyến đi và chi phí, bằng cách sử dụng các tùy chọn như thời gian, quãng đường và hiệu suất nhiên liệu_

Bạn cũng có thể xác định các tuyến hiệu quả nhất để lên lịch điều phối, chẳng hạn như:

-   Xác định kho hàng tốt nhất để vận chuyển các gói hàng đến điểm đến cuối cùng

### Ứng dụng thực tế của TRIP

Với TRIP, bạn có thể nhận thông tin chuyến đi, tuyến đường từ một vị trí đến một hoặc nhiều điểm đến.

## **CÁCH TẠO MỘT YÊU CẦU TRIP**

Đầu tiên, bạn phải đăng ký tài khoản và tạo API key của [Goong](http://goong.io) theo hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

**URL:** /trip

**Phương thức: Get**

**Ví dụ về request:**

curl "https://rsapi.goong.io/trip?origin=21.03931,105.83997&waypoints=21.03303694945164,%20105.79131815992706;21.017654632470325,%20105.80350611785252;21.00755912449365,%20105.81105921853873;20.99834437409386,%20105.79148982130629;21.00507520431542,%20105.78814242441126;21.0191769116844,%20105.78822825510088;21.026948305457093,%20105.79466555682208;21.012767209964053,%20105.80256198026676;21.020619056604428,%20105.78925822337628;21.01028337649572,%20105.7894298847555&destination=21.01343,105.79855&api\_key={YOUR\_API\_KEY}"

<table style="height: 248px;" width="769"><tbody><tr><td style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Mô tả</span></strong></td><td style="text-align: center;"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td style="text-align: left;"><strong>origin</strong></td><td style="text-align: left;">(Optional) Vị trí, tọa độ bắt đầu.</td><td style="text-align: left;">21.03931,105.83997</td></tr><tr><td><strong>waypoints</strong></td><td style="text-align: left;">(Optional) Vị trí, tọa độ điểm trung gian (ở giữa). Được phân tách bằng dấu chấm phẩy (;) nếu có nhiều hơn 2 điểm.</td><td style="text-align: left;">16.13901,107.33317;16.13867,107.33330</td></tr><tr><td><strong>destination</strong></td><td style="text-align: left;">(Optional) Vị trí, tọa độ điểm đến.</td><td style="text-align: left;">21.01343,105.79855</td></tr><tr><td style="text-align: left;"><strong>vehicle</strong></td><td style="text-align: left;">Loại phương tiện. Các lựa chọn là ô tô, xe máy, taxi, xe tải, hd (cho các phương tiện gọi xe). Tuỳ chọn, mặc định là ô tô.</td><td style="text-align: left;">car</td></tr></tbody></table>

-   Nếu điểm xuất phát hoặc điểm đến không được chỉ định, một tọa độ tốt nhất từ các điểm dừng sẽ được chọn làm điểm xuất phát hoặc điểm đến.
-   Điểm xuất phát, các điểm dừng và điểm đến đều là tùy chọn, nhưng tổng số tọa độ phải ít nhất là 10 để có chuyến đi tối ưu.
-   Chuyến đi là chuyến khứ hồi (hành trình quay lại điểm xuất phát), điểm xuất phát và điểm đến phải khác nhau.

**Ví dụ về response:**

application/json

{
  "code": "Ok",
  "trips": \[
    {
      "distance": 29360.3,
      "duration": 9207.8,
      "geometry": "wfl\_Coz~dS{CUEb@jF^~ALzLz@tBPzM\`AbAFbJp@w@jH\]hDnCVFFHDh@FRDFBbBbArCdB\`Aj@h@|A|@hAt@JDnAb@p@Tb@NnAb@rAd@\`@NfA^NDb@PlDjAnDpALDLDdAd@VJVHHDNDLF|@VHVJdA^PFNFNdBl@dA^j@Rj@Rd@PnC\`Ar@^NH\`@D\`@AZEVMPY^m@hAyAbDUd@Sb@IR\_@x@ADYj@GPcB|DOd@\`@RD@lAf@pAj@dAb@\`A\`@xAl@jAd@fAd@hF~BT^f@B^@dA?~EBn@HZRZ^\`@z@v@bBzA|CnCdA~@d@\`@ZVjBfBp@j@fA|@z@t@fAz@bEvCdAt@bAt@f@^PL\`@@p@t@z@b@h@\`@h@JXH^c@t@MVYl@EFq@tAZNpAiCJJ\`@d@\`@HHJHXVTRFD^NLTTTPNNNLHF??NJ|@p@JDDBARCDc@\`@g@l@\_@d@IJHK^e@f@m@b@a@BE@SECKE}@q@OK??IGOMOOUQUUOM\_@\]GEUSYWKImErIqBxDKGq@g@MISOYSW\`@y@pAmAnBaBlCuCvEgExGQX\_@d@g@l@w@z@}A\`BML{@~@a@b@u@|@UVuBbB\[T\_@VOJkAv@aAh@Ya@X\`@k@ZiAf@cA\`@kCdAk@TkChAMFUJWJcBx@sAp@q@^k@^s@l@mAnA}@fAa@f@OP{AhBsA~AKJYRULYJe@Hc@BOA\[Ce@Gq@Mk@O{@\[kAg@UMOZUl@M^M\`@EN}@|BCHYdAWd@MTCHKRGJMVIPUd@GJS^CFKRl@Zh@Vd@Vn@No@Oe@Wi@Wm@\[JSBGR\_@FKTe@HQLWFKJSBILUVe@XeABI|@}BDOLa@L\_@Tm@N\[q@\_@\_Ak@cBoAq@}@m@m@cGoFQO\_A\_A\]\]\_@\[\]nAIOT\[f@CDINSXiAtA}@\`Ai@h@OPg@j@WXu@v@w@z@gCfCaBfBs@t@Ub@Uj@EPKOj@e@xBu@hDwAnGGTI\`@VHj@ZFD\`Ah@zBvA\`Al@|AfAs@lAjAr@CLUzAbANS~ArARzBpARtCh@jC\`@fBX\`C
AJjA?PEt@WZSxAuApEmFtAwAJG|CGRCZGpAnBjBnCl@|@PXn@bAZf@bA~ApAtB|C~EXU|DoCz@o@wBcEvBbEh@x@d@r@xAeAdAs@l@\`Ab@r@n@fAxAeA|AiArA\_Ad@\_@rEkDvEcD~@s@nEgDbFyDtCtEnAhBnAjB|@zAJNz@vA@JDPJPl@|@VSvH{FpAcAHEFGbE}Cb@\]\`AIj@@d@Fb@Rd@Z|@rANT~CdFBFBFaAb@OJ^n@dA\`BPFBH{BfByCzBeBoCaBiCKOqBaDk@}@}AaCbE}Cb@\]ObBw@vC{BpAwAZ\[h@e@BCNMTQ~AkAXULKx@o@bAu@BAl@e@zA|BtClEjAdB~@tAhBvCdA\`BeAaBiBwC\_AuAkAeBuCmE{A}BfDgC\`CgBVQi@aAmJfHiAz@e@}ErD\]XQ@c@Ai@IaAS{Aa@WK\_@QYW\[\_@gAaBq@cAeA\_BKIOEKQq@iAS\[cA{AkAcBqAoBe@q@\_AuAuAuBwAoBe@m@m@q@Y\]g@i@w@}@g@k@Y\]UUOQa@c@\_EsEf@\[g@ZW\[oAuAY\]gBuBaAiAaAgAIAQDIHARJJ|BfCfBrBZ^DDHvAVjEF~@@XBZADALEZo@~Be@xEd@yEn@\_CD\[@M@EC\[AYG\_AWkEl@W~AfBn@t@bCnCb@f@PP\`@a@Y\]UUOQa@c@\_EsEW\[oAuAY\]q@YeH\_I{AcBgCyC{A{A\[Yo@c@}@q@\_@Q}@c@wBcA\_CkAq@\[y@\_@{@c@\_@S{As@yAu@}BiAw@a@kB}@WMWM}EaC{Aw@yAw@EC{Ao@\_Ac@YIoDq@WGmCg@oASSE{@SSEeBUy@MyAUc@IICaAQ\_@IaAUiBa@fAmGN\_ALiADU^sAVw@Aa@WqD\[kEg@yGYsDQiCMwAMuAEk@Gs@IeAM\_BIy@KuAKiAEa@Em@M\_BGq@q@eGe@yDKw@Iq@Ea@AMAG?c@@K@SHq@NmAFc@DWNaA\`@uBD\[TmAJc@DUDW@CDQ?CH\_@F\[@GLm@Je@Lo@??FUDSF\]Nq@XyAVoAp@qDVqALo@?ABQt@wDd@aCHe@TcALq@KKSGcBQuC\[mIs@{AKyMaAuBO{L}@aBMmAI",

      "legs": \[
        {
          "distance": 5933.8,
          "duration": 1224.4,
          "steps": \[\],
          "summary": "",
          "weight": 1224.4
        },
        {
          "distance": 1885.3,
          "duration": 408.7,
          "steps": \[\],
          "summary": "",
          "weight": 408.7
        },
        {
          "distance": 1658.9,
          "duration": 431.6,
          "steps": \[\],
          "summary": "",
          "weight": 431.6
        },
        {
          "distance": 2469,
          "duration": 661.5,
          "steps": \[\],
          "summary": "",
          "weight": 661.5
        },
        {
          "distance": 2075.6,
          "duration": 504,
          "steps": \[\],
          "summary": "",
          "weight": 504
        },
        {
          "distance": 256.1,
          "duration": 107.1,
          "steps": \[\],
          "summary": "",
          "weight": 107.1
        },
        {
          "distance": 1376.9,
          "duration": 305.6,
          "steps": \[\],
          "summary": "",
          "weight": 305.6
        },
        {
          "distance": 1403.7,
          "duration": 1771.6,
          "steps": \[\],
          "summary": "",
          "weight": 1771.6
        },
        {
          "distance": 1550.2,
          "duration": 1750.1,
          "steps": \[\],
          "summary": "",
          "weight": 1750.1
        },
        {
         "distance": 2670.3,
          "duration": 509,
          "steps": \[\],
          "summary": "",
          "weight": 509
        },
        {
          "distance": 999.7,
          "duration": 238.9,
          "steps": \[\],
          "summary": "",
          "weight": 238.9
        },
        {
          "distance": 7080.8,
          "duration": 1295.3,
          "steps": \[\],
          "summary": "",
          "weight": 1295.3
        }
      \],
      "weight": 9207.8,
      "weight\_name": "routability"
    }
  \],
  "waypoints": \[
    {
      "distance": 5.136911,
      "location": \[
        21.039316,
        105.839921
      \],
      "place\_id": "Qeza2NKABQXYxSPKnN1jWej8f9qZunsn4\_BW8Jy7USDaw1DBg4N\_J9rCN\_yBuEEj9NIJwKyAImJR\_fec5KlVIVj9VIObhmtM7-433Kzf9ELsVTvnmarbWuzDO\_SAgUFk6sMV24OpVVzv\_jPwmYFJXe3CO-a7r0FZjsM77N-AVV3A7VTfr5dFYu-aFeCYhiNi9\_4365irSUTvwzvSrYFFYdrgL-CcuX9D75kz-Jq7SVPb7C\_mmN5RXuPtNMsM",
      "trips\_index": 0,
      "waypoint\_index": 0
    },
    {
      "distance": 2.754927,
      "location": \[
        21.033061,
        105.791325
      \],
      "place\_id": "pl1MiIkisHbi5wfAlY5fLeaRGNSeiWpM6uTl6\_2wKlieDPb059dYTOf1aPiSsS4v5MwQwonUUC7V5bLjpTpYKv3P1-mis0xL5uc-1aXWXEvS5TLukKNIU-XKMv2JiEht48oc0oqHXFXm9zqgkPlAVOTLMu-m1khQ5coyyYmJXFTR5F3Wpp5Ma-aTHOmRjypr\_vc-4pGiQE3myjLbpHaIVaNPpJumVTHZK5pA68ZOyQFrS5SbvkddYV-rkPcI",
      "trips\_index": 0,
      "waypoint\_index": 4
    },
    {
      "distance": 22.416487,
      "location": \[
        21.017809,
        105.803366
      \],
      "place\_id": "bZTXSeOUyuD7lFWPk7RobvjPJ8ynjCpR7Mkr-o-3XXLi4x3NlaV7d\_rgK8iPi4Ir4soQrdJGK01fXcwnRjLnyStFdBfCgm3dO4-I70KDTWU4v4DfrlaZN11bPN12MjU1okM\_4GealWVCP8j\_8lY1FUeHON-qj001V4M83zIyMWVHU4VjTt6NJbuOWGeybii9u-\_I755SnRfhIzzfeoY1J49bsI-yQtXNP45U\_9OC3RV\_XliPq4NJdUu\_hOMc",
      "trips\_index": 0,
      "waypoint\_index": 2
    },
    {
      "distance": 31.015553,
      "location": \[
        21.007758,
        105.811269
      \],
      "place\_id": "MtGIptXLVbDkkgTSpZ5MXuf3APSjWC9v\_-nW05Iqalf-5F3okLEjRP3kIcKmnkBVy1cxYiZHUT2WV5CL3\_YlIbZHlLvKjilBk5uc-1aXWXEvS5f3ukKNIUzLK5f2JiEh248oc0oqgbVzmsjr5kPdAVOSIMu-m1khQ5eUyyYeJXFTK5F2J1p5Ma-aTHOmRjypr\_vc-4pGiQE3myjLbpCpMiNPpJumVaHZK5pA68ZOyQFrS5SbvkddYV-rkPcI",
      "trips\_index": 0,
      "waypoint\_index": 1
    },
    {
      "distance": 134.579692,
      "location": \[
        20.999314,
        105.79071
      \],
      "place\_id": "v2vfjerMdvj61jvOl61RWf6aFtG7kj5q\_5U3z5e-NlvP10TVv64yTOPXBcyJyVEy-TcN35TJTdHIMyf2-uMpFN-DSP\_S\_rlFW-\_ojyLjLQVbP-C\_zjb5VTvjXL-CUlVVw\_ogBz9e9QUj7lyfkjZVdSfnWL\_K7y1VNr9cv1JT4QfmU-UDLu4NJUfuOAfSM4Dd2kuoj\_4zjXVD71y\_GuZVRdc70O\_SIrWtX-40n7I6vXUfP-DtFjMr4SvdF8iA",
      "trips\_index": 0,
      "waypoint\_index": 9
    },
    {
      "distance": 43.717286,
      "location": \[
        21.005389,
        105.787887
      \],
      "place\_id": "RS92N5P4xtfjjEDlg5dge\_r7EeqMlDZE-usg3ri9XTfg-QX1lL4-Uc-Nmj-P2knQ1-Y3T3oOhYzPP1jP0jYhVd870Gf-Uu1V5-\_ojyLjLQVbP-K\_zjb5VTvgv1-CUlVVw\_tcBz5e9QUj76ifkjZVdSfk3L\_K7y1XW-E0v1JSUQUXM-UnLu4NRQPuOAfSMkjd24-oja4y\_\_1D71y9duZVRdc70O\_SIrWtX-40n7I6v4Edd-DvyjMrPSvf5IN8",
      "trips\_index": 0,
      "waypoint\_index": 8
    },
    {
      "distance": 15.681507,
      "location": \[
        21.019095,
        105.788105
      \],
      "place\_id": "m\_6CF6iCgtDswTHagat5b-\_iOeGeg1Mj4u4T4oHcfWHZ8iaEmLlyben-JeithGVV7O8T3a-qW3np0DHmuYJhWNniKf\_dhUdi7ew13q7dV0DZ7jnlU6hDWO7BjJs5g0Nm6MH22YGrV17t\_DHym4NLX-\_AOeR93a1b7sE5wkOCV1\_a71bdrZVHYO2YF-KahCFg9fw1IZqpS-ntwTlGr4NHY9j2LeKeu31B4u0x-pi5S1HZ7i3KkmtxTXOHvNsk",
      "trips\_index": 0,
      "waypoint\_index": 6
    },
    {
      "distance": 69.479722,
      "location": \[
        21.027187,
        105.795284
      \],
      "place\_id": "iM9t50LlUU795TvmlohwT7D1MI2S0Ep2heZTsZyMTlrPz230l9coWuCTLPWQsSBQ5s0g9ZPVXSz\_kQX\_iIhoWMCQCeinjVEt5OU816fUXnTQ5zDskqFJSufIMP-Likpv4cge0Iiil1fk9Tj7XoqSVubJMO2k1EpS58gwy4uLXlbT5l\_UpJxOaeSRHuuTjShp\_PU84JOgQk\_kyDDZpopOatHrJOuXsnRI5JI485GwQljQ5yTtk9VaVejmP8AT",
      "trips\_index": 0,
      "waypoint\_index": 3
    },
    {
      "distance": 19.450353,
      "location": \[
        21.01267,
        105.802406
      \],
      "place\_id": "6QHohMH0r3joXOnbUb6veurGN\_VBrJhV6ntiiumsqyfuXSzPZ9qrUfLrN-Bd2J5o3MAGzXjaqCXw6g6GdISoI\_D0I8Bzsagj6-oz2FHbnUbf6D\_IjRa6EXujHP\_BFhYdg7scRv1HfnVjr-jetTYWrWenGP-JF24Rd6Mc\_xFGEq1nc6VDbQZOcZuueEeQngpxm8\_oz702vqUDrxz\_WQYWYZd7kK-R7vZ5H6503\_E2\_nFff6CviVdqYWufpMM8",
      "trips\_index": 0,
      "waypoint\_index": 10
    },
    {
      "distance": 8.278421,
      "location": \[
        21.020549,
       105.789286
      \],
      "place\_id": "x6\_uha6MX\_\_Y8rkhmiFKXWun2hemeulQn7t8p3a7dQyL2wQyEnbdQJNjyE8mYuVdN6f4tIe6FdtDemAcmwIF1RNrBB-idgmli7ew13q7dV0BT7tnlm6hDWDnBOfaCg0Nm6MEX2YGrV33t\_DHym4NeS-\_AOeSt3UNb7sE5woKCV1\_a71bdrZVHYO2YF-KahCFg9fw16ZqpS0btwTnQr4NHY9jiLeKeu31B7Zsx-pi5S1HZ7i3kmtxTXOHvNsk",
      "trips\_index": 0,
      "waypoint\_index": 5
    },
    {
      "distance": 38.043008,
      "location": \[
        21.010007,
        105.789648
      \],
      "place\_id": "8fGEhdnxiVzB8Rj3nLZiefWBBPbYqGpGx7Al2Ya1N0D27Qzik55-efPhKYqdm3pp\_oUtn4adO3792z3XYqeKfPffLptcpEhH8ukqwbHCSF\_zxib6hLc-XPHeJumdnEd5994Ixp60SEHy4y7thJxUQPDfJvuywlxE8d4m3Z2dSEDF8EnCsopYf\_KHCP2Fmz5\_6BuMq9oW2VFny3ibPsJxYfMdM\_f2BpGJe8qYu5YcyVE7GpjL7hcNMQ\_7wKdY",
      "trips\_index": 0,
      "waypoint\_index": 7
    },
    {
      "distance": 36.917935,
      "location": \[
        21.013758,
        105.798614
      \],
      "place\_id": "RrhWKDhh7vf0m1fylIB3bO3sBv2bgyFT7Xw3ya-q\_CD3ShLig6hzbvfsEv6elHhG7-ONKKndSmP3\_djRl6lSYd\_9KcGDpgZe7O0036\_cVkHY7zggmqlC5O\_AOFmDgkJn6cAW2ICqVl\_s\_TDzmoJKXu7Bn-U43EJLa78Csw4ODVl7b7lfcrJRG7-xhFuObhSCZ9P006Juo90dKwDjRroLsYtnjLOOfunxA7Jow-5m4SlDY7yzlm91SXeDuN8g",
      "trips\_index": 0,
      "waypoint\_index": 11
    }
 \]
}

<table width="769"><tbody><tr><td width="69"><p style="text-align: center;"><span style="color: #0000ff;"><strong>Tham số</strong></span></p></td><td style="text-align: center;" width="190"><span style="color: #0000ff;"><strong>Mô tả</strong></span></td><td style="text-align: center;" width="325"><strong><span style="color: #0000ff;">Ví dụ</span></strong></td></tr><tr><td style="text-align: left;" rowspan="3" width="69"><strong>code</strong></td><td style="text-align: left;" width="190">Mã trả về thành công hoặc lỗi.</td><td style="text-align: left;" rowspan="3" width="325">ok</td></tr><tr><td style="text-align: left;" width="190">Nếu trả về mã code “ok” nghĩa là thành công.</td></tr><tr><td style="text-align: left;" width="190">Ngược lại, nếu lỗi thì trả về mã lỗi tương ứng.</td></tr><tr><td style="text-align: left;" width="69"><strong>trips</strong></td><td style="text-align: left;" width="190">Các chuyến và hành trình đã tạo. Bao gồm điểm đến, tuyến đường đi, thời gian (duration, đơn vị giây), khoảng cách (distance, đơn vị mét), thứ tự di chuyển trong hành trình (Step), khoảng cách giữa các điểm trong hành trình (weight)…</td><td style="text-align: center;" width="325"><div style="text-align: left;">&nbsp;[</div><div style="text-align: left;">&nbsp; &nbsp;{</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “distance”: 135260.5,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “duration”: 12487,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “geometry”:”wfl_Coz~dS{CUEb@jF^~…</div><div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “legs”: [</div><div style="text-align: left;"><div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;{</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “distance”: 66910.5,</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “duration”: 6079,</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “steps”: [],</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “summary”: “”,</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; “weight”: 6079</div><div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;},</div></div></div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; ],</div><div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “weight”: 12487,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “weight_name”: “routability”</div><div style="text-align: left;">&nbsp; &nbsp;},</div><div style="text-align: left;">&nbsp; &nbsp;…</div><div style="text-align: left;">]</div></div></div></td></tr><tr><td style="text-align: left;" width="69"><strong>waypoints</strong></td><td style="text-align: left;" width="190">Mảng chứa các địa điểm đi qua trong chuyến đi (gồm: tọa độ – kinh độ, vĩ độ, place_id, trip_index, waypoint_index).</td><td style="text-align: center;" width="325"><div style="text-align: left;">[</div><div style="text-align: left;">&nbsp; &nbsp;{</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “distance”: 5.136911,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “location”: [</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;21.039316,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;105.839921</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; ],</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “place_id”: “sNibrIoAq_lN6vKssJ32VkU6_eaJ…”,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “trips_index”: 0,</div><div style="text-align: left;">&nbsp; &nbsp; &nbsp; “waypoint_index”: 0</div><div style="text-align: left;">&nbsp; &nbsp;},</div><div style="text-align: left;">…</div><div style="text-align: left;">]</div></td></tr><tr><td style="text-align: left;" width="69"><strong>trip_index</strong></td><td style="text-align: left;" width="190">Thứ tự của đoạn đường trong cả chuyến đi.</td><td style="text-align: center;" width="325"><div><div style="text-align: left;">“trips_index”: 0</div></div></td></tr><tr><td style="text-align: left;" width="69"><strong>waypoint_index</strong></td><td style="text-align: left;" width="190">Thứ tự của điểm trong chuyến đi.</td><td style="text-align: center;" width="325"><div><div style="text-align: left;">“waypoint_index”: 2</div></div></td></tr><tr><td style="text-align: left;" width="69"><strong>place_id</strong></td><td style="text-align: left;" width="190">Id của địa điểm.</td><td style="text-align: left;" width="325">6QHohMH0r3joXOnbUb6veurGN_VBrJhV6n<br>tiiumsqyfuXSzPZ9qrUfLrN-Bd2J5o3MAGzXjaqCXw6g6GdISoI_D0I8B<br>zsagj6oz2FHbnUbf6D_IjRa6EXujHP_<br>BFhYdg7scRv1HfnVjr-jetTYWrWenGP-JF24Rd6Mc_xFGEq1nc6VDbQZOcZuue<br>EeQngpxm8_oz702vqUDrxz_WQYWYZd7kK-R7vZ5H6503_E2_nFff6CviVdqYWufpMM8″</td></tr></tbody></table>
