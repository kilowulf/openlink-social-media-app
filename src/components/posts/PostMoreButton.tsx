import { PostData } from "@/lib/types";
import { useState } from "react";
import DeletePostWarning from "./DeletePostWarning";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";

/**Post More Button:
 * encapsulates post delete button and functionality
 *
 */

interface PostMoreButtonProps {
  post: PostData;
  className?: string;
}

export default function PostMoreButton({
  post,
  className,
}: PostMoreButtonProps) {
  // state: display delete warning message
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="text-muted-foreground size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDeleteWarning(true)}>
            <span className="text-destructive flex items-center gap-3">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePostWarning
        post={post}
        open={showDeleteWarning}
        onClose={() => setShowDeleteWarning(false)}
      />
    </>
  );
}
