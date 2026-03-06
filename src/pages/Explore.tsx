import Layout from "@/components/Layout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const genres = ["Fantasy", "Romance", "Sci-Fi", "Mystery", "Horror", "Poetry", "Non-Fiction", "Young Adult"];

const trendingCovers = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=400&fit=crop",
];

const Explore = () => (
  <Layout>
    <div className="px-4 py-4 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search books, authors, genres..." className="pl-10 bg-secondary border-0 font-body" />
      </div>

      {/* Genres */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-3">Browse Genres</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button key={g} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-body font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-3">Trending Now</h2>
        <div className="grid grid-cols-3 gap-2">
          {trendingCovers.map((src, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden">
              <img src={src} alt="Trending book" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default Explore;
