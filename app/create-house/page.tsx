"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateHousePage() {
  const [houseName, setHouseName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function generateHouseCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return code;
}

  async function handleCreateHouse(
    e: React.FormEvent<HTMLFormElement>
    ) {
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

    // Check if user already belongs to a house
    const {
    data: existingMember,
    error: memberError,
    } = await supabase
    .from("house_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

    console.log("Existing member:", existingMember);
    console.log("Member error:", memberError);

    if (existingMember) {
    alert("You are already a member of a house.");
    setLoading(false);
    return;
    }

    const houseCode = generateHouseCode();

    const { data: house, error } = await supabase
  .from("houses")
  .insert({
  house_name: houseName,
  address: address,
  owner_id: user.id,
  house_code: houseCode,
})
  .select()
  .single();

  if (!error && house) {
  await supabase.from("house_members").insert({
    house_id: house.id,
    user_id: user.id,
    role: "owner",
  });
}

    setLoading(false);

    if (error) {
        alert(error.message);
    } else {
        alert("House created successfully!");
        router.push("/dashboard");
    }
    }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center">
            Create a New House
        </h1>

        <p className="text-gray-500 text-center mt-2">
            Start managing expenses with your roommates.
        </p>

        <form onSubmit={handleCreateHouse} className="mt-8 space-y-5">
            <div>
            <label className="block mb-2 font-medium">
                House Name
            </label>

            <input
                type="text"
                placeholder="Enter house name"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
            />
            </div>

            <div>
            <label className="block mb-2 font-medium">
                Address (Optional)
            </label>

            <input
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
            />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                {loading ? "Creating..." : "Create House"}
            </button>
        </form>
        </div>
    </main>
  );
}