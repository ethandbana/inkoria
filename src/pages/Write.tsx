import Layout from "@/components/Layout";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image, Type, ChevronDown, Save, Plus, Trash2, Upload, Send, BookOpen,
  Undo, Redo, Quote, Code, Link, Palette, Minus, ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Chapter {
  id?: string;
  title: string;
  content: string;
  chapter_order: number;
}

const allGenres = ["Fantasy", "Romance", "Sci-Fi", "Mystery", "Horror", "Poetry", "Non-Fiction", "Young Adult", "Thriller", "Drama", "History", "Biography", "Adventure", "Comedy", "Action"];

const popularTags = [
  "romance", "fantasy", "adventure", "drama", "love", "magic", "action",
  "mystery", "horror", "comedy", "youngadult", "scifi", "poetry", "wattpad",
  "booktok", "newwriter", "mustread", "bookworm", "writerslife", "amwriting"
];

type ToolbarTab = "home" | "insert" | "format" | "design";

const Write = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editBookId = searchParams.get("book");

  const [bookId, setBookId] = useState<string | null>(editBookId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showGenres, setShowGenres] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([{ title: "Chapter 1", content: "", chapter_order: 0 }]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeToolbar, setActiveToolbar] = useState<ToolbarTab>("home");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverDragging, setCoverDragging] = useState(false);
  const [editorBg, setEditorBg] = useState("#1a1a1a");
  const [editorFont, setEditorFont] = useState("serif");
  const [fontSize, setFontSize] = useState(16);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imageInsertRef = useRef<HTMLInputElement>(null);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const updated = [...chapters];
      updated[activeChapter] = { ...updated[activeChapter], content: editorRef.current.innerHTML };
      setChapters(updated);
    }
  }, [activeChapter, chapters]);

  useEffect(() => {
    if (!editBookId || !user) return;
    const loadBook = async () => {
      const { data: book } = await supabase.from("books").select("*").eq("id", editBookId).eq("author_id", user.id).single();
      if (!book) { toast.error("Book not found"); return; }
      setTitle(book.title);
      setDescription(book.description || "");
      setGenre(book.genre || "");
      setCoverUrl(book.cover_image_url);
      setBookId(book.id);
      setEditorBg(book.page_color || "#1a1a1a");
      setEditorFont(book.font_family || "serif");
      setTags((book as any).tags || []);

      const { data: chapterData } = await supabase.from("chapters").select("*").eq("book_id", editBookId).order("chapter_order");
      if (chapterData && chapterData.length > 0) {
        setChapters(chapterData.map((c) => ({ id: c.id, title: c.title, content: c.content || "", chapter_order: c.chapter_order })));
      }
    };
    loadBook();
  }, [editBookId, user]);

  useEffect(() => {
    if (editorRef.current && chapters[activeChapter]) {
      editorRef.current.innerHTML = chapters[activeChapter].content;
    }
  }, [activeChapter]);

  useEffect(() => {
    if (!user || !bookId) return;
    const interval = setInterval(() => saveBook(false), 30000);
    return () => clearInterval(interval);
  }, [user, bookId, title, chapters]);
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground font-body">Sign in to start writing</p>
          <Button onClick={() => navigate("/auth")} className="gradient-primary border-0 text-primary-foreground font-body">Sign In</Button>
        </div>
      </Layout>
    );
  }

  const saveBook = async (showToast = true) => {
    if (!user) return;
    setSaving(true);
    try {
      let currentBookId = bookId;
      if (!currentBookId) {
        const { data, error } = await supabase
          .from("books")
          .insert({ author_id: user.id, title: title || "Untitled", genre, description, is_draft: true, cover_image_url: coverUrl, tags, page_color: editorBg, font_family: editorFont })
          .select("id")
          .single();
        if (error) throw error;
        currentBookId = data.id;
        setBookId(currentBookId);
      } else {
        await supabase.from("books").update({ title, genre, description, cover_image_url: coverUrl, tags, page_color: editorBg, font_family: editorFont, updated_at: new Date().toISOString() }).eq("id", currentBookId);
      }

      for (const ch of chapters) {
        if (ch.id) {
          await supabase.from("chapters").update({ title: ch.title, content: ch.content, updated_at: new Date().toISOString() }).eq("id", ch.id);
        } else {
          const { data } = await supabase
            .from("chapters")
            .insert({ book_id: currentBookId!, title: ch.title, content: ch.content, chapter_order: ch.chapter_order })
            .select("id")
            .single();
          if (data) ch.id = data.id;
        }
      }

      setLastSaved(new Date());
      if (showToast) toast.success("Saved!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const publishBook = async () => {
    await saveBook(false);
    if (!bookId) { toast.error("Save your book first"); return; }
    const { error } = await supabase.from("books").update({ is_published: true, is_draft: false }).eq("id", bookId);
    if (error) { toast.error(error.message); return; }

    // Notify followers
    try {
      const { data: followers } = await supabase.from("follows").select("follower_id").eq("following_id", user.id);
      const { data: likers } = await supabase.from("likes").select("user_id").eq("book_id", bookId);
      const { data: commenters } = await supabase.from("comments").select("user_id").eq("book_id", bookId);

      const notifyIds = new Set<string>();
      followers?.forEach(f => notifyIds.add(f.follower_id));
      likers?.forEach(l => notifyIds.add(l.user_id));
      commenters?.forEach(c => notifyIds.add(c.user_id));
      notifyIds.delete(user.id);

      if (notifyIds.size > 0) {
        const notifications = Array.from(notifyIds).map(uid => ({
          user_id: uid,
          type: "book_published",
          title: "New book published!",
          body: `${title} is now live. Check it out!`,
          link: `/read/${bookId}`,
          from_user_id: user.id,
        }));
        await supabase.from("notifications").insert(notifications);
      }
    } catch (e) {
      console.error("Notification error:", e);
    }

    toast.success("Book published! 🎉");
    navigate("/profile");
  };

  const addChapter = () => {
    setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, content: "", chapter_order: chapters.length }]);
    setActiveChapter(chapters.length);
  };

  const removeChapter = (idx: number) => {
    if (chapters.length <= 1) return;
    const updated = chapters.filter((_, i) => i !== idx);
    setChapters(updated);
    setActiveChapter(Math.min(activeChapter, updated.length - 1));
  };

  const uploadFile = async (file: File, prefix: string) => {
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${prefix}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCoverUpload = async (file: File) => {
    try {
      const url = await uploadFile(file, "cover");
      setCoverUrl(url);
      toast.success("Cover uploaded!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
  };

  const onCoverDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setCoverDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleCoverUpload(file);
  };

  const handleImageInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "content");
      execCommand("insertHTML", `<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
      toast.success("Image inserted!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    toast.info("Extracting text from PDF...");
    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data, error } = await supabase.functions.invoke("extract-pdf-text", { body: { filePath } });
      if (error) throw error;
      if (data?.text) {
        const updated = [...chapters];
        updated[activeChapter] = { ...updated[activeChapter], content: updated[activeChapter].content + data.text };
        setChapters(updated);
        if (editorRef.current) editorRef.current.innerHTML = updated[activeChapter].content;
        toast.success("PDF text extracted!");
      }
    } catch (err: any) {
      toast.error("Failed to extract PDF: " + err.message);
    }
  };

  const addTag = (tag: string) => {
    const clean = tag.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 20) {
      setTags([...tags, clean]);
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const filteredSuggestions = popularTags.filter(t => t.includes(tagInput.toLowerCase()) && !tags.includes(t));

  const toolbarTabs: { key: ToolbarTab; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "insert", label: "Insert" },
    { key: "format", label: "Format" },
    { key: "design", label: "Design" },
  ];

  const editorBgOptions = [
    { label: "Dark", value: "#1a1a1a" },
    { label: "Cream", value: "#fdf6e3" },
    { label: "White", value: "#ffffff" },
    { label: "Sepia", value: "#f4ecd8" },
    { label: "Navy", value: "#1e293b" },
    { label: "Forest", value: "#1a2e1a" },
  ];

  const fontOptions = [
    { label: "Serif", value: "serif" },
    { label: "Sans-serif", value: "sans-serif" },
    { label: "Monospace", value: "monospace" },
    { label: "Cursive", value: "cursive" },
  ];

  return (
    <Layout>
      <div className="px-2 sm:px-4 py-4 space-y-3 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-display font-semibold">Write Your Story</h2>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-[10px] text-muted-foreground font-body hidden sm:inline">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => saveBook()} disabled={saving} className="gap-1.5 font-body text-xs sm:text-sm">
              <Save className="w-3.5 h-3.5" /> {saving ? "..." : "Save"}
            </Button>
            <Button size="sm" onClick={publishBook} className="gap-1.5 gradient-primary border-0 text-primary-foreground font-body text-xs sm:text-sm">
              <Send className="w-3.5 h-3.5" /> Publish
            </Button>
          </div>
        </div>

        {/* Cover Photo - Drag & Drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
          onDragLeave={() => setCoverDragging(false)}
          onDrop={onCoverDrop}
          onClick={() => coverInputRef.current?.click()}
          className={cn(
            "w-full aspect-[16/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden",
            coverDragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-border bg-secondary hover:border-primary/50",
          )}
        >
          {coverUrl ? (
            <div className="relative w-full h-full group">
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-sm font-body text-primary-foreground font-medium">Change Cover</span>
              </div>
            </div>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-body">Tap or drop a cover photo</span>
              <span className="text-[10px] text-muted-foreground/60 font-body">Recommended: 1600×900</span>
            </>
          )}
        </div>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={onCoverFileChange} />

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your book title..."
          className="w-full text-xl sm:text-2xl font-display font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/50"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a short description..."
          rows={2}
          className="w-full rounded-md bg-secondary border-0 font-body text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
        />

        {/* Genre */}
        <div className="relative">
          <button onClick={() => setShowGenres(!showGenres)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-sm font-body text-secondary-foreground w-full">
            <Type className="w-4 h-4" />
            <span>{genre || "Select Genre"}</span>
            <ChevronDown className="w-4 h-4 ml-auto" />
          </button>
          <AnimatePresence>
            {showGenres && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {allGenres.map((g) => (
                  <button key={g} onClick={() => { setGenre(g); setShowGenres(false); }} className={cn("w-full text-left px-4 py-2.5 text-sm font-body hover:bg-secondary transition-colors", genre === g && "text-primary font-semibold")}>
                    {g}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs font-body text-muted-foreground">Tags (Instagram, Wattpad, etc.)</label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-body">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive">×</button>
              </span>
            ))}
          </div>
          <div className="relative">
            <Input
              value={tagInput}
              onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
              onFocus={() => setShowTagSuggestions(true)}
              placeholder="Add tags (press Enter)..."
              className="bg-secondary border-0 font-body text-sm"
            />
            <AnimatePresence>
              {showTagSuggestions && tagInput && filteredSuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-32 overflow-y-auto">
                  {filteredSuggestions.slice(0, 8).map((s) => (
                    <button key={s} onClick={() => addTag(s)} className="w-full text-left px-4 py-2 text-sm font-body hover:bg-secondary transition-colors">
                      #{s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chapters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {chapters.map((ch, i) => (
            <button key={i} onClick={() => setActiveChapter(i)} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body shrink-0 transition-colors", activeChapter === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
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

        <Input
          value={chapters[activeChapter]?.title || ""}
          onChange={(e) => { const updated = [...chapters]; updated[activeChapter] = { ...updated[activeChapter], title: e.target.value }; setChapters(updated); }}
          className="bg-secondary border-0 font-body text-sm"
          placeholder="Chapter title..."
        />

        {/* Ribbon-style Toolbar */}
        <div className="rounded-xl bg-secondary border border-border overflow-hidden">
          {/* Toolbar Tabs */}
          <div className="flex border-b border-border">
            {toolbarTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveToolbar(key)}
                className={cn(
                  "px-3 sm:px-4 py-2 text-xs font-body font-medium transition-colors",
                  activeToolbar === key ? "bg-card text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Toolbar Content */}
          <div className="flex items-center gap-1 p-2 overflow-x-auto">
            {activeToolbar === "home" && (
              <>
                <ToolBtn icon={Undo} label="Undo" onClick={() => execCommand("undo")} />
                <ToolBtn icon={Redo} label="Redo" onClick={() => execCommand("redo")} />
                <ToolDivider />
                <ToolBtn icon={Bold} label="Bold" onClick={() => execCommand("bold")} />
                <ToolBtn icon={Italic} label="Italic" onClick={() => execCommand("italic")} />
                <ToolBtn icon={UnderlineIcon} label="Underline" onClick={() => execCommand("underline")} />
                <ToolBtn icon={Strikethrough} label="Strikethrough" onClick={() => execCommand("strikeThrough")} />
                <ToolDivider />
                <ToolBtn icon={Heading1} label="H1" onClick={() => execCommand("formatBlock", "h1")} />
                <ToolBtn icon={Heading2} label="H2" onClick={() => execCommand("formatBlock", "h2")} />
                <ToolBtn icon={Heading3} label="H3" onClick={() => execCommand("formatBlock", "h3")} />
                <ToolDivider />
                <ToolBtn icon={List} label="Bullets" onClick={() => execCommand("insertUnorderedList")} />
                <ToolBtn icon={ListOrdered} label="Numbered" onClick={() => execCommand("insertOrderedList")} />
              </>
            )}
            {activeToolbar === "format" && (
              <>
                <ToolBtn icon={AlignLeft} label="Left" onClick={() => execCommand("justifyLeft")} />
                <ToolBtn icon={AlignCenter} label="Center" onClick={() => execCommand("justifyCenter")} />
                <ToolBtn icon={AlignRight} label="Right" onClick={() => execCommand("justifyRight")} />
                <ToolBtn icon={AlignJustify} label="Justify" onClick={() => execCommand("justifyFull")} />
                <ToolDivider />
                <ToolBtn icon={Quote} label="Quote" onClick={() => execCommand("formatBlock", "blockquote")} />
                <ToolBtn icon={Code} label="Code" onClick={() => execCommand("formatBlock", "pre")} />
                <ToolBtn icon={Minus} label="Line" onClick={() => execCommand("insertHorizontalRule")} />
                <ToolDivider />
                <button onClick={() => execCommand("removeFormat")} className="px-2 py-1.5 rounded-md text-[10px] font-body text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  Clear Format
                </button>
              </>
            )}
            {activeToolbar === "insert" && (
              <>
                <ToolBtn icon={ImagePlus} label="Image" onClick={() => imageInsertRef.current?.click()} />
                <ToolBtn icon={Upload} label="PDF" onClick={() => fileInputRef.current?.click()} />
                <ToolBtn icon={Link} label="Link" onClick={() => {
                  const url = prompt("Enter URL:");
                  if (url) execCommand("createLink", url);
                }} />
                <ToolBtn icon={Minus} label="Divider" onClick={() => execCommand("insertHorizontalRule")} />
              </>
            )}
            {activeToolbar === "design" && (
              <div className="flex items-center gap-3 flex-wrap p-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-body text-muted-foreground">Background:</span>
                  {editorBgOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setEditorBg(opt.value)}
                      className={cn("w-6 h-6 rounded-full border-2 transition-all", editorBg === opt.value ? "border-primary scale-110" : "border-border")}
                      style={{ backgroundColor: opt.value }}
                      title={opt.label}
                    />
                  ))}
                </div>
                <ToolDivider />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-body text-muted-foreground">Font:</span>
                  {fontOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setEditorFont(opt.value)}
                      className={cn("px-2 py-1 rounded text-[10px] font-body transition-colors", editorFont === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}
                      style={{ fontFamily: opt.value }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <ToolDivider />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-body text-muted-foreground">Size:</span>
                  <button onClick={() => setFontSize(f => Math.max(12, f - 1))} className="w-6 h-6 rounded bg-muted text-muted-foreground hover:text-foreground text-xs">−</button>
                  <span className="text-xs font-body w-6 text-center">{fontSize}</span>
                  <button onClick={() => setFontSize(f => Math.min(28, f + 1))} className="w-6 h-6 rounded bg-muted text-muted-foreground hover:text-foreground text-xs">+</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <input ref={imageInsertRef} type="file" accept="image/*" className="hidden" onChange={handleImageInsert} />
        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          className="min-h-[50vh] p-4 sm:p-6 rounded-xl border border-border leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 prose prose-sm max-w-none"
          style={{
            backgroundColor: editorBg,
            fontFamily: editorFont,
            fontSize: `${fontSize}px`,
            color: ["#ffffff", "#fdf6e3", "#f4ecd8"].includes(editorBg) ? "#1a1a1a" : "#e5e5e5",
          }}
          data-placeholder="Start writing your masterpiece..."
          suppressContentEditableWarning
        />
      </div>
    </Layout>
  );
};

const ToolBtn = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0" title={label}>
    <Icon className="w-4 h-4" />
  </button>
);

const ToolDivider = () => <div className="w-px h-6 bg-border mx-0.5 shrink-0" />;

export default Write;
