<<<<<<< HEAD
# Tes Teknis Frontend - Transportasi Jakarta

Aplikasi frontend berbasis ReactJS untuk menampilkan Vehicle Live Tracker dari MBTA (Massachusetts Bay Transportation Authority) dengan deskripsi proyek mengembangkan aplikasi frontend untuk Sistem Manajemen Armada . Aplikasi ini dilengkapi dengan fitur filter berdasarkan rute dan trip, serta visualisasi lokasi kendaraan menggunakan peta interaktif.

---

## Teknologi yang Digunakan

- **ReactJS** – Framework utama frontend
- **TailwindCSS** – Styling UI responsif dan modern
- **React Select & AsyncSelect** – Dropdown dengan fitur pencarian dan multi-select
- **Leaflet & React-Leaflet** – Menampilkan lokasi kendaraan di peta
- **Framer Motion** – Animasi untuk popup detail kendaraan
- **MBTA API** – Data kendaraan real-time: https://api-v3.mbta.com

## Fitur Utama

- Filter berdasarkan Route dan Trip

- Detail kendaraan lengkap (lokasi, kecepatan, arah, status)

- Google Maps link langsung ke lokasi kendaraan

- Peta interaktif menggunakan Leaflet

- Tampilan pagination dan popup detail

- Dark Mode toggle

---

## Cara Menjalankan Aplikasi

1. **Clone repository ini**
   ```bash
   git clone https://github.com/abdullahfaqot/Tes-Teknis_FE_Transportasi-Jakarta.git
   cd Tes-Teknis_FE_Transportasi-Jakarta
2. **Install dependencied**
   " npm install " 
3. **Jalankan Aplikasi**
   " npm start "
4. **Buka di Browser**
   " http://localhost:3000 "   



## Struktur Aplikasi

Aplikasi ini terdiri dari satu komponen utama VechileList yang mencakup:

1. Filter Route dan Trip
   - Data route diambil dari endpoint routes MBTA 
   - Setelah memilih route app memuat trip dari kendaraan aktif di route tersebut.
   - Menggunakan react-select untuk route dan AsyncSelect untuk trip.
2. Daftar Kendaraan
   - Data kendaraan diambil berdasarkan filter route dan trip.
   - Ditampilkan dalam bentuk card responsif.
   - Setiap card bisa diklik untuk melihat detail kendaraan.
3. Detail Kendaraan   
   - Menampilkan info: label, status, latitude, longitude, route ID, trip ID, waktu update, kecepatan, arah.
   - Menampilkan lokasi kendaraan di peta (Leaflet) dan link ke Google Maps.
4. Pagination & Limit
   - Pengguna bisa memilih jumlah data per halaman.
   - Navigasi halaman disediakan (page 1–5).

## Notes

   - Filtering trip hanya menampilkan trip unik menggunakan Set().
   - Jumlah kendaraan tergantung kondisi real-time di MBTA.
   - Waktu tampil dalam format lokal (Indonesia).

Dev 

Abdullah 

Github: @abdullahfaqot

        

