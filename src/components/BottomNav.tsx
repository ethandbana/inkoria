import { Home, Search, PenSquare, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: PenSquare, label: "Write", path: "/write" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border/30 h-[var(--bottom-nav-height)]">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isWrite = path === "/write";
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isWrite ? (
                <motion.div
                  className="gradient-primary rounded-2xl p-2.5 -mt-5 premium-shadow"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </motion.div>
              ) : (
                <motion.div whileTap={{ scale: 0.85 }} whileHover={{ y: -2 }}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                </motion.div>
              )}
              <span className={cn("text-[10px] font-body", isActive && "font-semibold")}>
                {label}
              </span>
              {isActive && !isWrite && (
                <motion.div
                  className="absolute -bottom-1 w-5 h-0.5 rounded-full gradient-primary"
                  layoutId="nav-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
