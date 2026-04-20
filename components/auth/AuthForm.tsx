"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        if (error) throw error;
        router.push("/login?message=Check your email to verify your account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const isValid = type === "signup" ? email && password && firstName : email && password;

  return (
    <div className="flex w-full flex-col max-w-[420px] mx-auto">
      <h1 className="mb-2 text-3xl font-medium tracking-wide text-white md:text-[32px]">
        {type === "login" ? "Log in" : "Create an account"}
      </h1>
      
      <p className="mb-8 text-sm text-[#95939f]">
        {type === "login" ? "Don't have an account? " : "Already have an account? "}
        <Link href={type === "login" ? "/signup" : "/login"} className="text-[#a491e5] hover:underline underline-offset-4">
          {type === "login" ? "Sign up" : "Log in"}
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {type === "signup" && (
          <div className="flex gap-4">
            <Input 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required 
              placeholder="First name"
              className="h-12 border-transparent bg-[#312f38] px-4 text-white placeholder:text-[#6a6875] focus-visible:border-[#7354c4] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Input 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="Last name"
              className="h-12 border-transparent bg-[#312f38] px-4 text-white placeholder:text-[#6a6875] focus-visible:border-[#7354c4] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}
        
        <Input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="Email"
          className="h-12 border-transparent bg-[#312f38] px-4 text-white placeholder:text-[#6a6875] focus-visible:border-[#7354c4] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Enter your password"
            className="h-12 border-transparent bg-[#312f38] px-4 pr-10 text-white placeholder:text-[#6a6875] focus-visible:border-[#7354c4] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6875] hover:text-[#95939f] transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {type === "login" && (
          <div className="flex justify-end">
            <Link href="#" className="text-xs text-[#a491e5] hover:underline underline-offset-4">
              Forgot password?
            </Link>
          </div>
        )}

        {type === "signup" && (
          <div className="flex items-center space-x-3 my-1">
            <Checkbox 
              id="terms" 
              required 
              className="h-5 w-5 rounded-sm border-transparent bg-white data-[state=checked]:bg-white data-[state=checked]:text-black" 
            />
            <label htmlFor="terms" className="text-xs text-[#95939f] cursor-pointer">
              I agree to the <Link href="#" className="text-[#a491e5] hover:underline">Terms & Conditions</Link>
            </label>
          </div>
        )}
        
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        
        <Button 
          type="submit" 
          disabled={loading || !isValid} 
          className="mt-2 h-12 w-full bg-[#7354c4] text-white hover:bg-[#8565d6] text-[15px] font-medium"
        >
          {loading ? "Please wait..." : type === "login" ? "Log in" : "Create account"}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#312f38]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#23212b] px-3 text-[#6a6875]">Or register with</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          type="button" 
          onClick={() => handleOAuth("google")}
          className="h-11 flex-1 border-[#312f38] bg-transparent text-sm font-medium text-white hover:bg-[#312f38] hover:text-white"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={() => handleOAuth("apple")}
          className="h-11 flex-1 border-[#312f38] bg-transparent text-sm font-medium text-white hover:bg-[#312f38] hover:text-white"
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.365 21.444c-1.558.115-2.58-.755-3.83-1.074-1.298-.335-2.502.16-3.904 1.135-1.464 1.018-2.585 1.54-3.79 1.164-3.738-1.162-7.247-8.625-5.326-13.435 1.026-2.57 3.342-4.108 5.867-4.108 1.48.064 2.853.766 3.847 1.135 1.09.405 2.506.942 4.148.868 2.374-.108 4.298-1.196 5.485-2.906.183.16.335.34.464.538-2.215 1.345-2.613 4.298-1.123 6.038.567.663 1.282 1.135 2.083 1.4-1.168 3.522-3.167 6.474-3.92 9.245zm-4.71-15.65c-.183-2.185 1.066-4.254 3.036-5.46-1.07-2.195-3.32-3.414-5.37-3.3-2.316.126-4.043 1.944-4.52 3.962-.43 1.83 1.054 4.092 3.123 5.378 1.063.662 2.39.734 3.73-.58z" />
          </svg>
          Apple
        </Button>
      </div>
    </div>
  );
}
