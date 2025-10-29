import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Welcome Back
        </h2>
        
        <form className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
          />
          
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
          />
          
          <Button
            type="button"
            variant="primary"
            className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-400">  Do not have an account?{" "}
          <Link href="/auth/register" className="text-yellow-500 hover:text-yellow-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}