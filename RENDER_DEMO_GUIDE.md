# Render Demo Kurulum Rehberi

Bu rehber, projeyi Render uzerinde **ayri backend + ayri frontend + ayri PostgreSQL** olarak canliya almak icin hazirlandi.

## 1) Mevcut proje yapisi (ozet)

- `backend/GymManagement.API`: .NET 9 Web API (Render web service)
- `backend/GymManagement.Infrastructure`: EF Core, migrationlar, servis implementasyonlari
- `backend/GymManagement.Application`: DTO ve interface katmani
- `backend/GymManagement.Domain`: entity/domain katmani
- `frontend`: React + Vite istemci (Render static service)
- `docker-compose.yml`: lokal PostgreSQL
- `render.yaml`: Render blueprint (db + api + frontend)

## 2) Render uzerinde olusacak servisler

`render.yaml` ile olusacaklar:

- PostgreSQL DB: `gym-postgres`
- Backend API: `gym-api`
- Frontend Static: `gym-frontend`

## 3) Deploy oncesi kontrol listesi

1. Projeyi GitHub'a push et.
2. Render hesabinda **New + -> Blueprint** sec.
3. Repo'yu secip `render.yaml` okut.
4. Ilk deploy tamamlaninca asagidaki environment degerlerini doldur.

## 4) Backend (`gym-api`) environment ayarlari

`render.yaml` ile otomatik gelen kritik alanlar:

- `ASPNETCORE_ENVIRONMENT=Production`
- `ConnectionStrings__DefaultConnection` (Render DB'den geliyor)
- `Jwt__SecretKey` (otomatik generate)
- `AdminSeed__Password` (otomatik generate)

Manuel girilecek zorunlu alan:

- `AllowedOrigins=https://<senin-frontend-adresin>.onrender.com`

Not:
- API acildiginda `Program.cs` icinde migration otomatik calisir.
- `PORT` Render tarafindan verilir, uygulama bunu okuyup `0.0.0.0:<PORT>` dinler.

## 5) Frontend (`gym-frontend`) environment ayarlari

Manuel girilecek zorunlu alan:

- `VITE_API_URL=https://<senin-backend-adresin>.onrender.com/api`

Sonra frontend servisini **Redeploy** et (Vite build zamani env sabitlenir).

## 6) Ilk giris (demo hesabı)

Email:

- `admin@gym.demo`

Sifre:

- Render `gym-api` servisindeki `AdminSeed__Password` degerini kopyala.

## 7) Demo linkini gondermeden once test

1. Frontend aciliyor mu:
   - `https://<frontend>.onrender.com`
2. Login calisiyor mu.
3. Dashboard verisi geliyor mu.
4. Browser console'da CORS hatasi yok mu.
5. API endpoint kontrolu:
   - `https://<backend>.onrender.com/api/auth/me` (token ile)

## 8) Sik gorulen sorunlar

- 401/403:
  - Token yok ya da gecersiz olabilir.
- CORS hatasi:
  - `AllowedOrigins` frontend URL ile birebir ayni olmali.
- Frontend API'ye gidemiyor:
  - `VITE_API_URL` yanlis veya frontend redeploy edilmedi.
- DB baglanti hatasi:
  - `ConnectionStrings__DefaultConnection` Render DB'den bagli mi kontrol et.

## 9) Kisa komut notu (lokal dogrulama)

Backend:

```powershell
cd backend/GymManagement.API
dotnet run --urls "http://localhost:5000"
```

Frontend:

```powershell
cd frontend
npm run dev
```

Local env:

```env
VITE_API_URL=http://localhost:5000/api
```
