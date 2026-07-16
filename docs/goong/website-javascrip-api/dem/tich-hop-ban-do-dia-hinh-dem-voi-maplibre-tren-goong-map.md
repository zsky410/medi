---
title: "TÍCH HỢP BẢN ĐỒ ĐỊA HÌNH (DEM) VỚI MAPLIBRE TRÊN GOONG MAP"
source: https://help.goong.io/kb/website-javascrip-api/dem/tich-hop-ban-do-dia-hinh-dem-voi-maplibre-tren-goong-map/
updated: 2026-01-16T17:21:01
categories: ["DEM"]
---
# TÍCH HỢP BẢN ĐỒ ĐỊA HÌNH (DEM) VỚI MAPLIBRE TRÊN GOONG MAP

> Nguồn: [https://help.goong.io/kb/website-javascrip-api/dem/tich-hop-ban-do-dia-hinh-dem-voi-maplibre-tren-goong-map/](https://help.goong.io/kb/website-javascrip-api/dem/tich-hop-ban-do-dia-hinh-dem-voi-maplibre-tren-goong-map/)

## TỔNG QUAN

Tài liệu này hướng dẫn cách tích hợp **dữ liệu địa hình (Digital Elevation Model – DEM)** vào bản đồ Goong khi sử dụng **MapLibre**, nhằm mở rộng khả năng hiển thị và phân tích không gian địa lý trên nền bản đồ web. Nội dung tập trung vào quy trình khởi tạo bản đồ Goong với MapLibre, bổ sung nguồn dữ liệu DEM dạng `raster-dem`, hiển thị hiệu ứng đổ bóng địa hình (hillshade) và kích hoạt `TerrainControl` để cho phép bật hoặc tắt chế độ địa hình trong quá trình sử dụng.

Bên cạnh đó, tài liệu cũng làm rõ cách xử lý vòng đời của style trong MapLibre, đảm bảo các thành phần DEM và terrain hoạt động ổn định ngay cả khi style bị reload hoặc thay đổi thông qua `setStyle`.

Giải pháp này đặc biệt phù hợp cho các ứng dụng cần trực quan hoá địa hình, phân tích độ cao cũng như các bài toán hiển thị không gian 3D ở mức terrain trên nền bản đồ web.

## 1\. Khởi tạo bản đồ MapLibre

Bước đầu tiên là khởi tạo MapLibre với style bản đồ Goong ở trạng thái bình thường.  
**Chưa thêm dữ liệu DEM ở bước này**, vì style của MapLibre được load bất đồng bộ. Nếu thêm source hoặc layer DEM khi style chưa sẵn sàng sẽ gây lỗi.

const map = new maplibregl.Map({
  container: "map",
  style: \`https://tiles.goong.io/assets/goong\_map\_web.json?api\_key=${mapKey}\`,
  zoom: zoom,
  center: center,
});

Việc tách riêng bước khởi tạo bản đồ giúp đảm bảo style được load hoàn chỉnh trước khi bổ sung các thành phần liên quan đến địa hình.

## 2.**Thêm source raster-dem**

Trong MapLibre, mỗi lần gọi `map.setStyle()` sẽ khiến toàn bộ **source** và **layer** trong style hiện tại bị khởi tạo lại. Vì vậy, các thành phần liên quan đến dữ liệu địa hình (DEM) cần được thêm **sau khi style đã load hoàn chỉnh**, thông qua sự kiện `style.load`.

```js
map.on("style.load", () => {
```

**Trong đoạn code trên:**

-   `ensureTerrainResources()` đảm bảo source DEM và layer hillshade luôn tồn tại sau mỗi lần style reload
    
-   `TerrainControl` chỉ được thêm **một lần duy nhất**, tránh việc bị add trùng khi style được thay đổi nhiều lần
    

## 3\. Thêm DEM source và hillshade layer

Việc thêm DEM và hillshade được gom trong một hàm riêng để có thể gọi lại mỗi khi style được load lại.

function ensureTerrainResources() {
  const DEM\_SOURCE\_ID = "terrainSource";
  const HILLSHADE\_LAYER\_ID = "goong-hillshade";
  // 3.1 Thêm source raster-dem
  if (!map.getSource(DEM\_SOURCE\_ID)) {
    map.addSource(DEM\_SOURCE\_ID, {
      type: "raster-dem",
      tiles: \[\`https://dem.goong.io/{z}/{x}/{y}.png?api\_key=${mapKey}\`\],
      tileSize: 256,
      maxzoom: 15,
      encoding: "terrarium",
    });
  }
  // 3.2 Thêm layer hillshade từ DEM
  if (!map.getLayer(HILLSHADE\_LAYER\_ID)) {
    const labelLayerId = map
      .getStyle()
      .layers?.find(
        (l) => l.type === "symbol" && l.layout?.\["text-field"\]
      )?.id;
    map.addLayer(
      {
        id: HILLSHADE\_LAYER\_ID,
        type: "hillshade",
        source: DEM\_SOURCE\_ID,
        paint: {
          "hillshade-exaggeration": 0.6,
          "hillshade-shadow-color": "#473B24",
          "hillshade-highlight-color": "#ffffff",
          "hillshade-accent-color": "#888888",
        },
      },
      labelLayerId
    );
  }
}

  
Source `raster-dem` cung cấp dữ liệu độ cao cho bản đồ, là cơ sở để hiển thị hillshade và kích hoạt terrain (địa hình nổi).
