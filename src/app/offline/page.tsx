"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animated offline icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface-800 border border-white/5 mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400 animate-pulse-soft"
          >
            <path d="M12.01 21.49 23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" />
            <line x1="1" y1="1" x2="23" y2="23" className="text-red-400" />
          </svg>
          {/* Decorative pulse ring */}
          <div className="absolute inset-0 rounded-3xl border border-slate-700/50 animate-ping opacity-20" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-3">
          You&apos;re Offline
        </h1>

        {/* Subtext */}
        <p className="text-slate-400 mb-2">
          It looks like you&apos;ve lost your internet connection.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Some features may still be available from cached data.
          Check your connection and try again.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.reload()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Try Again
          </Button>
          <Link href="/my-bookings">
            <Button variant="outline" size="lg">
              View Cached Bookings
            </Button>
          </Link>
        </div>

        {/* Bottom hint */}
        <p className="text-xs text-slate-600 mt-10">
          SkyBook works offline for previously viewed bookings.
        </p>
      </div>
    </div>
  );
}
