import { Plus } from "lucide-react";

const stories = [
  { id: "add", name: "Your Story", image: null },
  { id: "1", name: "Maya", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: "2", name: "James", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: "3", name: "Luna", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { id: "4", name: "Noah", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  { id: "5", name: "Aria", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
];

const StoryBar = () => (
  <div className="flex gap-4 px-4 py-4 overflow-x-auto scrollbar-hide">
    {stories.map((story) => (
      <button key={story.id} className="flex flex-col items-center gap-1.5 shrink-0">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          story.id === "add" ? "border-2 border-dashed border-muted-foreground/40 bg-muted" : "p-0.5 gradient-primary"
        }`}>
          {story.id === "add" ? (
            <Plus className="w-5 h-5 text-muted-foreground" />
          ) : (
            <img src={story.image!} alt={story.name} className="w-full h-full rounded-full object-cover border-2 border-background" />
          )}
        </div>
        <span className="text-[11px] font-body text-muted-foreground truncate w-16 text-center">
          {story.name}
        </span>
      </button>
    ))}
  </div>
);

export default StoryBar;
