import { ReactNode } from "react";

export default function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <span className="relative group">
      {children}
      <span className="pointer-events-none absolute z-10 hidden group-hover:block bg-gray-700 text-white text-xs py-1 px-2 rounded -translate-x-1/2 left-1/2 bottom-full mb-1 whitespace-nowrap">
        {content}
      </span>
    </span>
  );
}
