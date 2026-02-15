import { motion } from "framer-motion";

interface PremiumLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const PremiumLoader = ({ size = "md", text }: PremiumLoaderProps) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-primary/20`}
          style={{ borderTopColor: "hsl(var(--primary))" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulsing dot */}
        <motion.div
          className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-primary"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Glow effect */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full`}
          style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {text && (
        <motion.p
          className="text-sm text-muted-foreground font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default PremiumLoader;
