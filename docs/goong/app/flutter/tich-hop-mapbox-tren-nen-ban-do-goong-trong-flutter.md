---
title: "TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG FLUTTER"
source: https://help.goong.io/kb/app/flutter/tich-hop-mapbox-tren-nen-ban-do-goong-trong-flutter/
updated: 2025-02-07T11:29:22
categories: ["Flutter"]
---
# TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG FLUTTER

> Nguồn: [https://help.goong.io/kb/app/flutter/tich-hop-mapbox-tren-nen-ban-do-goong-trong-flutter/](https://help.goong.io/kb/app/flutter/tich-hop-mapbox-tren-nen-ban-do-goong-trong-flutter/)

## TỔNG QUAN

Map SDK trong Flutter cho phép bạn tích hợp bản đồ vào ứng dụng di động của mình. Có nhiều plugin khác nhau và những plugin này hỗ trợ tùy chỉnh bản đồ, phong cách và xử lý sự kiện liên quan.

**Goong Maps Flutter** cung cấp Map SDK cho cả thiết bị Android và iOS, cho phép tùy chỉnh bản đồ với nội dung để hiển thị trên các thiết bị di động.  
**Goong Maps Plugin** dựa trên cơ chế của Flutter để bổ sung các màn hình hiển thị cho Android và iOS.

Tài liệu dưới đây trình bày cách tích hợp Mapbox trên nền bản đồ của [Goong](http://Goong.io), và sử dụng các dịch vụ cơ bản, bao gồm:

-   **Hiện các kiểu bản đồ:** Cơ bản, vệ tinh, tối, sáng,… gắn marker, vẽ vòng tròn bao quanh marker.
-   **Tìm kiếm:** Nhập tên địa chỉ, hiển thị các gợi ý liên quan tới tên địa chỉ nhập, sau khi chọn thì nhảy ra điểm đó trên bản đồ (sử dụng Autocomplete tìm kiếm gợi ý, rồi dùng Place Detail để lấy thông tin tọa độ về địa chỉ đó).
-   **Dẫn đường:** Nhập tọa độ điểm đầu và cuối, hiển thị đường dẫn trên bản đồ, có thông tin về khoảng cách và thời gian di chuyển (Directions với phương tiện di chuyển: car, taxi,..).

## CÁCH TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ [GOONG](http://goong.io) TRONG FLUTTER

### **Các tham số cần thiết**

Cần có:

-   Map Key, API Key: vào trang đăng ký tài khoản và tạo key, xem hướng dẫn tạo key [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

### **Gán Mapbox** 

-   Vào [https://account.mapbox.com/](https://account.mapbox.com/) để đăng ký tài khoản Mapbox để cấp MAPBOX\_ACCESS\_TOKEN.

-   Sau khi đăng ký tài khoản bạn vào mục **“Token”:**

![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.00.28-300x23.png)

-   Tiếp sau đó chọn **“Create token”:**

![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.05.11-300x76.png)

-   Bạn chọn theo mẫu sau:

![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.08.21-300x167.png)

**Lưu ý**: Bắt buộc phải chọn **“DOWNLOADS:READ”**

-   Ấn “**Create Token”** để tạo token”

**Lưu ý:** Token sẽ có dạng sk. …

### **Cấu hình** **Android**

-   Tìm hoặc tạo tệp **“properties”** trong thư mục người dùng **“Gradle”** của bạn. Thư mục này nằm tại **“«USER\_HOME»/.gradle”**. Sau khi bạn tìm thấy hoặc tạo tệp, đường dẫn của nó sẽ là **“«USER\_HOME»/.gradle/gradle.properties”**. Thông tin chi tiết về các thuộc tính của **Gradle** có thể được tìm thấy trong tài liệu chính thức của **Gradle**.
-   Thêm mã token của bạn vào tệp **“gradle.properties”**:
    
    SDK\_REGISTRY\_TOKEN=YOUR\_SECRET\_MAPBOX\_ACCESS\_TOKEN
    

### **Cấu hình iOS**

-    **Xác minh “.netrc”:**

machine api.mapbox.com

login mapbox

password sk.ey...

-   **Cấu hình token:**

Bạn có thể truyền token của mình cho môi trường khi xây dựng, chạy hoặc khởi động ứng dụng Flutter.

Bạn có thể truyền token truy cập công khai bằng cách sử dụng **“–dart-define”** khi chạy lệnh **“flutter build”** hoặc **“flutter run”** trên dòng lệnh:

$ flutter build <platform> --dart-define ACCESS\_TOKEN=YOUR\_PUBLIC\_MAPBOX\_ACCESS\_TOKEN
$ flutter run --dart-define ACCESS\_TOKEN=pk.eyJ1I...

Nếu bạn đang sử dụng Visual Studio Code, bạn có thể cấu hình tệp **“launch.json”** để thêm tham số **“–dart-define”** và mỗi khi ứng dụng được khởi động, tham số này sẽ được áp dụng.

{   
 "configurations": \[    
    {     
       "name": "Flutter",      
      "request": "launch",   
         "type": "dart",  
          "program": "lib/main.dart",   
         "args": \[  
            "--dart-define",   
             "ACCESS\_TOKEN=YOUR\_PUBLIC\_MAPBOX\_ACCESS\_TOKEN"  
          \], 
       }  
  \]
}

-   **Sau đó, lấy token từ môi trường trong ứng dụng và thiết lập nó thông qua “MapboxOptions” ở file “main.dart”:**

String ACCESS\_TOKEN = String.fromEnvironment("ACCESS\_TOKEN");
MapboxOptions.setAccessToken(ACCESS\_TOKEN);...

-   **Thêm dependency:**

Để sử dụng Maps SDK cho Flutter, hãy thêm phụ thuộc git vào tệp **“pubspec.yaml”**:

...dependencies:

mapbox\_maps\_flutter: ^2.0.0

...

-   **Trường hợp muốn thêm bản đồ ít icon:**

https://tiles.goong.io/assets/goong\_map\_highlight.json?api\_key=<MAP\_TILE\_KEY>

-   **Trường hợp muốn thêm bản đồ về tinh:**

https://tiles.goong.io/assets/goong\_satellite.json?api\_key=<MAP\_TILE\_KEY>

-   **Bỏ logo của Mapbox:**

attributionButtonPosition: null

-   **Chỉnh camera vào vị trí đang đứng:**

CameraPosition(
  target: LatLng(21.03357551700003, 105.81911236900004),
  zoom: 14.0,
)

-   **Thêm marker vào bản đồ:**

void \_addMarkerAtCurrentPosition() async {
  if (mapController == null) {
    print("Map controller is not initialized");
    return;
  }

  const initialLatitude = 21.03357551700003;
  const initialLongitude = 105.81911236900004;

  try {
    // Thêm hình tròn vào vị trí hiện tại
    mapController?.addCircle(
      CircleOptions(
        geometry: LatLng(initialLatitude, initialLongitude),
        circleRadius: 100.0,
        circleColor: "#848484",
        circleOpacity: 0.3,
        circleStrokeWidth: 2,
        circleStrokeColor: "#848484",
      ),
    );

    // Thêm marker lên trên hình tròn
    mapController?.addSymbol(
      SymbolOptions(
        geometry: LatLng(initialLatitude, initialLongitude),
        iconImage: 'location',
        iconSize: 0.3,
        zIndex: 1, // Đảm bảo marker ở trên hình tròn
      ),
    );

    print("Initial marker added at ($initialLatitude, $initialLongitude)");
  } catch (e) {
    print("Error adding initial marker: $e");
  }
}

-   Trong hàm trên thực hiện 2 việc: gắn marker lên bản đồ, vẽ vòng tròn.
-   Khi gắn marker thì chỉ cần truyền 2 tham số latitude, longitude.
-   Khi vẽ đường tròn: bản chất là vẽ 1 lớp layer có vòng tròn được tô màu, rồi sử dụng **“addCircle”** để hiển thị nó lên bản đồ.

### **Tìm kiếm địa điểm**

-   **Xử lý gọi Autocomplete API:**

Với bất kỳ tên địa chỉ nào người dùng nhập vào, hiển thị các gợi ý cho người dùng chọn.

Future<void> \_fetchData(String input) async {
  try {
    final url = Uri.parse(
      'https://rsapi.goong.io/Place/AutoComplete?location=21.013715429594125%2C%20105.79829597455202&input=$input&api\_key=<API\_KEY>'
    );

    var response = await http.get(url);
    final jsonResponse = jsonDecode(response.body);
    print(jsonResponse);

    setState(() {
      final jsonResponse = jsonDecode(response.body);
      places = jsonResponse\['predictions'\] as List<dynamic>;
      print('url $url, size: ${places.length}');

      // \_circleAnnotationManager?.deleteAll();
      isShow = true;
      isHidden = true;
    });
  } catch (e) {
    // ignore: avoid\_print
    print('$e');
  }
}

Khi người dùng nhập tên địa chỉ, thì hàm trên sẽ gọi dịch vụ [Autocomplete](https://document.goong.io/tutorial-Places.html) của [Goong](http://Goong.io) để trả về các gợi ý về tên địa chỉ ứng với từ mà người dùng nhập, kèm theo đó là _place\_id_. Sau đó hiển thị những gợi ý lên cho người dùng chọn, khi chọn thì gọi tiếp dịch vụ Place Detail bằng tham số _place\_id_, thì sẽ lấy được tọa độ của điểm này.

-   **Gọi Place Detail API:**

Future<void> \_fetchDataPlaceDetail() async {
  final url = Uri.parse(
    'https://rsapi.goong.io/place/detail?place\_id=${coordinate\['place\_id'\]}&api\_key=<API\_KEY>'
  );

  var response = await http.get(url);
  final jsonResponse = jsonDecode(response.body);
  details = jsonResponse\['result'\];

  setState(() {
    \_destinationPoint = LatLng(
      details\['geometry'\]\['location'\]\['lat'\],
      details\['geometry'\]\['location'\]\['lng'\],
    );
    \_addMarkerAtDestinationPoint(); // Thêm marker sau khi cập nhật \_destinationPoint
  });

  \_searchController.text = coordinate\['description'\];
  mainText = coordinate\['structured\_formatting'\]\['main\_text'\];
  secondText = coordinate\['structured\_formatting'\]\['secondary\_text'\];
}

-   **Với tọa đồ của điểm mà người dùng đã chọn, ta sẽ gán marker và view camera sẽ dùng “\_addMarkerAtDestinationPoint”:**

void \_addMarkerAtDestinationPoint() async {
  if (mapController == null) {
    print("Map controller is not initialized");
    return;
  }

  if (\_destinationPoint == null) {
    print("Destination point is not set");
    return;
  }

  try {
    // Xóa marker hiện tại nếu có
    if (\_currentMarker != null) {
      await mapController!.removeSymbol(\_currentMarker!);
    }

    // Thêm marker mới
    \_currentMarker = await mapController!.addSymbol(
      SymbolOptions(
        geometry: \_destinationPoint!,
        iconImage: 'locationEnd',
        iconSize: 0.3,
      ),
    );

    // Di chuyển camera đến vị trí mới
    mapController!.animateCamera(CameraUpdate.newLatLng(\_destinationPoint!));
  } catch (e) {
    print("Error adding marker: $e");
  }
}

**Lưu ý:** Số lần gọi [Autocomplete](https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/) thì cần phải tối ưu, tùy theo nhu cầu của ứng dụng, ví dụ theo kiểu sau 2,3 ký tự mới được gọi hoặc khách nhập nhưng chỉ gọi sau 3s không nhập gì. Vì [Goong](http://Goong.io) sẽ tính phí mỗi lần gọi Autocomplete này.

-   **Xoá marker:**

await mapController!.removeSymbol(\_currentMarker!);

### **Dẫn đường**

Dẫn đường sử dụng dịch vụ Directions, gửi kèm tọa độ điểm đầu, điểm cuối, phương tiện di chuyển, nhận về mã đường đi, khoảng cách 2 điểm, thời gian đi dự kiến,… Sau khi khách hàng nhập tọa độ điểm đầu và cuối, gọi dịch vụ [Directions](https://help.goong.io/kb/rest-api/direction/direction-tinh-toan-khoang-cach-va-chi-duong/) của Goong sau đó sẽ giải mã đường đi và hiển thị đường đi đó lên bản đồ.

-   **Hàm \_fetchDataDirection gọi dịch vụ của Goong:**

Future<void> \_fetchDataDirection() async {
  if (\_currentPosition != null && \_destinationPoint != null) {
    final url = Uri.parse(
      'https://rsapi.goong.io/Direction?origin=${\_currentPosition!.latitude},${\_currentPosition!.longitude}&destination=${\_destinationPoint!.latitude},${\_destinationPoint!.longitude}&vehicle=bike&api\_key=<API\_KEY>'
    );

    var response = await http.get(url);
    final jsonResponse = jsonDecode(response.body);
    var route = jsonResponse\['routes'\]\[0\]\['overview\_polyline'\]\['points'\];

    List<PointLatLng> result = polylinePoints.decodePolyline(route);
    List<List<double>> coordinates = result.map((point) => \[point.longitude, point.latitude\]).toList();

    \_drawLine(coordinates);
  }
}

Hàm này sẽ gọi dịch vụ Directions của [Goong](http://goong.io), bằng cách truyền tham số tọa độ điểm đầu và cuối, phương tiện di chuyển (ở đây lấy car), và sẽ lấy ra được đường (route), khoảng cách 2 điểm (distance), thời gian đi dự kiến (time),…

-   **Sau đó cần giải mã đường đi (route):**

List<PointLatLng> result = polylinePoints.decodePolyline(route);
List<List<double>> coordinates = result.map((point) => \[point.longitude, point.latitude\]).toList();

Giải mã ra được 1 mảng các tọa độ điểm mà đường sẽ đi qua.

-   **Hiển thị đường đó lên bản đồ:**

void \_drawLine(List<List<double>> coordinates) {
  mapController?.removeLayer("line\_layer");
  mapController?.removeSource("line\_source");

  final geoJsonData = {
    "type": "FeatureCollection",
    "features": \[
      {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": coordinates,
        },
      },
    \],
  };

  mapController?.addSource(
    "line\_source",
    GeojsonSourceProperties(
      data: geoJsonData,
    ),
  );

  mapController?.addLineLayer(
    "line\_source",
    "line\_layer",
    LineLayerProperties(
      lineColor: "#0000FF",
      lineWidth: 10,
      lineCap: "round",
      lineJoin: "round",
    ),
  );
}

Hàm trên thực hiện vẽ đường từ điểm hiện tại đến điểm đến.

-   **Để xoá dẫn đường dùng:**

mapController?.removeLayer("line\_layer");
mapController?.removeSource("line\_source");

-   **Tham khảo ví dụ mẫu tại đây**: [goong\_sample\_flutter Mapbox](https://help.goong.io/wp-content/uploads/2024/10/goong_sample_flutter-Mapbox.zip)
-   **Tham khảo cách tích hợp và các hàm**: [https://docs.mapbox.com/flutter/maps/guides/](https://docs.mapbox.com/flutter/maps/guides/)
