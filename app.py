from flask import Flask, render_template, request, jsonify, send_file
from pyproj import Transformer
import json
import tempfile

app = Flask(__name__)

origin = None
trajectory = []

# Transformer WGS84 -> ENU (local tangent plane)
def gps_to_enu(lat, lon, lat0, lon0):
    transformer = Transformer.from_crs(
        f"+proj=longlat +datum=WGS84",
        f"+proj=aeqd +lat_0={lat0} +lon_0={lon0} +datum=WGS84",
        always_xy=True
    )
    e, n = transformer.transform(lon, lat)
    return e, n


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/set_origin", methods=["POST"])
def set_origin():
    global origin, trajectory
    data = request.json
    origin = {
        "lat": data["lat"],
        "lon": data["lng"]
    }
    trajectory = []
    return jsonify({"status": "origin set", "origin": origin})


@app.route("/add_point", methods=["POST"])
def add_point():
    global trajectory
    data = request.json
    lat = data["lat"]
    lon = data["lng"]

    if origin is None:
        return jsonify({"error": "Origin not set"}), 400

    e, n = gps_to_enu(lat, lon, origin["lat"], origin["lon"])

    point = {
        "lat": lat,
        "lon": lon,
        "e": e,
        "n": n,
        "u": 0.0
    }
    trajectory.append(point)
    return jsonify(point)


@app.route("/export", methods=["GET"])
def export():
    return jsonify({
        "origin": origin,
        "trajectory": trajectory
    })

@app.route("/download", methods=["GET"])
def download():
    data = {
        "origin": origin,
        "trajectory": trajectory
    }

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
    with open(tmp.name, "w") as f:
        json.dump(data, f, indent=2)

    return send_file(
        tmp.name,
        as_attachment=True,
        download_name="trajectory_enu.json",
        mimetype="application/json"
    )

@app.route("/clear", methods=["POST"])
def clear():
    global trajectory
    trajectory = []
    return jsonify({"status": "cleared"})

@app.route("/undo", methods=["POST"])
def undo():
    global trajectory
    if trajectory:
        trajectory.pop()
    return jsonify({"status": "undone", "length": len(trajectory)})

if __name__ == "__main__":
    app.run(debug=True)
