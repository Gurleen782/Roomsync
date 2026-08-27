import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-10 text-center">
        <h1 className="text-4xl font-bold text-blue-600">
          Roommate Expense Splitter
        </h1>

        <p className="mt-4 text-gray-600">
          Split rent, groceries, electricity bills and recurring expenses with
          your roommates.
        </p>

        <Link
          href="/login"
          className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}