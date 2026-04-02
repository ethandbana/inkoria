import { motion } from "framer-motion";

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground/60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </div>
);

export default TypingIndicator;
