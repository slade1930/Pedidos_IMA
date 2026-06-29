"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-yellow-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-yellow-500",
  titleClassName = "text-yellow-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-auto min-h-[10rem] w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-[#3A5F26]/30 bg-[#2D1A10]/95 backdrop-blur-sm px-5 py-4 transition-all duration-700 hover:border-[#FBBF24]/60 hover:bg-[#2D1A10] [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-xl hover:-skew-y-0 hover:scale-105",
        className
      )}
    >
      <div>
        <span className={cn("relative inline-block rounded-full p-1.5 bg-[#3A5F26]/40 border border-[#FBBF24]/30 flex-shrink-0", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-lg font-black text-white", titleClassName)}>{title}</p>
      </div>
      <p className="text-sm font-semibold text-gray-100 leading-snug whitespace-normal break-words py-1.5">
        {description}
      </p>
      <p className="text-gray-400 text-xs font-bold">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#2D1A10]/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#2D1A10]/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 py-6">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}