import PostEditor from "@/components/posts/editor/PostEditor";
import Post from "@/components/posts/Post";
import TrendingSideBar from "@/components/TrendingSideBar";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";
import { getDisplayName } from "next/dist/shared/lib/utils";
import Image from "next/image";

export default async function Home() {
  // fetch posts
  const posts = await prisma.post.findMany({
    include: postDataInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      <TrendingSideBar />
    </main>
  );
}
