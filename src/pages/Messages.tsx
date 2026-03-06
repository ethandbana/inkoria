import Layout from "@/components/Layout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const conversations = [
  { id: "1", name: "Maya Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", lastMessage: "Loved the new chapter! The twist was amazing 🔥", time: "2m", unread: 3 },
  { id: "2", name: "James Wright", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", lastMessage: "Can we collab on the next arc?", time: "1h", unread: 0 },
  { id: "3", name: "Luna Park", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", lastMessage: "Thanks for the follow! Your writing is incredible", time: "3h", unread: 1 },
  { id: "4", name: "Noah Rivera", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", lastMessage: "Just published a new sci-fi short. Check it out!", time: "1d", unread: 0 },
];

const Messages = () => (
  <Layout>
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-xl font-display font-semibold">Messages</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search conversations..." className="pl-10 bg-secondary border-0 font-body" />
      </div>

      <div className="space-y-1">
        {conversations.map((c) => (
          <button key={c.id} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left">
            <div className="relative shrink-0">
              <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
              {c.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {c.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold font-body">{c.name}</span>
                <span className="text-xs text-muted-foreground font-body">{c.time}</span>
              </div>
              <p className="text-sm text-muted-foreground font-body truncate">{c.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  </Layout>
);

export default Messages;
