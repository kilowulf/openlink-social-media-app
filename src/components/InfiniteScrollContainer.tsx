import { useInView } from "react-intersection-observer";

/**
 * InfiniteScrollContainer Component:
 * This component provides a container that triggers a callback function (`onBottomReached`)
 * when the user scrolls near the bottom of the container. It uses the Intersection Observer API
 * via the `useInView` hook from the `react-intersection-observer` library.
 *
 * Props:
 * - `onBottomReached`: A function that gets called when the bottom of the container is in view.
 * - `className`: Optional class names for custom styling.
 * - `children`: The content that will be rendered inside the scrollable container.
 */

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void; // Function to be called when the bottom is reached
  className?: string; // Optional CSS class for styling the container
}

export default function InfiniteScrollContainer({
  children, // Content to render inside the container
  onBottomReached, // Callback function for loading more content
  className, // Optional custom class names for styling
}: InfiniteScrollContainerProps) {
  // useInView Hook:
  // This hook from 'react-intersection-observer' detects when an element (ref) is visible in the viewport.
  // The 'ref' is assigned to a div element, and when that div comes into view, 'onBottomReached' is triggered.
  const { ref } = useInView({
    rootMargin: "200px", // Trigger the callback when the element is 200px from the bottom of the viewport
    onChange(inView) {
      // This callback is triggered when the visibility of the element changes
      if (inView) {
        // If the element is in view (visible within the defined margin)
        onBottomReached(); // Call the 'onBottomReached' function to load more content
      }
    },
  });

  return (
    <div className={className}>
      {/* The main container for the scrollable content */}
      {children} {/* Render the children (posts, data, etc.) */}
      <div ref={ref} />
      {/* This div is observed; when it comes into view, the callback is triggered */}
    </div>
  );
}
