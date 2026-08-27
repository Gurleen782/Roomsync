"use client";
import HouseCard from "@/components/HouseCard";
import JoinRequestsCard from "@/components/JoinRequestsCard";
import { useBalances } from "@/hooks/useBalances";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [house, setHouse] = useState<any>(null);
  const [loadingHouse, setLoadingHouse] = useState(true);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestHouseName, setRequestHouseName] = useState("");
  const {
  balances,
  loadingBalances,
  yourBalance,
  loadBalances,
  handleSettle,
} = useBalances(userId, house?.id ?? "");

  const router = useRouter();

  async function loadMembers(houseId: string) {
  const { data: memberList } = await supabase
    .from("house_members")
    .select("*")
    .eq("house_id", houseId);

  if (memberList) {
    const membersWithNames = await Promise.all(
      memberList.map(async (member) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", member.user_id)
          .single();

        return {
          ...member,
          full_name: profile?.full_name || "Unknown User",
        };
      })
    );

    setMembers(membersWithNames);
    setMemberCount(membersWithNames.length);
  }

  setLoadingMembers(false);
}

async function loadExpenses(houseId: string) {
  const { data: expenseData } = await supabase
    .from("expenses")
    .select("*")
    .eq("house_id", houseId)
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
    const total = expenseData.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    setTotalExpenses(total);
  }

  setLoadingExpenses(false);
}

async function loadJoinRequests(houseId: string, role: string) {
  if (role !== "owner") {
    setLoadingRequests(false);
    return;
  }

  const { data: requests } = await supabase
    .from("join_requests")
    .select("*")
    .eq("house_id", houseId)
    .eq("status", "pending");

  if (requests) {
    const requestsWithNames = await Promise.all(
      requests.map(async (request) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", request.user_id)
          .maybeSingle();

        return {
          ...request,
          full_name: profile?.full_name || "Unknown User",
        };
      })
    );

    setJoinRequests(requestsWithNames);
  }

  setLoadingRequests(false);
}

  useEffect(() => {
  async function getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      setFullName(profile.full_name);
    }

    const { data: joinRequest } = await supabase
      .from("join_requests")
      .select("status, house_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (joinRequest) {
      setRequestStatus(joinRequest.status);

      const { data: houseInfo } = await supabase
        .from("houses")
        .select("house_name")
        .eq("id", joinRequest.house_id)
        .single();

      if (houseInfo) {
        setRequestHouseName(houseInfo.house_name);
      }
    }

    // Get house membership
    const { data: memberData } = await supabase
      .from("house_members")
      .select("house_id, role")
      .eq("user_id", user.id)
      .single();

    if (!memberData) {
      setLoadingHouse(false);
      setLoadingMembers(false);
      setLoadingExpenses(false);
      setLoadingRequests(false);
      return;
    }

    // Get house
    const { data: houseData } = await supabase
      .from("houses")
      .select("*")
      .eq("id", memberData.house_id)
      .single();

    if (houseData) {
      setHouse({
        ...houseData,
        role: memberData.role,
      });

      await loadMembers(memberData.house_id);
      await loadExpenses(memberData.house_id);
      await loadJoinRequests(
        memberData.house_id,
        memberData.role
      );
    }

    setLoadingHouse(false);
  }

  getProfile();
}, []);

  useEffect(() => {
    if (userId && house?.id) {
      loadBalances();
    }
  }, [userId, house?.id]);

  async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/login");
}

async function handleAccept(request: any) {
  // 1. Add user to house_members
  const { error: memberError } = await supabase
    .from("house_members")
    .insert({
      house_id: request.house_id,
      user_id: request.user_id,
      role: "member",
    });

  if (memberError) {
    alert(memberError.message);
    return;
  }

  // 2. Update request status
    const { data: updatedRequest, error: requestError } = await supabase
      .from("join_requests")
      .update({ status: "accepted" })
      .eq("id", request.id)
      .select();

    if (requestError) {
      alert(requestError.message);
      return;
    }

      alert("Member added successfully!");

      // Remove the request from the UI
      setJoinRequests((prev) =>
        prev.filter((r) => r.id !== request.id)
      );
    }

    async function handleReject(request: any) {
      const { error } = await supabase
        .from("join_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Request rejected!");

      setJoinRequests((prev) =>
        prev.filter((r) => r.id !== request.id)
      );
    }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-8">

        <div className="flex justify-between items-center">

        <h1 className="text-4xl font-bold text-blue-600">
          🏠 RoomSync
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>

       </div>

        <p className="text-2xl font-semibold mt-8 text-gray-800">
          {new Date().getHours() < 12
            ? "Good Morning"
            : new Date().getHours() < 17
            ? "Good Afternoon"
            : "Good Evening"}, {fullName || "User"} 👋
        </p>

        <p className="text-gray-500 mt-2">
          Manage your shared expenses and keep track of your house balance.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ marginTop: "30px" }}
        >

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 min-h-[180px]">
          <p className="text-gray-500 font-medium">
            👥 Members
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {memberCount}
          </h2>

          <p className="text-gray-400 mt-1">
            {memberCount === 1 ? "Member" : "Members"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 min-h-[180px]">
          <p className="text-gray-500">💸 Total Expenses</p>
          <h2 className="text-3xl font-bold mt-2">
            ₹{totalExpenses.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>

          <p className="text-gray-400 mt-1">
            All house expenses
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 min-h-[180px]">
          <p className="text-gray-500">💰 Net Balance</p>

          <h2
            className={`text-2xl font-bold mt-3 leading-snug ${
              yourBalance > 0
                ? "text-green-600"
                : yourBalance < 0
                ? "text-red-600"
                : "text-gray-700"
            }`}
          >
            {balances.length === 0
              ? "Settled"
              : yourBalance > 0
              ? `You are owed ₹${yourBalance.toFixed(2)}`
              : yourBalance < 0
              ? `You owe ₹${Math.abs(yourBalance).toFixed(2)}`
              : "Unsettled"}
          </h2>

          <p className="text-gray-400 mt-1">
            Your current balance
          </p>
        </div>

      </div>

          {!house && requestStatus && (
          <div
            className={`mt-6 p-5 rounded-xl ${
              requestStatus === "pending"
                ? "bg-yellow-100"
                : "bg-red-100"
            }`}
          >
            <h2 className="font-bold text-lg">
              {requestStatus === "pending"
                ? "🕒 Join Request Pending"
                : "❌ Join Request Rejected"}
            </h2>

            <p className="mt-2">
              {requestStatus === "pending"
                ? `Your request to join "${requestHouseName}" is waiting for the owner's approval.`
                : `Your request to join "${requestHouseName}" was rejected.`}
            </p>
          </div>
        )}

        {house?.role === "owner" && (
            <JoinRequestsCard
            loadingRequests={loadingRequests}
            joinRequests={joinRequests}
            handleAccept={handleAccept}
            handleReject={handleReject}
          />
          )}

        <HouseCard
          loadingHouse={loadingHouse}
          house={house}
          loadingMembers={loadingMembers}
          members={members}
          router={router}
          userId={userId}
        />

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold">🧾 Expenses</h2>

          <p className="text-gray-500 mt-2">
            Add a new expense or view all expenses in your house.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => router.push("/add-expense")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              ➕ Add Expense
            </button>

            <button
              onClick={() => router.push("/expenses")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              📄 View All Expenses
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                💰 Balances
              </h2>

              <p className="text-gray-500 mt-2">
                View and settle all pending balances.
              </p>
            </div>

            <button
              onClick={() => router.push("/balances")}
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap"
            >
              View Balances →
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}