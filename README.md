# Kutumba Gujarat 🏛️

**One State. One Family. Endless Possibilities.**

Kutumba Gujarat is a next-generation GovTech portal designed to streamline citizen welfare delivery. Instead of making citizens hunt for government schemes and repeatedly fill out the same demographic data, Kutumba introduces a **Unified Family ID**. 

By aggregating household data and maintaining a cryptographic single source of truth, our **Proactive Matching Engine** automatically discovers the welfare schemes a family is eligible for and enables a revolutionary **1-Click Application** process.

---

## 🚀 Key Features

### 👨‍👩‍👧‍👦 Citizen Portal
- **Unified Family Registration**: Citizens can register their entire household through an Aadhaar-linked e-KYC flow to generate a unique `GUJ-YYYY-XXXX` Family ID.
- **Proactive Scheme Matching**: Our dynamic eligibility engine evaluates the family's total income, individual ages, and gender constraints in real-time, automatically discovering welfare schemes (like MYSY, PM Awas Yojana, etc.) that they qualify for.
- **1-Click Apply**: Say goodbye to complex forms. If the proactive engine flags a citizen as eligible, they can apply for the scheme with a single click.
- **Household Lifecycle Management**: 
  - **Add Members**: Seamlessly add new members (e.g., newborns, spouses) to an existing household.
  - **Nuclear Family Split**: If a member gets married or relocates, they can easily split off from the parent household to instantly generate a new, independent Family ID.

### 🏢 State Admin Portal (BDO / Officials)
- **Application & Registration Verification**: Officials can review pending household registrations and approve or reject them based on field verification.
- **Scheme Constraint Management**: Admins can create new state welfare schemes and define exact eligibility rules (e.g., Max Income Limits, Target Age Ranges, Target Genders).
- **Financial Analytics**: A real-time dashboard tracking the total disbursement of state funds and breakdowns of successful scheme applications across the population.

---

## 🛠️ Technical Architecture

The project is built as a highly scalable monolithic repository seamlessly deployed on **Vercel** utilizing Serverless functions.

### Frontend (Client Layer)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion (Micro-animations)
- **UI Components**: Custom tailored, high-fidelity components designed for a premium, accessible citizen experience.

### Backend (Application Layer)
- **Framework**: Node.js + Express
- **Architecture**: Micro-service style routing built to run natively on **Vercel Serverless Functions**.
- **Core Modules**:
  - **Dynamic Eligibility Engine**: Parses scheme constraints (JSON) and computes match confidence against household demographics.
  - **Family Lifecycle Service**: Manages complex relational updates (household splitting and transferring members).

### Database (Data Layer)
- **Provider**: Supabase (PostgreSQL)
- **Core Tables**:
  - `families`: Tracks household ID, unified address, and verification status.
  - `members`: Tracks individual citizens, Aadhaar checksums, and parent household pointers.
  - `schemes`: Stores welfare definitions and JSON constraints.
  - `scheme_applications`: Tracks the disbursement lifecycle.

---

## 📦 Deployment Instructions

This repository is optimized for a zero-config deployment on **Vercel**.

1. Fork or clone this repository.
2. Import the project into your Vercel Dashboard.
3. Keep the "Root Directory" as `./` and Framework Preset as **Vite**.
4. In the Vercel **Environment Variables** section, add the following 4 keys:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**. 

*Vercel will automatically read the included `vercel.json` file, build the Vite frontend as static files, and convert the Node.js Express backend into secure Serverless API routes under `/api/*`.*

---

## 💻 Local Development

If you wish to run the project locally on your machine:

1. **Install Dependencies**:
   ```bash
   npm install
   cd backend
   npm install
   ```

2. **Start the Express Backend**:
   ```bash
   cd backend
   npm run dev
   # Runs on http://localhost:3001
   ```

3. **Start the Vite Frontend** (in a new terminal):
   ```bash
   npm run dev
   # Runs on http://localhost:5173
   ```
*(Note: The Vite frontend is configured with a proxy that automatically forwards `/api` requests to the local backend during development).*
