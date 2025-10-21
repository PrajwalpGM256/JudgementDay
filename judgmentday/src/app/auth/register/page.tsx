import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Create Account
        </h2>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              placeholder="johndoe123"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="button"
            className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            Create Account
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-yellow-500 hover:text-yellow-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}