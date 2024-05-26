import React from "react";
import { cn } from "@/utils/cn";

const Badge = ({ className, ...props }: React.HtmlHTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center whitespace-nowrap leading-normal justify-center font-[500] rounded-[5px] border-[0.5px] bg-[rgba(29,31,36)] shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.05)] text-[rgba(227,228,230)] text-[0.875rem] py-1 px-2 border-[rgb(42,44,49)]",
        className,
      )}
    />
  );
};

export default Badge;
