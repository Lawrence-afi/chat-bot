import React from "react";

export default function ChatItem({ chat }) {
  return (
    <li className="flex items-center justify-between gap-4 p-4">
      <span className="flex items-center gap-4">
        <span className="w-12 h-12 bg-[#363F3B] rounded-full flex items-center justify-center text-white">
          {chat.avatar || chat.name.charAt(0).toUpperCase()}
        </span>
        <span className="flex flex-col">
          <span>{chat.name}</span>
          <span>{chat.message}</span>
        </span>
      </span>
      <span className="flex flex-col items-end">
        <span>{chat.time}</span>
        {chat.unread > 0 && (
          <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
            {chat.unread}
          </span>
        )}
      </span>
    </li>
  );
}
