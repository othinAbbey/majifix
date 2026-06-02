import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";

const API_URL = process.env.REACT_APP_API_URL;

// fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const getIcon = (status) => {
  const color =
    status === "broken"
      ? "red"
      : status === "maintenance"
      ? "orange"
      : "green";

  return new L.Icon({
    iconUrl: `https://maps.gstatic.com/mapfiles/ms2/micons/${color}-dot.png`,
    iconSize: [32, 32],
  });
};

const WaterPointsMap = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/map`)
      .then((res) => setPoints(res.data.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <MapContainer
      center={[0.3476, 32.5825]}
      zoom={8}
      style={{ height: "90vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {points.map((p) => (
        <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={getIcon(p.status)}
        >
          <Popup>
            <b>{p.name}</b>
            <br />
            {p.district}
            <br />
            Status: {p.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default WaterPointsMap;