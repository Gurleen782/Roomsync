type BalancesCardProps = {
  loadingBalances: boolean;
  balances: any[];
  handleSettle: (balance: any) => void;
};

export default function BalancesSection({
  loadingBalances,
  balances,
  handleSettle,
}: BalancesCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold">
        💰 Balances
      </h2>

      {loadingBalances ? (
        <p className="mt-3 text-gray-500">
          Loading...
        </p>
      ) : balances.length === 0 ? (
        <p className="mt-3 text-gray-500">
          All expenses have been settled.
        </p>
      ) : (
        <div className="space-y-3 mt-6">
          {balances.map((balance) => (
          <div
              key={`${balance.expenseId}-${balance.id}`}
              className="border rounded-xl p-4 mt-4 flex justify-between items-center"
          >
              <p
                className={`text-lg font-semibold ${
                  balance.type === "owed"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {balance.text}
              </p>

              {balance.type === "owe" && (
                <button
                  onClick={() => handleSettle(balance)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Settle Up
                </button>
              )}
          </div>
        ))}
        </div>
      )}
    </div>
  );
}