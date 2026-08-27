type ExpensesCardProps = {
  loadingExpenses: boolean;
  expenses: any[];
};

export default function ExpensesCard({
  loadingExpenses,
  expenses,
}: ExpensesCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <h2 className="text-2xl font-bold">
        💰 Recent Expenses
      </h2>

      {loadingExpenses ? (
        <p className="mt-3 text-gray-500">
          Loading...
        </p>
      ) : expenses.length === 0 ? (
        <p className="mt-3 text-gray-500">
          No expenses yet.
        </p>
      ) : (
        <div className="space-y-4 mt-6">
          {expenses.map((expense: any) => (
            <div
              key={expense.id}
              className="border rounded-xl p-4"
            >
              <h3 className="font-bold text-lg">
                {expense.title}
              </h3>

              <p className="text-2xl font-bold text-blue-600 mt-2">
                ₹{expense.amount}
              </p>

              <p className="text-gray-500 mt-2">
                Paid by 👤 {expense.paid_by_name}
              </p>
              
              <p className="text-sm text-gray-400 mt-1">
                {new Date(expense.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}