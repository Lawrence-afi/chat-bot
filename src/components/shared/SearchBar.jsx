import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ placeholder = "Search conversations…" }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/9 border border-white/10 rounded-full px-4 py-2.5 flex-1 transition-all duration-75 ease-out focus-within:border-[#25d366] focus-within:bg-white/13">
      <Search className="text-[#8a8f98] shrink-0" size={18} />
      <input
        type="text"
        className="bg-none border-none outline-none w-full font-['Sora'] text-sm text-white placeholder:text-white/35"
        placeholder={placeholder}
        aria-label="Search"
      />
    </div>
  );
}
