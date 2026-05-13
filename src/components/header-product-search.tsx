import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { APP_PATHS } from "@/constants/app-paths";
import { useSearchProducts } from "@/services";
import type { PublicProductWithVariants } from "@/services/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

const DEBOUNCE_MS = 1000;
const MIN_CHARS = 2;
const SUGGEST_LIMIT = 8;

function pickSuggestionImage(product: PublicProductWithVariants): string | null {
  const imgs = product.images ?? [];
  const primary = imgs.find((i) => i.is_primary);
  const img = primary ?? imgs[0];
  return img?.url?.trim() ? img.url : null;
}

export type HeaderProductSearchProps = {
  value: string;
  onChange: (next: string) => void;
  /** Called when the user submits the form (Enter) with a non-empty query. */
  onSubmitSearch: () => void;
  /** After navigating from a suggestion or “View all”. */
  onAfterNavigate?: () => void;
  formClassName?: string;
  inputClassName: string;
};

export function HeaderProductSearch({
  value,
  onChange,
  onSubmitSearch,
  onAfterNavigate,
  formClassName,
  inputClassName,
}: HeaderProductSearchProps) {
  const navigate = useNavigate();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const debounced = useDebouncedValue(value, DEBOUNCE_MS);
  const trimmed = value.trim();
  const debouncedTrimmed = debounced.trim();
  const canSuggest = trimmed.length >= MIN_CHARS;
  const searchQueryKey = debouncedTrimmed.length >= MIN_CHARS ? debouncedTrimmed : "";

  const { data, isFetching, isError } = useSearchProducts(searchQueryKey, {
    page: 1,
    limit: SUGGEST_LIMIT,
  });

  const showPanel = panelOpen && canSuggest;

  const isStaleWhileTyping =
    canSuggest && debouncedTrimmed !== trimmed && trimmed.length >= MIN_CHARS;

  useEffect(() => {
    if (!panelOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [panelOpen]);

  const goToProduct = (product: PublicProductWithVariants) => {
    navigate(APP_PATHS.productDetail(product.id));
    setPanelOpen(false);
    onAfterNavigate?.();
  };

  const goToAllResults = () => {
    navigate(
      `${APP_PATHS.products}?search=${encodeURIComponent(trimmed)}`,
    );
    setPanelOpen(false);
    onAfterNavigate?.();
  };

  const results = data?.data ?? [];
  const total = data?.count ?? 0;
  const hasMore = total > results.length;

  return (
    <form
      className={formClassName}
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed) {
          onSubmitSearch();
          setPanelOpen(false);
        }
      }}
    >
      <div ref={rootRef} className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-[18px] w-[18px] text-gray-400" />
        </div>
        <Input
          type="search"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          placeholder="Search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setPanelOpen(true)}
          className={inputClassName}
        />

        {showPanel ? (
          <div
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(22rem,calc(100vh-8rem))] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {isStaleWhileTyping || (isFetching && !data) ? (
              <div className="space-y-2 px-3 py-3">
                <p className="text-xs text-gray-500">Searching…</p>
                {[1, 2, 3].map((k) => (
                  <div key={k} className="flex gap-3">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
                    <div className="flex flex-1 flex-col gap-2 py-0.5">
                      <Skeleton className="h-3 w-[85%] max-w-[12rem]" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <p className="px-4 py-3 text-sm text-red-600">
                Something went wrong. Try again.
              </p>
            ) : results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-600">
                No products found for &ldquo;{debouncedTrimmed}&rdquo;.
              </p>
            ) : (
              <ul className="py-1">
                {results.map((product) => {
                  const thumb = pickSuggestionImage(product);
                  return (
                    <li key={product.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goToProduct(product)}
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[10px] text-gray-400">No img</span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-gray-900">
                            {product.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatPrice(product.base_price, { decimals: 0 })}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {canSuggest && !isStaleWhileTyping && !isFetching && results.length > 0 ? (
              <div className="border-t border-gray-100 px-2 py-2">
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={goToAllResults}
                >
                  View all {total} result{total === 1 ? "" : "s"}
                  {hasMore ? " →" : ""}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
