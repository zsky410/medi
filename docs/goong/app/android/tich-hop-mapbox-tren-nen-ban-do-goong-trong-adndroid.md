---
title: "TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG ANDROID"
source: https://help.goong.io/kb/app/android/tich-hop-mapbox-tren-nen-ban-do-goong-trong-adndroid/
updated: 2025-02-07T14:09:54
categories: ["Android"]
---
# TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG ANDROID

> Nguồn: [https://help.goong.io/kb/app/android/tich-hop-mapbox-tren-nen-ban-do-goong-trong-adndroid/](https://help.goong.io/kb/app/android/tich-hop-mapbox-tren-nen-ban-do-goong-trong-adndroid/)

## TỔNG QUAN

Tài liệu dưới đây trình bày cách tích hợp Mapbox trên nền bản đồ của Goong, và sử dụng các dịch vụ cơ bản của Goong, bao gồm:

-   **Hiện các kiểu bản đồ:** Cơ bản, vệ tinh, tối, sáng,… gắn marker, vẽ vòng tròn bao quanh marker.
-   **Tìm kiếm:** Nhập tên địa chỉ, hiển thị các gợi ý liên quan tới tên địa chỉ nhập, sau khi chọn thì nhảy ra điểm đó trên bản đồ.
-   **Dẫn đường:** Nhập tọa độ điểm đầu và cuối, hiển thị đường dẫn trên bản đó, có thông tin về khoảng và thời gian di chuyển.

## CÁC BƯỚC TÍCH HỢP

### **Khởi tạo và các thông số cần thiết**

**Gán Mapbox vào Android:**

-   -   Vào [https://account.mapbox.com/](https://account.mapbox.com/) để đăng ký tài khoản Mapbox để cấp YOUR\_SECRET\_MAPBOX\_ACCESS\_TOKEN.
    
    -   Sau khi đăng ký tài khoản bạn vào mục **“Token”:**
    
    ![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.00.28-300x23.png)
    
    -   Tiếp sau đó chọn **“Create token”:**
    
    ![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.05.11-300x76.png)
    
    -   Bạn chọn theo mẫu sau:
    
    ![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.08.21-300x167.png)
    
    **Lưu ý**: bắt buộc phải chọn “**DOWNLOADS:READ”**
    
    -   Ấn “**Create Token”** để tạo token
    
    **Lưu ý:** token sẽ có dạng sk. …
    

-   -   Gắn access token vào project: [https://docs.mapbox.com/android/legacy/maps/guides/install/](https://docs.mapbox.com/android/legacy/maps/guides/install/)
    -   Config key tại file **“strings.xml”** và file **“gradle.properties”**:

<resources xmlns:tools\="http://schemas.android.com/tools"\>
    <string name\="app\_name"\>goong-mapbox</string\>
    <string name\="mapbox\_access\_token" translatable\="false" tools:ignore\="UnusedResources"\>YOUR\_MAPBOX\_TOKEN</string\>
    <string name\="goong\_api\_url"\>https://rsapi.goong.io/</string\>
    <string name\="goong\_map\_url"\>https://tiles.goong.io</string\>
    <string name\="goong\_api\_key"\>YOUR\_API\_KEY</string\>
    <string name\="goong\_map\_key"\>YOUR\_MAP\_KEY</string\>
</resources\>

 # Project-wide Gradle settings.

# Specifies the JVM arguments used for the daemon process. 
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8 

# When configured, Gradle will run in incubating parallel mode. 
# Uncomment the following line to enable parallel builds.
# org.gradle.parallel=true 

# Use AndroidX packages
android.useAndroidX=true 

# Kotlin code style for this project: "official" or "obsolete"
kotlin.code.style=official 

# Enables namespacing of each library's R class 
android.nonTransitiveRClass=true 

# Replace with your Mapbox token
MAPBOX\_DOWNLOADS\_TOKEN=YOUR\_MAPBOX\_TOKEN

### Các API được sử dụng

-   **API tìm kiếm (Autocomplete):**

https://rsapi.goong.io/Place/AutoComplete?api\_key={{api\_key}} &location=21.013715429594125%2C%20105.79829597455202&input=H%C3%A0%20N%E1%BB%99i

-   **API lấy chi tiết địa điểm (Place Detail):**

https://rsapi.goong.io//Place/Detail?api\_key={{api\_key}} &place\_id=KS1l5qA4VOcn9IGw1oYZNO5ehPpQbZoT\_MXVhz1VUkJQxyQaIyBh8zPa3ZNYCg4MjjUFXF4o\_%2FNeuGarUuEvXA%3D%3D.ZXhwYW5kMA%3D%3D\\

-   **API điều hướng (Directions):**

[https://rsapi.goong.io//Direction?origin=21.029579719995272%2C105.85242472181584&destination=20.9409074%2C106.2832288&vehicle=car&api\_key={{api\_key}}](https://rsapi.goong.io/Direction?origin=21.029579719995272%2C105.85242472181584&destination=20.9409074%2C106.2832288&vehicle=car&api_key=%7b%7bapi_key%7d%7d)

-   Xem chi tiết tại link: [https://document.goong.io/tutorial-Rest-Api.html](https://help.goong.io/kb/rest-api/)
-   **Khai báo các API:**

Sử dụng Retrofit để gọi sang API của Goong

-   **Add dependencies:**

implementation 'com.squareup.retrofit2:retrofit:2.6.4'
implementation 'com.squareup.retrofit2:converter-gson:2.6.4'

-   **Khởi tạo Retrofit instance:**

public class RetrofitInstance {
    private static Retrofit retrofit;

    public static Retrofit getRetrofitInstance(String url) {
        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .baseUrl(url)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}

-   **Tạo service để call API:**

package com.example.mapbox.api;

import com.example.mapbox.response.AutoCompleteResponse;
import com.example.mapbox.response.DirectionResponse;
import com.example.mapbox.response.PlaceByLatLngResponse;
import com.example.mapbox.response.PlaceDetailResponse;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface IApiService {
    
    @GET("/Place/AutoComplete")
    Call<AutoCompleteResponse> getAutoComplete(
            @Query("input") String input,
            @Query("api\_key") String apiKey
    );

    @GET("/Place/Detail")
    Call<PlaceDetailResponse> getPlaceDetail(
            @Query("place\_id") String placeId,
            @Query("api\_key") String apiKey
    );

    @GET("/Direction")
    Call<DirectionResponse> getDirection(
            @Query("origin") String origin,
            @Query("destination") String destination,
            @Query("vehicle") String vehicle,
            @Query("api\_key") String apiKey
    );
}

## TÍCH HỢP CÁC TÍNH NĂNG

### **Gắn Marker**

public void onMapReady(@NonNull MapboxMap mapboxMap) {
    String uri \= getResources().getString(R.string.goong\_map\_url) + 
                 "/assets/goong.map.web.json?api\_key=" + getResources().getString(R.string.goong\_api\_key);

    mapboxMap.setStyle(
        new Style.Builder().fromUri(uri),
        new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                LatLng start \= new LatLng(21.029579719995272, 105.85242472181584);
                LatLng end \= new LatLng(20.9409074, 106.2832288);

                symbolManager = new SymbolManager(mapView, mapboxMap, style);
                symbolManager.setIconAllowOverlap(true);
                symbolManager.setIconIgnorePlacement(true);

                // Use bitmap images for custom markers, not vector images
                IconFactory iconFactory \= IconFactory.getInstance(MainActivity.this);
                Icon icon \= iconFactory.fromResource(R.drawable.blue\_marker\_view);

                // Add markers to the map
                mapboxMap.addMarker(new MarkerOptions()
                        .position(start)
                        .icon(icon));
                
                mapboxMap.addMarker(new MarkerOptions()
                        .position(end)
                        .icon(icon));

                // Move the camera to the start position
                CameraPosition position \= new CameraPosition.Builder()
                        .target(start)
                        .zoom(15)
                        .tilt(20)
                        .build();

                mapboxMap.animateCamera(CameraUpdateFactory.newCameraPosition(position), 1200);
            }
        });

    this.mapboxMap = mapboxMap;
}

-   -   Sử dụng hàm **“addMarker”** để thêm marker cho một điểm với tọa độ bất kỳ
    -   Trong trường hợp không muốn sử dụng marker có sẵn của Mapbox ta phải sử dụng:

IconFactory iconFactory = IconFactory._getInstance_(MainActivity.this);
Icon icon = iconFactory.fromResource(R.drawable._blue\_marker\_view_);
 mapboxMap.addMarker(new MarkerOptions()
          .position(start)
          .icon(icon));

**Lưu ý**: Ảnh sử dụng làm marker thay thế phải dưới dạng bitmap (không được sử dụng ảnh dạng vector)

### **Tìm kiếm địa điểm**

-   **Vẽ giao diện tìm kiếm, sử dụng “EditText”, “RecyclerView” để làm Autocomplete:**

<EditText
    android:id\="@+id/search\_edit\_text"
    android:layout\_width\="match\_parent"
    android:layout\_height\="32dp"
    android:layout\_alignParentLeft\="false"
    android:layout\_alignParentBottom\="false"
    android:background\="@color/white"
    android:hint\="Search" />

<androidx.recyclerview.widget.RecyclerView
    android:id\="@+id/recycler\_view"
    android:layout\_width\="match\_parent"
    android:layout\_height\="wrap\_content"
    android:layout\_marginTop\="32dp"
    android:background\="@color/white"
    android:layout\_below\="@id/llTopBar" />

-   **Tạo 1 layout mới để custom giao diện bên trong mỗi item khi thực hiện tìm kiếm:**

<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android\="http://schemas.android.com/apk/res/android"
    xmlns:map\="http://schemas.android.com/apk/res-auto"
    xmlns:tools\="http://schemas.android.com/tools"
    android:layout\_width\="match\_parent"
    android:layout\_height\="wrap\_content"\>

    <!-- Top bar containing suggestions -->
    <LinearLayout
        android:id\="@+id/llTopBar"
        android:layout\_width\="match\_parent"
        android:layout\_height\="wrap\_content"
        android:background\="@color/white"
        android:gravity\="center\_vertical"
        android:orientation\="vertical"
        tools:ignore\="MissingConstraints"\>

        <TextView
            android:id\="@+id/suggestion\_text"
            android:layout\_width\="match\_parent"
            android:layout\_height\="wrap\_content"
            android:minHeight\="32dp"
            android:paddingLeft\="8dp"
            android:textColor\="@color/black" />

        <TextView
            android:id\="@+id/place\_id"
            android:layout\_width\="0dp"
            android:layout\_height\="0dp"
            android:paddingLeft\="8dp"
            android:visibility\="invisible" />
    </LinearLayout\>
</androidx.constraintlayout.widget.ConstraintLayout\>

-   **Gán sự kiện cho ô tìm kiếm khi người dùng gõ:**

searchEditText.addTextChangedListener(new TextWatcher() {
    @Override
    public void beforeTextChanged(CharSequence s, int start, int count, int after) {
        // No action needed before text is changed
    }

    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {
        // Call the search function whenever the text is changed
        search(s.toString());
    }

    @Override
    public void afterTextChanged(Editable s) {
        // No action needed after text has changed
    }
});

-   **Xử lý gọi Autocomplete API:**

 private void search(String textSearch) { if (recyclerView != null) { recyclerView.setVisibility(View.VISIBLE); } List<AutoComplete> filteredList = new ArrayList<>(); try { if (textSearch != null) { ApiService service \= RetrofitInstance.getRetrofitInstance("https://rsapi.goong.io/") .create(ApiService.class); Call<AutoCompleteResponse> call = service.getAutoComplete(textSearch, "YOUR\_API\_KEY"); call.enqueue(new Callback<AutoCompleteResponse>() { @Override public void onResponse(Call<AutoCompleteResponse> call, Response<AutoCompleteResponse> response) { if (response != null && response.isSuccessful()) { AutoCompleteResponse data \= response.body(); if (data != null && data.getPredictions() != null) { List<AutoComplete> autoCompletes = data.getPredictions(); for (AutoComplete item : autoCompletes) { filteredList.add(item); } if (filteredList != null && MainActivity.this.adapter != null) { MainActivity.this.adapter.updateSuggestions(filteredList); } } } } @Override public void onFailure(Call<AutoCompleteResponse> call, Throwable t) { Toast.makeText(MainActivity.this, "Auto complete is error!!!", Toast.LENGTH\_SHORT).show(); } }); } } catch (Exception e) { e.printStackTrace(); } }

**Lưu ý:** _Số lần gọi [Autocomplete](https://document.goong.io/tutorial-Places.html) thì cần phải tối ưu, tùy theo nhu cầu của ứng dụng, ví dụ theo kiểu sau 2,3 ký tự mới được gọi hoặc khách nhập nhưng chỉ gọi sau 3s không nhập gì. Vì [Goong](http://goong.io) sẽ tính phí mỗi lần gọi này._

### **Chi tiết địa điểm được chọn**

-   **Gọi Place Detail API:**

private void fetchDetailLocation(String placeId) {
    Style style \= mapboxMap.getStyle();
    ApiService service \= RetrofitInstance.getRetrofitInstance(getResources().getString(R.string.goong\_api\_url)).create(ApiService.class);
    
    Call<PlaceDetailResponse> call = service.getPlaceDetail(placeId, getResources().getString(R.string.goong\_api\_key));
    call.enqueue(new Callback<PlaceDetailResponse>() {
        @Override
        public void onResponse(Call<PlaceDetailResponse> call, Response<PlaceDetailResponse> response) {
            // TODO: Hiển thị danh marker cho điểm theo tọa độ.
            if (response != null && response.isSuccessful()) {
                PlaceDetailResponse data \= response.body();
                if (data != null && data.getResult() != null && data.getResult().getGeometry() != null) {
                    Location location \= data.getResult().getGeometry().getLocation();
                    try {
                        LatLng center \= new LatLng(
                            Double.parseDouble(location.getLat()),
                            Double.parseDouble(location.getLng())
                        );
                        drawCircleLineAndMarker(center, style);
                        selectedLocation = center;
                        mapboxMap.addMarker(new MarkerOptions().position(center));
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Parsing is error!!!", Toast.LENGTH\_SHORT).show();
                    }
                }
            }
        }

        @Override
        public void onFailure(Call<PlaceDetailResponse> call, Throwable t) {
            Toast.makeText(MainActivity.this, "FetchDetailLocation is error!!!", Toast.LENGTH\_SHORT).show();
        }
    });
}

**Vẽ điểm và vòng tròn bao quanh điểm:**

-   **Tính toán các điểm xung quanh điểm ở tâm:**

public List<Point> getCircleLatLng(LatLng center, double radius) { 
    List<Point> result = new ArrayList<>();
    int points = 64;
    double\[\]\[\] coordinates = new double\[points + 1\]\[2\];

    for (int i = 0; i < points; i++) {
        double angle = i \* (2 \* Math.PI / points);
        double dx = radius \* Math.cos(angle);
        double dy = radius \* Math.sin(angle);
        coordinates\[i\] = new double\[\]{ 
            center.getLongitude() + (dx / 110540f), 
            center.getLatitude() + (dy / 110540f) 
        };
    }

    // Close the circle
    coordinates\[points\] = coordinates\[0\];

    for (double\[\] coordinate : coordinates) {
        result.add(Point.fromLngLat(coordinate\[0\], coordinate\[1\]));
    }

    return result;
}

// Create Polygon
public static Polygon createPolygonFromPoints(List<Point> points) {
    List<List<Point>> polygonCoordinates = new ArrayList<>();
    polygonCoordinates.add(points);
    return Polygon.fromLngLats(polygonCoordinates);
}

-   **Vẽ các điểm xung quanh và marker điểm ở tâm:**

public void drawCircleLineAndMarker(LatLng center, Style style) {
    // Get points for the circle
    List<Point> points = this.getCircleLatM(center, 300); // radius: 300

    // Clear the map
    mapboxMap.clear();

    // Draw filled circle
    Feature circlePolygon \= Feature.fromGeometry(createPolygonFromPoints(points));
    style.addSource(new GeoJsonSource("circle.polygon", circlePolygon));
    style.addLayer(new FillLayer("polygon-layer", "circle.polygon")
            .withProperties(
                PropertyFactory.fillOpacity(0.2f),
                PropertyFactory.fillColor(Color.parseColor("#588888"))
            )
    );

    // Draw line around the circle
    style.addLayer(new LineLayer("circle-layer", "circle.source")
            .withProperties(
                PropertyFactory.lineCap(Property.LINE\_CAP\_SQUARE),
                PropertyFactory.lineJoin(Property.LINE\_JOIN\_MITER),
                PropertyFactory.lineOpacity(0.7f),
                PropertyFactory.lineWidth(0.3f),
                PropertyFactory.lineColor(Color.parseColor("#588888"))
            )
    );

    // Move camera to the selected point
    CameraPosition position \= new CameraPosition.Builder()
            .target(center)
            .zoom(15)
            .tilt(20)
            .build();

    mapboxMap.animateCamera(CameraUpdateFactory.newCameraPosition(position), 1200);
}

### **Dẫn đường**

-   **Gọi Directions API:**

private void fetchDirections(LatLng start, LatLng end, Style style) {
    String origin \= start.getLatitude() + ", " + start.getLongitude();
    String destination \= end.getLatitude() + ", " + end.getLongitude();

    // Create the API service
    ApiService service \= RetrofitInstance.getRetrofitInstance(
        getResources().getString(R.string.goong\_api\_url)
    ).create(ApiService.class);

    Call<DirectionResponse> call = service.getDirection(
        origin,
        destination,
        "car",  // Vehicle type
        getResources().getString(R.string.goong\_api\_key)
    );

    call.enqueue(new Callback<DirectionResponse>() {
        @Override
        public void onResponse(Call<DirectionResponse> call, Response<DirectionResponse> response) {
            // Check if the response is valid and successful
            if (response != null && response.isSuccessful()) {
                DirectionResponse data \= response.body();

                if (data != null && data.getRoutes() != null) {
                    Route route \= data.getRoutes().get(0);
                    if (route.getOverviewPolyline() != null &&
                        route.getOverviewPolyline().getPoints() != null) {
                        
                        String geometry \= route.getOverviewPolyline().getPoints();
                        List<Point> points = LineString.fromPolyline(geometry, 5).coordinates();
                        
                        drawLineBetweenTwoPoints(points, style);

                        // Clear previous markers and add new ones
                        mapboxMap.clear();
                        mapboxMap.addMarker(new MarkerOptions().position(start));
                        mapboxMap.addMarker(new MarkerOptions().position(end));

                        // Bound the map to show both start and end
                        bound(start, end);
                    }
                }
            }
        }

        @Override
        public void onFailure(Call<DirectionResponse> call, Throwable t) {
            Log.d("Call error", "call error: " + t.getMessage());
        }
    });
}

-   **Lấy danh sách điểm:**

Cài đặt thêm **“dependencies”**:

implementation 'com.mapbox.mapboxsdk:mapbox-android-plugin-annotation-v9:0.9.0'

Trong kết quả trả về có **“overview\_polyline”**, trong đó có points đã được mã hóa, sử dụng **“LineString”** để tạo đường line từ danh sách các điểm

LineString._fromPolyline_(geometry, 5).coordinates();

-   **Sử dụng GeoJson để vẽ line giữa 2 điểm:**

public void drawLineBetweenTwoPoints(List<Point> points, Style style) {
    // Create a Linestring from the list of points
    LineString lineString \= LineString.fromLngLats(points);

    // Create a Feature from the Linestring
    Feature feature \= Feature.fromGeometry(lineString);

    // Create a GeoJsonSource using the Feature
    GeoJsonSource geoJsonSource \= new GeoJsonSource("line-source", feature);

    // Add the source to the style
    style.addSource(geoJsonSource);

    // Add a LineLayer to the style
    style.addLayer(new LineLayer("line-layer", "line-source")
        .withProperties(
            PropertyFactory.lineCap(Property.LINE\_CAP\_SQUARE),
            PropertyFactory.lineJoin(Property.LINE\_JOIN\_MITER),
            PropertyFactory.lineOpacity(0.7f),
            PropertyFactory.lineWidth(7f),
            PropertyFactory.lineColor(Color.parseColor("#3887be"))
        )
    );
}

-   **Tham khảo ví dụ mẫu tại đây:** [Goong Sample android Mapbox](https://help.goong.io/wp-content/uploads/2024/08/Goong-Sample-android-Mapbox.zip)
-   **Tham khảo tài liệu tích hợp và các hàm:** [https://docs.mapbox.com/android/maps/guides/](https://docs.mapbox.com/android/maps/guides/)
