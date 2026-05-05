import React from "react";

/**
 * Avatar — reusable circular avatar with optional online dot.
 * Props:
 *  src      — image URL
 *  alt      — alt text
 *  online   — boolean, show green dot
 *  size     — "sm" | "md" | "lg"  (default "md")
 */
export default function Avatar({
  src,
  alt = "avatar",
  online = false,
  size = "md",
}) {
  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-[50px] h-[50px]",
    lg: "w-16 h-16",
  };

  return (
    <div className={`relative shrink-0 ${sizeClasses[size]}`}>
      <img
        src={src}
        alt={alt}
        className="rounded-full object-cover w-full h-full"
      />
      {online && (
        <span
          className="absolute bottom-0.5 right-0.5 w-[11px] h-[11px] bg-[#25d366] border-2 border-white rounded-full"
          aria-label="Online"
        />
      )}
    </div>
  );
}
