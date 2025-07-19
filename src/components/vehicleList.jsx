import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('');

  const limit = 10;

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const offset = (page - 1) * limit;

    let url = `https://api-v3.mbta.com/vehicles?page[limit]=${limit}&page[offset]=${offset}`;

    if (selectedRoute) {
      url += `&filter[route]=${selectedRoute}`;
    }
    if (selectedTrip) {
      url += `&filter[trip]=${selectedTrip}`;
    }

    try {
      const response = await fetch(url);
      const json = await response.json();
      setVehicles(json.data);
      setIsLastPage(json.data.length < limit);
    } catch (error) {
      console.error("Gagal mengambil data kendaraan:", error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedRoute, selectedTrip]); // ← dependencies di sini

  const fetchRoutes = useCallback(async () => {
    try {
      const response = await fetch('https://api-v3.mbta.com/routes');
      const json = await response.json();
      setRoutes(json.data.map(r => ({
        value: r.id,
        label: r.attributes.long_name || r.id
      })));
    } catch (error) {
      console.error("Gagal mengambil route:", error);
    }
  }, []);

  const loadTrips = async (inputValue, callback) => {
    try {
      let url = `https://api-v3.mbta.com/trips?page[limit]=10&page[offset]=0`;

      if (selectedRoute) {
        url += `&filter[route]=${selectedRoute}`;
      }

      const response = await fetch(url);
      const json = await response.json();

      const options = json.data
        .filter(trip => trip.id.toLowerCase().includes(inputValue.toLowerCase()))
        .map(trip => ({
          value: trip.id,
          label: trip.id
        }));

      callback(options);
    } catch (err) {
      console.error('Gagal memuat trip:', err);
      callback([]);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const nextPage = () => {
    if (!isLastPage) setPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const handleRouteChange = (selected) => {
    setSelectedRoute(selected ? selected.value : '');
    setSelectedTrip('');
    setPage(1);
  };

  const handleTripChange = (selected) => {
    setSelectedTrip(selected ? selected.value : '');
    setPage(1);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🚍 Data Kendaraan MBTA</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-64">
          <label className="block font-semibold mb-1">Filter by Route:</label>
          <Select
            options={routes}
            onChange={handleRouteChange}
            isClearable
            placeholder="Pilih Route"
          />
        </div>

        <div className="w-64">
          <label className="block font-semibold mb-1">Filter by Trip:</label>
          <AsyncSelect
            cacheOptions
            loadOptions={loadTrips}
            defaultOptions
            onChange={handleTripChange}
            isClearable
            placeholder="Cari Trip..."
          />
        </div>
      </div>

      {/* Data */}
      {loading ? (
        <div className="text-center">Memuat data...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center text-gray-600">Tidak ada data kendaraan.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-xl font-semibold">ID: {vehicle.id}</h2>
              <p><strong>Status:</strong> {vehicle.attributes.current_status}</p>
              <p><strong>Label:</strong> {vehicle.attributes.label || '-'}</p>
              <p><strong>Latitude:</strong> {vehicle.attributes.latitude}</p>
              <p><strong>Longitude:</strong> {vehicle.attributes.longitude}</p>
              <p><strong>Update:</strong> {vehicle.attributes.updated_at}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={prevPage}
          disabled={page === 1}
          className={`px-4 py-2 border rounded ${page === 1 ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'}`}
        >
          ⬅️ Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={nextPage}
          disabled={isLastPage}
          className={`px-4 py-2 border rounded ${isLastPage ? 'bg-gray-300' : 'bg-white hover:bg-gray-100'}`}
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
};

export default VehicleList;
