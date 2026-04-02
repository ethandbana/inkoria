import { Heart, MessageCircle, Bookmark, Share2, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BookCardProps {
  bookId: string;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  excerpt: string;
  genre: string;
  authorId: string;
}

const BookCard = ({ bookId, title, author, authorAvatar, coverImage, excerpt, genre, authorId }: BookCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: likes } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("book_id", bookId);
      const { count: comments } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("book_id", bookId);
      setLikeCount(likes || 0);
      setCommentCount(comments || 0);

      if (user) {
        const { data: likeData } = await supabase.from("likes").select("id").eq("book_id", bookId).eq("user_id", user.id).maybeSingle();
        setLiked(!!likeData);
        const { data: bookmarkData } = await supabase.from("bookmarks").select("id").eq("book_id", bookId).eq("user_id", user.id).maybeSingle();
        setSaved(!!bookmarkData);
      }
    };
    fetchCounts();
  }, [bookId, user]);

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like"); return; }
    if (liked) {
      await supabase.from("likes").delete().eq("book_id", bookId).eq("user_id", user.id);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ book_id: bookId, user_id: user.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error("Sign in to bookmark"); return; }
    if (saved) {
      await supabase.from("bookmarks").delete().eq("book_id", bookId).eq("user_id", user.id);
      setSaved(false);
      toast.success("Bookmark removed");
    } else {
      await supabase.from("bookmarks").insert({ book_id: bookId, user_id: user.id });
      setSaved(true);
      toast.success("Bookmarked!");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title, url: `${window.location.origin}/read/${bookId}` });
    } catch {
      await navigator.clipboard.writeText(`${window.location.origin}/read/${bookId}`);
      toast.success("Link copied!");
    }
  };

  const initial = author?.charAt(0)?.toUpperCase() || "?";

  return (
    <motion.article
      className="feed-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      {/* Author header */}
      <button onClick={() => navigate(`/user/${authorId}`)} className="flex items-center gap-3 p-4 w-full text-left group">
        <div className="avatar-ring">
          {authorAvatar ? (
            <img src={authorAvatar} alt={author} className="w-9 h-9 rounded-full object-cover border-2 border-background" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center border-2 border-background">
              <span className="text-sm font-bold gradient-text">{initial}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold font-body truncate group-hover:text-primary transition-colors">{author}</p>
          <p className="text-xs text-muted-foreground font-body">{genre}</p>
        </div>
      </button>

      {/* Cover */}
      <button onClick={() => navigate(`/read/${bookId}`)} className="w-full group">
        {coverImage ? (
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-lg font-display font-bold text-primary-foreground leading-tight drop-shadow-md">{title}</h3>
            </div>
          </div>
        ) : (
          <div className="aspect-[4/3] bg-secondary/50 flex flex-col items-center justify-center gap-3 transition-colors group-hover:bg-secondary/70">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-display font-bold leading-tight px-4 text-center">{title}</h3>
          </div>
        )}
      </button>

      {/* Actions */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-5">
          <motion.button onClick={handleLike} className="flex items-center gap-1.5 group" whileTap={{ scale: 0.85 }}>
            <Heart className={cn("w-5 h-5 transition-all duration-200", liked ? "fill-accent text-accent scale-110" : "text-muted-foreground group-hover:text-accent")} />
            <span className="text-xs font-body text-muted-foreground">{likeCount}</span>
          </motion.button>
          <motion.button onClick={() => navigate(`/read/${bookId}`)} className="flex items-center gap-1.5 group" whileTap={{ scale: 0.9 }}>
            <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            <span className="text-xs font-body text-muted-foreground">{commentCount}</span>
          </motion.button>
          <motion.button onClick={handleShare} className="group" whileTap={{ scale: 0.9 }}>
            <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </motion.button>
        </div>
        <motion.button onClick={handleBookmark} whileTap={{ scale: 0.85 }}>
          <Bookmark className={cn("w-5 h-5 transition-all duration-200", saved ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary")} />
        </motion.button>
      </div>

      {excerpt && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground font-body line-clamp-2 leading-relaxed">{excerpt}</p>
        </div>
      )}
    </motion.article>
  );
};

export default BookCard;
