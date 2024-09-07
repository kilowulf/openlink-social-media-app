"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "./actions";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";

/**Create Post Editor:
 * StarterKit: editor extensions
 * Client Component: use custom hooks to get session / user data
 */

//  time stamp: 3:52:06
export default function PostEditor() {
  // retrieve authenticated user
  const { user } = useSession();
  // use mutation for post submit
  const postSubmitMutation = useSubmitPostMutation();
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
  function onSubmit() {
    postSubmitMutation.mutate(input, {
      onSuccess: () => {
        editor?.commands.clearContent();
      },
    });
    //empty editor content after submission
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
        <LoadingButton
          onClick={onSubmit}
          loading={postSubmitMutation.isPending}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
