type ExpenseSummaryCardProps = {
  router: any;
};

export default function ExpenseSummaryCard({
  router,
}: ExpenseSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <h2 className="text-2xl font-bold">
        📋 Expenses
      </h2>

      <p className="text-gray-500 mt-3">
        View all house expenses.
      </p>

      <button
        onClick={() => router.push("/expenses")}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        View All Expenses →
      </button>

    </div>
  );
}