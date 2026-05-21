"use client";

export function SeatLegend() {
  const items = [
    { color: "bg-slate-700 border-slate-600", label: "Available" },
    { color: "bg-slate-800/30 border-slate-700/30 opacity-40", label: "Occupied" },
    { color: "bg-brand-500 border-brand-400", label: "Selected" },
    { color: "bg-accent-500 border-accent-400", label: "Your Seat" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-md border ${item.color}`}
          />
          <span className="text-xs text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
