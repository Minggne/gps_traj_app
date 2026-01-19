let markers = [];

let map = L.map('map', {
    zoomControl: false
}).setView([21.0285, 105.8542], 15);

L.control.zoom({
    position: 'bottomleft'
}).addTo(map);
let originMarker = null;
let polyline = L.polyline([], { color: 'red' }).addTo(map);
let lastClick = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

map.on('click', function (e) {
    lastClick = e.latlng;

    let marker = L.marker(e.latlng).addTo(map);
    markers.push(marker);

    addPoint(e.latlng);
});

function setOrigin() {
    if (!lastClick) return alert("Click map first");

    fetch('/set_origin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastClick)
    });

    if (originMarker) map.removeLayer(originMarker);
    originMarker = L.marker(lastClick, { color: 'green' }).addTo(map);

    polyline.setLatLngs([]);
    document.getElementById("status").innerText = "Origin set";
}

function addPoint(latlng) {
    fetch('/add_point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latlng)
    })
    .then(res => res.json())
    .then(data => {
        if (data.e !== undefined) {
            polyline.addLatLng(latlng);
        }
    })
    .then(data => {
    if (data.e !== undefined) {
        polyline.addLatLng(latlng);
        exportData();   // 👈 tự refresh bảng
    }
    });
}

function exportData() {
    fetch('/export')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            alert("Exported! Check console.");
        });
}

function exportData() {
    fetch('/export')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("table-body");
            tbody.innerHTML = "";

            data.trajectory.forEach((p, i) => {
                let row = `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${p.lat.toFixed(6)}</td>
                    <td>${p.lon.toFixed(6)}</td>
                    <td>${p.e.toFixed(2)}</td>
                    <td>${p.n.toFixed(2)}</td>
                    <td>${p.u.toFixed(2)}</td>
                  </tr>
                `;
                tbody.innerHTML += row;
            });
        });
}

function downloadJSON() {
    window.location.href = "/download";
}

function clearTrajectory() {
    fetch('/clear', { method: 'POST' })
        .then(res => res.json())
        .then(() => {
            // Xóa polyline
            polyline.setLatLngs([]);

            // Xóa marker
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            // Xóa bảng
            document.getElementById("table-body").innerHTML = "";

            document.getElementById("status").innerText = "Trajectory cleared";
        });
}

function undoPoint() {
    fetch('/undo', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (markers.length > 0) {
                // Xóa marker cuối
                let m = markers.pop();
                map.removeLayer(m);

                // Xóa polyline điểm cuối
                let pts = polyline.getLatLngs();
                pts.pop();
                polyline.setLatLngs(pts);

                // Refresh bảng
                exportData();
            }
        });
}

function exportData() {
    fetch('/export')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("table-body");
            tbody.innerHTML = "";

            let prev = null;

            data.trajectory.forEach((p, i) => {
                let dist = 0.0;
                let heading = 0.0;

                if (prev) {
                    let de = p.e - prev.e;
                    let dn = p.n - prev.n;
                    dist = Math.sqrt(de * de + dn * dn);
                    heading = Math.atan2(de, dn) * 180 / Math.PI;
                    if (heading < 0) heading += 360;
                }

                let row = `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${p.lat.toFixed(6)}</td>
                    <td>${p.lon.toFixed(6)}</td>
                    <td>${p.e.toFixed(2)}</td>
                    <td>${p.n.toFixed(2)}</td>
                    <td>${p.u.toFixed(2)}</td>
                    <td>${dist.toFixed(2)}</td>
                    <td>${heading.toFixed(1)}</td>
                  </tr>
                `;
                tbody.innerHTML += row;

                prev = p;
            });
        });
}
