# ⚡ contaLeve

> Upload your electricity bill → instantly see cheaper plans → simulate savings

contaLeve is a full-stack MVP that helps Brazilian consumers find cheaper energy suppliers by uploading their electricity bills.

---

## 🏗️ Architecture

```
Frontend (Next.js / TypeScript / Tailwind)
         ↓
Backend API (FastAPI / Python)
         ↓
Core Services Layer
 ├── Bill Parser   (PDF → structured data via pdfplumber / Tesseract OCR)
 ├── Tariff Engine (cost simulation per supplier)
 ├── Supplier Engine (plans database – seeded with demo data)
 └── Savings Engine (comparison & ranking)
         ↓
Database (PostgreSQL)
```

## 🚀 Quick Start (Docker Compose)

```bash
docker compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:8000  |
| API Docs | http://localhost:8000/docs |

---

## 🛠️ Local Development

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Copy env and start Postgres (via Docker or locally)
cp .env.example .env

# Run dev server
uvicorn app.main:app --reload
```

#### Run tests

```bash
cd backend
pytest -v
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📡 API Endpoints

| Method | Path           | Description                              |
|--------|----------------|------------------------------------------|
| POST   | `/upload-bill` | Upload a PDF/image bill → parsed data    |
| GET    | `/suppliers`   | List all energy suppliers                |
| POST   | `/simulate`    | Compare current cost vs all suppliers    |
| GET    | `/health`      | Health check                             |

### Example: Simulate savings

```bash
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{"monthly_kwh": 320, "current_cost": 272.00}'
```

Response:

```json
{
  "current_cost": 272.0,
  "monthly_kwh": 320.0,
  "best_option": {
    "supplier": { "name": "BaixoCusto Energia", "price_per_kwh": 0.63, ... },
    "monthly_cost": 201.6,
    "monthly_savings": 70.4,
    "yearly_savings": 844.8
  },
  "all_options": [...]
}
```

---

## 🗄️ Database Schema

| Table       | Key columns                                          |
|-------------|------------------------------------------------------|
| users       | id, email, created_at                                |
| bills       | id, user_id, monthly_kwh, total_cost, utility, ...   |
| suppliers   | id, name, price_per_kwh, type, renewable, ...        |
| simulations | id, bill_id, best_supplier_id, monthly_savings, ...  |

---

## 🧩 Tech Stack

- **Frontend**: Next.js 15 · App Router · Tailwind CSS · react-dropzone
- **Backend**: FastAPI · SQLAlchemy · Pydantic v2 · Alembic
- **Database**: PostgreSQL
- **Parsing**: pdfplumber · PyMuPDF · Tesseract OCR (fallback)
- **Infra**: Docker Compose
