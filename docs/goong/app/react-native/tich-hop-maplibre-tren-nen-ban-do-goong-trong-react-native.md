---
title: "TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ GOONG TRONG REACT NATIVE"
source: https://help.goong.io/kb/app/react-native/tich-hop-maplibre-tren-nen-ban-do-goong-trong-react-native/
updated: 2025-02-19T11:42:00
categories: ["React Native"]
---
# TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ GOONG TRONG REACT NATIVE

> Nguồn: [https://help.goong.io/kb/app/react-native/tich-hop-maplibre-tren-nen-ban-do-goong-trong-react-native/](https://help.goong.io/kb/app/react-native/tich-hop-maplibre-tren-nen-ban-do-goong-trong-react-native/)

## TỔNG QUAN

Map SDK trong React Native cho phép bạn tích hợp bản đồ vào ứng dụng di động của mình. Có nhiều plugin khác nhau và những plugin này hỗ trợ tùy chỉnh bản đồ, phong cách và xử lý sự kiện liên quan.

**Goong Maps React Native** cung cấp Map SDK cho cả thiết bị Android và iOS, cho phép tùy chỉnh bản đồ với nội dung để hiển thị trên các thiết bị di động.  
**Goong Maps Plugin** dựa trên cơ chế của React Native để bổ sung các màn hình hiển thị cho Android và iOS.

Tài liệu dưới đây trình bày cách tích hợp Maplibre trên nền bản đồ của [Goong](http://goong.io) và sử dụng các dịch vụ cơ bản, bao gồm:

-   **Hiện các kiểu bản đồ:** Cơ bản, vệ tinh, tối, sáng,… gắn marker, vẽ vòng tròn bao quanh marker.
-   **Tìm kiếm:** Nhập tên địa chỉ, hiển thị các gợi ý liên quan tới tên địa chỉ nhập, sau khi chọn thì nhảy ra điểm đó trên bản đồ (sử dụng Autocomplete tìm kiếm gợi ý, rồi dùng Place Detail để lấy thông tin tọa độ về địa chỉ đó).
-   **Dẫn đường:** Nhập tọa độ điểm đầu và cuối, hiển thị đường dẫn trên bản đồ, có thông tin về khoảng cách và thời gian di chuyển (Directions với phương tiện di chuyển: car, taxi,..).

## CÁCH TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ [GOONG](https://goong.io/) TRONG REACT NATIVE

### **Các tham số cần thiết**

Cần có:

-   Map Key, API Key: vào trang đăng ký tài khoản và tạo key, xem hướng dẫn tạo key [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

### **Gán MapLibre**

-   **Đầu tiên vào thêm package:**

yarn add @maplibre/maplibre-react-native@10.0.0-alpha.5

-   **Thêm Mapview:**

Để sử dụng Maplibre vào React Native bạn cần:

import MapLibreGL from '@maplibre/maplibre-react-native';
**MapLibreGL**.setAccessToken(null);

-   **Hiển thị bản đồ:**

const App = () => {
  const \[loadMap\] = useState("https://tiles.goong.io/assets/goong\_map\_web.json?api\_key=\\(GoongConstants.API\_KEY)"); 
  /\* Sử dụng Load Map \*/ // Kiểu URL cho bản đồ
  const \[coordinates\] = useState(\[105.83991, 21.028\]); // Vị trí mà bản đồ nên căn giữa. \[lng, lat\]
  const camera = useRef(null);

  return (
    <View style\={{ flex: 1 }}>
      **<MapLibreGL****.MapView**
        styleURL\={loadMap}
        onPress\={handleOnPress}
        style\={{ flex: 1 }}
        projection\="globe" // Phép chiếu được sử dụng khi hiển thị bản đồ
        zoomEnabled\={true}
      >
        **<MapLibreGL.Camera**
          ref\={camera}
          zoomLevel\={6} // Mức thu phóng của bản đồ
          centerCoordinate\={coordinates}
        />
     ** </MapLibreGL.MapView\>**
    </View\>
  );
};

-   Trường hợp muốn thêm bản đồ ít điểm:

https://tiles.goong.io/assets/goong\_map\_highlight.json?api\_key=\\(GoongConstants.API\_KEY)")

-   **Trường hợp muốn thêm bản đồ vệ tinh:**

[https://tiles.goong.io/assets/goong\_satellite.json?api\_key=\\(GoongConstants.API\_KEY)](https://tiles.goong.io/assets/goong_satellite.json?api_key=\\(GoongConstants.API_KEY\))

-   **Bỏ logo của MapLibre:**

mapView.logoView.isHidden = **true**

-   **Thêm marker vào bản đồ:**

**<MapLibreGL.MapView**
        styleURL\={loadMap} // Đường dẫn đến style bản đồ
        style\={{ flex: 1 }} // Đặt kích thước cho bản đồ
      >
        {locations.map((item, index) => (
          **<MapLibreGL.PointAnnotation**
            id\={\`pointID-${index}\`} // ID duy nhất cho mỗi điểm chú thích
            key\={\`pointKey-${index}\`} // Khóa duy nhất cho mỗi điểm chú thích
            coordinate\={item.coord} // Tọa độ của điểm hiển thị
            draggable\={true} // Cho phép kéo điểm chú thích
          >
            {/\* Bạn có thể thêm hình ảnh hoặc biểu tượng vào đây \*/}
            <MapLibreGL.Callout title\={\`Point ${index + 1}\`} />
          </MapLibreGL.PointAnnotation\>
        ))}
</**MapLibreGL.MapView\>**

Trong hàm trên thực hiện 2 việc: gắn marker lên bản đồ, vẽ vòng tròn.

Khi gắn marker thì chỉ cần truyền 2 tham số latitude, longitude.

### **Tìm kiếm địa điểm**

Với bất kỳ tên địa chỉ nào người dùng nhập vào, hiển thị các gợi ý cho người dùng chọn.

-   **Xử lý gọi Autocomplete API:**

const getPlacesAutocomplete = async () => {
    if (search.trim() === '') {
      setDescription(\[\]); // Xóa gợi ý nếu không có đầu vào
      return;
    }

    try {
      let autoComplete = await MapAPI.getPlacesAutocomplete({
        search: encodeURIComponent(search),
      });
      setDescription(autoComplete.predictions);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
};

Khi người dùng nhập tên địa chỉ, thì hàm trên sẽ gọi dịch vụ [Autocomplete](https://document.goong.io/tutorial-Places.html) của Goong để trả về các gợi ý về tên địa chỉ ứng với từ mà người dùng nhập, kèm theo đó là _place\_id_. Sau đó hiển thị những gợi ý lên cho người dùng chọn, khi chọn thì gọi tiếp dịch vụ Place Detail bằng tham số _place\_id_, thì sẽ lấy được tọa độ của điểm này.

-   **Gọi Place Detail API:**

const \_handleSubmit = async (item) => {
  let placeDetail = await MapAPI.getPlaceDetail({
    place\_id: item.item.place\_id,
  });  
  setLocations(\[
    placeDetail.result.geometry.location.lng,
    placeDetail.result.geometry.location.lat,
  \]);
  
  setZoomlevel(14);
};

-   **Với tọa độ của điểm mà người dùng đã chọn, ta sẽ gán marker và view camera:**

<**MapLibreGL.PointAnnotation**
  id="pointDirect"
  key="keymap"
  draggable={true}
  coordinate={currentLocation} // Tọa độ marker 1
/>

{locations.length > 0 ? (
  <**MapLibreGL.PointAnnotation**
    id\="marker1"
    coordinate\={locations} // Tọa độ marker 1
  />
) : null}

**Lưu ý:** Số lần gọi Autocomplete thì cần phải tối ưu, tùy theo nhu cầu của ứng dụng, ví dụ theo kiểu sau 2,3 ký tự mới được gọi hoặc khách nhập nhưng chỉ gọi sau 3s không nhập gì. Vì [Goong](http://goong.io) sẽ tính phí mỗi lần gọi [Autocomplete](https://help.goong.io/kb/rest-api/autocomplete/autocomplete-tu-dong-hoan-thanh-dia-diem/) này.

### **Dẫn đường**

Dẫn đường sử dụng dịch vụ Directions, gửi kèm tọa độ điểm đầu, điểm cuối, phương tiện di chuyển, nhận về mã đường đi, khoảng cách 2 điểm, thời gian đi dự kiến,…

Sau khi khách hàng nhập tọa độ điểm đầu và cuối, gọi dịch vụ Directions của bên Goong sau đó sẽ giải mã đường đi và hiển thị đường đi đó lên bản đồ.

-   **Hàm getDirections gọi dịch vụ của Goong:**

const getDirections = async () => {
  const direction = await MapAPi.getDirections({
    vehicle: 'car',
    origin: currentLocation,
    destination: locations,
  });

  const decodePolyline = (encoded) => {
    const decoded = polyline.decode(encoded);
    return decoded.map(point => ({
      latitude: point\[0\],
      longitude: point\[1\],
    }));
  };

  const coordinates = decodePolyline(
    direction.routes\[0\].overview\_polyline.points,
  );

  setRoute(coordinates);
};

Hàm này sẽ gọi dịch vụ [Directions](https://help.goong.io/kb/rest-api/direction/direction-tinh-toan-khoang-cach-va-chi-duong/) của [Goong](http://goong.io), bằng cách truyền tham số tọa độ điểm đầu và cuối, phương tiện di chuyển (ở đây lấy car), và sẽ lấy ra được đường (route), khoảng cách 2 điểm (distance), thời gian đi dự kiến (time),…

-   **Hiển thị đường đó lên bản đồ:**

**<MapLibreGL.ShapeSource**
  id="lineSource"
  shape={{
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: route.map(coord => \[
        coord.longitude,
        coord.latitude,
      \]),
    },
  }}
>
  **<****MapLibreGL**.**LineLayer**
    id\="lineLayer"
    style\={{
      lineColor: '#2E64FE',
      lineWidth: 10,
      lineCap: 'round', // Thêm thuộc tính lineCap
      lineJoin: 'round', // Thêm thuộc tính lineJoin
    }}
  />
**</MapLibreGL.ShapeSource\>**

-   **Tham khảo ví dụ mẫu tại đây:** [goong-sample-reactnative-maplibre](https://help.goong.io/wp-content/uploads/2024/10/goong-sample-reactnative-maplibre.zip)
-   **Tham khảo tài liệu tích hợp và các hàm:** [https://github.com/maplibre/maplibre-react-native](https://github.com/maplibre/maplibre-react-native)
