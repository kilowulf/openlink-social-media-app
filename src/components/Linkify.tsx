import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import UserLinkWithTooltip from "./UserLinkWithTooltip";

/**
 * LinkifyProps interface:
 * Defines the prop types for the components, specifying that the `children` prop
 * must be a React node (can be text or JSX elements).
 */
interface LinkifyProps {
  children: React.ReactNode;
}

/**
 * Linkify Component:
 * This component wraps around content and applies multiple "linkifying" transformations:
 * 1. Turns usernames (@username) into links with tooltips.
 * 2. Converts hashtags (#hashtag) into clickable links that navigate to a hashtag page.
 * 3. Converts URLs into clickable links.
 *
 * This allows text content (like social media posts or comments) to automatically
 * turn certain patterns (usernames, hashtags, URLs) into links.
 */
export default function Linkify({ children }: LinkifyProps) {
  return (
    <LinkifyUsername>
      {" "}
      {/* Wraps content with logic to detect and linkify usernames */}
      <LinkifyHashtag>
        {" "}
        {/* Wraps content with logic to detect and linkify hashtags */}
        <LinkifyUrl>
          {" "}
          {/* Wraps content with logic to detect and linkify URLs */}
          {children}
        </LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
}

/**
 * LinkifyUrl Component:
 * This component automatically converts URLs into clickable links.
 * The `LinkItUrl` component from 'react-linkify-it' is used to detect URLs
 * and convert them into links with the specified class for styling.
 */
function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

/**
 * LinkifyUsername Component:
 * This component detects usernames in the format @username using a regular expression.
 * The detected usernames are wrapped in the `UserLinkWithTooltip` component, which
 * likely shows additional user info on hover (like a tooltip).
 */
function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/} // Regular expression to detect usernames in the format @username
      component={(match, key) => (
        <UserLinkWithTooltip key={key} username={match.slice(1)}>
          {" "}
          {/* Removing "@" from the matched username */}
          {match} {/* Render the @username text */}
        </UserLinkWithTooltip>
      )}
    >
      {children}
    </LinkIt>
  );
}

/**
 * LinkifyHashtag Component:
 * This component detects hashtags in the format #hashtag using a regular expression.
 * The detected hashtags are converted into clickable links that navigate to a page
 * dedicated to that specific hashtag (e.g., /hashtag/hashtagName).
 */
function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/} // Regular expression to detect hashtags in the format #hashtag
      component={(match, key) => (
        <Link
          key={key}
          href={`/hashtag/${match.slice(1)}`} // Navigates to a dynamic hashtag page, stripping off the # symbol
          className="text-primary hover:underline"
        >
          {match} {/* Display the matched hashtag */}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
