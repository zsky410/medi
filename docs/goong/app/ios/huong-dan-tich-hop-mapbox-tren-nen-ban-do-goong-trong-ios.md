---
title: "TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG IOS"
source: https://help.goong.io/kb/app/ios/huong-dan-tich-hop-mapbox-tren-nen-ban-do-goong-trong-ios/
updated: 2025-02-07T11:34:04
categories: ["Ios"]
---
# TÍCH HỢP MAPBOX TRÊN NỀN BẢN ĐỒ GOONG TRONG IOS

> Nguồn: [https://help.goong.io/kb/app/ios/huong-dan-tich-hop-mapbox-tren-nen-ban-do-goong-trong-ios/](https://help.goong.io/kb/app/ios/huong-dan-tich-hop-mapbox-tren-nen-ban-do-goong-trong-ios/)

## TỔNG QUAN

Map SDK iOS là một bộ công cụ phát triển phần mềm (SDK) dành cho iOS, cho phép các nhà phát triển tích hợp và xây dựng các tính năng bản đồ trong ứng dụng của họ. SDK này thường hỗ trợ các tính năng nâng cao như hiển thị bản đồ, đánh dấu vị trí, tương tác với bản đồ và nhiều chức năng khác mà người dùng có thể sử dụng trong các ứng dụng di động.

GOONG iOS SDK cho phép bạn tùy chỉnh bản đồ với nội dung để hiển thị trên iPhone, iPad.

GOONG iOS SDK không chỉ mang hình ảnh sắc nét lên trên bản đồ, ngoài ra còn cho phép tương tác và điều chỉnh các đối tượng trên bản đồ của bạn tài liệu dưới đây trình bày cách tính hợp Mapbox trên nền bản đồ của **[Goong](http://Goong.io)**, và sử dụng các dịch vụ cơ bản, bao gồm:

-   **Hiện các kiểu bản đồ:** Cơ bản, vệ tinh, tối, sáng,… gắn marker, vẽ vòng tròn bao quanh marker.
-   **Tìm kiếm:** Nhập tên địa chỉ, hiển thị các gợi ý liên quan tới tên địa chỉ nhập, sau khi chọn thì nhảy ra điểm đó trên bản đồ (sử dụng Autocomplete tìm kiếm gợi ý, rồi dùng Place Detail để lấy thông tin tọa độ về địa chỉ đó).
-   **Định vị vị trí:** Xác định và hiển thị vị trí hiện tại của người dùng trên bản đồ.
-   **Dẫn đường**: Nhập tọa độ điểm đầu và cuối, hiển thị đường dẫn trên bản đó, có thông tin về khoảng cách và thời gian di chuyển (Directions với phương tiện di chuyển: car, taxi,..).
-   **Đánh dấu và chú thích**: Cho phép nhà phát triển thêm các đánh dấu (marker) hoặc chú thích (annotation) vào bản đồ để chỉ ra các vị trí cụ thể.
-   **Tương tác**: Hỗ trợ các thao tác tương tác như phóng to, thu nhỏ, xoay bản đồ, và di chuyển bản đồ.

## CÁC BƯỚC TÍCH HỢP

### **Các tham số cần thiết**

**Cần có:**

-   Map Key, API Key: vào trang đang ký tài khoản và tạo key, xem hướng dẫn tạo key [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

### **Gán Mapbox vào iOS**

-   Vào [https://account.mapbox.com/](https://account.mapbox.com/) để đăng ký tài khoản Mapbox để cấp YOUR\_SECRET\_MAPBOX\_ACCESS\_TOKEN.

-   Sau khi đăng ký tài khoản bạn vào mục **“Token”:**

![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.00.28-300x23.png)

-   Tiếp sau đó chọn **“Create token”:**

![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.05.11-300x76.png)

-   Bạn chọn theo mẫu sau:

![](https://help.goong.io/wp-content/uploads/2024/08/Screenshot-2024-10-16-at-21.08.21-300x167.png)

**Lưu ý**: Bắt buộc phải chọn “**DOWNLOADS:READ”**

-   Ấn “**Create Token”** để tạo token

**Lưu ý: T**oken sẽ có dạng sk. …

-   Tiếp theo vào **“.netrc”** copy nội dung dưới đây vào:

Mở “Terminal” chaỵ lệnh open .netrc và copy nội dung sau vào file **“.netrc”**:

machine api.mapbox.com

login mapbox

password YOUR\_SECRET\_MAPBOX\_ACCESS\_TOKEN

-   Add token vào file “**Info.plist”:**

[https://help.goong.io/wp-content/uploads/2024/08/Video-showing-how-to-add-public-Mapbox-token-to-Xcode-project.mp4](https://help.goong.io/wp-content/uploads/2024/08/Video-showing-how-to-add-public-Mapbox-token-to-Xcode-project.mp4)

-   Tiếp theo “**File”** → “**Add Packages…****.”**  copy [https://github.com/mapbox/mapbox-maps-ios.git](https://github.com/mapbox/mapbox-maps-ios.git) vào **“Search package”**

[https://help.goong.io/wp-content/uploads/2024/08/A-video-illustrating-the-steps-outlined-above-in-the-Xcode-UI.mp4](https://help.goong.io/wp-content/uploads/2024/08/A-video-illustrating-the-steps-outlined-above-in-the-Xcode-UI.mp4)

**Lưu ý**: trong _Dependency Rule_ _chọn_ Up to Next Major Version để version 10.15.0

-   Vào plist thêm:

MBXAccessToken với key YOUR\_SECRET\_MAPBOX\_ACCESS\_TOKEN

### Thêm **Mapview của Goong**

-    **Khởi tạo bản đồ:**

mapView \= MLNMapView(frame: view.bounds) mapView.autoresizingMask \= \[.flexibleWidth, .flexibleHeight\] 
mapView.logoView.isHidden \= true 
mapView.delegate \= self 
mapView.styleURL \= URL(string: "https://tiles.goong.io/assets/goong\_map\_web.json?api\_key=\\(GoongConstants.API\_KEY)") 
view.addSubview(mapView)

-   **Trường hợp thêm bản đồ ít icon:**

https://tiles.goong.io/assets/goong\_map\_highlight.json?api\_key=\\(GoongConstants.API\_KEY)

-   **Thêm bản đồ vệ tinh:**

https://tiles.goong.io/assets/goong\_satellite.json?api\_key=\\(GoongConstants.API\_KEY)

-   **Bỏ logo của Mapbox:**

mapView.ornaments.logoView.isHidden = **true**
mapView.ornaments.attributionButton.isHidden = **true**
mapView.ornaments.compassView.isHidden = **true**
mapView.ornaments.scaleBarView.isHidden = **true**

-   **LocationManager:**

Lấy location hiện tại của mình để gán vào vị trí mình đang đứng bằng cách sử dụng **“LocationManager”**

class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let locationManager \= CLLocationManager()
    
    @Published var locationStatus: CLAuthorizationStatus?
    @Published var lastLocation: CLLocation?
    @Published var speedLocation: CLLocationSpeedAccuracy?
    @Published var heading: Double {
        willSet {
            objectWillChange.send()
        }
    }
    
    var speed: CLLocationSpeed \= CLLocationSpeed()
    var bearing: CLLocationDirection \= CLLocationDirection()
    var didUpdateLocations: (() -> Void)?

    override init() {
        heading \= 0
        super.init()
        locationManager.delegate \= self
        locationManager.desiredAccuracy \= kCLLocationAccuracyBest
        locationManager.requestWhenInUseAuthorization()
        locationManager.startUpdatingLocation()
        locationManager.startUpdatingHeading()
    }

    func requestLocation() {
        locationManager.requestWhenInUseAuthorization()
    }

    var statusString: String {
        guard let status \= locationStatus else { return "unknown" }
        
        switch status {
        case .notDetermined:
            return "notDetermined"
        case .authorizedWhenInUse:
            return "authorizedWhenInUse"
        case .authorizedAlways:
            return "authorizedAlways"
        case .restricted:
            return "restricted"
        case .denied:
            return "denied"
        default:
            return "unknown"
        }
    }

    func locationManager(\_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        locationStatus \= status
        // print(#function, statusString)
    }

    func locationManager(\_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        self.heading \= Double(round(1 \* newHeading.trueHeading) / 1)
    }

    func locationManager(\_ manager: CLLocationManager, didUpdateLocations locations: \[CLLocation\]) {
        guard let location \= locations.last else { return }
        lastLocation \= location
        didUpdateLocations?()
    }
}

-    **Chỉnh camera vào vị trí hiện tại:**

func mapViewCameraCurrent() {
    // Get the last known location coordinates or use simulator values as fallback
    let latitude \= self.locationManager.lastLocation?.coordinate.latitude ?? Constants.latitudeSimulator
    let longitude \= self.locationManager.lastLocation?.coordinate.longitude ?? Constants.longitudeSimulator
    
    // Set the center coordinate and zoom level of the mapView
    mapView.centerCoordinate \= CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    mapView.zoomLevel \= 15
}

-   **Thêm marker vào bản đồ:**

func addCurrentMarker(latitude: Double, longitude: Double) {
    guard let style \= mapView.mapboxMap.style else {
        print("Style not loaded.")
        return
    }
    
    // Add the current marker image to the style
    if let currentMarkerImage \= UIImage(named: Constants.ic\_current\_point) {
        try? style.addImage(currentMarkerImage, id: Constants.blue\_icon\_id)
    } else {
        print("Failed to load marker image.")
        return
    }

    // Create the feature for the marker
    var features \= \[Feature\]()
    let pointGeometry \= Point(LocationCoordinate2D(latitude: latitude, longitude: longitude))
    var feature \= Feature(geometry: pointGeometry)
    feature.properties \= \[Constants.icon\_key: .string(Constants.blue\_marker\_property)\]
    features.append(feature)

    // Create a GeoJSON source and add it to the style
    var source \= GeoJSONSource()
    source.data \= .featureCollection(FeatureCollection(features: features))
    do {
        try style.addSource(source, id: Constants.source\_id)
    } catch {
        print("Error adding GeoJSON source: \\(error)")
        return
    }

    // Create and configure the symbol layer for the marker
    var layerCurrent \= SymbolLayer(id: Constants.layer\_id)
    layerCurrent.source \= Constants.source\_id
    layerCurrent.iconImage \= .constant(.name(Constants.blue\_icon\_id)) // Use the correct image ID
    layerCurrent.iconRotate \= .expression(Exp(.get) { "bearing" })
    layerCurrent.iconAnchor \= .constant(.bottom)
    layerCurrent.iconAllowOverlap \= .constant(false)
    layerCurrent.iconSize \= .constant(0.5) // Adjusted for clarity

    // Create a circle annotation for the marker background
    let circleAnnotation \= CircleAnnotation(centerCoordinate: CLLocationCoordinate2D(latitude: latitude, longitude: longitude))
    circleAnnotation.circleColor \= StyleColor(.gray)
    circleAnnotation.circleRadius \= 64
    circleAnnotation.circleOpacity \= 0.5

    // Create the circle annotation manager and add the annotation
    let circleAnnotationManager \= mapView.annotations.makeCircleAnnotationManager()
    circleAnnotationManager.annotations \= \[circleAnnotation\]

    // Add the symbol layer to the style
    do {
        try style.addLayer(layerCurrent)
    } catch {
        print("Error adding symbol layer: \\(error)")
    }
}

Trong hàm trên thực hiện 2 việc: gắn marker lên bản đồ, vẽ vòng tròn.

Khi gắn marker thì chỉ cần truyền 2 tham số latitude, longitude

Khi vẽ đường tròn: bản chất là vẽ 1 lớp layer có vòng tròn được tô màu, rồi sử dụng **“CircleAnnotation”** để hiển thị nó lên bản đồ. Hàm vẽ vòng tròn **“circleAnnotation”**

### **Tìm kiếm địa điểm**

Với bất kỳ tên địa chỉ nào người dùng nhập vào, hiển thị các gợi ý cho người dùng chọn. **“SearchViewModel”** sẽ gọi thực hiện điều đó

-   [**Autocomplete:**](https://document.goong.io/tutorial-Places.html)

final class SearchViewModel: ObservableObject {
    @Published var searchText: String \= ""
    @Published var predictions: AutoComplete?
    
    private var inputText: String \= ""
    private var url: String \= ""
    
    func convertURL(currentLocation: CLLocationCoordinate2D, searchText: String) {
        // URL encode the search text
        guard let encodedInputText \= searchText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else {
            return
        }
        inputText \= encodedInputText
        
        url \= "\\(GoongConstants.GOONG\_API\_URL)/Place/AutoComplete?api\_key=\\(GoongConstants.GOONG\_API\_KEY)&location=\\(currentLocation.latitude),\\(currentLocation.longitude)&input=\\(inputText)&origin=\\(currentLocation.latitude),\\(currentLocation.longitude)"
        
        // Fetch API if search text has more than 3 characters
        if searchText.count \> 3 {
            fetchAPISearch()
        }
    }
    
    func fetchAPISearch() {
        weak var task: DispatchWorkItem?
        
        DispatchQueue.global().async {
            var request \= URLRequest(url: URL(string: self.url)!)
            request.httpMethod \= "GET"
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let session \= URLSession.shared
            task \= session.dataTask(with: request) { \[weak self\] data, response, error in
                // Check if the response is a valid HTTP response
                if let response \= response as? HTTPURLResponse {
                    do {
                        // Decode the JSON response
                        let json \= try JSONDecoder().decode(AutoComplete.self, from: data!)
                        
                        DispatchQueue.main.async {
                            self?.predictions \= json
                            task?.cancel()
                        }
                    } catch {
                        print("Error decoding JSON: \\(error)")
                    }
                }
            }
            task?.resume()
        }
    }
}

Khi người dùng nhập tên địa chỉ, thì hàm trên sẽ gọi dịch vụ [Autocomplete](https://document.goong.io/tutorial-Places.html) của Goong để trả về các gợi ý về tên địa chỉ ứng với từ mà người dùng nhập, kèm theo đó là _place\_id_. Sau đó hiển thị những gợi ý lên cho người dùng chọn, khi chọn thì gọi tiếp dịch vụ place detail bằng tham số _place\_id_, thì sẽ lấy được tọa độ của điểm này.

-   [**Place Detail:**](https://document.goong.io/tutorial-Places.html)

final class PlaceDetailViewModel: ObservableObject {
    var onLocationUpdate: (() -> Void)?
    
    @Published var locationDetail: LocationReponseDto? {
        didSet {
            self.onLocationUpdate?()
        }
    }
    
    private var url: String \= ""
    
    func convertURL(placeID: String) {
        url \= "\\(GoongConstants.GOONG\_API\_URL)/Place/Detail?place\_id=\\(placeID)&api\_key=\\(GoongConstants.GOONG\_API\_KEY)"
        fetchPlaceDetail()
    }
    
    func fetchPlaceDetail() {
        weak var task: DispatchWorkItem?
        
        DispatchQueue.global().async {
            var request \= URLRequest(url: URL(string: self.url)!)
            request.httpMethod \= "GET"
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let session \= URLSession.shared
            task \= session.dataTask(with: request) { \[weak self\] data, response, error in
                do {
                    guard let data \= data else {
                        print("No data received: \\(String(describing: error))")
                        return
                    }
                    let json \= try JSONDecoder().decode(LocationReponseDto.self, from: data)
                    DispatchQueue.main.async {
                        self?.locationDetail \= json
                        task?.cancel()
                    }
                } catch {
                    print("Error: \\(error)")
                }
            }
            task?.resume()
        }
    }
}

Với tọa đồ của điểm mà người dùng đã chọn, ta sẽ gán marker và view camera bằng cách sử dụng 2 hàm **“mapViewCameraDestination”** và **“addDestination”**

-   **Thêm camera:**

func mapViewCameraDestination() {
    guard let locationDetail \= self.placeDetailViewModel.locationDetail else {
        print("Location detail is not available.")
        return
    }
    
    let latitude \= locationDetail.result.geometry.location.lat
    let longitude \= locationDetail.result.geometry.location.lng

    self.mapView.mapboxMap.setCamera(
        to: CameraOptions(
            center: CLLocationCoordinate2D(
                latitude: latitude,
                longitude: longitude
            ),
            zoom: 15.0,
            bearing: locationManager.heading,
            pitch: 0
        )
    )
}

-   **Thêm marker:**

func addDestinationMarker(latitude: Double, longitude: Double) {
    let style \= mapView.mapboxMap.style
    
    // Add destination marker image to the style
    if let markerImage \= UIImage(named: Constants.destination\_marker) {
        try? style.addImage(markerImage, id: Constants.red\_icon\_id)
    } else {
        print("Failed to load marker image.")
        return
    }

    // Create a feature for the destination marker
    var features \= \[Feature\]()
    let feature \= Feature(geometry: Point(LocationCoordinate2D(latitude: latitude, longitude: longitude)))
    feature.properties \= \[Constants.icon\_key\_des: .string(Constants.red\_marker\_property)\]
    features.append(feature)

    // Create a GeoJSON source for the marker
    var source \= GeoJSONSource()
    source.data \= .featureCollection(FeatureCollection(features: features))
    
    do {
        try style.addSource(source, id: Constants.source\_id\_destination)
    } catch {
        print("Failed to add source: \\(error)")
        return
    }

    // Create and configure the symbol layer for the destination marker
    var layer \= SymbolLayer(id: Constants.layer\_id\_des)
    layer.source \= Constants.source\_id\_destination
    layer.iconImage \= .constant(.name("red"))
    layer.iconAnchor \= .constant(.bottom)
    layer.iconAllowOverlap \= .constant(false)
    layer.iconSize \= .constant(0.1)

    do {
        try style.addLayer(layer)
    } catch {
        print("Failed to add layer: \\(error)")
    }
}

**Lưu ý**: _Số lần gọi [AutoComplete](https://document.goong.io/tutorial-Places.html) thì cần phải tối ưu, tùy theo nhu cầu của ứng dụng, ví dụ theo kiểu sau 2,3 ký tự mới được gọi hoặc khách nhập nhưng chỉ gọi sau 3s không nhập gì. Vì Goong sẽ tính phí mỗi lần gọi [AutoComplete](https://document.goong.io/tutorial-Places.html) này._

-   **Xoá marker:**

func removeAnnotationPoint() {
    do {
        let style \= mapView.mapboxMap.style
        
        // Remove the layer and source for the destination marker
        try style.removeLayer(withId: Constants.layer\_id\_des)
        try style.removeSource(withId: Constants.source\_id\_destination)
    } catch {
        print("Error removing marker: \\(error)")
    }
}

### **Dẫn đường**

Dẫn đường sử dụng dịch vụ Directions, gửi kèm tọa độ điểm đầu, điểm cuối, phương tiện di chuyển, nhận về mã đường đi, khoảng cách 2 điểm, thời gian đi dự kiến,…

Sau khi khách hàng nhập tọa độ điểm đầu và cuối, gọi dịch vụ Directions của bên Goong sau đó sẽ giải mã đường đi và hiển thị đường đi đó lên bản đồ.

-   **Hàm DirectionViewModel gọi dịch vụ của Goong:**

final class DirectionViewModel: ObservableObject {
    var onDirectionUpdate: (() -> Void)?

    @Published var direction: DirectionReponseDto! {
        didSet {
            self.onDirectionUpdate?()
        }
    }

    var onStatusLineUpdate: (() -> Void)?

    @Published var status: Bool! {
        didSet {
            self.onStatusLineUpdate?()
        }
    }

    var url: String \= ""

    func convertURL(origin: String, destination: String) {
        url \= "\\(GoongConstants.GOONG\_API\_URL)/Direction?vehicle=car&origin=\\(origin)&destination=\\(destination)&alternatives=true&api\_key=\\(GoongConstants.GOONG\_API\_KEY)"
        getDirection()
    }

    func getDirection() {
        weak var task: DispatchWorkItem?

        DispatchQueue.global().async {
            var request \= URLRequest(url: URL(string: self.url)!)
            request.httpMethod \= "GET"
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")

            let session \= URLSession.shared
            task \= session.dataTask(with: request) { \[weak self\] data, response, error in
                do {
                    guard let data \= data else {
                        print("No data received: \\(String(describing: error))")
                        return
                    }
                    let json \= try JSONDecoder().decode(DirectionReponseDto.self, from: data)
                    DispatchQueue.main.async {
                        self?.direction \= json
                        task?.cancel()
                    }
                } catch {
                    print("Error: \\(error)")
                }
            }
            task?.resume()
        }
    }
}

Hàm này sẽ gọi dịch vụ Directions của Goong, bằng cách truyền tham số tọa độ điểm đầu và cuối, phương tiện di chuyển (ở đây lấy car), và sẽ lấy ra được đường (route), khoảng cách 2 điểm (distance), thời gian đi dự kiến (time),…

-   **DecodePolyline:**

Sau đó cần giải mã đường đi (route), hàm **“decodePolyline”**:

func decodeGeoJSON(from geoJsonString: String) throws -> FeatureCollection? {
    var featureCollection: FeatureCollection?
    
    do {
        guard let data \= geoJsonString.data(using: .utf8) else {
            return nil
        }
        
        featureCollection \= try JSONDecoder().decode(FeatureCollection.self, from: data)
    } catch {
        print("Error parsing data: \\(error)")
    }
    
    return featureCollection
}

-    **Hiển thị đường đó lên bản đồ:**

func addLine(coordinates: \[Any\], decodedCoordinates: \[CLLocationCoordinate2D\]?) {
    // Check if the GeoJSON source already exists
    if let \_ \= try? mapView.mapboxMap.style.source(withId: Constants.GEO\_JSON\_ID) {
        // If the GeoJSON source exists, update it with the new coordinates
        let geoJSON \= GeoJSONObject.geometry(.lineString(.init(decodedCoordinates!)))
        do {
            try mapView.mapboxMap.style.updateGeoJSONSource(withId: Constants.GEO\_JSON\_ID, geoJSON: geoJSON)
        } catch {
            print("Error updating GeoJSON source: \\(error)")
        }
    } else {
        // Create a new GeoJSON string
        let geoJSONString \= """
        {
            "type": "FeatureCollection",
            "features": \[{
                "type": "Feature",
                "properties": {
                    "lineMetrics": true
                },
                "geometry": {
                    "coordinates": \\(coordinates),
                    "type": "LineString"
                }
            }\]
        }
        """
        
        // Decode the GeoJSON string
        guard let featureCollection \= try? decodeGeoJSON(from: geoJSONString) else {
            print("Failed to decode GeoJSON")
            return
        }
        
        // Create a GeoJSON data source
        let geoJSONSource \= GeoJSONSource(data: .featureCollection(featureCollection))
        
        // Create a line layer
        var lineLayer \= LineLayer(id: Constants.LINE\_LAYER)
        lineLayer.source \= Constants.GEO\_JSON\_ID
        lineLayer.lineColor \= .constant(StyleColor(.blue))
        
        let lowZoomWidth \= Constants.lowZoomWidth
        let highZoomWidth \= Constants.highZoomWidth
        
        // Use an expression to define the line width at different zoom extents
        lineLayer.lineWidth \= .expression(Exp(.interpolate) {
            Exp(.linear)
            Exp(.zoom)
            lowZoomWidth
            highZoomWidth
        })
        lineLayer.lineCap \= .constant(.round)
        lineLayer.lineJoin \= .constant(.round)
        lineLayer.lineOpacity \= .constant(Constants.opacityNumber)
        
        // Create a line border layer
        var lineBorder \= LineLayer(id: Constants.LINE\_BORDER)
        lineBorder.source \= Constants.GEO\_JSON\_ID
        lineBorder.lineColor \= .constant(StyleColor(.white))
        lineBorder.lineGapWidth \= .expression(Exp(.interpolate) {
            Exp(.linear)
            Exp(.zoom)
            lowZoomWidth
            highZoomWidth
        })
        lineBorder.lineWidth \= .constant(2)
        lineBorder.lineCap \= .constant(.round)
        lineBorder.lineJoin \= .constant(.round)

        // Add the line layer and the border to the map
        do {
            try mapView.mapboxMap.style.addSource(geoJSONSource, id: Constants.GEO\_JSON\_ID)
            try mapView.mapboxMap.style.addLayer(lineLayer, layerPosition: .below(Constants.belowLayer)) // road-label
            try mapView.mapboxMap.style.addLayer(lineBorder, layerPosition: .below(Constants.belowLayer)) // road-label
        } catch {
            print("Error adding GeoJSON layer: \\(error)")
        }
    }
}

Hàm trên thực hiện vẽ đường từ điểm hiện tại đến điểm đến

-    **Để xoá dẫn đường dùng hàm removeLineLayer():**

func removeLineLayer() {
    do {
        // Attempt to remove the line layers and image layer
        try mapView.mapboxMap.style.removeLayer(withId: Constants.LINE\_LAYER)
        try mapView.mapboxMap.style.removeLayer(withId: Constants.LINE\_BORDER)
        try mapView.mapboxMap.style.removeLayer(withId: Constants.imageID)
        
        // Optionally, remove the layer for route arrows based on the current step index
        // try mapView.mapboxMap.style.removeLayer(withId: "LINE\_LAYER\_ROUTE\_ARROW\_\\(stepsBannner.indexStep)")
    } catch {
        print("Error removing line layers: \\(error)")
    }
}

-   **Tham khảo ví dụ mẫu tại đây: [goong\_sample\_ios](https://help.goong.io/wp-content/uploads/2024/08/goong_sample_ios-1.zip)**
-   **Tham khảo cách tích hợp và các hàm**: **[https://docs.mapbox.com/ios/maps/guides/](https://docs.mapbox.com/ios/maps/guides/)**
