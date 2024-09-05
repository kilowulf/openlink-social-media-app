import { Prisma } from "@prisma/client";

//  Define data schema for user data of those followed
export const userDataSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

// Define the shape of data to be included when querying posts, specifically fetching the related user data.
export const postDataInclude = {
  user: {
    select: userDataSelect,
  },
} satisfies Prisma.PostInclude; // Ensures that the structure satisfies the Prisma type 'PostInclude'.

// Define a TypeScript type 'PostData' which will represent the result of a Prisma query
// that includes the defined 'postDataInclude'. This type will reflect the post data along with the selected user data.
export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;
