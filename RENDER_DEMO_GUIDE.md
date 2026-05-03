# Render demo rehberi (HA Salon / Gym)

Bu rehber, projeyi Render uzerinde **PostgreSQL + Docker API + statik Vite frontend** olarak demo link verecek sekilde aciklar.

## Onemli: .NET ve Docker

Render, [.NET icin native runtime sunmuyor](https://render.com/docs/language-support); **API Docker ile** calisir. `render.yaml` icinde `gym-api` servisi `runtime: docker` ve `dockerContext: ./backend` kullanir.

## 1) Proje yapisi

- `backend/GymManagement.API` — .NET 9 Web API, `Dockerfile`
- `backend/.dockerignore` — build hizlandirma
- `frontend` — React + Vite (`VITE_API_URL` build zamaninda sabitlenir)
- `render.yaml` — Blueprint (veritabani + API + static site)

## 2) Blueprint ile kurulum

1. Kodu GitHub'a push et.
2. Render → **New +** → **Blueprint**.
3. `HA-Salon` (veya) repoyu sec; `render.yaml` otomatik okunur.
4. Olusturulan kaynaklar: `gym-postgres`, `gym-api`, `gym-frontend` (hepsi **Oregon** bolgesi).

## 3) Ortam degiskenleri (otomatik)

| Servis | Degisken | Kaynak |
|--------|----------|--------|
| gym-api | `ConnectionStrings__DefaultConnection` | `fromDatabase` |
| gym-api | `Jwt__SecretKey`, `AdminSeed__Password` | `generateValue: true` |
| gym-api | `RenderDemo__RelaxCors` | `true` → CORS: `https://*.onrender.com` + localhost |
| gym-frontend | `VITE_API_URL` | `gym-api` servisinin `RENDER_EXTERNAL_URL` (origin; koda `/api` eklenir) |

Ilk deployda static site buildi bazen API URL’sine bagli kalir: **gym-frontend** “build failed” verirse, `gym-api` ayaga kalktiktan sonra **gym-frontend** icin **Manual Deploy** yap.

## 4) Demo linki paylasimi

- **Kullaniciya verilecek URL:** `https://gym-frontend-....onrender.com` (Blueprint’teki static site adresi; Render panosundan kopyala).
- **Admin girisi:** `AdminSeed__Email` (varsayilan `admin@gym.demo`) + Render’da `gym-api` → Environment → `AdminSeed__Password` degeri.

## 5) Uretim / siki CORS

`RenderDemo__RelaxCors` degerini `false` yap ve `AllowedOrigins` icine yalnizca kendi frontend URL’ini yaz (virgulle birden fazla mumkun).

## 6) Saglik kontrolu

- `GET https://<gym-api>/health` → `{ "status": "ok" }` (Render health check bu path’i kullanir).

## 7) Sik sorunlar

- **Docker build “COPY” hatasi:** Render’da `dockerContext` mutlaka repo kokuine gore `./backend` olmali (bu dosyada ayarli).
- **CORS:** Demo modunda `RelaxCors` acikken manuel `AllowedOrigins` gerekmez.
- **401 / token:** Normal auth akisi; sifre yanlis veya token suresi dolmus olabilir.
- **DB baglantisi:** Blueprint’teki Postgres ile API ayni `region` (oregon) olmali.

## 8) Lokal gelistirme

Backend:

```powershell
cd backend/GymManagement.API
dotnet run --urls "http://localhost:5000"
```

Frontend (Vite proxy `/api`):

```powershell
cd frontend
npm run dev
```

Lokal production build testi (API 5000’de):

```powershell
cd frontend
$env:VITE_API_URL="http://localhost:5000"
npm run build
```
