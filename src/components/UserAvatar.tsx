import Image from "next/image";
import avatarImgPlaceholder from "@/assets/user_avatar_image_placeholder.jpg";
import { cn } from "@/lib/utils";

// user avatar interface
interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

// reusable avatar component
export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || avatarImgPlaceholder}
      alt="User Avatar Image"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "bg-secondary aspect-square h-fit flex-none rounded-full object-cover",
        className,
      )}
    />
  );
}
