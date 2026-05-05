import React from "react";

/**
 * BottomNav — mobile-only bottom navigation bar.
 * Props: items — array of { label, icon: LucideIcon, active }
 */
export default function BottomNav({ items = [] }) {
  return (
    <nav
      className="flex fixed bottom-0 left-0 w-full bg-white border-t border-[#ebebeb] px-0 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] z-[100] md:hidden"
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <button
          key={item.label}
          className={`flex-1 flex flex-col items-center gap-1 text-[#8a8f98] py-1 transition-colors duration-75 ease-out ${
            item.active ? "text-[#25d366]" : ""
          }`}
          aria-current={item.active ? "page" : undefined}
        >
          <item.icon size={22} />
          <span className="text-[10px] font-semibold tracking-[0.02em]">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
