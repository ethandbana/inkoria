import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, MessageCircle, UserPlus, UserMinus, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [stats, setStats] = useState({ books: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (p) setProfile(p);

      const { data: b } = await supabase.from("books").select("*").eq("author_id", userId).eq("is_published", true);
      if (b) setBooks(b);

      const { count: followers } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId);
      const { count: following } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId);

      setStats({ books: b?.length || 0, followers: followers || 0, following: following || 0 });

      if (user) {
        const { data: f } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle();
        setIsFollowing(!!f);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user) { navigate("/auth"); return; }
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId!);
      setIsFollowing(false);
      setStats((s) => ({ ...s, followers: s.followers - 1 }));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: userId! });
      setIsFollowing(true);
      setStats((s) => ({ ...s, followers: s.followers + 1 }));
    }
  };

  const handleMessage = async () => {
    if (!user) { navigate("/auth"); return; }
    navigate(`/messages?chat=${userId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <BookOpen className="w-8 h-8 animate-pulse text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-muted-foreground font-body">User not found</p>
        </div>
      </Layout>
    );
  }

  const displayName = profile.display_name || profile.username || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const isOwnProfile = user?.id === userId;

  return (
    <Layout>
      <div className="py-4">
        <div className="px-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {profile.background_image_url && (
          <div className="h-32 -mt-4 mb-4 overflow-hidden">
            <img src={profile.background_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="px-4 flex items-start gap-5">
          <div className="w-20 h-20 rounded-full gradient-primary p-0.5 shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-2xl font-display font-bold gradient-text">{initial}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold">{displayName}</h2>
              {profile.is_online && <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />}
            </div>
            {profile.username && <p className="text-xs text-muted-foreground font-body">@{profile.username}</p>}
            <p className="text-sm text-muted-foreground font-body mt-1">{profile.bio || "No bio"}</p>
            {profile.favorite_genres?.length > 0 && (
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

        {!isOwnProfile && (
          <div className="px-4 mt-4 flex gap-2">
            <Button
              onClick={handleFollow}
              className={isFollowing ? "flex-1 font-body text-sm" : "flex-1 gradient-primary border-0 text-primary-foreground font-body text-sm"}
              variant={isFollowing ? "outline" : "default"}
            >
              {isFollowing ? <><UserMinus className="w-4 h-4 mr-1" /> Unfollow</> : <><UserPlus className="w-4 h-4 mr-1" /> Follow</>}
            </Button>
            <Button variant="outline" onClick={handleMessage} className="font-body text-sm">
              <MessageCircle className="w-4 h-4 mr-1" /> Message
            </Button>
          </div>
        )}

        <div className="mt-6">
          <h3 className="px-4 text-sm font-display font-semibold mb-3">Published Books</h3>
          <div className="grid grid-cols-2 gap-2 px-4">
            {books.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground font-body text-sm">No published books</div>
            ) : (
              books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => navigate(`/read/${book.id}`)}
                  className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary flex flex-col items-center justify-center p-4 hover:bg-secondary/80 transition-colors"
                >
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-xs font-body text-foreground font-semibold truncate w-full text-center">{book.title}</p>
                    </>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
