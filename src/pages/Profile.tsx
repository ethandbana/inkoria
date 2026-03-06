import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Settings, Grid3X3, BookOpen, Heart, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const tabs = [
  { icon: Grid3X3, label: "Published" },
  { icon: BookOpen, label: "Drafts" },
  { icon: Heart, label: "Liked" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [stats, setStats] = useState({ books: 0, followers: 0, following: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);

      const { data: booksData } = await supabase.from("books").select("*").eq("author_id", user.id);
      if (booksData) setBooks(booksData);

      const { count: followersCount } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id);
      const { count: followingCount } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id);

      setStats({
        books: booksData?.length || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
      });
    };
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground font-body">Sign in to view your profile</p>
          <Button onClick={() => navigate("/auth")} className="gradient-primary border-0 text-primary-foreground font-body">Sign In</Button>
        </div>
      </Layout>
    );
  }

  const displayName = profile?.display_name || profile?.username || user.email?.split("@")[0] || "Writer";
  const initial = displayName.charAt(0).toUpperCase();

  const publishedBooks = books.filter((b) => b.is_published);
  const draftBooks = books.filter((b) => b.is_draft);
  const currentBooks = activeTab === 0 ? publishedBooks : activeTab === 1 ? draftBooks : [];

  return (
    <Layout>
      <div className="py-6">
        <div className="px-4 flex items-start gap-5">
          <div className="w-20 h-20 rounded-full gradient-primary p-0.5 shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-2xl font-display font-bold gradient-text">{initial}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold">{displayName}</h2>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-body mt-1">{profile?.bio || "No bio yet"}</p>
            {profile?.favorite_genres?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.favorite_genres.map((g: string) => (
                  <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-body">{g}</span>
                ))}
              </div>
            )}
            <div className="flex gap-6 mt-3">
              {[[stats.books.toString(), "Books"], [stats.followers.toString(), "Followers"], [stats.following.toString(), "Following"]].map(([num, label]) => (
                <div key={label} className="text-center">
                  <p className="text-sm font-bold font-body">{num}</p>
                  <p className="text-xs text-muted-foreground font-body">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 mt-4 flex gap-2">
          <Button variant="outline" className="flex-1 font-body text-sm">Edit Profile</Button>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" onClick={async () => { await signOut(); navigate("/auth"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex mt-6 border-b border-border">
          {tabs.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-body transition-colors border-b-2",
                activeTab === i ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 p-4">
          {currentBooks.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground font-body text-sm">
              {activeTab === 0 ? "No published books yet" : "No drafts yet"}
            </div>
          ) : (
            currentBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => navigate(book.is_published ? `/read/${book.id}` : "/write")}
                className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary flex flex-col items-center justify-center p-4 hover:bg-secondary/80 transition-colors"
              >
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs font-body text-foreground font-semibold truncate w-full text-center">{book.title}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{book.genre || "No genre"}</p>
                  </>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
