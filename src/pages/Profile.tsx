import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Settings, Grid3X3, BookOpen, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Grid3X3, label: "Published" },
  { icon: BookOpen, label: "Drafts" },
  { icon: Heart, label: "Liked" },
];

const myBooks = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop",
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout>
      <div className="py-6">
        {/* Profile header */}
        <div className="px-4 flex items-start gap-5">
          <div className="w-20 h-20 rounded-full gradient-primary p-0.5 shrink-0">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <span className="text-2xl font-display font-bold gradient-text">Y</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold">Your Name</h2>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-body mt-1">Aspiring author & storyteller ✨</p>
            <div className="flex gap-6 mt-3">
              {[["12", "Books"], ["2.4K", "Followers"], ["384", "Following"]].map(([num, label]) => (
                <div key={label} className="text-center">
                  <p className="text-sm font-bold font-body">{num}</p>
                  <p className="text-xs text-muted-foreground font-body">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit profile button */}
        <div className="px-4 mt-4">
          <Button variant="outline" className="w-full font-body text-sm">Edit Profile</Button>
        </div>

        {/* Tabs */}
        <div className="flex mt-6 border-b border-border">
          {tabs.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-body transition-colors border-b-2",
                activeTab === i ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Book grid */}
        <div className="grid grid-cols-2 gap-2 p-4">
          {myBooks.map((src, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden">
              <img src={src} alt="Book cover" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
