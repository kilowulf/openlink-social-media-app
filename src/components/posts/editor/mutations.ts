import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";
import { PostsPage } from "@/lib/types";

/**SubmitPostMutation:
 * allows for instantaneous post submission and display
 *
 */

export function useSubmitPostMutation() {
  const { toast } = useToast();

  // react query hook
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // pass as a reference
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      // retrieve post cache
      const queryFilter: QueryFilters = { queryKey: ["post-feed", "for-you"] };
      // cancel any pending queries
      await queryClient.cancelQueries(queryFilter);
      // mutate posts in cache
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        // oldData -> posts array
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: `${error.message}`,
        description: "Failed to post. Please try again.",
      });
    },
  });
  return mutation;
}
