import React from "react";

/**
 * UnreadBadge — small red badge showing unread message count.
 * Renders nothing when count is 0 or falsy.
 */
export default function UnreadBadge({ count }) {
  if (!count) return null;
  return <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-[#e5484d] text-white text-[11px] font-bold rounded-full shrink-0">{count}</span>;
}
