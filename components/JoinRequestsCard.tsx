type JoinRequestsCardProps = {
  loadingRequests: boolean;
  joinRequests: any[];
  handleAccept: (request: any) => void;
  handleReject: (request: any) => void;
};

export default function JoinRequestsCard({
  loadingRequests,
  joinRequests,
  handleAccept,
  handleReject,
}: JoinRequestsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <h2 className="text-2xl font-bold">
        🔔 Join Requests
        {joinRequests.length > 0 && ` (${joinRequests.length})`}
      </h2>

      {joinRequests.length > 0 && (
        <p className="text-orange-600 font-medium mt-2">
          You have pending join requests.
        </p>
      )}

      {loadingRequests ? (
        <p className="text-gray-500 mt-3">
          Loading...
        </p>
      ) : joinRequests.length === 0 ? (
        <p className="text-gray-500 mt-3">
          No pending requests.
        </p>
      ) : (
        joinRequests.map((request: any) => (
          <div
            key={request.id}
            className="rounded-xl p-4 mt-4 border"
              style={{
                backgroundColor: "#F8F4FC",
                borderColor: "#E5D9F0",
              }}
          >
            <p className="font-semibold text-lg">
              👤 {request.full_name}
            </p>

            <p className="text-gray-500 mt-1">
              wants to join your house.
            </p>

            <div className="flex gap-3 mt-4">

              <button
                onClick={() => handleAccept(request)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                Accept
              </button>

              <button
              onClick={() => handleReject(request)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
            >
              Reject
            </button>

            </div>

          </div>
        ))
      )}

    </div>
  );
}