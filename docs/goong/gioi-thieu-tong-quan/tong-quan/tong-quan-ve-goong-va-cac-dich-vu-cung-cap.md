---
title: "TỔNG QUAN VỀ GOONG VÀ CÁC DỊCH VỤ CUNG CẤP"
source: https://help.goong.io/kb/gioi-thieu-tong-quan/tong-quan/tong-quan-ve-goong-va-cac-dich-vu-cung-cap/
updated: 2024-10-21T23:16:42
categories: ["Tổng quan"]
---
# TỔNG QUAN VỀ GOONG VÀ CÁC DỊCH VỤ CUNG CẤP

> Nguồn: [https://help.goong.io/kb/gioi-thieu-tong-quan/tong-quan/tong-quan-ve-goong-va-cac-dich-vu-cung-cap/](https://help.goong.io/kb/gioi-thieu-tong-quan/tong-quan/tong-quan-ve-goong-va-cac-dich-vu-cung-cap/)

# **GIỚI THIỆU CHUNG VỀ GOONG**

**Nền tảng bản đồ số [Goong](http://goong.io) (Goong Maps APIs/Platform)** được phát triển bởi Công Ty CP Công Nghệ và Dịch Vụ IMAP. Là nền tảng cung cấp dịch vụ API bản đồ không gian số, công cụ để ứng dụng và tích hợp vào các phần mềm/ứng dụng/nền tảng số, bản đồ doanh nghiệp….Một giải pháp thay thế hoàn hảo cho Google Maps API tại Việt Nam, chất lượng tương đương mà chi phí chỉ bằng 1/2.

**Dữ liệu của Goong** được xây dựng _**phù hợp với đặc điểm địa lý, địa hình**_ cũng như _**tình hình giao thông phức tạp ở Việt Nam.**_

API được thiết kế phù hợp giúp người dùng có thể **_chuyển đổi từ Google sang Goong_** một cách đơn giản và dễ dàng nhất **_chỉ với thay đổi end-point-url và key_**.

API của Goong tích hợp được trên _**đa nền tảng**_ cho cả hệ thống web/app, có thể được tích hợp trực tiếp trên Goong Maps hoặc Google Map.

![](https://help.goong.io/wp-content/uploads/2024/08/Presentation2.jpg)

# **CÁC LOẠI API CƠ BẢN CỦA GOONG CUNG CẤP**

## Rest API

### **Autocomplete API**

**Định nghĩa:** **[Autocomplete (Gợi ý tìm kiếm địa điểm)](https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/)** là dịch vụ tự động gợi ý tìm kiếm nhanh địa chỉ, địa điểm dựa trên từ khóa người dùng nhập giúp dễ dàng chọn lựa và chọn đúng kết quả cần tìm kiếm. Chỉ với tối thiểu 4 ký tự Goong đã có thể gợi ý đúng chính xác địa điểm, ngay cả khi viết tắt, sai chính tả hoặc viết theo vùng miền. Dữ liệu địa điểm được xây dựng chi tiết tới các lớp sâu như các cột của sân bay, các cổng, sảnh của trung tâm thương mại…

![](https://help.goong.io/wp-content/uploads/2024/08/Group-78-1024x530.png)

**Ứng dụng thực tế:**

-   **Tìm kiếm địa điểm trên các ứng dụng bản đồ và dẫn đường:**

      + **Mô tả:** Khi người dùng bắt đầu nhập địa chỉ hoặc tên địa điểm, [Autocomplete API](https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/) sẽ đưa ra các gợi ý tự động hoàn thành dựa trên các ký tự đã nhập. 

      + **Ví dụ:** Trên ứng dụng bản đồ như Goong Maps hoặc Goong Map, khi người dùng nhập “226 Va “, API sẽ hiển thị các gợi ý như “226 Vạn Phúc, Liễu Giai”, “226 Vạn Phúc, Hà Đông”, “Khách sạn La Thành,…”,… giúp người dùng nhanh chóng chọn đúng địa điểm cần tìm.

-   **Ứng dụng đặt xe và giao hàng:** 

      + **Mô tả:** Giúp người dùng nhập địa chỉ giao hàng hoặc điểm đón một cách nhanh chóng và chính xác.

      + **Ví dụ:** Trên ứng dụng gọi xe như Be hoặc Xanh SM…, khi khách hàng bắt đầu nhập địa chỉ điểm đi/điểm đến, Autocomplete API cung cấp các gợi ý địa chỉ phù hợp, giúp tiết kiệm thời gian và giảm thiểu lỗi nhập liệu.

-   **Tích hợp vào website doanh nghiệp, thương mại điện tử:** 

      + **Mô tả:** Hỗ trợ người dùng nhập địa chỉ giao hàng một cách nhanh chóng và chính xác trong quá trình thanh toán. 

      + **Ví dụ:** Trên các trang web/app mua hàng trực tuyến như Shopee hoặc Tiki, hay cụ thể là sàn Sendo, hay trên app FPT Long Châu đang sử dụng API của Goong, khi người dùng nhập địa chỉ giao hàng, API sẽ đưa ra các gợi ý tự động hoàn thành, giúp quy trình thanh toán nhanh chóng và thuận tiện hơn.

### **Place Detail API**

**Định nghĩa:** [**Place Detail**](https://help.goong.io/kb/rest-api/place-detail/place-detail-thong-tin-chi-tiet-dia-diem/) **(Thông tin chi tiết địa điểm)** là một API được cung cấp bởi [Goong Maps](http://goong.io/), cung cấp khả năng tìm kiếm và truy xuất thông tin chi tiết về các địa điểm cụ thể như nhà hàng, khách sạn, cửa hàng, công viên và các điểm tham quan khác. API này cho phép người dùng tìm kiếm địa điểm dựa trên các tham số như vị trí hiện tại, loại địa điểm, từ khóa và bán kính tìm kiếm.

**Ứng dụng thực tế:** 

-   **Ứng dụng tìm kiếm địa điểm xung quanh:**

      + **Mô tả:** API này cung cấp một địa điểm hay tọa độ địa lý. Người dùng có thể lấy thông tin chi tiết về địa điểm đó, bao gồm tên, địa chỉ, website,…và nhiều thông tin khác nữa.

      + **Ví dụ:** Các ứng dụng như Yelp hoặc Google Places sử dụng Place Detail để cung cấp thông tin chi tiết về các nhà hàng, quán cà phê, và cửa hàng gần người dùng, giúp họ dễ dàng tìm kiếm và lựa chọn địa điểm phù hợp.

-   **Ứng dụng bản đồ và dẫn đường:**

      **+ Mô tả:** Place Detail tích hợp khả năng tìm kiếm địa điểm vào các ứng dụng bản đồ để cung cấp thông tin chi tiết về các điểm quan trọng trên bản đồ. 

      **+ Ví dụ:** Các ứng dụng bản đồ như Goong Maps sử dụng Place Detail để người dùng có thể tìm kiếm các điểm quan trọng như cây xăng, bãi đỗ xe, và ATM một cách dễ dàng.

-   **Dịch vụ giao hàng:**

     **+ Mô tả:** Xác định và tìm kiếm các địa điểm giao hàng hoặc nhận hàng phù hợp dựa trên vị trí của khách hàng.

     **+ Ví dụ:** Các dịch vụ giao đồ ăn như GrabFood hoặc GoFood sử dụng Place Detail để tìm kiếm và hiển thị các nhà hàng gần khách hàng, giúp họ đặt món ăn nhanh chóng và thuận tiện.

### **Geocode API**

[**Geocode**:](https://help.goong.io/kb/rest-api/geocoding/geocodeding-ma-hoa-dia-ly/) Chuyển đổi địa chỉ thành tọa độ địa lý và ngược lại. Cụ thể, Geocode API sử dụng các dữ liệu vị trí như địa chỉ, mã bưu chính, tên địa điểm để xác định vị trí chính xác trên bản đồ hoặc hệ thống thông tin địa lý.

#### **Reverse Geocode API**

**Định nghĩa:** **Là tính năng chuyển đổi tọa độ thành địa chỉ** cho phép chuyển đổi tọa độ địa lý (vĩ độ và kinh độ) thành địa chỉ văn bản hoặc tên địa điểm. Điều này rất hữu ích trong việc hiển thị thông tin địa chỉ cụ thể từ một vị trí trên bản đồ, giúp xác định vị trí địa lý một cách dễ dàng và trực quan.

![](https://help.goong.io/wp-content/uploads/2024/08/Group-76-1024x530.png)

**Ứng dụng thực tế:**

-   **Ứng dụng bản đồ và dẫn đường:**  
    **\+ Mô tả:** Reverse Geocode API giúp hiển thị địa chỉ cụ thể khi người dùng nhấn vào một điểm trên bản đồ.  
    **\+ Ví dụ:** Khi người dùng nhấn vào một điểm trên bản đồ trong ứng dụng dẫn đường, API này có thể hiển thị địa chỉ hoặc tên địa điểm tại vị trí đó, giúp người dùng biết họ đang ở đâu hoặc đang di chuyển đến đâu.
-   **Dịch vụ gọi xe:**  
    **\+ Mô tả:** Xác định địa chỉ hiện tại của người dùng dựa trên tọa độ GPS của họ để cung cấp dịch vụ gọi xe chính xác hơn.  
    **\+ Ví dụ:** Các ứng dụng như Be, Xanh SM, Viettel Post hoặc Sendo sử dụng Reverse Geocode API để chuyển đổi tọa độ GPS của người dùng thành địa chỉ chi tiết, giúp tài xế tìm đến đúng vị trí của khách hàng
-   **Phân tích và báo cáo:**  
    **\+ Mô tả:** Sử dụng thông tin địa chỉ để phân tích dữ liệu vị trí và tạo báo cáo chi tiết về hoạt động dựa trên các tọa độ đã thu thập.  
    **\+ Ví dụ:** Các doanh nghiệp có thể sử dụng Reverse Geocode API để chuyển đổi tọa độ vị trí khách hàng hoặc điểm bán hàng thành địa chỉ cụ thể, từ đó phân tích dữ liệu bán hàng theo khu vực địa lý.

#### **Forward Geocode API**

**Định nghĩa: Tính năng chuyển đổi địa chỉ thành tọa độ** cho phép người dùng gửi một địa chỉ hoặc tên địa điểm và nhận lại tọa độ địa lý tương ứng. Điều này rất hữu ích trong việc xác định vị trí trên bản đồ và thực hiện các chức năng như điều hướng, tìm kiếm địa điểm, và phân tích không gian.

![](https://help.goong.io/wp-content/uploads/2024/08/Group-75-1024x530.png)

**Ứng dụng thực tế:**

-   **Ứng dụng bản đồ và dẫn đường:**  
    + **Mô tả:** Giúp xác định và hiển thị vị trí chính xác trên bản đồ, hỗ trợ điều hướng và lập kế hoạch lộ trình.  
    **\+ Ví dụ:** Các ứng dụng như Google Maps hoặc các hệ thống GPS sử dụng API này để chuyển đổi địa chỉ người dùng nhập vào thành vị trí trên bản đồ để hướng dẫn đường đi.
-   **Dịch vụ giao hàng:**  
    **\+ Mô tả:** Xác định tọa độ địa lý của địa chỉ giao hàng để tính toán lộ trình tối ưu và cải thiện hiệu suất giao hàng.  
    **\+ Ví dụ:** Các công ty giao hàng như Grab hoặc Gojek sử dụng Forward Geocode API để xác định vị trí khách hàng và lập kế hoạch giao hàng hiệu quả nhất.
-   **Ứng dụng du lịch và đặt chỗ:**  
    **\+ Mô tả:** Cung cấp khả năng tìm kiếm địa điểm du lịch, khách sạn, và nhà hàng dựa trên địa chỉ hoặc tên địa điểm, cải thiện trải nghiệm người dùng.  
    **\+ Ví dụ:** Các ứng dụng như Booking.com hoặc TripAdvisor sử dụng Forward Geocode API để giúp người dùng tìm kiếm và đặt chỗ tại các địa điểm du lịch, khách sạn và nhà hàng dựa trên địa chỉ nhập vào.

### **Directions API**

**Định nghĩa:** [**Directions**](https://help.goong.io/kb/rest-api/direction/direction-tinh-toan-khoang-cach-va-chi-duong/) (**Tính toán khoảng cách – dẫn đường**) là loại API cung cấp khả năng tính toán và trả về lộ trình chi tiết giữa hai hoặc nhiều địa điểm. API này hỗ trợ các loại phương tiện khác nhau như (car, bike, taxi, truck, hd). Nó bao gồm các hướng dẫn chi tiết từng bước, khoảng cách, thời gian dự kiến, và các thông tin cần thiết khác để giúp người dùng di chuyển từ điểm A đến điểm B một cách hiệu quả.

![](https://help.goong.io/wp-content/uploads/2024/08/Group-81-1024x530.png)

**Ứng dụng thực tế:**

-   **Ứng dụng bản đồ và dẫn đường:**  
    \+ **Mô tả:** Hỗ trợ người dùng xác định lộ trình tốt nhất và cung cấp hướng dẫn chi tiết khi di chuyển.  
    \+ **Ví dụ:** Các ứng dụng như Google Maps hoặc Goong Map sử dụng Directions API để chỉ dẫn người dùng từ điểm xuất phát đến đích, bao gồm cả các ngã rẽ và các thông tin giao thông thực tế.
-   **Dịch vụ giao hàng và Logistics:**  
    \+ **Mô tả:** Giúp các công ty giao hàng tối ưu hóa lộ trình giao hàng, giảm thời gian và chi phí vận chuyển.  
    + **Ví dụ:** Một công ty giao hàng có thể sử dụng API này để xác định lộ trình giao hàng nhanh nhất và tiết kiệm nhất, đảm bảo hàng hóa được giao đúng thời gian.
-   **Ứng dụng gọi xe và dịch vụ vận tải:**  
    \+ **Mô tả:** Cung cấp cho tài xế lộ trình tối ưu và thông tin giao thông theo thời gian thực, giúp cải thiện trải nghiệm khách hàng.  
    + **Ví dụ:** Các ứng dụng như Grab hoặc Be sử dụng Directions API để cung cấp lộ trình tối ưu cho tài xế, bao gồm cả các tùy chọn thay thế nếu có kẹt xe hoặc sự cố giao thông.

### **Distance Matrix API**

**Định nghĩa:** [**Distance Matrix**](https://help.goong.io/kb/rest-api/distance-matrix/distace-matrix-ma-tran-khoang-cach/) hay còn gọi là ma trận khoảng cách, là một loại API cho phép người dùng tính toán khoảng cách và thời gian di chuyển giữa nhiều địa điểm khác nhau.

Distance Matrix thường được sử dụng trong lập kế hoạch định tuyến, vận chuyển hàng hóa, quản lý đội xe, và trong các ứng dụng liên quan đến di chuyển và định vị. Nó cung cấp thông tin cụ thể để tối ưu hóa hành trình và quản lý tài nguyên di chuyển.

![](https://help.goong.io/wp-content/uploads/2024/08/Group-106-1024x530.png)

**Ứng dụng thực tế:**

-   **Ứng dụng giao hàng và Logistics**  
    \+ **Mô tả:** Distance Matrix API giúp tính toán khoảng cách và thời gian giữa các điểm giao hàng, từ đó lập kế hoạch lộ trình hiệu quả cho các tài xế.  
    \+ **Ví dụ:** Một công ty giao hàng có thể sử dụng API này để xác định lộ trình tối ưu cho các tài xế dựa trên khoảng cách ngắn nhất hoặc thời gian di chuyển ngắn nhất giữa các địa điểm giao hàng, giúp tiết kiệm thời gian và nhiên liệu.
-   **Ứng dụng gọi xe và dịch vụ vận tải:**  
    \+ **Mô tả:** Hỗ trợ tính toán thời gian đến nơi và khoảng cách giữa điểm đón và điểm đến, từ đó cải thiện dịch vụ và trải nghiệm khách hàng.  
    \+ **Ví dụ:** Các ứng dụng gọi xe như Grab hoặc Uber sử dụng Distance Matrix API để cung cấp ước lượng thời gian và chi phí cho chuyến đi, giúp khách hàng có thông tin chính xác trước khi đặt xe.
-   **Quản lý đội xe:**  
    \+ **Mô tả:** Giúp quản lý đội xe theo dõi và tối ưu hóa lộ trình di chuyển của các phương tiện, giảm thiểu thời gian không hoạt động và tối ưu hóa hiệu suất.  
    \+ **Ví dụ:** Một công ty quản lý đội xe có thể sử dụng API này để phân tích và tối ưu hóa các lộ trình hàng ngày của xe tải, xe buýt hoặc taxi, đảm bảo rằng các phương tiện luôn di chuyển trên lộ trình ngắn nhất và hiệu quả nhất.

## **Map**

### **Map load**

**Định nghĩa:** Dùng để chỉ chế độ hiển thị bản đồ trong các ứng dụng hoặc phần mềm. Trong chế độ này, người dùng có thể nhìn thấy hình ảnh bản đồ của một khu vực cụ thể, bao gồm các yếu tố như địa hình, đường phố, tòa nhà, các đặc điểm địa lý khác và có thể tương tác với chúng.

Map load của Goong được thiết kế với **công nghệ Vector tiles** giúp bản đồ hiển thị **sắc nét**, thu nhỏ, phóng to, xoay hay nghiêng bản đồ **chỉ với một chạm.**

**Hỗ trợ trên đa nền tảng:** web, mobile với hơn 100 mẫu giúp lập trình nhanh chóng và dễ dàng.

**Ứng dụng thực tế:**

-   **Ứng dụng vào website doanh nghiệp**  
    \+ **Mô tả:** Website của một doanh nghiệp thể hiện bộ mặt của doanh nghiệp đó trên trang trực tuyến. Bởi vậy ngoài các thông tin cơ bản của doanh nghiệp, sản phẩm, tính năng, dịch vụ cung cấp… thì việc tích hợp bản đồ vị trí của doanh nghiệp ngay trên trang web của công ty là rất quan trọng. Giúp cho khách hàng, đối tác dễ dàng tiếp cận và tìm hiểu về doanh nghiệp hơn, có thể thu nhỏ, phóng to, xoay hay nghiêng bản đồ để xác định vị trí và tìm đường đến doanh nghiệp.  
    \+ **Ví dụ:** Hầu hết các doanh nghiệp đều đang cập nhật vị trí của doanh nghiệp mình lên trên bản đồ và tích hợp bản đồ đó vào ngay trên trang web để khi khách hàng truy cập trang web là có thể dễ dàng xác định được ngay vị trí của doanh nghiệp mình.
-   **Tích hợp lên nền tảng trực tuyến**  
    \+ **Mô tả:** Tạo và nhúng bản đồ vào trang web/ ứng dụng di động/ nền tảng trực tuyến… để hiển thị được các vị trí, địa điểm khác nhau. Thậm trí có thể đặt các marker dưới hình dạng các icon lên trên bản đồ. Có thể tương tác ngay trên bản đồ như: xoay, nghiêng, kéo, dịch sang vị trí khác để hiển thị các khu vực khác.  
    \+ **Ví dụ:** Các ứng dụng đặt xe, giao hàng như Be, Sendo… tích hợp bản đồ lên trên app để hiện thị được cho người dùng vị trí đến, đi, vị trí cửa hàng và quãng đường, lộ trình tài xế giao hàng. Ở mỗi khu vực khác nhau thì bản đồ sẽ hiển thị các địa điểm, vị trí ở bán kính xung quanh khác nhau.

**Cách tích hợp:**

-   **Vào Website:** [Tại đây](https://help.goong.io/kb/website-javascrip-api/)
-   **Vào IOS:** [Tại đây](https://help.goong.io/kb/app/ios/)
-   **Vào Android**: [Tại đây](https://help.goong.io/kb/app/android/)
-   **Với Flutter:** [Tại đây](https://help.goong.io/kb/app/flutter/)
-   **Với React native**: [Tại đây](https://help.goong.io/kb/app/react-native/)

### Static Maps

**Định nghĩa:** [**Static Maps**](https://help.goong.io/kb/static-map/static-map-static-map/staticmap-ban-do-tinh/) hay còn được gọi là _**bản đồ tĩnh**_ (**_bản đồ hiển thị dưới dạng hình ảnh_**). Nó được tạo ra từ các yêu cầu địa chỉ và tọa độ được cung cấp. Điều này cho phép các nhà phát triển và các công ty có thể sử dụng dữ liệu bản đồ để hiển thị trên các trang web hoặc ứng dụng mà không cần phải tạo ra một bản đồ tương tác hoặc một ứng dụng định vị động.

Static Maps là cách đơn giản nhất để hiển thị bản đồ trên trang web hoặc ứng dụng dành cho thiết bị di động. Vì chúng không yêu cầu thư viện bản đồ hoặc SDK và có thể được hiển thị ở bất kỳ đâu, có thể hiển thị hình ảnh, kể cả trong ứng dụng hoặc giao diện người dùng nơi không thể tích hợp bản đồ tương tác. GOONG Static Maps là tập hợp các REST API và thư viện ứng dụng khách để tạo hình ảnh về kiểu GOONG Studio.

Đa phần Static Maps được sử dụng để giảm thời gian tải và thúc đẩy sự tương tác cho người dùng.

![](https://help.goong.io/wp-content/uploads/2024/08/Static-Map.png)

**Ứng dụng thực tế**

-   **Ứng dụng Website và ứng dụng di động:**  
    + **Mô tả:** Tạo và nhúng hình ảnh bản đồ tĩnh vào trang web hoặc ứng dụng di động để hiển thị vị trí cụ thể.  
    \+ **Ví dụ:** Một trang web bất động sản có thể sử dụng Static Maps để hiển thị vị trí của các bất động sản đang bán hoặc cho thuê trên bản đồ, giúp người dùng dễ dàng hình dung vị trí địa lý của các tài sản này.
-   **In ấn và tài liệu:**  
    + **Mô tả:** Sử dụng bản đồ tĩnh trong các tài liệu in ấn hoặc báo cáo để hiển thị vị trí và thông tin địa lý mà không cần kết nối internet.  
    + **Ví dụ:** Các công ty du lịch có thể in bản đồ tĩnh trong các tài liệu quảng cáo hoặc hướng dẫn du lịch để khách hàng có thể tham khảo vị trí các điểm thăm quan.
-   **Email Marketing:**  
    + **Mô tả:** Nhúng bản đồ tĩnh trong email để cung cấp thông tin vị trí một cách rõ ràng và trực quan.  
    \+ **Ví dụ:** Một nhà hàng có thể gửi email marketing cho khách hàng kèm theo bản đồ tĩnh chỉ ra vị trí của nhà hàng để khách hàng dễ dàng tìm thấy.

# KẾT LUẬN

[**Goong Maps API**](https://goong.io/) đang ngày càng khẳng định vai trò quan trọng trong việc cung cấp giải pháp bản đồ phù hợp với nhu cầu đặc thù tại Việt Nam. Chất lượng ổn định và chi phí hợp lý là đặc điểm giúp Goong ngày càng nhận được sự tin tưởng từ phía khách hàng.

Đăng ký dùng thử GOONG để nhận 100$ miễn phí [tại đây](https://account.goong.io/).

Liên hệ hỗ trợ: 0869697502 – 0904522538
