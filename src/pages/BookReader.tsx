import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft, Settings2, Minus, Plus, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CHARS_PER_PAGE = 1200;

const pageThemes = {
  classic: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-stone-800 dark:text-amber-100" },
  sepia: { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-stone-700 dark:text-orange-100" },
  dark: { bg: "bg-stone-900", text: "text-stone-200" },
  paper: { bg: "bg-white dark:bg-stone-800", text: "text-stone-900 dark:text-stone-100" },
};

const BookReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<keyof typeof pageThemes>("classic");
  const [showSettings, setShowSettings] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!bookId) return;
    const fetchBook = async () => {
      const { data: bookData } = await supabase.from("books").select("*").eq("id", bookId).single();
      if (bookData) setBook(bookData);
      const { data: chapterData } = await supabase.from("chapters").select("*").eq("book_id", bookId).order("chapter_order");
      if (chapterData) setChapters(chapterData);
    };
    fetchBook();
  }, [bookId]);

  const fullText = chapters.map((c) => `\n\n— ${c.title} —\n\n${c.content}`).join("");
  const pages: string[] = [];
  for (let i = 0; i < fullText.length; i += CHARS_PER_PAGE) {
    pages.push(fullText.slice(i, i + CHARS_PER_PAGE));
  }
  const totalPages = Math.max(pages.length, 1);

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) { setDirection(1); setCurrentPage((p) => p + 1); }
  }, [currentPage, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) { setDirection(-1); setCurrentPage((p) => p - 1); }
  }, [currentPage]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <BookOpen className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  const t = pageThemes[theme];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-display font-semibold truncate max-w-[60%]">{book.title}</h2>
        <button onClick={() => setShowSettings(!showSettings)} className="text-muted-foreground hover:text-foreground">
          <Settings2 className="w-5 h-5" />
        </button>
      </header>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-card overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-body text-muted-foreground">Font Size</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFontSize((s) => Math.max(12, s - 2))} className="p-1 rounded bg-secondary"><Minus className="w-4 h-4" /></button>
                  <span className="text-sm font-body w-8 text-center">{fontSize}</span>
                  <button onClick={() => setFontSize((s) => Math.min(28, s + 2))} className="p-1 rounded bg-secondary"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-body text-muted-foreground">Page Theme</span>
                <div className="flex gap-2">
                  {(Object.keys(pageThemes) as (keyof typeof pageThemes)[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setTheme(k)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        pageThemes[k].bg,
                        theme === k ? "border-primary scale-110" : "border-border"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={cn("w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative", t.bg)} style={{ minHeight: "70vh" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              initial={{ rotateY: direction > 0 ? 90 : -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: direction > 0 ? -90 : 90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="p-8"
              style={{ perspective: 1000 }}
            >
              <p className={cn("font-body leading-relaxed whitespace-pre-wrap", t.text)} style={{ fontSize }}>
                {pages[currentPage] || "No content yet."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Page number */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-xs text-muted-foreground font-body">{currentPage + 1} / {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/80 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentPage === 0}>
          <ChevronLeft className="w-5 h-5" /> Prev
        </Button>
        <Button variant="ghost" size="sm" onClick={goNext} disabled={currentPage >= totalPages - 1}>
          Next <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default BookReader;
