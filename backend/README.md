# Kutumba Gujarat — Backend API

## Setup

```bash
cd backend
npm install
```

Add your `SUPABASE_SERVICE_ROLE_KEY` to `backend/.env`:
```
SUPABASE_URL=https://wrhzvfnhxlmkvkkmfuui.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
```

## Start Dev Server

```bash
npm run dev
```

---

## API Reference & Sample Curl Commands

### Health Check
```bash
curl http://localhost:3001/health
```

---

### Admin — GET Metrics
```bash
curl http://localhost:3001/api/admin/metrics
```

### Admin — Create Scheme
```bash
curl -X POST http://localhost:3001/api/admin/schemes \
  -H "Content-Type: application/json" \
  -d "{\"scheme_name\":\"PM Kisan Samman Nidhi\",\"benefit_type\":\"Household\",\"benefit_amount\":\"6000\",\"description\":\"Annual income support for farmer families.\",\"constraints\":{\"max_income_limit\":200000,\"target_gender\":\"all\"}}"
```

---

### Eligibility — Evaluate Family
```bash
curl http://localhost:3001/api/eligibility/evaluate/GUJ-2026-6292
```

---

### Family — Split Household
```bash
curl -X POST http://localhost:3001/api/family/split \
  -H "Content-Type: application/json" \
  -d "{\"source_family_id\":\"GUJ-2026-6292\",\"new_hof_aadhaar\":\"123456789012\",\"migrating_member_ids\":[\"123456789012\",\"987654321098\"],\"new_address\":\"45, New Colony, Surat - 395001\"}"
```

---

### Verify — Send OTP
```bash
curl -X POST http://localhost:3001/api/verify/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"aadhaar_number\":\"111122223333\",\"member_name\":\"Ruchir Joshi\"}"
```

### Verify — Confirm OTP
```bash
curl -X POST http://localhost:3001/api/verify/confirm-otp \
  -H "Content-Type: application/json" \
  -d "{\"session_token\":\"<token_from_send_otp_response>\",\"otp\":\"123456\"}"
```
