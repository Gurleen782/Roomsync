"use client";

import { useBalances } from "@/hooks/useBalances";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


import BalancesSection from "@/components/BalancesSection";

export default function BalancesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [houseId, setHouseId] = useState("");
  const {
  balances,
  loadingBalances,
  yourBalance,
  loadBalances,
  handleSettle,
} = useBalances(userId, houseId);

useEffect(() => {
  async function fetchData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data: member } = await supabase
      .from("house_members")
      .select("house_id")
      .eq("user_id", user.id)
      .single();

    if (!member) return;

    setHouseId(member.house_id);
  }

  fetchData();
}, []);

useEffect(() => {
  if (userId && houseId) {
    loadBalances();
  }
}, [userId, houseId]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-8">

        <div className="flex items-center justify-between">

            <h1 className="text-3xl font-bold">
                💰 Balances
            </h1>

            <button
                onClick={() => router.push("/dashboard")}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-semibold transition"
            >
                ← Dashboard
            </button>

        </div>

            <p className="text-gray-500 mt-2">
            View all balances and settle pending payments.
            </p>

            <BalancesSection
                loadingBalances={loadingBalances}
                balances={balances}
                handleSettle={(balance) => handleSettle(balance, userId)}
            />

      </div>
    </main>
  );
}