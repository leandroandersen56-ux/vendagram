import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PLATFORM_COVERS } from "@/lib/mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getListingImage(category?: string | null, screenshots?: string[] | null) {
  const firstScreenshot = screenshots?.find((item) => typeof item === "string" && item.trim().length > 0);
  const fallbackCover = category ? PLATFORM_COVERS[category] : undefined;

  return firstScreenshot || fallbackCover || "/placeholder.svg";
}

export function handleListingImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string | null,
) {
  const fallbackCover = category ? PLATFORM_COVERS[category] : undefined;
  const target = event.currentTarget;
  const nextSrc = fallbackCover || "/placeholder.svg";

  if (target.src !== nextSrc) {
    target.src = nextSrc;
    return;
  }

  target.onerror = null;
}
