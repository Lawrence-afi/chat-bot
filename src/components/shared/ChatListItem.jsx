import React from "react";
import Avatar from "./Avatar";
import UnreadBadge from "./UnreadBadge";

/**
 * ChatListItem — a single row in the conversation list.
 * Props: chat { id, name, message, time, unread, avatar, online }
 */
export default function ChatListItem({ chat }) {
  return (
    <li className="flex items-center gap-3.5 px-[22px] py-[13px] cursor-pointer border-b border-[#ebebeb] transition-colors duration-75 ease-out hover:bg-[#f5f7fa] active:bg-[#eef0f4] last:border-b-0 animate-[fadeSlideIn_0.3s_ease_both]">
      <Avatar
        src={chat.avatar}
        alt={chat.name}
        online={chat.online}
        size="md"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#111] whitespace-nowrap overflow-hidden text-ellipsis">
            {chat.name}
          </span>
          <span className="text-[11px] text-[#8a8f98] whitespace-nowrap shrink-0">
            {chat.time}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-[#8a8f98] whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
            {chat.message}
          </p>
          <UnreadBadge count={chat.unread} />
        </div>
      </div>
    </li>
  );
}
