import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  Paperclip,
  Camera,
  Mic,
  Send,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import useAuthStore from "../store/authStore";
import { createEncryptedPayload, decryptMessagePayload } from "../utils/crypto";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const Header = ({ recipientName, active, onBack }) => (
  <div className="flex items-center justify-between p-4 bg-white">
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="text-gray-600 hover:text-gray-900"
        onClick={onBack}
      >
        <ArrowLeft />
      </button>
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
        {recipientName?.charAt(0)?.toUpperCase() || "U"}
      </div>
      <div>
        <h3 className="font-semibold">{recipientName || "Chat"}</h3>
        <p className="text-xs text-green-500">
          {active ? "Active now" : "Offline"}
        </p>
      </div>
    </div>

    <div className="flex gap-4 text-gray-600">
      <Phone />
      <Video />
    </div>
  </div>
);

const MessageBubble = ({ msg }) => {
  const isMe = msg.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} px-4 mb-2`}>
      <div>
        <div
          className={`px-4 py-2 rounded-xl max-w-xs ${
            isMe
              ? "bg-teal-500 text-white rounded-br-none"
              : "bg-gray-200 text-black rounded-bl-none"
          }`}
        >
          {msg.text}
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">{msg.time}</p>
      </div>
    </div>
  );
};

const InputBar = ({ message, setMessage, onSend, disabled }) => (
  <div className="flex items-center gap-2 p-3 bg-white">
    <Paperclip className="text-gray-500" />
    <input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSend();
        }
      }}
      type="text"
      placeholder="Write your message"
      className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none"
    />
    <button
      type="button"
      onClick={onSend}
      disabled={disabled}
      className="rounded-full bg-[#24786D] p-3 text-white disabled:opacity-50"
    >
      <Send className="w-4 h-4" />
    </button>
    <Camera className="text-gray-500" />
    <Mic className="text-gray-500" />
  </div>
);

const ChatPage = () => {
  const { id: recipientId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.access_token);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const privateKey = useAuthStore((state) => state.privateKey);
  const [recipientName, setRecipientName] = useState("");
  const [recipientKey, setRecipientKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState(null);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!recipientId || !token) return;
    let isMounted = true;

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError(null);

        const [messagesRes, publicKeyRes] = await Promise.all([
          api.get(`/conversations/${recipientId}/messages`, {
            params: {
              limit: 50,
            },
          }),
          api.get(`/users/${recipientId}/public-key`),
        ]);

        if (!isMounted) return;

        const normalized = Array.isArray(messagesRes.data)
          ? await Promise.all(
              messagesRes.data
                .slice()
                .reverse()
                .map(async (message) => {
                  let messageText = message.payload?.ciphertext
                    ? "Encrypted message"
                    : "Encrypted content";

                  if (privateKey && message.payload?.ciphertext) {
                    try {
                      messageText = await decryptMessagePayload(
                        message.payload,
                        privateKey,
                      );
                    } catch (decryptError) {
                      console.warn(
                        "Unable to decrypt chat history message:",
                        decryptError,
                      );
                    }
                  }

                  return {
                    id: message.id,
                    sender: message.from_user_id === currentUserId ? "me" : "other",
                    text: messageText,
                    time: formatTime(message.created_at),
                    payload: message.payload,
                  };
                }),
            )
          : [];

        setMessages(normalized);
        setRecipientKey(publicKeyRes.data?.public_key ?? null);
      } catch (err) {
        const message = err.response
          ? JSON.stringify(err.response.data)
          : err.request
            ? "No response from server."
            : err.message;
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadConversation();

    return () => {
      isMounted = false;
    };
  }, [recipientId, token, currentUserId, privateKey]);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(
      `wss://whisperbox.koyeb.app/ws?token=${token}`,
    );
    socketRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      setWsError(null);
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "message.receive") {
          const isRelevant =
            data.from_user_id === recipientId ||
            data.to_user_id === recipientId;
          if (!isRelevant) return;

          let messageText = data.payload?.ciphertext
            ? "Encrypted message"
            : "Encrypted content";

          if (privateKey && data.payload?.ciphertext) {
            try {
              messageText = await decryptMessagePayload(data.payload, privateKey);
            } catch (decryptError) {
              console.warn("Unable to decrypt incoming WebSocket message:", decryptError);
            }
          }

          setMessages((prev) => [
            ...prev,
            {
              id: data.id,
              sender: data.from_user_id === currentUserId ? "me" : "other",
              text: messageText,
              time: formatTime(data.created_at),
              payload: data.payload,
            },
          ]);
        }
      } catch (err) {
        console.error("WebSocket message parse error", err);
      }
    };

    socket.onerror = () => {
      setWsConnected(false);
      setWsError("WebSocket unavailable; outgoing messages will use fallback POST.");
    };

    socket.onclose = () => {
      setWsConnected(false);
      setWsError("WebSocket unavailable; outgoing messages will use fallback POST.");
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [recipientId, token, currentUserId, privateKey]);

  const sendMessage = async () => {
    if (!input.trim() || !recipientKey) return;
    setSending(true);
    setError(null);

    try {
      const payload = await createEncryptedPayload(input.trim(), recipientKey);
      const localMessage = {
        id: `local-${Date.now()}`,
        sender: "me",
        text: input.trim(),
        time: formatTime(new Date().toISOString()),
        payload,
        pending: true,
      };

      setMessages((prev) => [...prev, localMessage]);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const event = {
          event: "message.send",
          to: recipientId,
          payload,
        };
        socketRef.current.send(JSON.stringify(event));
      } else {
        await api.post("/messages", {
          to: recipientId,
          payload,
        });
      }

      setInput("");
    } catch (err) {
      const message = err.response
        ? JSON.stringify(err.response.data)
        : err.request
          ? "No response from server."
          : err.message;
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-gray-50">
      <Header
        recipientName={recipientName || recipientId}
        active={wsConnected}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto py-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading chat history…</p>
        ) : error ? (
          <p className="text-center text-sm text-red-600 wrap-break-word">
            {error}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No conversation history yet.
          </p>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}

        {wsError && !error ? (
          <p className="mt-2 text-center text-sm text-yellow-600 wrap-break-word">
            {wsError}
          </p>
        ) : null}
      </div>

      <InputBar
        message={input}
        setMessage={setInput}
        onSend={sendMessage}
        disabled={sending || !recipientKey}
      />
    </div>
  );
};

export default ChatPage;
