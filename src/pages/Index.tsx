import Layout from "@/components/Layout";
import StoryBar from "@/components/StoryBar";
import BookCard from "@/components/BookCard";

const mockBooks = [
  {
    title: "Whispers of the Forgotten",
    author: "Maya Chen",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop",
    excerpt: "In a world where memories could be traded like currency, Elara discovered she held the rarest one of all — the memory of a civilization that never existed...",
    genre: "Fantasy",
    likes: 2847,
    comments: 342,
  },
  {
    title: "Neon Horizons",
    author: "James Wright",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop",
    excerpt: "The last human city floated above the clouds, powered by dreams harvested from sleeping children. Detective Kira had three days to find who was stealing them...",
    genre: "Sci-Fi",
    likes: 1923,
    comments: 218,
  },
  {
    title: "Letters to Yesterday",
    author: "Luna Park",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&h=400&fit=crop",
    excerpt: "She found the letters hidden in the walls of her grandmother's house — love letters addressed to someone who wouldn't be born for another fifty years...",
    genre: "Romance",
    likes: 4102,
    comments: 567,
  },
];

const Index = () => (
  <Layout>
    <StoryBar />
    <div className="px-4 space-y-4 pb-4">
      {mockBooks.map((book, i) => (
        <BookCard key={i} {...book} />
      ))}
    </div>
  </Layout>
);

export default Index;
