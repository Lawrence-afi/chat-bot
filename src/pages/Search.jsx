import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Avatar = ({ src }) => (
  <div className="relative">
    <img
      src={src || "https://ui-avatars.com/api/?name=U"}
      alt="avatar"
      className="w-12 h-12 rounded-full object-cover"
    />
    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
  </div>
);

const ListItem = ({ avatar, title, subtitle, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded-xl"
  >
    <Avatar src={avatar} />
    <div>
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  </button>
);

const SearchPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.access_token);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(async () => {
      if (!token) {
        setError("You must be signed in to search users.");
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/users/search", {
          params: {
            q: query,
          },
        });

        setResults(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        const message = err.response
          ? JSON.stringify(err.response.data)
          : err.request
            ? "No response from server."
            : err.message;

        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, token]);

  return (
    <div className="min-h-screen bg-[#F3F6F6] flex justify-center items-start p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users"
            className="bg-transparent outline-none flex-1 px-2 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Users</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Searching users…</p>
          ) : error ? (
            <p className="text-sm text-red-600 wrap-break-word">{error}</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-gray-500">
              {query.trim()
                ? "No users found."
                : "Type a name to search users."}
            </p>
          ) : (
            results.map((user) => (
              <ListItem
                key={user.id}
                avatar={
                  user.display_name
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}`
                    : "https://ui-avatars.com/api/?name=U"
                }
                title={user.display_name || user.username}
                subtitle={user.username}
                onClick={() => navigate(`/conversation/${user.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
