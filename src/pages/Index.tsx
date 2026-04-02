import Layout from "@/components/Layout";
import StoryBar from "@/components/StoryBar";
import BookCard from "@/components/BookCard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      const { data } = await supabase
        .from("books")
        .select("*, profiles:author_id(username, display_name, avatar_url)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setBooks(data);
      setLoading(false);
    };
    fetchFeed();
  }, []);

  return (
    <Layout>
      <StoryBar />
      <div className="px-4 space-y-4 pb-4">
        {!user && (
          <div className="glass-card p-6 text-center space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-primary" />
            <h3 className="font-display font-semibold text-lg">Welcome to Inkoria</h3>
            <p className="text-sm text-muted-foreground font-body">Where stories become worlds. Sign in to write, read, and connect with writers.</p>
            <Button onClick={() => navigate("/auth")} className="gradient-btn font-body">Get Started</Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><BookOpen className="w-8 h-8 animate-pulse text-primary" /></div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="font-display font-semibold text-lg">No stories yet</h3>
            <p className="text-sm text-muted-foreground font-body">Be the first to publish a story!</p>
            {user && <Button onClick={() => navigate("/write")} className="gradient-btn font-body">Start Writing</Button>}
          </div>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              bookId={book.id}
              title={book.title}
              author={(book.profiles as any)?.display_name || (book.profiles as any)?.username || "Unknown"}
              authorAvatar={(book.profiles as any)?.avatar_url || ""}
              coverImage={book.cover_image_url || ""}
              excerpt={book.description || ""}
              genre={book.genre || "General"}
              authorId={book.author_id}
            />
          ))
        )}
      </div>
    </Layout>
  );
};

export default Index;
