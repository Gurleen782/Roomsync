"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadExpenses() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: member } = await supabase
        .from("house_members")
        .select("house_id")
        .eq("user_id", user.id)
        .single();

      if (!member) {
        setLoading(false);
        return;
      }

      const { data: expenseData } = await supabase
        .from("expenses")
        .select("*")
        .eq("house_id", member.house_id)
        .order("created_at", { ascending: false });

      if (expenseData) {
        const expensesWithNames = await Promise.all(
          expenseData.map(async (expense) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", expense.paid_by)
              .single();

            return {
              ...expense,
              paid_by_name: profile?.full_name || "Unknown User",
            };
          })
        );

        setExpenses(expensesWithNames);
      }

      setLoading(false);
    }

    loadExpenses();

    const channel = supabase
      .channel("expenses-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        () => {
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  async function handleDelete(expenseId: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    // Delete all splits first
    const { error: splitError } = await supabase
      .from("expense_splits")
      .delete()
      .eq("expense_id", expenseId);

    if (splitError) {
      alert(splitError.message);
      return;
    }

    // Delete expense
    const { error: expenseError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (expenseError) {
      alert(expenseError.message);
      return;
    }

    // Remove it from UI
    setExpenses((prev) =>
      prev.filter((expense) => expense.id !== expenseId)
    );

    alert("Expense deleted successfully!");
  }

  function startEditing(expense: any) {
    setEditingExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
  }

  async function saveChanges() {
    if (!editingExpense) return;

    if (!editTitle.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    if (Number(editAmount) <= 0) {
      alert("Amount must be greater than 0.");
      return;
    }

    setSaving(true);

    // Update expense
    const { error } = await supabase
      .from("expenses")
      .update({
        title: editTitle,
        amount: Number(editAmount),
      })
      .eq("id", editingExpense.id);

    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }

    // Get all splits for this expense
    const { data: splits, error: splitError } = await supabase
      .from("expense_splits")
      .select("*")
      .eq("expense_id", editingExpense.id);

    if (splitError) {
      setSaving(false);
      alert(splitError.message);
      return;
    }

    if (splits && splits.length > 0) {
      const newShare = Number(editAmount) / splits.length;

      for (const split of splits) {
        const { error } = await supabase
          .from("expense_splits")
          .update({
            amount: newShare,
          })
          .eq("id", split.id);

        if (error) {
          setSaving(false);
          alert(error.message);
          return;
        }
      }
    }

    setSaving(false);
    setEditingExpense(null);

    alert("Expense updated successfully!");
  }

  const filteredExpenses = expenses.filter((expense) =>
    expense.title.toLowerCase().includes(search.toLowerCase())
  );

  function getCategoryIcon(category: string) {
    switch (category) {
      case "Food":
        return "🍕";
      case "Grocery":
        return "🛒";
      case "Rent":
        return "🏠";
      case "Electricity":
        return "⚡";
      case "Travel":
        return "🚕";
      case "Entertainment":
        return "🎬";
      case "Shopping":
        return "🛍";
      default:
        return "📦";
    }
  }

  return (
  <main className="min-h-screen bg-gray-100">
    <div className="max-w-5xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-12 pt-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            📋 Expense History
          </h1>

          <p className="text-gray-500 mt-3">
            View all expenses added in your house.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-5 py-2 rounded-xl font-semibold transition"
        >
          ← Dashboard
        </button>
      </div>

      <div className="mt-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Main Content */}
      <div className="pt-4">

        {loading ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <p className="text-lg text-gray-500">
              Loading expenses...
            </p>
          </div>
        ) : filteredExpenses.length === 0 ? (

            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-6xl">
                {search ? "🔍" : "📄"}
              </div>

              <h2 className="text-2xl font-bold mt-4">
                {search ? "No Matching Expenses" : "No Expenses Yet"}
              </h2>

              <p className="text-gray-500 mt-2">
                {search
                  ? `No expense found for "${search}".`
                  : "Add your first expense from the dashboard."}
              </p>

            </div>

          ) : (

          <div className="mt-4 space-y-5">

            {filteredExpenses.map((expense) => (

              <div
                key={expense.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5"
              >

                <div className="grid grid-cols-[1fr_110px] items-start gap-6">

                  <div>
                    {editingExpense?.id === expense.id ? (
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="border rounded-xl px-4 py-2 w-64"
                        />

                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="border rounded-xl px-3 py-2 w-28 text-center"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <span>{getCategoryIcon(expense.category)}</span>

                          <span>
                            {expense.title.charAt(0).toUpperCase() +
                              expense.title.slice(1)}
                          </span>
                        </h2>

                        <span className="text-xl font-bold text-green-700">
                          ₹{Number(expense.amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-4 pr-4 mt-2">

                    {editingExpense?.id === expense.id ? (
                      <>
                        <button
                          onClick={saveChanges}
                          className="w-24 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
                        >
                          💾 Save
                        </button>

                        <button
                          onClick={() => setEditingExpense(null)}
                          className="w-24 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-xl"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      expense.paid_by === user?.id && (
                        <>
                          <button
                            onClick={() => startEditing(expense)}
                            className="w-24 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="w-24 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-sm font-medium"
                          >
                            🗑 Delete
                          </button>
                        </>
                      )
                    )}

                  </div>

                </div>

                <div className="mt-4 space-y-2 text-gray-700">

                  <p>
                    👤 <span className="font-semibold">Paid by:</span>{" "}
                    {expense.paid_by_name}
                  </p>

                  <p>
                    📅{" "}
                    {new Date(expense.created_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  </main>
);
}