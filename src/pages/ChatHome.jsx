import React, { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import ChatListItem from "../components/shared/ChatListItem";
import useAuthStore from "../store/authStore";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function normalizeConversation(conversation) {
  const lastMessage =
    conversation.last_message ||
    conversation.lastMessage ||
    conversation.message ||
    conversation.latest_message ||
    null;

  const content =
    lastMessage?.content || lastMessage?.text || lastMessage?.message || "";

  const rawTimestamp =
    lastMessage?.created_at ||
    lastMessage?.timestamp ||
    conversation.updated_at ||
    conversation.updatedAt ||
    conversation.timestamp ||
    null;

  const userId =
    conversation.user_id ||
    conversation.other_user_id ||
    conversation.participant_id ||
    conversation.target_user_id ||
    conversation.partner_id ||
    conversation.recipient_id ||
    conversation.id ||
    conversation._id ||
    conversation.conversation_id;

  return {
    id: userId,
    targetId: userId,
    name:
      conversation.name ||
      conversation.title ||
      conversation.subject ||
      (conversation.participants?.length
        ? conversation.participants[0].name ||
          conversation.participants[0].username
        : "Unknown"),
    message: content,
    time: formatTime(rawTimestamp),
    sortTime: rawTimestamp ? new Date(rawTimestamp).getTime() : 0,
    unread: conversation.unread_count ?? conversation.unread ?? 0,
    avatar:
      conversation.avatar ||
      conversation.image ||
      conversation.participants?.[0]?.avatar ||
      conversation.participants?.[0]?.name?.charAt(0)?.toUpperCase() ||
      "U",
    online: conversation.online ?? false,
  };
}

export default function ChatHome() {
  
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.access_token);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setErrorMessage(null);
        const response = await api.get("/conversations");

        let conversationList = [];
        if (Array.isArray(response.data)) {
          conversationList = response.data;
        } else if (Array.isArray(response.data.conversations)) {
          conversationList = response.data.conversations;
        }

        const normalized = conversationList
          .map(normalizeConversation)
          .filter((item) => item.id)
          .sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0));

        setConversations(normalized);
      } catch (err) {
        const message = err.response
          ? JSON.stringify(err.response.data)
          : err.request
            ? "No response from server. This may be a network or CORS issue."
            : err.message;

        console.error("Fetch conversations error", message);
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token]);

  const handleConversationClick = (conversationId) => {
    if (!conversationId) return;
    navigate(`/conversation/${conversationId}`);
  };

  return (
    <div className="bg-[#000E08] pt-5 min-h-screen">
      <div className="flex h-[15vh] justify-between items-center p-6 text-white">
        <div className="border-2 border-[#363F3B] rounded-full w-11 h-11 flex items-center justify-center bg-[#363F3B]" onClick={() => navigate("/search")}>
          <Search />
        </div>
        <p className="font-bold text-lg">Messages</p>
        <div className="border-2 border-[#363F3B] rounded-full w-11 h-11 flex items-center justify-center bg-[#363F3B]" onClick={() => navigate("/profile")}>
          <User />
        </div>
      </div>

      <div className="bg-white min-h-[85vh] pt-1 rounded-t-[20px] border">
        <div className="bg-slate-300 w-14 h-2 rounded-full mx-auto mt-4"></div>

        <div className="px-6 py-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading conversations…</p>
          ) : errorMessage ? (
            <p className="text-sm text-red-600 wrap-break-word">
              {errorMessage}
            </p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-500">No messages</p>
          ) : (
            <ul>
              {conversations.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  onClick={() =>
                    handleConversationClick(chat.targetId ?? chat.id)
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
