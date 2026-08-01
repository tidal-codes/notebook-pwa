import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { getSearchIndexManager } from "./search-index-manager";
import type { NoteSearchResult } from "./types";

const DEBOUNCE_MS = 200;

export function useGlobalSearch() {
  // Guards against an OLDER, slow request overwriting a NEWER one's
  // results if responses arrive out of order.
  const latestRequestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [results, setResults] = useState<NoteSearchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const debouncedMatchCase = useDebounce(matchCase, DEBOUNCE_MS);


  useEffect(() => {
    getSearchIndexManager()
      .init()
      .catch(() => {
        // Initialization failed to start; the first real search call below
        // will surface the actual error to the user instead of failing silently.
      });
  }, []);

  const runSearch = useCallback(
    async (searchQuery: string, useMatchCase: boolean) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotalMatches(0);
        setIsLoading(false);
        return;
      }

      const requestId = ++latestRequestIdRef.current;
      setIsLoading(true);

      try {
        const searchIndexManager = getSearchIndexManager();
        const response = await searchIndexManager.search(
          searchQuery,
          useMatchCase,
        );


        // If a newer request has started since this one was sent, drop
        // this (now-stale) response.
        if (requestId !== latestRequestIdRef.current) return;

        setResults(response.results);
        setTotalMatches(response.totalMatches);
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    runSearch(debouncedQuery, debouncedMatchCase);
  }, [debouncedQuery, debouncedMatchCase, runSearch]);

  return {
    query,
    setQuery,
    matchCase,
    setMatchCase,
    results,
    totalMatches,
    isLoading,
  };
}
