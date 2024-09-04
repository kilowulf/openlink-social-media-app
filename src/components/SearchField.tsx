"use client";

import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

// SearchField component

export default function SearchField() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // retrieve value from Input element
    const form = e.currentTarget;
    const query = (form.query as HTMLInputElement).value.trim();
    // if no input value provided, exit out of function
    if (!query) return;
    // if value present direct navigation to search result
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    // Progressive Enhancements: ensure routing works whether javascript is enabled or not
    // we add method and action for Progressive enhancements
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="relative">
        <Input name="query" placeholder="Search" className="pe-10" />
        <SearchIcon className="text-muted-foreground absolute right-3 top-1/2 size-5 -translate-y-1/2 transform" />
      </div>
    </form>
  );
}
