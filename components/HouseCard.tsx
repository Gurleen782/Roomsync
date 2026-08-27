type HouseCardProps = {
  loadingHouse: boolean;
  house: any;
  loadingMembers: boolean;
  members: any[];
  router: any;
  userId: string;
};

export default function HouseCard({
  loadingHouse,
  house,
  loadingMembers,
  members,
  router,
  userId,
}: HouseCardProps) {

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <h2 className="text-2xl font-bold">
        🏠 My House
      </h2>

      {loadingHouse ? (
        <p className="text-gray-600 mt-3">
          Loading house...
        </p>
      ) : house ? (
        <>
          <h3 className="text-xl font-semibold mt-4" style={{ color: "#3e0a66" }}>
            {house.house_name}
          </h3>

          <p className="text-gray-500 mt-2">
            📍 {house.address || "No address provided"}
          </p>

          <p className="text-green-600 font-medium mt-2 capitalize">
            {house.role}
          </p>

          {house.role === "owner" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">
                House Code
              </p>

              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-bold tracking-widest">
                  {house.house_code}
                </p>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(house.house_code);
                    alert("House code copied!");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-xl font-bold">
              👥 Members
            </h3>

            {loadingMembers ? (
              <p className="mt-3 text-gray-500">
                Loading members...
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {members.map((member: any) => (
                  <div
                    key={member.user_id}
                    className="flex justify-between items-center rounded-xl p-4 border"
                    style={{
                      backgroundColor: "#F8F4FC",
                      borderColor: "#E5D9F0",
                    }}
                  >
                    <span>
                      {member.role === "owner" ? "👑" : "🙂"}{" "}
                      {member.user_id === userId ? "You" : member.full_name}
                    </span>

                    <span className="capitalize text-gray-500">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              {/*<button
                onClick={() => router.push("/add-expense")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                ➕ Add Expense
              </button>?*/}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-600 mt-3">
            You are not a member of any house yet.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.push("/create-house")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Create House
            </button>

            <button
              onClick={() => router.push("/join-house")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              Join House
            </button>
          </div>
        </>
      )}
    </div>
  );
}