# 🏠 RoomSync

**RoomSync** is a full-stack shared expense management platform designed for people living together in a shared house.

It helps roommates manage their shared household, record expenses, automatically split costs, track balances, and settle outstanding payments from one centralized dashboard.

---

## 🚀 Features

### 👤 Authentication

* User signup and login
* Secure authentication using Supabase
* User profile with full name
* Logout functionality

### 🏠 House Management

* Create a house
* Join an existing house using a unique house code
* View house details
* Owner and member roles
* View house members
* Owner can manage join requests
* Accept or reject join requests
* Display pending and rejected request status

### 💸 Expense Management

* Add shared expenses
* Expense title and amount
* Expense categories:

  * Food
  * Grocery
  * Rent
  * Electricity
  * Travel
  * Entertainment
  * Shopping
  * Other
* Automatically split expenses among house members
* View expense history
* Search expenses
* Edit expenses
* Delete expenses
* Display total house expenses

### 💰 Balance & Settlement

* Automatically calculate individual expense shares
* Track who owes whom
* Calculate the user's net balance
* Show whether the user is owed money or owes money
* Track settled and unsettled balances
* Mark outstanding balances as settled

---

## 🛠️ Tech Stack

| Technology       | Purpose                                       |
| ---------------- | --------------------------------------------- |
| **Next.js**      | Full-stack React framework                    |
| **TypeScript**   | Type-safe development                         |
| **Tailwind CSS** | UI styling                                    |
| **Supabase**     | Authentication, database and backend services |
| **PostgreSQL**   | Relational database                           |
| **React Hooks**  | State management and application logic        |

---

## 🏗️ Project Structure

```text
RoomSync/
│
├── app/
│   ├── dashboard/
│   ├── login/
│   ├── signup/
│   ├── add-expense/
│   ├── expenses/
│   ├── balances/
│   ├── create-house/
│   └── join-house/
│
├── components/
│   ├── HouseCard.tsx
│   └── JoinRequestsCard.tsx
│
├── hooks/
│   └── useBalances.ts
│
├── lib/
│   └── supabase.ts
│
├── public/
│
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd RoomSync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Never commit your `.env.local` file or expose your Supabase credentials publicly.

### 4. Run the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔐 Database

RoomSync uses **Supabase PostgreSQL** for storing:

* User profiles
* Houses
* House members
* Join requests
* Expenses
* Expense balances and settlements

Row Level Security (RLS) is enabled to help protect database access.

---

## 🎯 Project Purpose

RoomSync was developed to provide a simple and centralized way for roommates to manage shared household expenses without manually calculating individual payments.

The project demonstrates practical use of:

* Full-stack web development
* Authentication
* Relational databases
* CRUD operations
* Database security
* State management
* Expense calculation logic
* User and house management

---

## 👩‍💻 Author

**Gurleen Kaur**


