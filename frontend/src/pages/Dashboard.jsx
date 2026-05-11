import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import Chatbot from '../components/Chatbot';
import '../App.css'; // CSS Import

const socket = io.connect("http://localhost:5000");

// Leaflet Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper Components ---
const LocationMarker = ({ position, setPosition, setPickupLocation }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            setPickupLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        },
    });
    return position ? <Marker position={position} /> : null;
};

const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => { map.setView(coords, map.getZoom()); }, [coords, map]);
    return null;
};

const Dashboard = () => {
    const [position, setPosition] = useState([22.7196, 75.8577]);
    const [pickupLocation, setPickupLocation] = useState("Selecting...");
    const [rideRequest, setRideRequest] = useState(null);
    const [rideStatus, setRideStatus] = useState("");
    const [vehicle, setVehicle] = useState({ type: 'car', model: '', plateNumber: '' });
    const [userVehicles, setUserVehicles] = useState([]);

    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');

    useEffect(() => {
        if (userRole === 'driver') {
            socket.on("receive_ride_request", (data) => setRideRequest(data));
        }
        if (userRole === 'user') {
            socket.on("ride_accepted_by_driver", (data) => {
                setRideStatus(`✅ Confirmed: ${data.driverName} is coming!`);
            });
            navigator.geolocation.getCurrentPosition((pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                setPickupLocation(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
            });
        }
        return () => socket.off();
    }, [userRole]);

    const handleRequestRide = () => {
        if (userVehicles.length === 0) return alert("Add a vehicle first!");
        setRideStatus("⏳ Searching for drivers...");
        socket.emit("send_ride_request", {
            passengerName: userName,
            location: pickupLocation,
            vehicle: userVehicles[0].model
        });
    };

    const handleAcceptRide = () => {
        socket.emit("accept_ride", { driverName: userName, passengerSocketId: rideRequest.passengerSocketId });
        setRideRequest(null);
        alert("Ride accepted! Go to passenger.");
    };

    // UI FOR USER
    const renderUserUI = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '25px' }}>
            <div className="dashboard-card" style={{ background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '15px', background: '#34495e', color: '#fff', fontSize: '14px' }}>
                    📍 <b>Pickup At:</b> {pickupLocation}
                </div>
                <div style={{ height: '480px' }}>
                    <MapContainer center={position} zoom={15} style={{ height: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker position={position} setPosition={setPosition} setPickupLocation={setPickupLocation} />
                        <RecenterMap coords={position} />
                    </MapContainer>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="dashboard-card" style={sidebarCardStyle}>
                    <h3 style={{ margin: '0 0 15px 0' }}>🚗 Your Vehicles</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input placeholder="Model" value={vehicle.model} style={miniInput} onChange={e => setVehicle({...vehicle, model: e.target.value})} />
                        <input placeholder="No." value={vehicle.plateNumber} style={miniInput} onChange={e => setVehicle({...vehicle, plateNumber: e.target.value})} />
                    </div>
                    <button onClick={() => {setUserVehicles([...userVehicles, vehicle]); setVehicle({model:'', plateNumber:''})}} style={addBtnStyle}>Add</button>
                    {userVehicles.map((v, i) => <div key={i} style={tagStyle}>{v.model} ({v.plateNumber})</div>)}
                </div>

                <div className="dashboard-card" style={{ ...sidebarCardStyle, borderTop: '6px solid #007bff' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Book a Ride</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>{rideStatus || "Ready to book"}</p>
                    <button onClick={handleRequestRide} disabled={rideStatus.includes("✅")} style={bookBtnStyle}>
                        {rideStatus.includes("⏳") ? "SEARCHING..." : "CONFIRM BOOKING"}
                    </button>
                </div>
            </div>
        </div>
    );

    // UI FOR DRIVER
    const renderDriverUI = () => (
        <div style={{ maxWidth: '700px', margin: '40px auto' }}>
            <div className="dashboard-card" style={{ background: '#fff', padding: '40px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                {rideRequest ? (
                    <div className="request-alert" style={{ padding: '30px', borderRadius: '15px' }}>
                        <h2 style={{ color: '#27ae60' }}>New Request! 🔔</h2>
                        <hr style={{ opacity: 0.1 }} />
                        <p><b>Passenger:</b> {rideRequest.passengerName}</p>
                        <p><b>Location:</b> {rideRequest.location}</p>
                        <p><b>Vehicle:</b> {rideRequest.vehicle}</p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button onClick={handleAcceptRide} style={{ ...actionBtn, background: '#27ae60' }}>Accept</button>
                            <button onClick={() => setRideRequest(null)} style={{ ...actionBtn, background: '#e74c3c' }}>Decline</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: '50px' }}>🛰️</div>
                        <h3>Searching for Passengers...</h3>
                        <p style={{ color: '#888' }}>Please stay on this page to receive requests.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
            <nav style={navStyle}>
                <h2 style={{ margin: 0 }}>DriverApp 🚕</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span>Hi, <b>{userName}</b></span>
                    <button onClick={() => {localStorage.clear(); window.location.href='/login'}} style={logoutBtn}>Logout</button>
                </div>
            </nav>
            {userRole === 'driver' ? renderDriverUI() : renderUserUI()}
            <Chatbot />
        </div>
    );
};

// Styles
const sidebarCardStyle = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const miniInput = { width: '50%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const addBtnStyle = { width: '100%', padding: '10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const tagStyle = { marginTop: '10px', padding: '8px', background: '#f8f9fa', borderRadius: '6px', fontSize: '13px', borderLeft: '3px solid #27ae60' };
const bookBtnStyle = { width: '100%', padding: '15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: '#fff', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' };
const logoutBtn = { padding: '8px 15px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const actionBtn = { flex: 1, padding: '12px', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default Dashboard;