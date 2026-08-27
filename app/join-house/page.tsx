"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function JoinHousePage() {
  const [houseCode, setHouseCode] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleJoinHouse(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setLoading(false);
      return;
    }

    // Find house using the code
    const { data: house, error: houseError } = await supabase
      .from("houses")
      .select("*")
      .eq("house_code", houseCode.toUpperCase())
      .single();

    if (houseError || !house) {
      alert("Invalid house code.");
      setLoading(false);
      return;
    }

    // Check if user is already a member of a house
    const { data: existingMember } = await supabase
      .from("house_members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      alert("You are already a member of a house.");
      setLoading(false);
      return;
    }

    // Check if a pending request already exists
    const { data: existingRequest } = await supabase
      .from("join_requests")
      .select("*")
      .eq("house_id", house.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      alert("You already have a pending join request.");
      setLoading(false);
      return;
    }

    // Create join request
    const { error } = await supabase
      .from("join_requests")
      .insert({
        house_id: house.id,
        user_id: user.id,
        status: "pending",
      });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Join request sent!");
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-blue-600 text-center">
          Join a House
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Enter the house code shared by your roommate.
        </p>

        <form
          onSubmit={handleJoinHouse}
          className="space-y-5 mt-8"
        >

          <input
            type="text"
            placeholder="House Code"
            value={houseCode}
            onChange={(e) => setHouseCode(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 uppercase"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
          >
            {loading ? "Sending..." : "Join House"}
          </button>

        </form>

      </div>
    </main>
  );
}