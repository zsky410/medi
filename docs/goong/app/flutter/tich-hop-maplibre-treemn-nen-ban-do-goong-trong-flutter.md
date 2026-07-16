---
title: "TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ GOONG TRONG FLUTTER"
source: https://help.goong.io/kb/app/flutter/tich-hop-maplibre-treemn-nen-ban-do-goong-trong-flutter/
updated: 2025-05-07T18:12:06
categories: ["Flutter"]
---
# TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ GOONG TRONG FLUTTER

> Nguồn: [https://help.goong.io/kb/app/flutter/tich-hop-maplibre-treemn-nen-ban-do-goong-trong-flutter/](https://help.goong.io/kb/app/flutter/tich-hop-maplibre-treemn-nen-ban-do-goong-trong-flutter/)

## TỔNG QUAN

Map SDK trong Flutter cho phép bạn tích hợp bản đồ vào ứng dụng di động của mình. Có nhiều plugin khác nhau và những plugin này hỗ trợ tùy chỉnh bản đồ, phong cách và xử lý sự kiện liên quan.

**Goong Maps Flutter** cung cấp Map SDK cho cả thiết bị Android và iOS, cho phép tùy chỉnh bản đồ với nội dung để hiển thị trên các thiết bị di động.  
**Goong Maps Plugin** dựa trên cơ chế của Flutter để bổ sung các màn hình hiển thị cho Android và iOS.

Tài liệu dưới đây trình bày cách tích hợp Maplibre trên nền bản đồ của [Goong](http://Goong.io) và sử dụng các dịch vụ cơ bản, bao gồm:

-   **Hiện các kiểu bản đồ:** Cơ bản, vệ tinh, tối, sáng,… gắn marker, vẽ vòng tròn bao quanh marker.
-   **Tìm kiếm:** Nhập tên địa chỉ, hiển thị các gợi ý liên quan tới tên địa chỉ nhập, sau khi chọn thì nhảy ra điểm đó trên bản đồ (sử dụng Autocomplete tìm kiếm gợi ý, rồi dùng Place Detail để lấy thông tin tọa độ về địa chỉ đó).
-   **Dẫn đường:** Nhập tọa độ điểm đầu và cuối, hiển thị đường dẫn trên bản đồ, có thông tin về khoảng cách và thời gian di chuyển (Directions với phương tiện di chuyển: car, taxi,..).

## CÁCH TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ GOONG TRONG FLUTTER

### **Các tham số cần thiết**

Trước hết bạn phải có tài khoản và key của Goong Maps, hướng dẫn chi tiết [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

### **Gán Maplibre**  

-   **Đầu tiên vào mở “Terminal” copy nội dung dưới đây vào để add package:**

flutter pub add maplibre\_gl

hoặc thêm trực tiếp dưới dạng phụ thuộc vào tệp **“pubspec.yaml”** của bạn:

dependencies:
  maplibre\_gl: ^0.19.0

-   **Thêm Mapview của Goong:**

MapLibreMap(
  onMapCreated: \_onMapCreated,
  onStyleLoadedCallback: \_onStyleLoadedCallback,
  initialCameraPosition: CameraPosition(
    target: LatLng(21.03357551700003, 105.81911236900004),
    zoom: 14.0,
  ),
)

-   **Trường hợp thêm bản đồ ít icon**

https://tiles.goong.io/assets/goong\_map\_highlight.json?api\_key=<MAP\_TILE\_KEY>

-   **Thêm bản đồ vệ tinh:**

https://tiles.goong.io/assets/goong\_satellite.json?api\_key=<MAP\_TILE\_KEY>

-   **Bỏ logo của Maplibre:**

 attributionButtonPosition: null

-   **Chỉnh camera vào vị trí hiện tại:**

CameraPosition(
  target: LatLng(21.03357551700003,105.81911236900004),
  zoom: 14.0,
)

-   **Thêm marker vào bản đồ:**

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

    print("Marker added at ($\_destinationPoint)");

    // Di chuyển camera đến vị trí mới
    mapController!.animateCamera(
      CameraUpdate.newLatLng(\_destinationPoint!),
    );
  } catch (e) {
    print("Error adding marker: $e");
  }
}

Khi gắn marker thì chỉ cần truyền 2 tham số latitude, longitude.

### **Tìm kiếm địa điểm**

Với bất kỳ tên địa chỉ nào người dùng nhập vào, hiển thị các gợi ý cho người dùng chọn.

-   **Xử lý gọi Autocomplete API:**

Future<void> \_fetchData(String input) async {
    try {
        final url = Uri.parse('https://rsapi.goong.io/Place/AutoComplete?location=21.013715429594125%2C%20105.79829597455202&input=$input&api\_key=<API\_KEY>); 
        var response = await http.get(url);
        final jsonResponse = jsonDecode(response.body);        setState(() {
        final jsonResponse = jsonDecode(response.body);
        places = jsonResponse\['predictions'\] as List<dynamic>;
        // \_circleAnnotationManager?.deleteAll();
        isShow = true;
        isHidden = true;
       });
    } catch (e) {
       // ignore: avoid\_print
       print('$e');
    }
}

Khi người dùng nhập tên địa chỉ, thì hàm trên sẽ gọi dịch vụ [Autocomplete](https://document.goong.io/tutorial-Places.html) của Goong để trả về các gợi ý về tên địa chỉ ứng với từ mà người dùng nhập, kèm theo đó là _place\_id_. Sau đó hiển thị những gợi ý lên cho người dùng chọn, khi chọn thì gọi tiếp dịch vụ Place Detail bằng tham số _place\_id_, thì sẽ lấy được tọa độ của điểm này.

-   **Gọi Place Detail API:**

Future<void> \_fetchDataPlaceDetail() async {
  final url = Uri.parse(
      'https://rsapi.goong.io/place/detail?place\_id=${coordinate\['place\_id'\]}&api\_key=<API\_KEY>');
  
  var response = await http.get(url);
  final jsonResponse = jsonDecode(response.body);
  details = jsonResponse\['result'\];

  setState(() {
    \_destinationPoint = LatLng(
      details\['geometry'\]\['location'\]\['lat'\],
      details\['geometry'\]\['location'\]\['lng'\]
    );
    
    \_addMarkerAtDestinationPoint(); // Thêm marker sau khi cập nhật \_destinationPoint
  });

  \_searchController.text = coordinate\['description'\];
  mainText = coordinate\['structured\_formatting'\]\['main\_text'\];
  secondText = coordinate\['structured\_formatting'\]\['secondary\_text'\];
}

-   **Thêm marker:**

void \_addMarkerAtDestinationPoint() async {
  if (mapController == null) {
    return;
  }

  if (\_destinationPoint == null) {
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
    mapController!.animateCamera(
      CameraUpdate.newLatLng(\_destinationPoint!),
    );
  } catch (e) {
    print("Error adding marker: $e");
  }
}

**Lưu ý**: Số lần gọi [Autocomplete](https://document.goong.io/tutorial-Places.html) thì cần phải tối ưu, tùy theo nhu cầu của ứng dụng, ví dụ theo kiểu sau 2,3 ký tự mới được gọi hoặc khách nhập nhưng chỉ gọi sau 3s không nhập gì. Vì [Goong](http://Goong.io) sẽ tính phí mỗi lần gọi [Autocomplete](https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/) này.

-   **Xoá marker:**

await mapController!.removeSymbol(\_currentMarker!);

### **Dẫn đường**

Dẫn đường sử dụng dịch vụ Directions, gửi kèm tọa độ điểm đầu, điểm cuối, phương tiện di chuyển, nhận về mã đường đi, khoảng cách 2 điểm, thời gian đi dự kiến,…

Sau khi khách hàng nhập tọa độ điểm đầu và cuối, gọi dịch vụ Directions của bên [Goong](http://Goong.io) sau đó sẽ giải mã đường đi và hiển thị đường đi đó lên bản đồ.

-   **Hàm “fetchdatadirection” gọi dịch vụ của Goong:**

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

Hàm này sẽ gọi dịch vụ [Directions](https://help.goong.io/kb/rest-api/direction/direction-tinh-toan-khoang-cach-va-chi-duong/) của [Goong](http://Goong.io), bằng cách truyền tham số tọa độ điểm đầu và cuối, phương tiện di chuyển (ở đây lấy car), và sẽ lấy ra được đường (route), khoảng cách 2 điểm (distance), thời gian đi dự kiến (time),…

-   **Decodepolyline:**

Giải mã đường đi (route).

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

  // Thêm source
  mapController?.addSource(
    "line\_source",
    GeojsonSourceProperties(
      data: geoJsonData,
    ),
  );

  // Thêm layer
  mapController?.addLineLayer(
    "line\_source",
    "line\_layer",
    LineLayerProperties(
      lineColor: "#0000FF", // Màu xanh dưới dạng chuỗi
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

-   **Tham khảo ví dụ mẫu tại đây:** [goong\_sample\_flutter\_maplibre](<https://help.goong.io/wp-content/uploads/2025/05/goong_sample_flutter_maplibre \(1\).zip>)
-   **Tham khảo cách tích hợp và các hàm**: [https://github.com/maplibre/flutter-maplibre-gl](https://github.com/maplibre/flutter-maplibre-gl)
