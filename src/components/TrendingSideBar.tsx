import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { userDataSelect } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";

export default function TrendingSideBar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
      {/** Need to delay render of component to give the appearance of syncing */}
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <RecommendedFollow />
      </Suspense>
    </div>
  );
}

// timestamp: 4:20:07

async function RecommendedFollow() {
  const { user } = await validateRequest();

  if (!user) return null;
  // artificial delay
  await new Promise((r) => setTimeout(r, 1000));

  // display only those who are not already being followed
  const recommendedFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
    },
    select: userDataSelect,
    take: 5,
  });

  return (
    <div className="bg-card space-y-5 rounded-2xl p-5 shadow-sm">
      <div className="text-xl font-bold">Follow Recommendations</div>
      {recommendedFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <Link
            href={`/users/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName}
              </p>
              <p className="text-muted-foreground line-clamp-1 break-all">
                @{user.username}
              </p>
            </div>
          </Link>
          <Button>Follow</Button>
        </div>
      ))}
    </div>
  );
}
