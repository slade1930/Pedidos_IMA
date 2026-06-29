"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Inline implementation of useOnClickOutside to eliminate external package requirements
function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

interface Tab {
  title: string;
  icon: LucideIcon;
  href: string; // Added href to match routing requirements
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  href?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  activeTabPath?: string; // Track path for active states
  className?: string;
  activeColor?: string;
  onChange?: (href: string | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.05, type: "spring" as const, bounce: 0, duration: 0.4 };

export function ExpandableTabs({
  tabs,
  activeTabPath,
  className,
  activeColor = "text-[#FBBF24]",
  onChange,
}: ExpandableTabsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement>(null);

  const Separator = () => (
    <div className="mx-1 h-[20px] w-[1px] bg-[#3A5F26]/20" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-[#3A5F26]/12 bg-[#F9FAF9]/90 backdrop-blur-md p-1 shadow-sm",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const isSelected = activeTabPath === tab.href || (tab.href !== "/shop" && activeTabPath?.startsWith(tab.href + "/"));
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isSelected || hovered === index}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange?.(tab.href)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-lg py-1.5 text-xs font-bold transition-all duration-300 cursor-pointer select-none",
              isSelected
                ? cn("bg-[#1E3A1E] text-white shadow-md")
                : "text-[#1E3A1E]/80 hover:bg-[#3A5F26]/10 hover:text-[#1E3A1E]"
            )}
          >
            <Icon size={16} className={cn("transition-colors", isSelected ? "text-[#FBBF24]" : "text-[#1E3A1E]")} />
            <AnimatePresence initial={false}>
              {(isSelected || hovered === index) && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap text-[11px] uppercase tracking-wider font-extrabold pr-0.5"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

export default ExpandableTabs;