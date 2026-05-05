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

  const isInitial = typeof src === "string" && src.length === 1;
  const initial = isInitial ? src.toUpperCase() : alt?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className={`relative shrink-0 ${sizeClasses[size]}`}>
      {isInitial ? (
        <div className="rounded-full bg-[#24786D] text-white font-semibold flex items-center justify-center w-full h-full">
          {initial}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="rounded-full object-cover w-full h-full"
        />
      )}
      {online && (
        <span
          className="absolute bottom-0.5 right-0.5 w-2.75 h-2.75 bg-[#25d366] border-2 border-white rounded-full"
          aria-label="Online"
        />
      )}
    </div>
  );
}
