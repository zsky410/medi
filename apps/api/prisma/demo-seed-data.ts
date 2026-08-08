export const DEMO_EMAIL_DOMAIN = "demo.medi.app";
export const DEMO_PASSWORD = "medi1234";

export type DemoPlan = "FREE" | "PRO";
export type DemoPlaceCategory = "ATTRACTION" | "FOOD" | "LODGING" | "TRANSPORT" | "SHOPPING" | "OTHER";
export type DemoTripVisibility = "PRIVATE" | "LINK" | "PUBLIC";
export type DemoTripDistributionMode = "EXPLORE_FREE" | "SHOP_FREE" | "SHOP_PAID";

export interface DemoUser {
  key: string;
  email: string;
  name: string;
  plan: DemoPlan;
  avatarUrl: string;
}

export interface DemoPlace {
  name: string;
  category: DemoPlaceCategory;
  address: string;
  lat: number;
  lng: number;
  note: string;
  cost: number;
  durationMinutes: number;
}

export interface DemoDay {
  order: number;
  places: DemoPlace[];
}

export interface DemoTrip {
  slug: string;
  ownerKey: string;
  memberKeys: string[];
  title: string;
  destination: string;
  coverImage: string;
  dayCount: number;
  budgetAmount: number;
  visibility: DemoTripVisibility;
  distributionMode: DemoTripDistributionMode;
  cloneCount: number;
  lodging: DemoPlace;
  days: DemoDay[];
  checklist: string[];
  guide?: DemoGuide;
}

export interface DemoGuide {
  title: string;
  description: string;
  price: number;
  currency: "VND";
  purchaseCount: number;
}

type StopSeed = Omit<DemoPlace, "lat" | "lng" | "durationMinutes">;

interface DestinationSeed {
  destination: string;
  center: { lat: number; lng: number };
  lodging: StopSeed;
  stops: StopSeed[];
}

const avatar = (seed: number) => `https://i.pravatar.cc/160?img=${seed}`;

export const DEMO_USERS: DemoUser[] = [
  { key: "an", email: `an.nguyen@${DEMO_EMAIL_DOMAIN}`, name: "An Nguyễn", plan: "PRO", avatarUrl: avatar(12) },
  { key: "bao", email: `bao.tran@${DEMO_EMAIL_DOMAIN}`, name: "Bảo Trần", plan: "FREE", avatarUrl: avatar(18) },
  { key: "chi", email: `chi.le@${DEMO_EMAIL_DOMAIN}`, name: "Chi Lê", plan: "PRO", avatarUrl: avatar(24) },
  { key: "duy", email: `duy.pham@${DEMO_EMAIL_DOMAIN}`, name: "Duy Phạm", plan: "FREE", avatarUrl: avatar(31) },
  { key: "em", email: `em.vo@${DEMO_EMAIL_DOMAIN}`, name: "Em Võ", plan: "PRO", avatarUrl: avatar(38) },
  { key: "giang", email: `giang.ho@${DEMO_EMAIL_DOMAIN}`, name: "Giang Hồ", plan: "FREE", avatarUrl: avatar(44) },
  { key: "han", email: `han.do@${DEMO_EMAIL_DOMAIN}`, name: "Hân Đỗ", plan: "PRO", avatarUrl: avatar(49) },
  { key: "khoa", email: `khoa.bui@${DEMO_EMAIL_DOMAIN}`, name: "Khoa Bùi", plan: "FREE", avatarUrl: avatar(53) },
  { key: "linh", email: `linh.dang@${DEMO_EMAIL_DOMAIN}`, name: "Linh Đặng", plan: "PRO", avatarUrl: avatar(58) },
  { key: "minh", email: `minh.ngo@${DEMO_EMAIL_DOMAIN}`, name: "Minh Ngô", plan: "FREE", avatarUrl: avatar(61) },
];

const destinationSeeds: Record<string, DestinationSeed> = {
  daLat: {
    destination: "Đà Lạt",
    center: { lat: 11.9404, lng: 108.4583 },
    lodging: {
      name: "Mây Lang Thang Homestay",
      category: "LODGING",
      address: "Phường 7, Đà Lạt",
      note: "Chỗ ở view đồi thông, tiện đi trung tâm và săn mây.",
      cost: 720000,
    },
    stops: [
      { name: "Hồ Xuân Hương", category: "ATTRACTION", address: "Trung tâm Đà Lạt", note: "Dạo hồ, chụp ảnh sáng sớm.", cost: 0 },
      { name: "Tiệm cà phê Túi Mơ To", category: "OTHER", address: "Hẻm 31 Sào Nam", note: "Cafe vườn, view thung lũng.", cost: 75000 },
      { name: "Quảng trường Lâm Viên", category: "ATTRACTION", address: "Trần Quốc Toản", note: "Check-in biểu tượng hoa dã quỳ.", cost: 0 },
      { name: "Bánh căn Nhà Chung", category: "FOOD", address: "Nhà Chung", note: "Ăn sáng bánh căn nóng.", cost: 60000 },
      { name: "Thác Datanla", category: "ATTRACTION", address: "Đèo Prenn", note: "Máng trượt và thác nước.", cost: 250000 },
      { name: "Chợ đêm Đà Lạt", category: "SHOPPING", address: "Nguyễn Thị Minh Khai", note: "Ăn vặt, mua đồ len.", cost: 150000 },
      { name: "Đồi chè Cầu Đất", category: "ATTRACTION", address: "Xuân Trường", note: "Săn mây, đồi chè buổi sớm.", cost: 50000 },
      { name: "Kokoro Cafe", category: "OTHER", address: "Khu du lịch Lá Phong", note: "Cafe phong cách Nhật.", cost: 90000 },
      { name: "Lẩu gà lá é Tao Ngộ", category: "FOOD", address: "Đường 3/4", note: "Bữa tối đặc sản Đà Lạt.", cost: 180000 },
      { name: "Lang Biang", category: "ATTRACTION", address: "Lạc Dương", note: "Ngắm núi và cao nguyên.", cost: 160000 },
      { name: "Nhà thờ Domaine de Marie", category: "ATTRACTION", address: "Ngô Quyền", note: "Kiến trúc màu hồng nổi bật.", cost: 0 },
      { name: "Kem bơ Thanh Thảo", category: "FOOD", address: "Nguyễn Văn Trỗi", note: "Ăn nhẹ sau khi dạo phố.", cost: 45000 },
    ],
  },
  daNang: {
    destination: "Đà Nẵng",
    center: { lat: 16.0471, lng: 108.2068 },
    lodging: {
      name: "Mỹ Khê Beach Hotel",
      category: "LODGING",
      address: "Võ Nguyên Giáp, Đà Nẵng",
      note: "Khách sạn ven biển, tiện đi Mỹ Khê và Sơn Trà.",
      cost: 980000,
    },
    stops: [
      { name: "Bãi biển Mỹ Khê", category: "ATTRACTION", address: "Võ Nguyên Giáp", note: "Tắm biển và dạo sáng.", cost: 0 },
      { name: "Bún chả cá Bà Lữ", category: "FOOD", address: "Hùng Vương", note: "Ăn sáng kiểu Đà Nẵng.", cost: 60000 },
      { name: "Ngũ Hành Sơn", category: "ATTRACTION", address: "Hòa Hải", note: "Hang động, chùa và view biển.", cost: 80000 },
      { name: "Chợ Hàn", category: "SHOPPING", address: "Trần Phú", note: "Mua đặc sản làm quà.", cost: 180000 },
      { name: "Bán đảo Sơn Trà", category: "ATTRACTION", address: "Sơn Trà", note: "Cung đường biển và chùa Linh Ứng.", cost: 0 },
      { name: "Cầu Rồng", category: "ATTRACTION", address: "Nguyễn Văn Linh", note: "Ngắm phố đêm, cuối tuần xem phun lửa.", cost: 0 },
      { name: "Mì Quảng Ếch Bếp Trang", category: "FOOD", address: "Lê Đình Dương", note: "Mì Quảng nổi tiếng.", cost: 85000 },
      { name: "A La Carte Rooftop", category: "OTHER", address: "Võ Nguyên Giáp", note: "Cafe/đồ uống ngắm biển.", cost: 160000 },
      { name: "Bảo tàng Điêu khắc Chăm", category: "ATTRACTION", address: "2 Tháng 9", note: "Tìm hiểu văn hóa Chăm.", cost: 60000 },
      { name: "Hải sản Năm Đảnh", category: "FOOD", address: "Sơn Trà", note: "Bữa tối hải sản địa phương.", cost: 250000 },
      { name: "Asia Park", category: "ATTRACTION", address: "2 Tháng 9", note: "Vòng quay và khu vui chơi tối.", cost: 180000 },
      { name: "Wonderlust Bakery & Coffee", category: "OTHER", address: "Trần Phú", note: "Cafe nghỉ chân trong trung tâm.", cost: 90000 },
    ],
  },
  hoiAn: {
    destination: "Hội An",
    center: { lat: 15.8801, lng: 108.338 },
    lodging: {
      name: "Hoi An Ancient House Village Resort",
      category: "LODGING",
      address: "Cẩm Thanh, Hội An",
      note: "Resort yên tĩnh, tiện vào phố cổ và rừng dừa.",
      cost: 1200000,
    },
    stops: [
      { name: "Phố cổ Hội An", category: "ATTRACTION", address: "Minh An", note: "Dạo phố cổ, nhà cổ, hội quán.", cost: 120000 },
      { name: "Bánh mì Phượng", category: "FOOD", address: "Phan Châu Trinh", note: "Ăn nhanh trước khi dạo phố.", cost: 45000 },
      { name: "Chùa Cầu", category: "ATTRACTION", address: "Nguyễn Thị Minh Khai", note: "Biểu tượng phố cổ.", cost: 0 },
      { name: "Faifo Coffee", category: "OTHER", address: "Trần Phú", note: "Rooftop ngắm mái ngói Hội An.", cost: 80000 },
      { name: "Rừng dừa Bảy Mẫu", category: "ATTRACTION", address: "Cẩm Thanh", note: "Đi thuyền thúng.", cost: 180000 },
      { name: "Chợ đêm Nguyễn Hoàng", category: "SHOPPING", address: "Nguyễn Hoàng", note: "Đèn lồng, quà lưu niệm.", cost: 160000 },
      { name: "Biển An Bàng", category: "ATTRACTION", address: "Cẩm An", note: "Tắm biển buổi chiều.", cost: 0 },
      { name: "Cao lầu Thanh", category: "FOOD", address: "Thái Phiên", note: "Đặc sản cao lầu.", cost: 65000 },
      { name: "Làng gốm Thanh Hà", category: "ATTRACTION", address: "Thanh Hà", note: "Trải nghiệm làm gốm.", cost: 90000 },
      { name: "Mót Hội An", category: "FOOD", address: "Trần Phú", note: "Nước thảo mộc check-in.", cost: 25000 },
      { name: "Làng rau Trà Quế", category: "ATTRACTION", address: "Cẩm Hà", note: "Lớp nấu ăn và vườn rau.", cost: 250000 },
      { name: "Morning Glory", category: "FOOD", address: "Nguyễn Thái Học", note: "Ăn tối món miền Trung.", cost: 220000 },
    ],
  },
  nhaTrang: {
    destination: "Nha Trang",
    center: { lat: 12.2388, lng: 109.1967 },
    lodging: {
      name: "Nha Trang Seaview Hotel",
      category: "LODGING",
      address: "Trần Phú, Nha Trang",
      note: "Khách sạn gần biển và chợ đêm.",
      cost: 1050000,
    },
    stops: [
      { name: "Biển Trần Phú", category: "ATTRACTION", address: "Trần Phú", note: "Tắm biển và dạo bộ.", cost: 0 },
      { name: "Bún cá Nguyên Loan", category: "FOOD", address: "Ngô Gia Tự", note: "Ăn sáng bún cá.", cost: 55000 },
      { name: "Tháp Bà Ponagar", category: "ATTRACTION", address: "2 Tháng 4", note: "Di tích Chăm nổi tiếng.", cost: 30000 },
      { name: "Hòn Mun", category: "ATTRACTION", address: "Vịnh Nha Trang", note: "Lặn ngắm san hô.", cost: 450000 },
      { name: "Chợ Đầm", category: "SHOPPING", address: "Bến Chợ", note: "Mua hải sản khô và đặc sản.", cost: 180000 },
      { name: "Sailing Club", category: "OTHER", address: "Trần Phú", note: "Ngắm biển buổi tối.", cost: 220000 },
      { name: "Tắm bùn I-Resort", category: "ATTRACTION", address: "Vĩnh Ngọc", note: "Thư giãn tắm bùn khoáng.", cost: 350000 },
      { name: "Nem nướng Đặng Văn Quyên", category: "FOOD", address: "Lãn Ông", note: "Đặc sản nem nướng.", cost: 90000 },
      { name: "Viện Hải dương học", category: "ATTRACTION", address: "Cầu Đá", note: "Tham quan sinh vật biển.", cost: 40000 },
      { name: "Rainforest Cafe", category: "OTHER", address: "Bắc Sơn", note: "Cafe nhiều cây xanh.", cost: 85000 },
      { name: "VinWonders Nha Trang", category: "ATTRACTION", address: "Hòn Tre", note: "Công viên giải trí cả ngày.", cost: 880000 },
      { name: "Hải sản Bờ Kè", category: "FOOD", address: "Cù Lao Trung", note: "Ăn tối hải sản.", cost: 280000 },
    ],
  },
  ninhBinh: {
    destination: "Ninh Bình",
    center: { lat: 20.2506, lng: 105.9745 },
    lodging: {
      name: "Tam Coc Garden Homestay",
      category: "LODGING",
      address: "Tam Cốc, Ninh Bình",
      note: "Homestay giữa đồng lúa, tiện đi Tràng An và Hang Múa.",
      cost: 780000,
    },
    stops: [
      { name: "Tràng An", category: "ATTRACTION", address: "Tràng An", note: "Đi thuyền qua hang và núi đá vôi.", cost: 250000 },
      { name: "Miến lươn Bà Phấn", category: "FOOD", address: "Ninh Bình", note: "Ăn sáng địa phương.", cost: 60000 },
      { name: "Hang Múa", category: "ATTRACTION", address: "Khê Đầu Hạ", note: "Leo núi ngắm Tam Cốc.", cost: 100000 },
      { name: "Tam Cốc", category: "ATTRACTION", address: "Hoa Lư", note: "Thuyền giữa đồng lúa.", cost: 250000 },
      { name: "Chùa Bích Động", category: "ATTRACTION", address: "Ninh Hải", note: "Chùa cổ trong núi.", cost: 0 },
      { name: "Dê núi Chính Thư", category: "FOOD", address: "Hoa Lư", note: "Ăn tối dê núi, cơm cháy.", cost: 220000 },
      { name: "Cố đô Hoa Lư", category: "ATTRACTION", address: "Trường Yên", note: "Di tích kinh đô xưa.", cost: 30000 },
      { name: "Cafe Brick", category: "OTHER", address: "Tam Cốc", note: "Cafe nghỉ chân.", cost: 70000 },
      { name: "Đầm Vân Long", category: "ATTRACTION", address: "Gia Viễn", note: "Khu bảo tồn đất ngập nước.", cost: 120000 },
      { name: "Chùa Bái Đính", category: "ATTRACTION", address: "Gia Sinh", note: "Quần thể chùa lớn.", cost: 120000 },
      { name: "Phố cổ Hoa Lư", category: "SHOPPING", address: "Ninh Bình", note: "Đi dạo và ăn vặt buổi tối.", cost: 150000 },
      { name: "Bún mọc Tố Như", category: "FOOD", address: "Ninh Bình", note: "Bữa trưa nhẹ.", cost: 55000 },
    ],
  },
  haNoi: {
    destination: "Hà Nội",
    center: { lat: 21.0278, lng: 105.8342 },
    lodging: {
      name: "Old Quarter Boutique Hotel",
      category: "LODGING",
      address: "Hàng Bạc, Hoàn Kiếm",
      note: "Ở ngay phố cổ, tiện đi bộ và food tour.",
      cost: 900000,
    },
    stops: [
      { name: "Hồ Hoàn Kiếm", category: "ATTRACTION", address: "Hoàn Kiếm", note: "Dạo hồ sáng sớm.", cost: 0 },
      { name: "Phở Bát Đàn", category: "FOOD", address: "Bát Đàn", note: "Ăn sáng phở Hà Nội.", cost: 70000 },
      { name: "Văn Miếu - Quốc Tử Giám", category: "ATTRACTION", address: "Đống Đa", note: "Di tích giáo dục cổ.", cost: 70000 },
      { name: "Cafe Giảng", category: "OTHER", address: "Nguyễn Hữu Huân", note: "Cà phê trứng.", cost: 45000 },
      { name: "Nhà tù Hỏa Lò", category: "ATTRACTION", address: "Hỏa Lò", note: "Bảo tàng lịch sử.", cost: 50000 },
      { name: "Chợ Đồng Xuân", category: "SHOPPING", address: "Đồng Xuân", note: "Mua đồ và ăn vặt.", cost: 150000 },
      { name: "Hoàng thành Thăng Long", category: "ATTRACTION", address: "Ba Đình", note: "Di sản văn hóa.", cost: 70000 },
      { name: "Bún chả Hương Liên", category: "FOOD", address: "Lê Văn Hưu", note: "Bữa trưa bún chả.", cost: 90000 },
      { name: "Hồ Tây", category: "ATTRACTION", address: "Tây Hồ", note: "Ngắm hoàng hôn.", cost: 0 },
      { name: "Tranquil Books & Coffee", category: "OTHER", address: "Nguyễn Quang Bích", note: "Cafe sách yên tĩnh.", cost: 75000 },
      { name: "Phố bia Tạ Hiện", category: "FOOD", address: "Tạ Hiện", note: "Ăn tối, phố đêm.", cost: 180000 },
      { name: "Lotte Observation Deck", category: "ATTRACTION", address: "Ba Đình", note: "Ngắm skyline Hà Nội.", cost: 250000 },
    ],
  },
  hcm: {
    destination: "TP.HCM",
    center: { lat: 10.7769, lng: 106.7009 },
    lodging: {
      name: "District 1 City Hotel",
      category: "LODGING",
      address: "Bến Nghé, Quận 1",
      note: "Khách sạn trung tâm, tiện đi bộ các điểm chính.",
      cost: 1000000,
    },
    stops: [
      { name: "Dinh Độc Lập", category: "ATTRACTION", address: "Nam Kỳ Khởi Nghĩa", note: "Di tích lịch sử trung tâm.", cost: 65000 },
      { name: "Bánh mì Huỳnh Hoa", category: "FOOD", address: "Lê Thị Riêng", note: "Bánh mì nổi tiếng.", cost: 70000 },
      { name: "Bưu điện Thành phố", category: "ATTRACTION", address: "Công xã Paris", note: "Kiến trúc cổ.", cost: 0 },
      { name: "Cà phê Linh", category: "OTHER", address: "Trương Định", note: "Cafe vợt kiểu Sài Gòn.", cost: 50000 },
      { name: "Bảo tàng Chứng tích Chiến tranh", category: "ATTRACTION", address: "Võ Văn Tần", note: "Bảo tàng lịch sử.", cost: 40000 },
      { name: "Chợ Bến Thành", category: "SHOPPING", address: "Lê Lợi", note: "Mua quà, ăn vặt.", cost: 180000 },
      { name: "Địa đạo Củ Chi", category: "ATTRACTION", address: "Củ Chi", note: "Tour nửa ngày tìm hiểu lịch sử.", cost: 350000 },
      { name: "Cơm tấm Ba Ghiền", category: "FOOD", address: "Đặng Văn Ngữ", note: "Cơm tấm sườn bì chả.", cost: 90000 },
      { name: "Phố đi bộ Nguyễn Huệ", category: "ATTRACTION", address: "Quận 1", note: "Dạo phố tối.", cost: 0 },
      { name: "Saigon Skydeck", category: "ATTRACTION", address: "Bitexco", note: "Ngắm thành phố từ cao.", cost: 240000 },
      { name: "Chợ Lớn", category: "SHOPPING", address: "Quận 5", note: "Khám phá khu người Hoa.", cost: 120000 },
      { name: "Secret Garden", category: "FOOD", address: "Pasteur", note: "Ăn tối món Việt rooftop.", cost: 260000 },
    ],
  },
  hue: {
    destination: "Huế",
    center: { lat: 16.4637, lng: 107.5909 },
    lodging: {
      name: "Sông Hương Garden Hotel",
      category: "LODGING",
      address: "Lê Lợi, Huế",
      note: "Gần sông Hương và khu trung tâm.",
      cost: 820000,
    },
    stops: [
      { name: "Đại Nội Huế", category: "ATTRACTION", address: "Phú Hậu", note: "Tham quan kinh thành.", cost: 200000 },
      { name: "Bún bò Mệ Kéo", category: "FOOD", address: "Bạch Đằng", note: "Ăn sáng bún bò Huế.", cost: 55000 },
      { name: "Chùa Thiên Mụ", category: "ATTRACTION", address: "Kim Long", note: "Chùa cổ bên sông Hương.", cost: 0 },
      { name: "Lăng Khải Định", category: "ATTRACTION", address: "Thủy Bằng", note: "Kiến trúc giao thoa Đông Tây.", cost: 150000 },
      { name: "Muối Coffee", category: "OTHER", address: "Nguyễn Lương Bằng", note: "Cafe muối đặc trưng.", cost: 50000 },
      { name: "Chợ Đông Ba", category: "SHOPPING", address: "Trần Hưng Đạo", note: "Mua mè xửng, nón lá.", cost: 150000 },
      { name: "Lăng Tự Đức", category: "ATTRACTION", address: "Thượng Ba", note: "Không gian lăng tẩm thơ mộng.", cost: 150000 },
      { name: "Cơm hến Hoa Đông", category: "FOOD", address: "Cồn Hến", note: "Bữa trưa cơm hến.", cost: 60000 },
      { name: "Làng hương Thủy Xuân", category: "ATTRACTION", address: "Huyền Trân Công Chúa", note: "Check-in làng hương.", cost: 50000 },
      { name: "Phá Tam Giang", category: "ATTRACTION", address: "Quảng Điền", note: "Ngắm hoàng hôn trên đầm phá.", cost: 180000 },
      { name: "Chè Hẻm", category: "FOOD", address: "Hùng Vương", note: "Ăn chè Huế.", cost: 40000 },
      { name: "Phố đi bộ Nguyễn Đình Chiểu", category: "OTHER", address: "Sông Hương", note: "Dạo tối bên sông.", cost: 0 },
    ],
  },
  phuQuoc: {
    destination: "Phú Quốc",
    center: { lat: 10.2899, lng: 103.984 },
    lodging: {
      name: "Bãi Sao Beach Resort",
      category: "LODGING",
      address: "An Thới, Phú Quốc",
      note: "Resort gần biển, tiện đi đảo phía nam.",
      cost: 1650000,
    },
    stops: [
      { name: "Bãi Sao", category: "ATTRACTION", address: "An Thới", note: "Tắm biển cát trắng.", cost: 0 },
      { name: "Bún quậy Kiến Xây", category: "FOOD", address: "Dương Đông", note: "Ăn sáng đặc sản.", cost: 80000 },
      { name: "Cáp treo Hòn Thơm", category: "ATTRACTION", address: "An Thới", note: "Ngắm quần đảo từ trên cao.", cost: 650000 },
      { name: "Sunset Town", category: "ATTRACTION", address: "An Thới", note: "Check-in phố Địa Trung Hải.", cost: 0 },
      { name: "Chuồn Chuồn Bistro", category: "OTHER", address: "Dương Đông", note: "Cafe view toàn đảo.", cost: 150000 },
      { name: "Chợ đêm Phú Quốc", category: "SHOPPING", address: "Dương Đông", note: "Hải sản, quà lưu niệm.", cost: 250000 },
      { name: "Làng chài Hàm Ninh", category: "ATTRACTION", address: "Hàm Ninh", note: "Ăn ghẹ và dạo cầu cảng.", cost: 250000 },
      { name: "Nhà tù Phú Quốc", category: "ATTRACTION", address: "An Thới", note: "Di tích lịch sử.", cost: 0 },
      { name: "Tour 4 đảo", category: "ATTRACTION", address: "An Thới", note: "Snorkeling và cano đảo.", cost: 850000 },
      { name: "Bãi Khem", category: "ATTRACTION", address: "An Thới", note: "Biển đẹp, ít đông hơn.", cost: 0 },
      { name: "Xin Chào Seafood", category: "FOOD", address: "Dương Đông", note: "Ăn tối hải sản ngắm biển.", cost: 350000 },
      { name: "Grand World Phú Quốc", category: "SHOPPING", address: "Gành Dầu", note: "Dạo phố đêm, show ánh sáng.", cost: 300000 },
    ],
  },
  haLong: {
    destination: "Hạ Long",
    center: { lat: 20.9101, lng: 107.1839 },
    lodging: {
      name: "Hạ Long Bay Cruise Cabin",
      category: "LODGING",
      address: "Bến Tuần Châu, Hạ Long",
      note: "Cabin du thuyền một đêm trên vịnh.",
      cost: 2200000,
    },
    stops: [
      { name: "Vịnh Hạ Long", category: "ATTRACTION", address: "Quảng Ninh", note: "Du thuyền giữa đảo đá vôi.", cost: 900000 },
      { name: "Bún bề bề Cầu Trắng", category: "FOOD", address: "Hạ Long", note: "Ăn sáng hải sản.", cost: 75000 },
      { name: "Hang Sửng Sốt", category: "ATTRACTION", address: "Vịnh Hạ Long", note: "Hang động nổi tiếng.", cost: 0 },
      { name: "Đảo Titop", category: "ATTRACTION", address: "Vịnh Hạ Long", note: "Leo view point và tắm biển.", cost: 0 },
      { name: "Kayak Hang Luồn", category: "ATTRACTION", address: "Vịnh Hạ Long", note: "Chèo kayak giữa núi đá.", cost: 200000 },
      { name: "Chợ đêm Hạ Long", category: "SHOPPING", address: "Bãi Cháy", note: "Mua đặc sản và đồ lưu niệm.", cost: 180000 },
      { name: "Bảo tàng Quảng Ninh", category: "ATTRACTION", address: "Trần Quốc Nghiễn", note: "Check-in kiến trúc kính đen.", cost: 40000 },
      { name: "Hải sản Cái Dăm", category: "FOOD", address: "Bãi Cháy", note: "Bữa tối hải sản.", cost: 320000 },
      { name: "Sun World Hạ Long", category: "ATTRACTION", address: "Bãi Cháy", note: "Cáp treo, vòng quay, công viên.", cost: 350000 },
      { name: "Cộng Cà Phê Hạ Long", category: "OTHER", address: "Bãi Cháy", note: "Cafe nghỉ chân.", cost: 70000 },
      { name: "Cảng Tuần Châu", category: "ATTRACTION", address: "Tuần Châu", note: "Dạo cảng và ngắm du thuyền.", cost: 0 },
      { name: "Chả mực Thoan", category: "FOOD", address: "Hạ Long", note: "Mua và ăn chả mực.", cost: 180000 },
    ],
  },
  sapa: {
    destination: "Sa Pa",
    center: { lat: 22.3364, lng: 103.8438 },
    lodging: {
      name: "Mường Hoa Valley Homestay",
      category: "LODGING",
      address: "Lao Chải, Sa Pa",
      note: "Homestay nhìn ruộng bậc thang.",
      cost: 750000,
    },
    stops: [
      { name: "Fansipan", category: "ATTRACTION", address: "Hoàng Liên", note: "Cáp treo lên nóc nhà Đông Dương.", cost: 850000 },
      { name: "Phở cốn sủi Ông Há", category: "FOOD", address: "Sa Pa", note: "Ăn sáng nóng.", cost: 65000 },
      { name: "Bản Cát Cát", category: "ATTRACTION", address: "San Sả Hồ", note: "Dạo bản và chụp ảnh.", cost: 150000 },
      { name: "Cafe Viettrekking", category: "OTHER", address: "Hoàng Liên", note: "Cafe săn mây.", cost: 90000 },
      { name: "Nhà thờ đá Sa Pa", category: "ATTRACTION", address: "Trung tâm Sa Pa", note: "Check-in trung tâm.", cost: 0 },
      { name: "Chợ đêm Sa Pa", category: "SHOPPING", address: "Trung tâm Sa Pa", note: "Đồ nướng và thổ cẩm.", cost: 180000 },
      { name: "Thung lũng Mường Hoa", category: "ATTRACTION", address: "Lao Chải", note: "Trekking ruộng bậc thang.", cost: 250000 },
      { name: "Cá hồi Ô Quý Hồ", category: "FOOD", address: "Sa Pa", note: "Ăn trưa cá hồi.", cost: 260000 },
      { name: "Đèo Ô Quý Hồ", category: "ATTRACTION", address: "QL4D", note: "Ngắm núi và hoàng hôn.", cost: 0 },
      { name: "Bản Tả Van", category: "ATTRACTION", address: "Tả Van", note: "Trekking nhẹ và gặp người bản địa.", cost: 120000 },
      { name: "Gem Valley Cafe", category: "OTHER", address: "Cát Cát", note: "Cafe nghệ thuật.", cost: 80000 },
      { name: "Lẩu cá tầm A Phủ", category: "FOOD", address: "Sa Pa", note: "Bữa tối ấm bụng.", cost: 280000 },
    ],
  },
  quyNhon: {
    destination: "Quy Nhơn",
    center: { lat: 13.7563, lng: 109.2297 },
    lodging: {
      name: "Quy Nhơn Beachfront Hotel",
      category: "LODGING",
      address: "Xuân Diệu, Quy Nhơn",
      note: "Khách sạn ven biển, tiện đi Eo Gió và Kỳ Co.",
      cost: 890000,
    },
    stops: [
      { name: "Kỳ Co", category: "ATTRACTION", address: "Nhơn Lý", note: "Biển xanh, cano và tắm biển.", cost: 350000 },
      { name: "Bún chả cá Ngọc Liên", category: "FOOD", address: "Nguyễn Huệ", note: "Ăn sáng đặc sản.", cost: 55000 },
      { name: "Eo Gió", category: "ATTRACTION", address: "Nhơn Lý", note: "Check-in vách đá ven biển.", cost: 25000 },
      { name: "Surf Bar", category: "OTHER", address: "Xuân Diệu", note: "Cafe biển buổi chiều.", cost: 90000 },
      { name: "Tháp Đôi", category: "ATTRACTION", address: "Trần Hưng Đạo", note: "Di tích Chăm trong thành phố.", cost: 20000 },
      { name: "Hải sản Hoàng Thao", category: "FOOD", address: "Nhơn Lý", note: "Ăn tối hải sản.", cost: 280000 },
      { name: "Ghềnh Ráng Tiên Sa", category: "ATTRACTION", address: "Ghềnh Ráng", note: "Bãi đá và mộ Hàn Mặc Tử.", cost: 30000 },
      { name: "Chợ Khu 6", category: "SHOPPING", address: "Quy Nhơn", note: "Ăn vặt, mua đồ địa phương.", cost: 120000 },
      { name: "Đồi cát Phương Mai", category: "ATTRACTION", address: "Nhơn Lý", note: "Trượt cát và chụp ảnh.", cost: 60000 },
      { name: "Bánh xèo tôm nhảy Gia Vỹ", category: "FOOD", address: "Diên Hồng", note: "Ăn trưa món Bình Định.", cost: 90000 },
      { name: "Cù Lao Xanh", category: "ATTRACTION", address: "Vịnh Quy Nhơn", note: "Tour đảo trong ngày.", cost: 650000 },
      { name: "S-Blue Coffee", category: "OTHER", address: "Xuân Diệu", note: "Nghỉ chân sát biển.", cost: 75000 },
    ],
  },
  muiNe: {
    destination: "Mũi Né",
    center: { lat: 10.9333, lng: 108.2833 },
    lodging: {
      name: "Mũi Né Sand Resort",
      category: "LODGING",
      address: "Nguyễn Đình Chiểu, Mũi Né",
      note: "Resort sát biển, tiện đi đồi cát.",
      cost: 1150000,
    },
    stops: [
      { name: "Đồi cát bay", category: "ATTRACTION", address: "Mũi Né", note: "Trượt cát và ngắm bình minh.", cost: 100000 },
      { name: "Bánh căn Lân Nguyệt", category: "FOOD", address: "Phan Thiết", note: "Ăn sáng bánh căn hải sản.", cost: 65000 },
      { name: "Suối Tiên", category: "ATTRACTION", address: "Huỳnh Thúc Kháng", note: "Đi bộ trong khe suối đỏ.", cost: 30000 },
      { name: "Làng chài Mũi Né", category: "ATTRACTION", address: "Mũi Né", note: "Chụp ảnh thuyền thúng.", cost: 0 },
      { name: "Joe's Cafe", category: "OTHER", address: "Nguyễn Đình Chiểu", note: "Cafe nhạc sống buổi tối.", cost: 120000 },
      { name: "Hải sản Bờ Kè", category: "FOOD", address: "Nguyễn Đình Chiểu", note: "Bữa tối hải sản.", cost: 280000 },
      { name: "Bàu Trắng", category: "ATTRACTION", address: "Hòa Thắng", note: "Jeep tour đồi cát trắng.", cost: 450000 },
      { name: "Tháp Chăm Po Sah Inu", category: "ATTRACTION", address: "Phan Thiết", note: "Di tích Chăm cổ.", cost: 30000 },
      { name: "Chợ Phan Thiết", category: "SHOPPING", address: "Phan Thiết", note: "Mua nước mắm, hải sản khô.", cost: 180000 },
      { name: "Răng mực Loan", category: "FOOD", address: "Phan Thiết", note: "Ăn vặt đặc sản.", cost: 70000 },
      { name: "Bãi đá Ông Địa", category: "ATTRACTION", address: "Hàm Tiến", note: "Ngắm biển và chụp ảnh.", cost: 0 },
      { name: "Pineapple Mũi Né", category: "OTHER", address: "Hàm Tiến", note: "Đồ uống sau biển.", cost: 100000 },
    ],
  },
  canTho: {
    destination: "Cần Thơ",
    center: { lat: 10.0452, lng: 105.7469 },
    lodging: {
      name: "Mekong Riverside Homestay",
      category: "LODGING",
      address: "Cái Răng, Cần Thơ",
      note: "Homestay ven sông, tiện đi chợ nổi sáng sớm.",
      cost: 680000,
    },
    stops: [
      { name: "Chợ nổi Cái Răng", category: "ATTRACTION", address: "Cái Răng", note: "Đi thuyền lúc bình minh.", cost: 250000 },
      { name: "Bún riêu Cần Thơ", category: "FOOD", address: "Ninh Kiều", note: "Ăn sáng sau chợ nổi.", cost: 50000 },
      { name: "Nhà cổ Bình Thủy", category: "ATTRACTION", address: "Bình Thủy", note: "Kiến trúc nhà cổ miền Tây.", cost: 30000 },
      { name: "Cồn Sơn", category: "ATTRACTION", address: "Bình Thủy", note: "Trải nghiệm cá lóc bay, vườn trái cây.", cost: 220000 },
      { name: "Cafe 1985", category: "OTHER", address: "Ninh Kiều", note: "Cafe nghỉ trưa.", cost: 65000 },
      { name: "Chợ đêm Tây Đô", category: "SHOPPING", address: "Ninh Kiều", note: "Ăn vặt và mua quà.", cost: 150000 },
      { name: "Bến Ninh Kiều", category: "ATTRACTION", address: "Ninh Kiều", note: "Dạo sông Hậu buổi tối.", cost: 0 },
      { name: "Lẩu mắm Dạ Lý", category: "FOOD", address: "3 Tháng 2", note: "Bữa tối miền Tây.", cost: 220000 },
      { name: "Thiền viện Trúc Lâm Phương Nam", category: "ATTRACTION", address: "Mỹ Khánh", note: "Không gian chùa rộng.", cost: 0 },
      { name: "Vườn trái cây Mỹ Khánh", category: "ATTRACTION", address: "Phong Điền", note: "Ăn trái cây tại vườn.", cost: 150000 },
      { name: "Hủ tiếu Sáu Hoài", category: "FOOD", address: "Cái Răng", note: "Lò hủ tiếu truyền thống.", cost: 80000 },
      { name: "Chợ Cần Thơ", category: "SHOPPING", address: "Hai Bà Trưng", note: "Mua đặc sản địa phương.", cost: 150000 },
    ],
  },
};

const durationByCategory: Record<DemoPlaceCategory, number> = {
  ATTRACTION: 110,
  FOOD: 70,
  LODGING: 30,
  TRANSPORT: 45,
  SHOPPING: 80,
  OTHER: 75,
};

function withCoordinates(seed: DestinationSeed, stop: StopSeed, index: number): DemoPlace {
  const ring = Math.floor(index / 6) + 1;
  const angle = (index * 47 * Math.PI) / 180;
  return {
    ...stop,
    lat: Number((seed.center.lat + Math.sin(angle) * 0.012 * ring).toFixed(6)),
    lng: Number((seed.center.lng + Math.cos(angle) * 0.012 * ring).toFixed(6)),
    durationMinutes: durationByCategory[stop.category],
  };
}

function buildDays(seedKey: keyof typeof destinationSeeds, dayCount: number, densePattern: number[] = [5, 5, 4, 5, 4]): DemoDay[] {
  const seed = destinationSeeds[seedKey];
  const stops = seed.stops.map((stop, index) => withCoordinates(seed, stop, index));
  let cursor = 0;
  return Array.from({ length: dayCount }, (_, dayIndex) => {
    const size = densePattern[dayIndex % densePattern.length];
    const places = Array.from({ length: size }, (_, i) => stops[(cursor + i) % stops.length]);
    cursor += size;
    if (!places.some((place) => place.category === "FOOD")) {
      const food = stops.find((place, index) => place.category === "FOOD" && index >= dayIndex) ?? stops.find((place) => place.category === "FOOD");
      if (food) places[places.length - 1] = food;
    }
    return { order: dayIndex, places };
  });
}

function lodging(seedKey: keyof typeof destinationSeeds): DemoPlace {
  const seed = destinationSeeds[seedKey];
  return withCoordinates(seed, seed.lodging, 99);
}

function makeTrip(input: {
  slug: string;
  ownerKey: string;
  memberKeys: string[];
  title: string;
  seedKey: keyof typeof destinationSeeds;
  dayCount: number;
  budgetAmount: number;
  cloneCount: number;
  coverImage?: string;
  checklist: string[];
  densePattern?: number[];
  distributionMode?: DemoTripDistributionMode;
  guide?: DemoGuide;
}): DemoTrip {
  return {
    slug: input.slug,
    ownerKey: input.ownerKey,
    memberKeys: input.memberKeys,
    title: input.title,
    destination: destinationSeeds[input.seedKey].destination,
    coverImage: input.coverImage ?? coverFor(input.seedKey, input.slug),
    dayCount: input.dayCount,
    budgetAmount: input.budgetAmount,
    visibility: "PUBLIC",
    distributionMode: input.distributionMode ?? "EXPLORE_FREE",
    cloneCount: input.cloneCount,
    lodging: lodging(input.seedKey),
    days: buildDays(input.seedKey, input.dayCount, input.densePattern),
    checklist: input.checklist,
    guide: input.guide,
  };
}

function guide(title: string, description: string, price: number, purchaseCount: number): DemoGuide {
  return { title, description, price, currency: "VND", purchaseCount };
}

const baseChecklist = ["CCCD/hộ chiếu", "Xác nhận chỗ ở", "Sạc dự phòng", "Thuốc cá nhân", "Áo mưa nhẹ"];
const beachChecklist = [...baseChecklist, "Kem chống nắng", "Đồ bơi", "Túi chống nước"];
const mountainChecklist = [...baseChecklist, "Áo khoác", "Giày đi bộ", "Miếng giữ nhiệt"];
const cityChecklist = [...baseChecklist, "Giày đi bộ", "Thẻ ngân hàng", "Túi nhỏ chống trộm"];

export const DEMO_COVER_IMAGES = {
  daLat: "https://image.vietnam.travel/sites/default/files/2021-05/Da%20Lat%20Travel%20Guide%20Vietnam%20Tourism.jpg",
  daNang: "https://image.vietnam.travel/sites/default/files/2018-10/danang%20travel%20guide.jpg",
  hoiAn: "https://image.vietnam.travel/sites/default/files/2017-07/vietnam-tourism.jpg",
  nhaTrang: "https://image.vietnam.travel/sites/default/files/2021-05/Nha%20Trang%20Travel%20Guide%20Vietnam%20Tourism.jpg",
  ninhBinh: "https://image.vietnam.travel/sites/default/files/2017-06/travel-vietnam-3.jpg",
  haNoi: "https://image.vietnam.travel/sites/default/files/2017-06/vietnam-travel-5.jpg",
  hcm: "https://image.vietnam.travel/sites/default/files/2017-07/vietnam-tourism-4.jpg",
  hue: "https://image.vietnam.travel/sites/default/files/2021-05/Hue%20Travel%20Guide%20Vietnam%20Tourism_0.jpg",
  phuQuoc: "https://image.vietnam.travel/sites/default/files/2021-05/Phu%20Quoc%20Travel%20Guide%20Vietnam%20Tourism_0.jpg",
  haLong: "https://image.vietnam.travel/sites/default/files/2017-06/visitvietnam-3.jpg",
  sapa: "https://image.vietnam.travel/sites/default/files/2021-05/Sapa%20Travel%20Guide%20Vietnam%20Tourism.jpg",
  quyNhon: "https://image.sggp.org.vn/w1000/Uploaded/2026/zfuswurkxr/2023_02_13/eogio-voxk-3579.jpg",
  muiNe: "https://duaelbluiumc3.cloudfront.net/Media/Images/InboundImages/place_to_visit_Vietnam/Mui-Ne-Beach-2.jpg",
  canTho: "https://image.vietnam.travel/sites/default/files/2021-05/Can%20Tho%20Travel%20Guide%20Vietnam%20Tourism_2.jpg",
} as const;

export const DEMO_COVER_IMAGE_POOLS: Record<keyof typeof DEMO_COVER_IMAGES, readonly string[]> = {
  daLat: [
    DEMO_COVER_IMAGES.daLat,
    "https://huongtientourist.com/wp-content/uploads/2025/09/Valley-of-Love-Da-Lat.jpg",
    "https://grantourismotravels.com/wp-content/uploads/2018/04/One-Day-in-Dalat-Vietnam-Itinerary-Copyright-2022-Terence-Carter-Grantourismo-T.jpg",
  ],
  daNang: [
    DEMO_COVER_IMAGES.daNang,
    "https://mediaen.vietnamplus.vn/images/cc571c067c64d4f85fb35f04673bf296e641ee0239bd074cd0dadd7b29a369cc44385f555410ba4d93606e7c2f9733fe9e362ed184cebf37073861eeaf80b59e/golden_bridge__iconic.jpg",
    "https://static-images.vnncdn.net/files/publish/2022/9/14/five-most-visited-photogenic-bridges-in-vietnam-ae0ba6dce76246aa99bf90f775c853ff.png",
  ],
  hoiAn: [
    DEMO_COVER_IMAGES.hoiAn,
    "https://imghappyvietnam.vnanet.vn/MediaUpload/Org/2024/06/16/194632-vna_potal_thuong_dinh_my-trieu_2019_pho_co_hoi_an-di_san_van_hoa_the_gioi_104401816_3738366.jpg",
    "https://hoiangardenvillas.com/wp-content/uploads/2024/08/hoi-an-thanh-pho-du-lich-hap-dan.jpg",
  ],
  nhaTrang: [
    DEMO_COVER_IMAGES.nhaTrang,
    "https://skylightnhatrang.com/wp-content/uploads/2024/07/nha-trang-co-phai-la-diem-den-ly-tuong-10.jpg",
    "https://usolie.info/userfiles/picmedia/image-1774605587_1937.png",
  ],
  ninhBinh: [
    DEMO_COVER_IMAGES.ninhBinh,
    "https://en-cdn.nhandan.vn/images/690c590d50fc5d3afa89e2f20ddc864a6d998ccc845395207565389e3fcd3f7dc7aa93cf9066ed23ae754929e0028ffee9025c2d7944d75148de8ee1664be9e4/imageninh-binh.jpg",
  ],
  haNoi: [
    DEMO_COVER_IMAGES.haNoi,
    "https://vietnamdiscovery.com/wp-content/uploads/2025/03/Taxi-Hanoi-Airport-to-Old-Quarter.jpg",
  ],
  hcm: [
    DEMO_COVER_IMAGES.hcm,
    "https://tnt-aviation.aero/uploads/news/2025_06/s1180x560.jpg",
  ],
  hue: [
    DEMO_COVER_IMAGES.hue,
    "https://static.wixstatic.com/media/5d0430_b05e333553444d4cbe61be6de751f89e~mv2.jpg/v1/fill/w_2560%2Ch_1706%2Cal_c%2Cq_90/hue-imperial-citadel.jpg",
    "https://ncuappshoretrip.blob.core.windows.net/ncu-media-shoretrip-prod/images/17763fb5-d641-4aca-a8d7-5ffc8d0098c4.jpg",
  ],
  phuQuoc: [
    DEMO_COVER_IMAGES.phuQuoc,
    "https://ik.imagekit.io/tvlk/blog/2023/09/bai-sao-8.jpg?tr=q-70%2Cc-at_max%2Cw-1000%2Ch-600",
  ],
  haLong: [
    DEMO_COVER_IMAGES.haLong,
    "https://mettavoyage.com/wp-content/uploads/2023/07/Copy-of-Chua-co-ten-1000-%C3%97-680-px-700-%C3%97-472-px-16.png",
    "https://www.gxlycyts.com/uploads/140717/160711/260121/1-26012115134J20.jpg",
  ],
  sapa: [
    DEMO_COVER_IMAGES.sapa,
    "https://m.chapaexpresstrain.com/storage/posts/12d63a76-9760-4bfc-9389-0f00d2f713fd.jpg",
    "https://i0.wp.com/theluxurytravelexpert.com/wp-content/uploads/2017/07/sapa.jpg?ssl=1",
  ],
  quyNhon: [
    DEMO_COVER_IMAGES.quyNhon,
    "https://mia.vn/media/uploads/blog-du-lich/ky-co-eo-gio-3-1751644636.jpg",
    "https://myvietnamtours.com/wp/wp-content/uploads/2023/12/With-smooth-sand-dunes-and-pristine-clear-beaches-Ky-Co-Eo-Gio-is-considered-to-be-the-Maldives-of-Vietnam.-750x422.jpg",
  ],
  muiNe: [
    DEMO_COVER_IMAGES.muiNe,
    "https://cdn.getyourguide.com/image/format%3Dauto%2Cfit%3Dcrop%2Cgravity%3Dcenter%2Cquality%3D60%2Cwidth%3D400%2Cheight%3D265%2Cdpr%3D2/tour_img/4d2c61f2fadb161de3d04365da0696ff266839ec2ae5e114d0e43c3ac4461938.jpg",
    "https://a.cdn-hotels.com/gdcs/production128/d380/b5c0b913-b896-462e-9672-c5b593460748.jpg?h=1066&impolicy=fcrop&q=medium&w=1600",
  ],
  canTho: [
    DEMO_COVER_IMAGES.canTho,
    "https://en-cdn.nhandan.vn/images/767e7ba477f43c18c09baa99f3063129c0d753490abd6a4797e9a2464e60cb4d2717ed0c6b0c38264b3b6ab9f89826a16e7b9973a2a16b72ad5c4ef974d5dafa5066dac795c9ee1cdfaee037ee9e29fe/c619d3e8a414f31623c3dc88046312ea.jpg",
  ],
};

const coverCursor = new Map<keyof typeof DEMO_COVER_IMAGES, number>();

function coverFor(seedKey: keyof typeof destinationSeeds, _slug: string): string {
  const pool = DEMO_COVER_IMAGE_POOLS[seedKey];
  const index = coverCursor.get(seedKey) ?? 0;
  coverCursor.set(seedKey, index + 1);
  return pool[index % pool.length];
}

export const DEMO_TRIPS: DemoTrip[] = [
  makeTrip({ slug: "da-lat-chill-3n2d", ownerKey: "an", memberKeys: ["bao", "chi"], title: "Đà Lạt chill 3N2Đ: cafe, thác và chợ đêm", seedKey: "daLat", dayCount: 3, budgetAmount: 4200000, cloneCount: 38, checklist: mountainChecklist }),
  makeTrip({ slug: "da-lat-san-may-4n3d", ownerKey: "chi", memberKeys: ["an", "duy"], title: "Đà Lạt săn mây 4N3Đ: Cầu Đất và đồi thông", seedKey: "daLat", dayCount: 4, budgetAmount: 5600000, cloneCount: 44, checklist: mountainChecklist, densePattern: [6, 5, 5, 4] }),
  makeTrip({ slug: "da-nang-bien-pho-3n2d", ownerKey: "duy", memberKeys: ["em", "giang"], title: "Đà Nẵng 3N2Đ: biển Mỹ Khê, Sơn Trà, food tour", seedKey: "daNang", dayCount: 3, budgetAmount: 4800000, cloneCount: 52, checklist: beachChecklist }),
  makeTrip({ slug: "da-nang-hoi-an-4n3d", ownerKey: "em", memberKeys: ["han", "khoa"], title: "Đà Nẵng - Hội An 4N3Đ: biển, phố cổ, rừng dừa", seedKey: "hoiAn", dayCount: 4, budgetAmount: 6500000, cloneCount: 61, checklist: beachChecklist, densePattern: [5, 6, 5, 4] }),
  makeTrip({ slug: "nha-trang-island-3n2d", ownerKey: "giang", memberKeys: ["linh", "minh"], title: "Nha Trang island hopping 3N2Đ: biển, đảo, hải sản", seedKey: "nhaTrang", dayCount: 3, budgetAmount: 5200000, cloneCount: 47, checklist: beachChecklist }),
  makeTrip({ slug: "nha-trang-nghi-duong-4n3d", ownerKey: "han", memberKeys: ["an", "bao"], title: "Nha Trang nghỉ dưỡng 4N3Đ: tắm bùn, đảo và cafe biển", seedKey: "nhaTrang", dayCount: 4, budgetAmount: 7200000, cloneCount: 34, checklist: beachChecklist, densePattern: [5, 5, 6, 4] }),
  makeTrip({ slug: "ninh-binh-3n2d", ownerKey: "khoa", memberKeys: ["chi", "duy"], title: "Ninh Bình 3N2Đ: Tràng An, Hang Múa, Tam Cốc", seedKey: "ninhBinh", dayCount: 3, budgetAmount: 3900000, cloneCount: 58, checklist: mountainChecklist }),
  makeTrip({ slug: "ha-noi-cuoi-tuan-3n2d", ownerKey: "linh", memberKeys: ["em", "giang"], title: "Hà Nội cuối tuần 3N2Đ: phố cổ, cafe trứng, food tour", seedKey: "haNoi", dayCount: 3, budgetAmount: 4100000, cloneCount: 73, checklist: cityChecklist }),
  makeTrip({ slug: "ha-noi-van-hoa-4n3d", ownerKey: "minh", memberKeys: ["han", "khoa"], title: "Hà Nội văn hóa 4N3Đ: bảo tàng, Hồ Tây, phố đêm", seedKey: "haNoi", dayCount: 4, budgetAmount: 5400000, cloneCount: 29, checklist: cityChecklist, densePattern: [6, 5, 5, 4] }),
  makeTrip({ slug: "hcm-city-break-3n2d", ownerKey: "an", memberKeys: ["linh", "minh"], title: "TP.HCM city break 3N2Đ: Quận 1, bảo tàng, rooftop", seedKey: "hcm", dayCount: 3, budgetAmount: 4500000, cloneCount: 66, checklist: cityChecklist }),
  makeTrip({ slug: "hcm-cu-chi-4n3d", ownerKey: "bao", memberKeys: ["duy", "em"], title: "TP.HCM - Củ Chi 4N3Đ: city tour và Chợ Lớn", seedKey: "hcm", dayCount: 4, budgetAmount: 5900000, cloneCount: 41, checklist: cityChecklist, densePattern: [5, 6, 5, 4] }),
  makeTrip({ slug: "hue-di-san-3n2d", ownerKey: "chi", memberKeys: ["giang", "han"], title: "Huế di sản 3N2Đ: Đại Nội, lăng tẩm, cơm hến", seedKey: "hue", dayCount: 3, budgetAmount: 3800000, cloneCount: 55, checklist: cityChecklist }),
  makeTrip({ slug: "hue-cham-rai-4n3d", ownerKey: "duy", memberKeys: ["khoa", "linh"], title: "Huế chậm rãi 4N3Đ: làng hương, phá Tam Giang, cafe muối", seedKey: "hue", dayCount: 4, budgetAmount: 5100000, cloneCount: 32, checklist: cityChecklist, densePattern: [5, 5, 6, 4] }),
  makeTrip({ slug: "phu-quoc-bien-dao-4n3d", ownerKey: "em", memberKeys: ["an", "minh"], title: "Phú Quốc biển đảo 4N3Đ: Bãi Sao, Hòn Thơm, chợ đêm", seedKey: "phuQuoc", dayCount: 4, budgetAmount: 8200000, cloneCount: 69, checklist: beachChecklist, densePattern: [5, 6, 5, 4] }),
  makeTrip({ slug: "phu-quoc-nghi-duong-5n4d", ownerKey: "giang", memberKeys: ["bao", "chi"], title: "Phú Quốc nghỉ dưỡng 5N4Đ: tour đảo, Sunset Town, resort", seedKey: "phuQuoc", dayCount: 5, budgetAmount: 11200000, cloneCount: 48, checklist: beachChecklist, densePattern: [6, 5, 5, 5, 4] }),
  makeTrip({ slug: "ha-long-cruise-3n2d", ownerKey: "han", memberKeys: ["duy", "linh"], title: "Hạ Long 3N2Đ: du thuyền, hang động, kayak", seedKey: "haLong", dayCount: 3, budgetAmount: 6900000, cloneCount: 37, checklist: beachChecklist }),
  makeTrip({ slug: "sapa-4n3d", ownerKey: "khoa", memberKeys: ["em", "minh"], title: "Sa Pa 4N3Đ: Fansipan, Mường Hoa, bản làng", seedKey: "sapa", dayCount: 4, budgetAmount: 6200000, cloneCount: 64, checklist: mountainChecklist, densePattern: [5, 6, 5, 4] }),
  makeTrip({ slug: "quy-nhon-3n2d", ownerKey: "linh", memberKeys: ["an", "han"], title: "Quy Nhơn 3N2Đ: Kỳ Co, Eo Gió, hải sản", seedKey: "quyNhon", dayCount: 3, budgetAmount: 4300000, cloneCount: 31, checklist: beachChecklist }),
  makeTrip({ slug: "mui-ne-3n2d", ownerKey: "minh", memberKeys: ["bao", "giang"], title: "Mũi Né 3N2Đ: đồi cát, Suối Tiên, resort biển", seedKey: "muiNe", dayCount: 3, budgetAmount: 4600000, cloneCount: 26, checklist: beachChecklist }),
  makeTrip({ slug: "can-tho-mien-tay-3n2d", ownerKey: "bao", memberKeys: ["chi", "khoa"], title: "Cần Thơ miền Tây 3N2Đ: chợ nổi, vườn trái cây, homestay", seedKey: "canTho", dayCount: 3, budgetAmount: 3600000, cloneCount: 45, checklist: baseChecklist }),
  makeTrip({ slug: "hoi-an-am-thuc-3n2d", ownerKey: "an", memberKeys: ["em", "han"], title: "Hội An 3N2Đ: cao lầu, phố đèn lồng và biển An Bàng", seedKey: "hoiAn", dayCount: 3, budgetAmount: 4200000, cloneCount: 57, checklist: cityChecklist, densePattern: [6, 5, 4] }),
  makeTrip({ slug: "ha-long-cat-ba-4n3d", ownerKey: "chi", memberKeys: ["bao", "linh"], title: "Hạ Long - Cát Bà 4N3Đ: vịnh, hang động và kayak", seedKey: "haLong", dayCount: 4, budgetAmount: 7600000, cloneCount: 50, checklist: beachChecklist, densePattern: [5, 6, 5, 4] }),
  makeTrip({ slug: "sapa-ban-lang-3n2d", ownerKey: "duy", memberKeys: ["giang", "khoa"], title: "Sa Pa bản làng 3N2Đ: Mường Hoa, bản Cát Cát, cafe núi", seedKey: "sapa", dayCount: 3, budgetAmount: 4700000, cloneCount: 46, checklist: mountainChecklist, densePattern: [5, 6, 4] }),
  makeTrip({ slug: "phu-quoc-sunset-3n2d", ownerKey: "em", memberKeys: ["han", "minh"], title: "Phú Quốc 3N2Đ: Bãi Sao, Sunset Town và chợ đêm", seedKey: "phuQuoc", dayCount: 3, budgetAmount: 6800000, cloneCount: 62, checklist: beachChecklist, densePattern: [6, 5, 4] }),
  makeTrip({ slug: "hue-lang-huong-3n2d", ownerKey: "giang", memberKeys: ["an", "duy"], title: "Huế 3N2Đ: Đại Nội, làng hương và cafe muối", seedKey: "hue", dayCount: 3, budgetAmount: 3900000, cloneCount: 43, checklist: cityChecklist, densePattern: [5, 5, 5] }),
  makeTrip({ slug: "da-nang-ba-na-3n2d", ownerKey: "han", memberKeys: ["chi", "khoa"], title: "Đà Nẵng 3N2Đ: Bà Nà, Sơn Trà và hải sản", seedKey: "daNang", dayCount: 3, budgetAmount: 5600000, cloneCount: 59, checklist: beachChecklist, densePattern: [6, 5, 5] }),
  makeTrip({ slug: "ninh-binh-gia-dinh-4n3d", ownerKey: "khoa", memberKeys: ["bao", "em"], title: "Ninh Bình gia đình 4N3Đ: Tràng An, Vân Long, Bái Đính", seedKey: "ninhBinh", dayCount: 4, budgetAmount: 5200000, cloneCount: 39, checklist: mountainChecklist, densePattern: [5, 5, 6, 4] }),
  makeTrip({ slug: "ha-noi-food-photo-3n2d", ownerKey: "linh", memberKeys: ["giang", "minh"], title: "Hà Nội 3N2Đ: food tour, phố cổ và góc chụp ảnh", seedKey: "haNoi", dayCount: 3, budgetAmount: 4300000, cloneCount: 70, checklist: cityChecklist, densePattern: [6, 5, 4] }),
  makeTrip({ slug: "hcm-rooftop-3n2d", ownerKey: "minh", memberKeys: ["an", "han"], title: "TP.HCM 3N2Đ: bảo tàng, Chợ Lớn và rooftop", seedKey: "hcm", dayCount: 3, budgetAmount: 4700000, cloneCount: 54, checklist: cityChecklist, densePattern: [5, 6, 4] }),
  makeTrip({ slug: "can-tho-cho-noi-4n3d", ownerKey: "bao", memberKeys: ["chi", "linh"], title: "Cần Thơ 4N3Đ: chợ nổi, vườn trái cây và homestay", seedKey: "canTho", dayCount: 4, budgetAmount: 4400000, cloneCount: 42, checklist: baseChecklist, densePattern: [5, 5, 6, 4] }),
  makeTrip({ slug: "shop-da-lat-couple-4n3d", ownerKey: "an", memberKeys: ["chi", "linh"], title: "Guide Đà Lạt couple 4N3Đ: săn mây, cafe view đẹp, ăn tối ấm cúng", seedKey: "daLat", dayCount: 4, budgetAmount: 6800000, cloneCount: 25, checklist: mountainChecklist, densePattern: [6, 5, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Đà Lạt couple 4N3Đ", "Guide tối ưu cho cặp đôi muốn lịch trình dày nhưng vẫn có nhịp nghỉ: săn mây Cầu Đất, cafe view đồi, thác Datanla, chợ đêm và các bữa ăn đặc sản.", 149000, 88) }),
  makeTrip({ slug: "shop-da-lat-budget-3n2d", ownerKey: "bao", memberKeys: ["duy", "minh"], title: "Guide Đà Lạt tiết kiệm 3N2Đ: cafe, chợ đêm và điểm đẹp", seedKey: "daLat", dayCount: 3, budgetAmount: 3200000, cloneCount: 19, checklist: mountainChecklist, densePattern: [5, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Đà Lạt tiết kiệm 3N2Đ", "Guide giá tốt cho nhóm bạn cần demo nhanh: nhiều điểm check-in không tốn vé, quán ăn bình dân, cafe dễ đi và homestay gần trung tâm.", 79000, 74) }),
  makeTrip({ slug: "shop-da-nang-family-4n3d", ownerKey: "chi", memberKeys: ["em", "khoa"], title: "Guide Đà Nẵng gia đình 4N3Đ: biển, Bà Nà, bảo tàng và hải sản", seedKey: "daNang", dayCount: 4, budgetAmount: 7800000, cloneCount: 28, checklist: beachChecklist, densePattern: [5, 6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Đà Nẵng gia đình 4N3Đ", "Lịch trình cân bằng cho gia đình: sáng biển Mỹ Khê, ngày Bà Nà/Ngũ Hành Sơn, bảo tàng Chăm, chợ Hàn và các quán ăn địa phương dễ đặt xe.", 179000, 96) }),
  makeTrip({ slug: "shop-hoi-an-photo-3n2d", ownerKey: "duy", memberKeys: ["an", "han"], title: "Guide Hội An chụp ảnh 3N2Đ: phố cổ, rừng dừa, An Bàng", seedKey: "hoiAn", dayCount: 3, budgetAmount: 4500000, cloneCount: 21, checklist: cityChecklist, densePattern: [6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Hội An chụp ảnh 3N2Đ", "Guide tập trung các khung giờ đẹp ở phố cổ, Chùa Cầu, Faifo Coffee, rừng dừa Bảy Mẫu và biển An Bàng để demo ảnh preview sinh động.", 89000, 82) }),
  makeTrip({ slug: "shop-nha-trang-island-4n3d", ownerKey: "em", memberKeys: ["giang", "minh"], title: "Guide Nha Trang biển đảo 4N3Đ: Hòn Mun, tắm bùn, hải sản", seedKey: "nhaTrang", dayCount: 4, budgetAmount: 7600000, cloneCount: 24, checklist: beachChecklist, densePattern: [5, 5, 6, 4], distributionMode: "SHOP_PAID", guide: guide("Nha Trang biển đảo 4N3Đ", "Bản guide trả phí cho nhóm thích biển: đảo Hòn Mun, VinWonders, tắm bùn, cafe cây xanh, chợ Đầm và các bữa hải sản đã chia theo ngày.", 159000, 79) }),
  makeTrip({ slug: "shop-ninh-binh-nature-3n2d", ownerKey: "giang", memberKeys: ["bao", "khoa"], title: "Guide Ninh Bình thiên nhiên 3N2Đ: Tràng An, Hang Múa, Tam Cốc", seedKey: "ninhBinh", dayCount: 3, budgetAmount: 3900000, cloneCount: 17, checklist: mountainChecklist, densePattern: [5, 6, 4], distributionMode: "SHOP_PAID", guide: guide("Ninh Bình thiên nhiên 3N2Đ", "Guide cho chuyến ngắn: gom các điểm thuyền, núi, chùa và món dê núi theo thứ tự dễ đi, tránh lặp điểm cuối ngày trước sang ngày sau.", 99000, 67) }),
  makeTrip({ slug: "shop-ha-noi-culture-5n4d", ownerKey: "han", memberKeys: ["chi", "linh"], title: "Guide Hà Nội văn hóa 5N4Đ: bảo tàng, Hồ Tây, phố cổ, food tour", seedKey: "haNoi", dayCount: 5, budgetAmount: 6900000, cloneCount: 26, checklist: cityChecklist, densePattern: [6, 5, 5, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Hà Nội văn hóa 5N4Đ", "Guide trả phí cho người thích lịch trình dày: bảo tàng, di tích, phố cổ, Hồ Tây, cafe trứng, bún chả và các điểm ngắm skyline theo buổi.", 199000, 103) }),
  makeTrip({ slug: "shop-hcm-first-time-4n3d", ownerKey: "khoa", memberKeys: ["duy", "em"], title: "Guide TP.HCM lần đầu 4N3Đ: Quận 1, Chợ Lớn, Củ Chi", seedKey: "hcm", dayCount: 4, budgetAmount: 6200000, cloneCount: 23, checklist: cityChecklist, densePattern: [5, 6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("TP.HCM lần đầu 4N3Đ", "Lịch trình trả phí cho khách lần đầu tới Sài Gòn: gom điểm trung tâm, bảo tàng, Chợ Lớn, Củ Chi, rooftop và quán ăn nổi tiếng theo cụm di chuyển.", 169000, 91) }),
  makeTrip({ slug: "shop-hue-heritage-4n3d", ownerKey: "linh", memberKeys: ["an", "giang"], title: "Guide Huế di sản 4N3Đ: Đại Nội, lăng tẩm, phá Tam Giang", seedKey: "hue", dayCount: 4, budgetAmount: 5400000, cloneCount: 18, checklist: cityChecklist, densePattern: [5, 5, 6, 4], distributionMode: "SHOP_PAID", guide: guide("Huế di sản 4N3Đ", "Guide di sản: Đại Nội, lăng tẩm, làng hương, phá Tam Giang, cafe muối và các món Huế được rải đều từng ngày.", 109000, 76) }),
  makeTrip({ slug: "shop-phu-quoc-resort-5n4d", ownerKey: "minh", memberKeys: ["bao", "han"], title: "Guide Phú Quốc resort 5N4Đ: tour đảo, Sunset Town, nghỉ dưỡng", seedKey: "phuQuoc", dayCount: 5, budgetAmount: 12500000, cloneCount: 30, checklist: beachChecklist, densePattern: [6, 5, 5, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Phú Quốc resort 5N4Đ", "Guide trả phí cho chuyến nghỉ dưỡng dài hơn: beach club, Bãi Sao, Hòn Thơm, Sunset Town, chợ đêm và nhịp nghỉ resort không bị quá tải.", 229000, 112) }),
  makeTrip({ slug: "shop-ha-long-cruise-4n3d", ownerKey: "bao", memberKeys: ["chi", "minh"], title: "Guide Hạ Long du thuyền 4N3Đ: hang động, kayak, Cát Bà", seedKey: "haLong", dayCount: 4, budgetAmount: 8600000, cloneCount: 22, checklist: beachChecklist, densePattern: [5, 6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Hạ Long du thuyền 4N3Đ", "Bản guide trả phí cho nhóm muốn trải nghiệm vịnh sâu hơn: lịch du thuyền, hang động, kayak, chợ đêm và nhịp di chuyển sang Cát Bà.", 189000, 85) }),
  makeTrip({ slug: "shop-sapa-trekking-4n3d", ownerKey: "an", memberKeys: ["duy", "khoa"], title: "Guide Sa Pa trekking 4N3Đ: Fansipan, Mường Hoa, bản làng", seedKey: "sapa", dayCount: 4, budgetAmount: 6500000, cloneCount: 20, checklist: mountainChecklist, densePattern: [5, 6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Sa Pa trekking 4N3Đ", "Guide cho nhóm thích núi: Fansipan, thung lũng Mường Hoa, bản làng, cafe núi và các bữa ăn ấm bụng sau ngày đi bộ.", 129000, 89) }),
  makeTrip({ slug: "shop-quy-nhon-beach-3n2d", ownerKey: "chi", memberKeys: ["em", "linh"], title: "Guide Quy Nhơn biển xanh 3N2Đ: Kỳ Co, Eo Gió, hải sản", seedKey: "quyNhon", dayCount: 3, budgetAmount: 4600000, cloneCount: 15, checklist: beachChecklist, densePattern: [6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Quy Nhơn biển xanh 3N2Đ", "Guide cho lịch biển ngắn ngày: Kỳ Co, Eo Gió, Tháp Đôi, cafe ven biển và quán hải sản được gom theo cung đường hợp lý.", 89000, 64) }),
  makeTrip({ slug: "shop-mui-ne-sand-dunes-3n2d", ownerKey: "duy", memberKeys: ["bao", "giang"], title: "Guide Mũi Né 3N2Đ: đồi cát, Suối Tiên, resort biển", seedKey: "muiNe", dayCount: 3, budgetAmount: 4800000, cloneCount: 14, checklist: beachChecklist, densePattern: [5, 6, 4], distributionMode: "SHOP_PAID", guide: guide("Mũi Né đồi cát 3N2Đ", "Guide cho chuyến nghỉ biển dễ demo: bình minh đồi cát, Suối Tiên, làng chài, resort biển và các bữa hải sản địa phương.", 79000, 61) }),
  makeTrip({ slug: "shop-can-tho-local-3n2d", ownerKey: "em", memberKeys: ["han", "minh"], title: "Guide Cần Thơ local 3N2Đ: chợ nổi, vườn trái cây, homestay", seedKey: "canTho", dayCount: 3, budgetAmount: 3800000, cloneCount: 16, checklist: baseChecklist, densePattern: [5, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Cần Thơ local 3N2Đ", "Guide cho trải nghiệm miền Tây: chợ nổi Cái Răng, vườn trái cây, nhà cổ, bến Ninh Kiều và homestay sông nước.", 89000, 73) }),
  makeTrip({ slug: "shop-da-nang-hoi-an-premium-5n4d", ownerKey: "giang", memberKeys: ["an", "khoa"], title: "Guide Đà Nẵng - Hội An 5N4Đ: biển, phố cổ, rừng dừa, food tour", seedKey: "hoiAn", dayCount: 5, budgetAmount: 8800000, cloneCount: 27, checklist: beachChecklist, densePattern: [6, 5, 5, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Đà Nẵng - Hội An premium 5N4Đ", "Guide trả phí kết hợp biển và phố cổ: Mỹ Khê, Sơn Trà, phố cổ Hội An, rừng dừa, An Bàng, cafe rooftop và food tour miền Trung.", 249000, 118) }),
  makeTrip({ slug: "shop-ha-noi-weekend-free-3n2d", ownerKey: "han", memberKeys: ["chi", "duy"], title: "Guide Hà Nội cuối tuần 3N2Đ: cafe trứng, phố cổ, món ngon", seedKey: "haNoi", dayCount: 3, budgetAmount: 3600000, cloneCount: 18, checklist: cityChecklist, densePattern: [6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Hà Nội cuối tuần 3N2Đ", "Guide cuối tuần ở Hà Nội: phố cổ, Hồ Hoàn Kiếm, cafe trứng, bún chả, chợ Đồng Xuân và các điểm đi bộ thuận tiện.", 99000, 93) }),
  makeTrip({ slug: "shop-hcm-food-night-3n2d", ownerKey: "khoa", memberKeys: ["em", "linh"], title: "Guide TP.HCM food night 3N2Đ: cơm tấm, bánh mì, phố đi bộ", seedKey: "hcm", dayCount: 3, budgetAmount: 4100000, cloneCount: 17, checklist: cityChecklist, densePattern: [5, 6, 4], distributionMode: "SHOP_PAID", guide: guide("TP.HCM food night 3N2Đ", "Guide food tour buổi tối: cơm tấm, bánh mì, cafe vợt, phố đi bộ Nguyễn Huệ, chợ Bến Thành và rooftop nhẹ.", 109000, 86) }),
  makeTrip({ slug: "shop-phu-quoc-budget-4n3d", ownerKey: "linh", memberKeys: ["bao", "giang"], title: "Guide Phú Quốc tiết kiệm 4N3Đ: biển đẹp, chợ đêm, Sunset Town", seedKey: "phuQuoc", dayCount: 4, budgetAmount: 7200000, cloneCount: 19, checklist: beachChecklist, densePattern: [5, 6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Phú Quốc tiết kiệm 4N3Đ", "Guide trả phí tối ưu chi phí cho đảo ngọc: chọn điểm biển đẹp, lịch chợ đêm, Sunset Town, tour đảo vừa phải và gợi ý resort hợp ngân sách.", 149000, 77) }),
  makeTrip({ slug: "shop-hue-food-3n2d", ownerKey: "minh", memberKeys: ["an", "han"], title: "Guide Huế food tour 3N2Đ: bún bò, cơm hến, chè, cafe muối", seedKey: "hue", dayCount: 3, budgetAmount: 3500000, cloneCount: 13, checklist: cityChecklist, densePattern: [6, 5, 4], distributionMode: "SHOP_PAID", guide: guide("Huế food tour 3N2Đ", "Guide trả phí tập trung ăn uống và di sản: bún bò, cơm hến, chè Huế, cafe muối, Đại Nội, lăng Khải Định và làng hương.", 139000, 69) }),
];
