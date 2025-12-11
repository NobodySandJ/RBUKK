# Panduan Deploy Ulang ke Vercel

## Masalah yang Teratasi

File yang di-deploy berbeda dengan file lokal karena:

- Anda mengedit file di `frontend/` folder
- Vercel men-deploy dari root directory
- File di root sudah outdated

## Solusi

✅ **File sudah disinkronkan!**

Semua perubahan dari `frontend/` sudah di-copy ke root:

- `frontend/css/style.css` → `css/style.css`
- `frontend/js/api.js` → `js/api.js`
- `frontend/js/auth.js` → `js/auth.js`
- `frontend/js/cart.js` → `js/cart.js`
- `frontend/js/script.js` → `js/script.js`
- `frontend/index.html` → `index.html`
- `frontend/assets/` → `assets/`

## Deploy ke Vercel

Sekarang deploy ulang dengan versi terbaru:

```bash
# Commit semua perubahan
git add .
git commit -m "Sync frontend files and update API configuration"
git push

# Deploy menggunakan Vercel CLI
vercel --prod
```

Atau jika menggunakan Git integration di Vercel Dashboard, push ke repository akan otomatis trigger deployment.

## Catatan Penting

**Untuk kedepannya:**

- Edit file di ROOT directory (bukan di `frontend/`)
- File yang akan di-deploy: `index.html`, `/css/`, `/js/`, `/assets/` di root
- Folder `frontend/` bisa diabaikan atau dihapus untuk menghindari kebingungan

## Verifikasi Setelah Deploy

1. Cek deployment URL di Vercel Dashboard
2. Test API endpoint: `https://your-app.vercel.app/api/health`
3. Test frontend: `https://your-app.vercel.app`
4. Buka browser console untuk cek API Base URL log
