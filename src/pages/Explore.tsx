import Layout from "@/components/Layout";
import { Search, BookOpen, Users, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const genres = ["Fantasy", "Romance", "Sci-Fi", "Mystery", "Horror", "Poetry", "Non-Fiction", "Young Adult", "Thriller", "Drama"];

const Explore = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"books" | "people">("books");
  const [books, setBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchOnlineUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tab === "books") searchBooks();
      else searchUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, tab, activeGenre]);

  const fetchOnlineUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_online", true)
      .limit(20);
    if (data) setOnlineUsers(data);
  };

  const searchBooks = async () => {
    let q = supabase.from("books").select("*, profiles:author_id(username, display_name, avatar_url)").eq("is_published", true);
    if (query) q = q.ilike("title", `%${query}%`);
    if (activeGenre) q = q.eq("genre", activeGenre);
    const { data } = await q.order("created_at", { ascending: false }).limit(30);
    if (data) setBooks(data);
  };

  const searchUsers = async () => {
    let q = supabase.from("profiles").select("*");
    if (query) q = q.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);
    const { data } = await q.order("is_online", { ascending: false }).limit(30);
    if (data) setUsers(data);
  };

  return (
    <Layout>
      <div className="px-4 py-4 space-y-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={tab === "books" ? "Search books, genres..." : "Search writers..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-secondary border-0 font-body"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {[{ key: "books", icon: BookOpen, label: "Books" }, { key: "people", icon: Users, label: "People" }].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-body transition-colors",
                tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Online Users Bar */}
        {onlineUsers.length > 0 && (
          <div>
            <h3 className="text-sm font-body font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" /> Online Now
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {onlineUsers.map((u) => (
                <button key={u.id} onClick={() => navigate(`/user/${u.id}`)} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {(u.display_name || u.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <span className="text-[10px] font-body text-muted-foreground truncate w-14 text-center">
                    {u.display_name || u.username || "User"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "books" && (
          <>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(activeGenre === g ? null : g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors",
                    activeGenre === g ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {books.map((book) => (
                <motion.button
                  key={book.id}
                  onClick={() => navigate(`/read/${book.id}`)}
                  className="text-left rounded-xl overflow-hidden bg-card border border-border"
                  whileHover={{ scale: 1.02 }}
                >
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} className="w-full aspect-[3/4] object-cover" />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-secondary flex flex-col items-center justify-center gap-2 p-3">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs font-display font-semibold text-center line-clamp-2">{book.title}</span>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-body font-semibold truncate">{book.title}</p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {(book.profiles as any)?.display_name || (book.profiles as any)?.username || "Unknown"}
                    </p>
                  </div>
                </motion.button>
              ))}
              {books.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground font-body text-sm">
                  {query || activeGenre ? "No books found" : "No published books yet"}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "people" && (
          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => navigate(`/user/${u.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
              >
                <div className="relative shrink-0">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {(u.display_name || u.username || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {u.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold font-body">{u.display_name || u.username || "User"}</p>
                  <p className="text-xs text-muted-foreground font-body truncate">{u.bio || "No bio"}</p>
                  {u.favorite_genres?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {u.favorite_genres.slice(0, 3).map((g: string) => (
                        <span key={g} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">{g}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-body">
                  {u.is_online ? "Online" : "Offline"}
                </span>
              </button>
            ))}
            {users.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-body text-sm">No users found</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;
