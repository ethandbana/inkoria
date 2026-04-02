import { useState, useEffect } from "react";
import { X, Search, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewConversationModalProps {
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}

const NewConversationModal = ({ currentUserId, onSelectUser, onClose }: NewConversationModalProps) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, is_online")
      .neq("id", currentUserId)
      .order("display_name", { ascending: true });
    setUsers(data || []);
    setLoading(false);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.display_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.bio || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold font-display">New Conversation</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border-0 rounded-full text-sm text-foreground placeholder:text-muted-foreground outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {search ? `No users found for "${search}"` : "No users on the platform yet"}
            </div>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/80 transition-colors text-left"
              >
                <div className="relative">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {(user.display_name || user.username || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.display_name || user.username || "User"}</p>
                  {user.username && <p className="text-xs text-muted-foreground truncate">@{user.username}</p>}
                  {user.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>}
                </div>
                <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
