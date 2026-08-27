# 🏠 RoomSync

RoomSync is a full-stack shared expense management platform designed for people living together in a shared house.

It allows house members to manage their house, track shared expenses, automatically split costs, view balances, and settle outstanding payments from one centralized dashboard.

---

## 🚀 Features

### 👤 Authentication
- User signup and login
- Secure authentication using Supabase
- User profile with full name
- Logout functionality

### 🏠 House Management
- Create a house
- Join an existing house using a house code
- View house details
- Owner and member roles
- View all house members
- Owner can manage join requests
- Accept or reject join requests

### 💸 Expense Management
- Add shared expenses
- Expense title and amount
- Expense categories:
  - Food
  - Grocery
  - Rent
  - Electricity
  - Travel
  - Entertainment
  - Shopping
  - Other
- Automatically split expenses equally among house members
- View expense history
- Search expenses
- Edit expenses
- Delete expenses

### 💰 Balance & Settlement
- Automatically calculate individual expense shares
- Track who owes whom
- Calculate the user's net balance
- Show whether the user is owed money or owes money
- Track settled and unsettled expense splits
- Mark outstanding balances as settled

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js | Full-stack React framework |
| TypeScript | Type-safe development |
| Tailwind CSS | UI styling |
| Supabase | Authentication and backend services |
| PostgreSQL | Relational database |
| React Hooks | State and application logic |

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
│   ├── expense-history/
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