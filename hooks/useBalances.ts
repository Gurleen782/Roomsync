"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useBalances(userId: string, houseId: string) {
  const [balances, setBalances] = useState<any[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [yourBalance, setYourBalance] = useState(0);

    async function loadBalances() {
        if (!houseId || !userId) {
            setLoadingBalances(false);
            return;
        }

        const { data: expenses, error } = await supabase
            .from("expenses")
            .select("*")
            .eq("house_id", houseId);

        if (!expenses) {
            setLoadingBalances(false);
            return;
        }

        const balances: Record<string, number> = {};

        for (const expense of expenses) {
            const { data: splits } = await supabase
            .from("expense_splits")
            .select("*")
            .eq("expense_id", expense.id)
            .eq("is_paid", false);

            if (!splits) continue;

            for (const split of splits) {
                // Ignore the payer's own share
                if (split.user_id === expense.paid_by) continue;

                const amount = Number(split.amount);

                // If I paid, others owe me
                if (expense.paid_by === userId) {
                    if (!balances[split.user_id]) {
                    balances[split.user_id] = 0;
                    }

                    balances[split.user_id] += amount;
                }

                // If someone else paid and I'm one of the split members,
                // then I owe them.
                else if (split.user_id === userId) {
                    if (!balances[expense.paid_by]) {
                    balances[expense.paid_by] = 0;
                }

                balances[expense.paid_by] -= amount;
                }
            }
        }

        const result = [];

        for (const expense of expenses) {
            const { data: splits } = await supabase
                .from("expense_splits")
                .select("*")
                .eq("expense_id", expense.id)
                .eq("is_paid", false);

            if (!splits) continue;

            for (const split of splits) {
                if (split.user_id === expense.paid_by) continue;

                // I paid, someone owes me
                if (expense.paid_by === userId) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("full_name")
                        .eq("id", split.user_id)
                        .single();

                    result.push({
                        id: split.user_id,
                        expenseId: expense.id,
                        amount: Number(split.amount),
                        type: "owed",
                        text: `${profile?.full_name} owes you ₹${Number(split.amount).toFixed(2)}`,
                    });
                }   

                // Someone else paid, I owe them
                else if (split.user_id === userId) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("full_name")
                        .eq("id", expense.paid_by)
                        .single();

                    result.push({
                        id: expense.paid_by,
                        expenseId: expense.id,
                        amount: Number(split.amount),
                        type: "owe",
                        text: `You owe ${profile?.full_name} ₹${Number(split.amount).toFixed(2)}`,
                    });
                }
            }
        }

        const net = result.reduce((sum, balance) => {
            return balance.type === "owe"
                ? sum - balance.amount
                : sum + balance.amount;
        }, 0);

        setYourBalance(net);
        setBalances(result);
        setLoadingBalances(false);
    }

    async function handleSettle(
    balance: any,
    userId: string
    ) {
        const { error } = await supabase
            .from("expense_splits")
            .update({ is_paid: true })
            .eq("expense_id", balance.expenseId)
            .eq("user_id", userId);

        if (error) {
            alert(error.message);
            return;
        }

        alert("Settlement recorded!");

        await loadBalances();
    }

    return {
        balances,
        loadingBalances,
        yourBalance,
        loadBalances,
        handleSettle,
    };
}