import Layout from "@/components/Layout";
import { Bold, Italic, Heading1, Heading2, List, AlignLeft, AlignCenter, Image, Type, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

const toolbarButtons = [
  { icon: Bold, command: "bold", label: "Bold" },
  { icon: Italic, command: "italic", label: "Italic" },
  { icon: Heading1, command: "formatBlock", value: "h1", label: "H1" },
  { icon: Heading2, command: "formatBlock", value: "h2", label: "H2" },
  { icon: List, command: "insertUnorderedList", label: "List" },
  { icon: AlignLeft, command: "justifyLeft", label: "Left" },
  { icon: AlignCenter, command: "justifyCenter", label: "Center" },
];

const Write = () => {
  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">Write Your Story</h2>
          <Button size="sm" className="gap-2 gradient-primary border-0 text-primary-foreground font-body">
            <Save className="w-4 h-4" /> Save Draft
          </Button>
        </div>

        {/* Cover upload */}
        <button className="w-full aspect-[16/9] rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
          <Image className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-body">Add Cover Photo</span>
        </button>

        {/* Genre selector */}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-sm font-body text-secondary-foreground w-full">
          <Type className="w-4 h-4" />
          <span>Select Genre</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </button>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Your book title..."
          className="w-full text-2xl font-display font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/50"
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
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[50vh] p-4 rounded-xl bg-card border border-border font-body text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 prose prose-sm max-w-none"
          data-placeholder="Start writing your masterpiece..."
          suppressContentEditableWarning
        />
      </div>
    </Layout>
  );
};

export default Write;
