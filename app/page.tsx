export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Admin Login
        </h1>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-black py-2 text-white hover:bg-gray-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
