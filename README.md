# GPS Trajectory Planner

Ứng dụng web để lập kế hoạch quỹ đạo GPS và chuyển đổi tọa độ GPS sang hệ tọa độ ENU (East-North-Up) cho robot navigation.

## Tổng Quan

GPS Trajectory Planner là một công cụ tương tác cho phép người dùng:
- Chọn điểm gốc (origin) trên bản đồ
- Đánh dấu các điểm waypoint bằng cách click trên bản đồ
- Tự động chuyển đổi tọa độ GPS (WGS84) sang tọa độ ENU
- Tính toán khoảng cách và góc heading giữa các điểm
- Xuất dữ liệu quỹ đạo dưới dạng file JSON

## Cấu Trúc Thư Mục

```
gps_trajectory_app/
├── static/
│   └── script.js          # JavaScript xử lý frontend và tương tác bản đồ
├── templates/
│   └── index.html         # Giao diện web chính
└── app.py                 # Flask server backend
```

## Tính Năng Chính

### 1. Tương Tác Bản Đồ
- **Click để thêm điểm**: Click chuột trên bản đồ để thêm waypoint
- **Set Origin**: Đặt điểm gốc cho hệ tọa độ ENU
- **Hiển thị quỹ đạo**: Đường polyline màu đỏ nối các điểm

### 2. Chuyển Đổi Tọa Độ
- Chuyển đổi GPS (Latitude, Longitude) sang ENU (East, North, Up)
- Sử dụng phép chiếu Azimuthal Equidistant với datum WGS84
- Tọa độ U (Up) mặc định = 0.0

### 3. Tính Toán Tự Động
- **Distance**: Khoảng cách Euclidean giữa 2 điểm liên tiếp (mét)
- **Heading**: Góc hướng từ Bắc (0-360 độ)

### 4. Quản Lý Quỹ Đạo
- **Undo Last Point**: Xóa điểm cuối cùng
- **Clear Trajectory**: Xóa toàn bộ quỹ đạo
- **Refresh Table**: Cập nhật bảng dữ liệu
- **Download JSON**: Tải xuống file JSON chứa toàn bộ quỹ đạo

## Yêu Cầu Hệ Thống

### Python Dependencies
```bash
Flask
pyproj
```

### Frontend Libraries (CDN)
- Leaflet.js 1.9.4 (thư viện bản đồ)
- OpenStreetMap tiles

## Cài Đặt

### 1. Clone hoặc tạo thư mục project

```bash
mkdir gps_trajectory_app
cd gps_trajectory_app
```

### 2. Tạo cấu trúc thư mục

```bash
mkdir static templates
```

### 3. Đặt các file vào đúng vị trí

- `script.js` → `static/script.js`
- `index.html` → `templates/index.html`
- `app.py` → `app.py` (thư mục gốc)

### 4. Cài đặt Python dependencies

```bash
pip install flask pyproj
```

Hoặc sử dụng requirements.txt:

```bash
pip install -r requirements.txt
```

**File requirements.txt:**
```
Flask>=2.3.0
pyproj>=3.6.0
```

## Hướng Dẫn Sử Dụng

### 1. Khởi động server

```bash
python app.py
```

Server sẽ chạy tại: `http://127.0.0.1:5000`

### 2. Sử dụng ứng dụng

#### Bước 1: Đặt điểm gốc (Origin)
1. Click vào vị trí trên bản đồ muốn làm gốc tọa độ
2. Nhấn nút **"Set Origin"**
3. Marker xanh sẽ xuất hiện tại điểm gốc

#### Bước 2: Thêm waypoints
1. Click các điểm trên bản đồ theo thứ tự quỹ đạo
2. Mỗi click sẽ tạo marker và thêm vào quỹ đạo
3. Đường màu đỏ sẽ nối các điểm lại

#### Bước 3: Xem dữ liệu
- Bảng dữ liệu tự động hiển thị:
  - **#**: Số thứ tự điểm
  - **Lat/Lon**: Tọa độ GPS
  - **E/N/U**: Tọa độ ENU (mét)
  - **Dist**: Khoảng cách từ điểm trước (mét)
  - **Heading**: Góc hướng (độ)

#### Bước 4: Xuất dữ liệu
- Nhấn **"Download JSON"** để tải file `trajectory_enu.json`

### 3. Các nút điều khiển

| Nút | Chức năng |
|-----|-----------|
| **Set Origin** | Đặt điểm cuối click làm gốc tọa độ |
| **Refresh Table** | Cập nhật lại bảng dữ liệu |
| **Download JSON** | Tải file JSON chứa quỹ đạo |
| **Undo Last Point** | Xóa điểm waypoint cuối cùng |
| **Clear Trajectory** | Xóa toàn bộ quỹ đạo |

## Format Dữ Liệu JSON

```json
{
  "origin": {
    "lat": 21.028500,
    "lon": 105.854200
  },
  "trajectory": [
    {
      "lat": 21.028600,
      "lon": 105.854300,
      "e": 8.92,
      "n": 11.13,
      "u": 0.0
    },
    {
      "lat": 21.028700,
      "lon": 105.854400,
      "e": 17.84,
      "n": 22.26,
      "u": 0.0
    }
  ]
}
```

## API Endpoints

### Backend Routes

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Trang chủ |
| POST | `/set_origin` | Đặt điểm gốc tọa độ |
| POST | `/add_point` | Thêm waypoint mới |
| GET | `/export` | Xuất dữ liệu JSON (view) |
| GET | `/download` | Tải file JSON |
| POST | `/clear` | Xóa toàn bộ quỹ đạo |
| POST | `/undo` | Xóa điểm cuối |

### Request/Response Examples

#### Set Origin
**Request:**
```json
POST /set_origin
{
  "lat": 21.028500,
  "lng": 105.854200
}
```

**Response:**
```json
{
  "status": "origin set",
  "origin": {
    "lat": 21.028500,
    "lon": 105.854200
  }
}
```

#### Add Point
**Request:**
```json
POST /add_point
{
  "lat": 21.028600,
  "lng": 105.854300
}
```

**Response:**
```json
{
  "lat": 21.028600,
  "lon": 105.854300,
  "e": 8.92,
  "n": 11.13,
  "u": 0.0
}
```

## Công Thức Tính Toán

### 1. GPS to ENU Conversion
Sử dụng phép chiếu Azimuthal Equidistant:
```
Projection: +proj=aeqd +lat_0={lat0} +lon_0={lon0} +datum=WGS84
```

### 2. Distance Calculation
```python
distance = sqrt((e2 - e1)² + (n2 - n1)²)
```

### 3. Heading Calculation
```python
heading = atan2(Δe, Δn) × 180 / π
if heading < 0:
    heading += 360
```

Trong đó:
- `Δe = e2 - e1` (East difference)
- `Δn = n2 - n1` (North difference)
- Heading: 0° = Bắc, 90° = Đông, 180° = Nam, 270° = Tây



