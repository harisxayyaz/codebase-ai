export default function ChatPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Chat with Repo</h2>

      <div className="border h-[400px] p-4 mb-4 rounded">
        Chat messages will appear here
      </div>

      <input
        className="w-full border p-2 rounded"
        placeholder="Ask something about the code..."
      />
    </div>
  );
}