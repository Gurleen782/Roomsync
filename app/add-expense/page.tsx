"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddExpensePage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("Food");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Find user's house
    const { data: member } = await supabase
      .from("house_members")
      .select("house_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      alert("You are not part of any house.");
      setLoading(false);
      return;
    }

    // Create expense
    const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
        house_id: member.house_id,
        paid_by: user.id,
        title,
        amount: Number(amount),
        category,
    })
    .select()
    .single();

    if (error || !expense) {
    setLoading(false);
    alert(error?.message || "Failed to add expense.");
    return;
    }
    
    const { data: members } = await supabase
    .from("house_members")
    .select("user_id")
    .eq("house_id", member.house_id);

    if (!members || members.length === 0) {
    setLoading(false);
    alert("No members found.");
    return;
    }

    const share = Number(amount) / members.length;

    const splits = members.map((member) => ({
    expense_id: expense.id,
    user_id: member.user_id,
    amount: share,
    }));

    const { error: splitError } = await supabase
  .from("expense_splits")
  .insert(splits);

    setLoading(false);

    if (splitError) {
    alert(splitError.message);
    return;
    }

    alert("Expense added and split successfully!");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Add Expense
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            placeholder="Expense Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-3 rounded-lg"
            required
          />

          <div className="mt-5">
            <label className="block text-gray-700 font-medium mb-2">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>Food</option>
              <option>Grocery</option>
              <option>Rent</option>
              <option>Electricity</option>
              <option>Travel</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "Saving..." : "Add Expense"}
          </button>

        </form>

      </div>
    </main>
  );
}