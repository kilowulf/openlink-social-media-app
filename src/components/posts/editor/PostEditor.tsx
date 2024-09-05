"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "./actions";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import "./styles.css";

/**Create Post Editor:
 * StarterKit: editor extensions
 * Client Component: use custom hooks to get session / user data
 */

//  time stamp: 3:52:06
export default function PostEditor() {
  // retrieve authenticated user
  const { user } = useSession();
  // create editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false, // disable bold
        italic: false, // disable italic
      }),
      Placeholder.configure({
        placeholder: "Leave a post",
      }),
    ],
  });

  // managed state of editor contents
  const input =
    editor?.getText({
      blockSeparator: "\n", // add new line
    }) || "";

  // send off post input
  async function onSubmit() {
    await submitPost(input);
    //empty editor content after submission
    editor?.commands.clearContent();
  }

  return (
    <div className="bg-card flex flex-col gap-5 rounded-2xl p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          className="mt-4 hidden sm:inline"
        />
        <EditorContent
          editor={editor}
          className="bg-background max-h-[20rem] w-full overflow-y-auto rounded-2xl px-5 py-3"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
        </Button>
      </div>
    </div>
  );
}
