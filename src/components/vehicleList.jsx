import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl,
    shadowUrl: iconShadowUrl
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [selectedTrips, setSelectedTrips] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const fetchRoutes = async () => {
        try {
            const res = await fetch('https://api-v3.mbta.com/routes');
            const json = await res.json();
            setRoutes(json.data.map(r => ({
                value: r.id,
                label: r.attributes.long_name || r.id
            })));
        } catch (err) {
            console.error('❌ Gagal memuat route:', err);
        }
    };

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const allData = [];
            const routesToFetch = selectedRoutes.length > 0 ? selectedRoutes : [null];

            for (const route of routesToFetch) {
                let url = 'https://api-v3.mbta.com/vehicles?page[limit]=100';
                if (route) {
                    url = `https://api-v3.mbta.com/vehicles?filter[route]=${route}&page[limit]=100`;
                }
                if (selectedTrips.length > 0) {
                    url += `&filter[trip]=${selectedTrips.join(',')}`;
                }

                const res = await fetch(url);
                const json = await res.json();
                allData.push(...(json.data || []));
                await delay(250);
            }

            setAllVehicles(allData);
            const paged = allData.slice((page - 1) * limit, page * limit);
            setVehicles(paged);
        } catch (err) {
            console.error('❌ Gagal memuat vehicle:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadTrips = async () => {
        if (selectedRoutes.length === 0) return [];

        try {
            const tripSet = new Set();
            const tripOptions = [];

            for (const route of selectedRoutes) {
                let url = `https://api-v3.mbta.com/vehicles?filter[route]=${route}&page[limit]=100`;

                const res = await fetch(url);
                const json = await res.json();

                for (const vehicle of json.data) {
                    const tripId = vehicle.relationships?.trip?.data?.id;
                    const label = vehicle.attributes?.label || tripId;

                    if (tripId && !tripSet.has(tripId)) {
                        tripSet.add(tripId);
                        tripOptions.push({
                            value: tripId,
                            label: `Trip ${tripId} (${label})`
                        });
                    }
                }

                await delay(200);
            }

            return tripOptions;
        } catch (err) {
            console.error('❌ Gagal load trip:', err);
            return [];
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleString('id-ID', {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        fetchRoutes();
        fetchVehicles();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [selectedRoutes, selectedTrips]);

    useEffect(() => {
        fetchVehicles();
    }, [selectedRoutes, selectedTrips, page, limit]);

    const totalPages = Math.ceil(allVehicles.length / limit);

    const statusColor = (status) => {
        switch (status) {
            case 'IN_TRANSIT_TO': return 'text-green-600';
            case 'STOPPED_AT': return 'text-red-600';
            case 'INCOMING_AT': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">🚍 Live Tracker Kendaraan MBTA</h1>

            <div className="mb-4">
                <label className="block font-semibold mb-2">Pilih Route (boleh lebih dari satu):</label>
                <Select
                    isMulti
                    options={routes}
                    onChange={(selected) => {
                        const values = selected ? selected.map(s => s.value) : [];
                        setSelectedRoutes(values);
                        setSelectedTrips([]);
                        setPage(1);
                    }}
                    placeholder="Pilih Route..."
                />
            </div>

            {selectedRoutes.length > 0 && (
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Pilih Trip (boleh lebih dari satu):</label>
                    <AsyncSelect
                        key={selectedRoutes.join(',')}
                        isMulti
                        cacheOptions
                        loadOptions={loadTrips}
                        defaultOptions
                        onChange={(selected) => {
                            const values = selected ? selected.map(s => s.value) : [];
                            setSelectedTrips(values);
                            setPage(1);
                        }}
                        isClearable
                        placeholder="Pilih Trip..."
                    />
                </div>
            )}

            <AnimatePresence>
                {selectedVehicle && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded shadow-md w-full max-w-md relative overflow-y-auto max-h-[90vh]"
                            initial={{ scale: 0.7, opacity: 0, y: 100 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ duration: 0.4, type: 'spring' }}
                        >
                            <h2 className="text-xl font-bold mb-4">Detail Kendaraan</h2>
                            <div className="space-y-2">
                                <p><strong>Label:</strong> {selectedVehicle.attributes?.label || '-'}</p>
                                <p><strong>Status:</strong> <span className={statusColor(selectedVehicle.attributes?.current_status)}>{selectedVehicle.attributes?.current_status || '-'}</span></p>
                                <p><strong>Latitude:</strong> {selectedVehicle.attributes?.latitude}</p>
                                <p><strong>Longitude:</strong> {selectedVehicle.attributes?.longitude}</p>
                                <p><strong>Route:</strong> {selectedVehicle.relationships?.route?.data?.id || '-'}</p>
                                <p><strong>Trip:</strong> {selectedVehicle.relationships?.trip?.data?.id || '-'}</p>
                                <p><strong>Waktu Update:</strong> {formatDate(selectedVehicle.attributes?.updated_at)}</p>
                                <p><strong>Kecepatan:</strong> {selectedVehicle.attributes?.speed || 0} km/h</p>
                                <p><strong>Arah (bearing):</strong> {selectedVehicle.attributes?.bearing || '-'}°</p>

                                <div className="my-4 h-64">
                                    <MapContainer
                                        center={[selectedVehicle.attributes?.latitude, selectedVehicle.attributes?.longitude]}
                                        zoom={15}
                                        scrollWheelZoom={false}
                                        style={{ height: "100%", width: "100%" }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap contributors'
                                        />
                                        <Marker position={[selectedVehicle.attributes?.latitude, selectedVehicle.attributes?.longitude]}>
                                            <Popup>
                                                {selectedVehicle.attributes?.label || 'Kendaraan'}<br />
                                                {selectedVehicle.attributes?.current_status}
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>

                                <a
                                    href={`https://www.google.com/maps?q=${selectedVehicle.attributes?.latitude},${selectedVehicle.attributes?.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline block"
                                >
                                    📍 Lihat di Google Maps
                                </a>

                                <div className="text-right pt-4">
                                    <button
                                        onClick={() => setSelectedVehicle(null)}
                                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="text-center">Memuat data kendaraan...</div>
            ) : vehicles.length === 0 ? (
                <div className="text-center text-red-600 font-semibold mt-8">
                    🚫 Tidak ada data kendaraan di halaman ini.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map(vehicle => (
                        <div
                            key={vehicle.id}
                            className="border p-4 rounded shadow bg-white cursor-pointer hover:bg-gray-100"
                            onClick={() => setSelectedVehicle(vehicle)}
                        >
                            <h2 className="text-xl font-bold mb-2">ID: {vehicle.id}</h2>
                            <p><strong>Status:</strong> <span className={statusColor(vehicle.attributes?.current_status)}>{vehicle.attributes?.current_status}</span></p>
                            <p><strong>Label:</strong> {vehicle.attributes?.label || '-'}</p>
                            <p><strong>Latitude:</strong> {vehicle.attributes?.latitude}</p>
                            <p><strong>Longitude:</strong> {vehicle.attributes?.longitude}</p>
                            <p><strong>Update:</strong> {formatDate(vehicle.attributes?.updated_at)}</p>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-6 flex justify-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-4 py-2 border rounded ${page === p ? 'bg-blue-500 text-white' : 'bg-white'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VehicleList;
