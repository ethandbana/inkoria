import Layout from "@/components/Layout";
import { Bold, Italic, Heading1, Heading2, List, AlignLeft, AlignCenter, Image, Type, ChevronDown, Save, Plus, Trash2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Chapter {
  id?: string;
  title: string;
  content: string;
  chapter_order: number;
}

const toolbarButtons = [
  { icon: Bold, command: "bold", label: "Bold" },
  { icon: Italic, command: "italic", label: "Italic" },
  { icon: Heading1, command: "formatBlock", value: "h1", label: "H1" },
  { icon: Heading2, command: "formatBlock", value: "h2", label: "H2" },
  { icon: List, command: "insertUnorderedList", label: "List" },
  { icon: AlignLeft, command: "justifyLeft", label: "Left" },
  { icon: AlignCenter, command: "justifyCenter", label: "Center" },
];

const genres = ["Fantasy", "Romance", "Sci-Fi", "Mystery", "Horror", "Poetry", "Non-Fiction", "Young Adult", "Thriller", "Drama"];

const Write = () => {
  const { user } = useAuth();
  const [bookId, setBookId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [showGenres, setShowGenres] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([{ title: "Chapter 1", content: "", chapter_order: 0 }]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Autosave every 30 seconds
  useEffect(() => {
    if (!user || !bookId) return;
    const interval = setInterval(() => saveBook(), 30000);
    return () => clearInterval(interval);
  }, [user, bookId, title, chapters]);

  // Sync editor content with chapter state
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const updated = [...chapters];
      updated[activeChapter] = { ...updated[activeChapter], content: editorRef.current.innerHTML };
      setChapters(updated);
    }
  }, [activeChapter, chapters]);

  // Update editor when switching chapters
  useEffect(() => {
    if (editorRef.current && chapters[activeChapter]) {
      editorRef.current.innerHTML = chapters[activeChapter].content;
    }
  }, [activeChapter]);

  const saveBook = async () => {
    if (!user) { toast.error("Please sign in to save"); return; }
    setSaving(true);
    try {
      let currentBookId = bookId;
      if (!currentBookId) {
        const { data, error } = await supabase
          .from("books")
          .insert({ author_id: user.id, title: title || "Untitled", genre, is_draft: true })
          .select("id")
          .single();
        if (error) throw error;
        currentBookId = data.id;
        setBookId(currentBookId);
      } else {
        await supabase.from("books").update({ title, genre, updated_at: new Date().toISOString() }).eq("id", currentBookId);
      }

      // Save chapters
      for (const ch of chapters) {
        if (ch.id) {
          await supabase.from("chapters").update({ title: ch.title, content: ch.content, updated_at: new Date().toISOString() }).eq("id", ch.id);
        } else {
          const { data } = await supabase
            .from("chapters")
            .insert({ book_id: currentBookId, title: ch.title, content: ch.content, chapter_order: ch.chapter_order })
            .select("id")
            .single();
          if (data) ch.id = data.id;
        }
      }

      setLastSaved(new Date());
      toast.success("Saved!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      title: `Chapter ${chapters.length + 1}`,
      content: "",
      chapter_order: chapters.length,
    };
    setChapters([...chapters, newChapter]);
    setActiveChapter(chapters.length);
  };

  const removeChapter = (idx: number) => {
    if (chapters.length <= 1) return;
    const updated = chapters.filter((_, i) => i !== idx);
    setChapters(updated);
    setActiveChapter(Math.min(activeChapter, updated.length - 1));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    toast.info("Extracting text from PDF... This may take a moment.");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in first"); return; }

      // Upload to storage
      const filePath = `${user!.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, file);
      if (uploadError) throw uploadError;

      // Use edge function to extract text
      const { data, error } = await supabase.functions.invoke("extract-pdf-text", {
        body: { filePath },
      });
      if (error) throw error;

      if (data?.text) {
        const updated = [...chapters];
        updated[activeChapter] = {
          ...updated[activeChapter],
          content: updated[activeChapter].content + data.text,
        };
        setChapters(updated);
        if (editorRef.current) {
          editorRef.current.innerHTML = updated[activeChapter].content;
        }
        toast.success("PDF text extracted and added to editor!");
      }
    } catch (err: any) {
      toast.error("Failed to extract PDF: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">Write Your Story</h2>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-[10px] text-muted-foreground font-body">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              onClick={saveBook}
              disabled={saving}
              className="gap-1.5 gradient-primary border-0 text-primary-foreground font-body"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Cover upload */}
        <button className="w-full aspect-[16/9] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
          <Image className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-body">Add Cover Photo</span>
        </button>

        {/* Genre selector */}
        <div className="relative">
          <button
            onClick={() => setShowGenres(!showGenres)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-sm font-body text-secondary-foreground w-full"
          >
            <Type className="w-4 h-4" />
            <span>{genre || "Select Genre"}</span>
            <ChevronDown className="w-4 h-4 ml-auto" />
          </button>
          <AnimatePresence>
            {showGenres && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
              >
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGenre(g); setShowGenres(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm font-body hover:bg-secondary transition-colors",
                      genre === g && "text-primary font-semibold"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your book title..."
          className="w-full text-2xl font-display font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/50"
        />

        {/* Chapter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {chapters.map((ch, i) => (
            <button
              key={i}
              onClick={() => setActiveChapter(i)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body shrink-0 transition-colors",
                activeChapter === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {ch.title}
              {chapters.length > 1 && activeChapter === i && (
                <Trash2 className="w-3 h-3 ml-1 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeChapter(i); }} />
              )}
            </button>
          ))}
          <button onClick={addChapter} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chapter title edit */}
        <Input
          value={chapters[activeChapter]?.title || ""}
          onChange={(e) => {
            const updated = [...chapters];
            updated[activeChapter] = { ...updated[activeChapter], title: e.target.value };
            setChapters(updated);
          }}
          className="bg-secondary border-0 font-body text-sm"
          placeholder="Chapter title..."
        />

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 rounded-lg bg-secondary overflow-x-auto">
          {toolbarButtons.map(({ icon: Icon, command, value, label }) => (
            <button
              key={label}
              onClick={() => execCommand(command, value)}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Import PDF"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          className="min-h-[50vh] p-4 rounded-xl bg-card border border-border font-body text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 prose prose-sm max-w-none"
          data-placeholder="Start writing your masterpiece..."
          suppressContentEditableWarning
        />
      </div>
    </Layout>
  );
};

export default Write;
