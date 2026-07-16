---
title: "TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ GOONG TRONG IOS"
source: https://help.goong.io/kb/app/ios/tich-hop-maplibre-tren-nen-ban-do-goong-trong-ios/
updated: 2025-02-07T13:54:40
categories: ["Ios"]
---
# TÍCH HỢP MAPLIBRE TRÊN NỀN BẢN ĐỒ GOONG TRONG IOS

> Nguồn: [https://help.goong.io/kb/app/ios/tich-hop-maplibre-tren-nen-ban-do-goong-trong-ios/](https://help.goong.io/kb/app/ios/tich-hop-maplibre-tren-nen-ban-do-goong-trong-ios/)

## TỔNG QUAN

Map SDK iOS là một bộ công cụ phát triển phần mềm (SDK) dành cho iOS, cho phép các nhà phát triển tích hợp và xây dựng các tính năng bản đồ trong ứng dụng của họ. SDK này thường hỗ trợ các tính năng nâng cao như hiển thị bản đồ, đánh dấu vị trí, tương tác với bản đồ và nhiều chức năng khác mà người dùng có thể sử dụng trong các ứng dụng di động.

GOONG iOS SDK cho phép bạn tùy chỉnh bản đồ với nội dung để hiển thị trên iPhone, iPad.

GOONG iOS SDK không chỉ mang hình ảnh sắc nét lên trên bản đồ, ngoài ra còn cho phép tương tác và điều chỉnh các đối tượng trên bản đồ của bạn tài liệu dưới đây trình bày cách tích hợp Maplibre trên nền bản đồ của **[Goong](http://Goong.io)** và sử dụng các dịch vụ cơ bản, bao gồm:

-   **Hiện các kiểu bản đồ:** Cơ bản, vệ tinh, tối, sáng,… gắn marker, vẽ vòng tròn bao quanh marker.
-   **Tìm kiếm:** Nhập tên địa chỉ, hiển thị các gợi ý liên quan tới tên địa chỉ nhập, sau khi chọn thì nhảy ra điểm đó trên bản đồ (sử dụng Autocomplete tìm kiếm gợi ý, rồi dùng Place Detail để lấy thông tin tọa độ về địa chỉ đó).
-   **Định vị vị trí:** Xác định và hiển thị vị trí hiện tại của người dùng trên bản đồ.
-   **Dẫn đường:** Nhập tọa độ điểm đầu và cuối, hiển thị đường dẫn trên bản đó, có thông tin về khoảng cách và thời gian di chuyển (Directions với phương tiện di chuyển: car, taxi,..).
-   **Đánh dấu và chú thích:** Cho phép nhà phát triển thêm các đánh dấu (marker) hoặc chú thích (annotation) vào bản đồ để chỉ ra các vị trí cụ thể.
-   **Tương tác:** Hỗ trợ các thao tác tương tác như phóng to, thu nhỏ, xoay bản đồ và di chuyển bản đồ.

## CÁC BƯỚC TÍCH HỢP

Cần có Map Key, API Key: vào trang đăng ký tài khoản và tạo key, xem hướng dẫn tạo key [tại đây](https://help.goong.io/kb/gioi-thieu-tong-quan/dang-ky-va-tao-key/dang-ky-tai-khoan-va-tao-key/).

### **Gán Maplibre vào iOS**

-   **Thêm Package:**

[https://help.goong.io/wp-content/uploads/2024/08/A-video-illustrating-the-steps-outlined-above-in-the-Xcode-UI.mp4](https://help.goong.io/wp-content/uploads/2024/08/A-video-illustrating-the-steps-outlined-above-in-the-Xcode-UI.mp4)

-   **Tiếp theo “File” → “Add Packages….” copy https://github.com/maplibre/maplibre-gl-native-distribution vào “Search package”**

**Lưu ý**: Nếu cài cocoapods thì thêm vào podfile “pod ‘MapLibre’, ‘6.5.0’”

-   **Thêm Mapview của Goong k****hởi tạo bản đồ:**

mapView \= MLNMapView(frame: view.bounds)
mapView.autoresizingMask \= \[.flexibleWidth, .flexibleHeight\]
mapView.logoView.isHidden \= true
mapView.delegate \= self
mapView.styleURL \= URL(string: "https://tiles.goong.io/assets/goong\_map\_web.json?api\_key=\\(GoongConstants.API\_KEY)")
view.addSubview(mapView)

-   **Trường hợp thêm bản đồ ít icon** 

https://tiles.goong.io/assets/goong\_map\_highlight.json[?api\_key=\\(GoongConstants.API\_KEY)](https://tiles.goong.io/assets/goong_satellite.json?api_key=\\(GoongConstants.API_KEY\))

-   **Thêm bản đồ vệ tinh:**

[https://tiles.goong.io/assets/goong\_satellite.json?api\_key=\\(GoongConstants.API\_KEY)](https://tiles.goong.io/assets/goong_satellite.json?api_key=\\(GoongConstants.API_KEY\))

-   **Bỏ logo của Maplibre:**

mapView.logoView.isHidden = **true**

-   **LocationManager:**

Lấy location hiện tại của mình để gán vào vị trí mình đang đứng bằng cách sử dụng LocationManager

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

-   **Chỉnh camera vào vị trí hiện tại:**

func mapViewCameraCurrent() {
    // Get the last known location coordinates or use simulator values as fallback
    let latitude \= self.locationManager.lastLocation?.coordinate.latitude ?? Constants.latitudeSimulator
    let longitude \= self.locationManager.lastLocation?.coordinate.longitude ?? Constants.longitudeSimulator
    
    // Set the center coordinate and zoom level of the mapView
    mapView.centerCoordinate \= CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    mapView.zoomLevel \= 15
}

-   **Thêm marker vào vị trí hiện tại:**

func addCurrentMarker(latitude: Double, longitude: Double) {
    // Set the image for the marker
    if let image \= UIImage(named: Constants.ic\_current\_point) {
        mapView.style?.setImage(image, forName: Constants.blue\_icon\_id)
    }

    // Create coordinates for the marker
    let coordinate \= CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    let pointFeature \= MLNPointFeature()
    pointFeature.coordinate \= coordinate
    pointFeature.attributes \= \[Constants.icon\_key: Constants.blue\_marker\_property\]

    // Create a shape source and add it to the style
    let source \= MLNShapeSource(identifier: Constants.source\_id, shape: pointFeature, options: nil)
    mapView.style?.addSource(source)

    // Create a symbol style layer and configure it
    let layer \= MLNSymbolStyleLayer(identifier: Constants.layer\_id, source: source)
    layer.iconImageName \= NSExpression(forConstantValue: Constants.blue\_icon\_id)
    layer.iconAllowsOverlap \= NSExpression(forConstantValue: NSNumber(value: false))
    layer.iconScale \= NSExpression(forConstantValue: NSNumber(value: 0.6))

    // Add the layer to the map's style
    mapView.style?.addLayer(layer)
}

Trong hàm trên thực hiện 2 việc: gắn marker lên bản đồ, vẽ vòng tròn.

Khi gắn marker thì chỉ cần truyền 2 tham số latitude, longitude.

Khi vẽ đường tròn: bản chất là vẽ 1 lớp layer có vòng tròn được tô màu, rồi sử dụng **“CircleAnnotation”** để hiển thị nó lên bản đồ. Hàm vẽ vòng tròn **“circleAnnotation”.**

### **Tìm kiếm địa điểm**

Với bất kỳ tên địa chỉ nào người dùng nhập vào, hiển thị các gợi ý cho người dùng chọn. **“SearchViewModel”** sẽ gọi thực hiện điều đó.

-   **[Autocomplete:](https://document.goong.io/tutorial-Places.html)**

final class SearchViewModel: ObservableObject {
    @Published var searchText: String \= ""
    @Published var predictions: AutoComplete?
    
    private var inputText: String \= ""
    private var url: String \= ""

    func ConvertURL(currentLocation: CLLocationCoordinate2D, searchText: String) {
        inputText \= searchText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!
        url \= "\\(GoongConstants.GOONG\_API\_URL)/Place/AutoComplete?api\_key=\\(GoongConstants.GOONG\_API\_KEY)&location=\\(currentLocation.latitude),\\(currentLocation.longitude)&input=\\(inputText)&origin=\\(currentLocation.latitude),\\(currentLocation.longitude)"

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
                if let response \= response as? HTTPURLResponse {
                    do {
                        let json \= try JSONDecoder().decode(AutoComplete.self, from: data!)
                        DispatchQueue.main.async {
                            self?.predictions \= json
                            task?.cancel()
                        }
                    } catch {
                        print("error", error)
                    }
                }
            }
            task?.resume()
        }
    }
}

Khi người dùng nhập tên địa chỉ, thì hàm trên sẽ gọi dịch vụ [Autocomplete](https://document.goong.io/tutorial-Places.html) của Goong để trả về các gợi ý về tên địa chỉ ứng với từ mà người dùng nhập, kèm theo đó là place\_id. Sau đó hiển thị những gợi ý lên cho người dùng chọn, khi chọn thì gọi tiếp dịch vụ Place Detail bằng tham số place\_id, thì sẽ lấy được tọa độ của điểm này. PlaceDetailViewModel:

-   [**Place Detail:**](https://document.goong.io/tutorial-Places.html)

final class PlaceDetailViewModel: ObservableObject {
    var onLocationUpdate: (() -> Void)?

    @Published var locationDetail: LocationReponseDto? {
        didSet {
            self.onLocationUpdate?()
        }
    }
    
    private var url: String \= ""

    func ConvertURL(placeID: String) {
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
                    let json \= try JSONDecoder().decode(LocationReponseDto.self, from: data!)
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

Với tọa đồ của điểm mà người dùng đã chọn, ta sẽ gán marker và view camera sẽ dùng 2 hàm **“mapViewCameraDestination”** và **“addDestination”.**

-   **Thêm camera điểm đến:**

func mapViewCameraDestination() {
    guard let latitude \= self.placeDetailViewModel.locationDetail?.result.geometry.location.lat,
          let longitude \= self.placeDetailViewModel.locationDetail?.result.geometry.location.lng else {
        return
    }

    mapView.setCenter(
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
        zoomLevel: 13,
        animated: true
    )
}

-   **Thêm marker điểm đến:**

func addDestinationMarker(latitude: Double, longitude: Double) {
    guard let style \= mapView.style else { return }

    // Add the destination marker image to the style
    if let image \= UIImage(named: Constants.destination\_marker) {
        style.setImage(image, forName: Constants.red\_icon\_id)
    }

    // Create a feature with the destination coordinates
    let coordinate \= CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    let pointFeature \= MLNPointFeature()
    pointFeature.coordinate \= coordinate
    pointFeature.attributes \= \[Constants.icon\_key\_des: Constants.red\_marker\_property\]

    // Create a shape source and add it to the style
    let source \= MLNShapeSource(identifier: Constants.source\_id\_destination, shape: pointFeature, options: nil)
    style.addSource(source)

    // Create a symbol style layer and configure it
    let layer \= MLNSymbolStyleLayer(identifier: Constants.layer\_id\_des, source: source)
    layer.iconImageName \= NSExpression(forConstantValue: Constants.red\_icon\_id)
    layer.iconAllowsOverlap \= NSExpression(forConstantValue: NSNumber(value: false))
    layer.iconScale \= NSExpression(forConstantValue: NSNumber(value: 0.1))

    // Add the layer to the map's style
    style.addLayer(layer)
}

**Lưu ý:** _Số lần gọi Autocomplete thì cần phải tối ưu, tùy theo nhu cầu của ứng dụng, ví dụ theo kiểu sau 2,3 ký tự mới được gọi hoặc khách nhập nhưng chỉ gọi sau 3s không nhập gì. Vì Goong sẽ tính phí mỗi lần gọi Autocomplete này._

-   **Xoá marker:**

func removeAnnotationPoint() {
    guard let style \= mapView.style else {
        return
    }
    if let layer \= style.layer(withIdentifier: Constants.layer\_id\_des) {
        do {
            try style.removeLayer(layer)
        } catch {
            print("\\(error)")
        }
    } 

    if let source \= style.source(withIdentifier: Constants.source\_id\_destination) {
        do {
            try style.removeSource(source)
        } catch {
            print("\\(error)")
        }
    } 
}

### **Dẫn đường**

Dẫn đường sử dụng dịch vụ Directions, gửi kèm tọa độ điểm đầu, điểm cuối, phương tiện di chuyển, nhận về mã đường đi, khoảng cách 2 điểm, thời gian đi dự kiến,…

Sau khi bạn nhập tọa độ điểm đầu và cuối, gọi dịch vụ Directions của Goong sau đó sẽ giải mã đường đi và hiển thị đường đi đó lên bản đồ.

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

    func ConvertURL(origin: String, destination: String) {
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
            let task \= session.dataTask(with: request) { \[weak self\] data, response, error in
                do {
                    let json \= try JSONDecoder().decode(DirectionReponseDto.self, from: data!)
                    DispatchQueue.main.async {
                        self?.direction \= json
                        task?.cancel()
                    }
                } catch {
                    print("Error: \\(error)")
                }
            }
            task.resume()
        }
    }
}

Hàm này sẽ gọi dịch vụ Directions của [Goong](http://goong.io), bằng cách truyền tham số tọa độ điểm đầu và cuối, phương tiện di chuyển (ở đây lấy car) và sẽ lấy ra được đường (route), khoảng cách 2 điểm (distance), thời gian đi dự kiến (time),…

-   **DecodePolyline:**

Sau đó cần giải mã đường đi (route), hàm decodePolyline:

func decodeGeoJSON(from geoJsonString: String) throws -> FeatureCollection? {
    var featureCollection: FeatureCollection?

    do {
        guard let data \= geoJsonString.data(using: .utf8) else {
            return nil
        }
        
        featureCollection \= try JSONDecoder().decode(FeatureCollection.self, from: data)
    } catch {
        print("\\(error)")
    }
    
    return featureCollection
}

-   **Hiển thị đường đó lên bản đồ:**

func addLine(decodedCoordinates: \[CLLocationCoordinate2D\]) {
    let sourceIdentifier \= Constants.lineSource
    
    if let existingSource \= mapView.style?.source(withIdentifier: sourceIdentifier) as? MLNShapeSource {
        // Update the existing source with new data
        let polyline \= MLNPolyline(coordinates: decodedCoordinates, count: UInt(decodedCoordinates.count))
        existingSource.shape \= polyline
    } else {
        // Create a polyline with the coordinates
        let polyline \= MLNPolyline(coordinates: decodedCoordinates, count: UInt(decodedCoordinates.count))
        
        // Create a GeoJSON source
        let source \= MLNShapeSource(identifier: sourceIdentifier, shape: polyline, options: nil)
        mapView.style?.addSource(source)
        
        // Create a line layer and add it to the map
        let lineLayer \= MLNLineStyleLayer(identifier: Constants.LINE\_LAYER, source: source)
        lineLayer.lineColor \= NSExpression(forConstantValue: UIColor.blue)
        lineLayer.lineWidth \= NSExpression(forConstantValue: 10)
        lineLayer.lineCap \= NSExpression(forConstantValue: "round")
        lineLayer.lineJoin \= NSExpression(forConstantValue: "round")
        
        mapView.style?.addLayer(lineLayer)
    }
}

Hàm trên thực hiện vẽ đường từ điểm hiện tại đến điểm đến

-   **Để xoá dẫn đường :**

func removeLineLayer() {
    guard let style \= mapView.style else {
        print("Style chưa được tải.")
        return
    }
    
    if let layer \= style.layer(withIdentifier: Constants.LINE\_LAYER) {
        do {
            try style.removeLayer(layer)
        } catch {
            print("\\(error)")
        }
    } 
    
    if let source \= style.source(withIdentifier: Constants.lineSource) {
        do {
            try style.removeSource(source)
        } catch {
            print("\\(error)")
        }
    } 
}

-   **Tham khảo ví dụ mẫu tại đây**: [goong-sample-mapLibre-ios](https://help.goong.io/wp-content/uploads/2024/08/goong-sample-mapLibre-ios.zip)
-   **Tham khảo cách tích hợp và các hàm**: [https://github.com/maplibre/maplibre-native](https://github.com/maplibre/maplibre-native)
