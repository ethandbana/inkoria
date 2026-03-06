import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BookCardProps {
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  excerpt: string;
  genre: string;
  likes: number;
  comments: number;
}

const BookCard = ({ title, author, authorAvatar, coverImage, excerpt, genre, likes, comments }: BookCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      className="feed-card animate-fade-in"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Author header */}
      <div className="flex items-center gap-3 p-4">
        <img src={authorAvatar} alt={author} className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold font-body truncate">{author}</p>
          <p className="text-xs text-muted-foreground font-body">{genre}</p>
        </div>
      </div>

      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-display font-bold text-primary-foreground leading-tight">{title}</h3>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setLiked(!liked)} className="flex items-center gap-1.5 group">
            <Heart
              className={cn("w-5 h-5 transition-all", liked ? "fill-accent text-accent scale-110" : "text-muted-foreground group-hover:text-foreground")}
            />
            <span className="text-xs font-body text-muted-foreground">{likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-1.5 group">
            <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs font-body text-muted-foreground">{comments}</span>
          </button>
          <button className="group">
            <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
        <button onClick={() => setSaved(!saved)}>
          <Bookmark className={cn("w-5 h-5 transition-all", saved ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground")} />
        </button>
      </div>

      {/* Excerpt */}
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground font-body line-clamp-2">{excerpt}</p>
      </div>
    </motion.article>
  );
};

export default BookCard;
