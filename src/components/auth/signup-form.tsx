"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupAction } from "@/lib/actions/auth";

export function SignupForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signupAction(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
    } catch {
      // redirect() throws NEXT_REDIRECT — this is expected behavior
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        required
        autoComplete="new-password"
        hint="Must be at least 6 characters"
      />

      <Input
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        size="lg"
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-400 hover:text-brand-300 transition-colors font-medium"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
