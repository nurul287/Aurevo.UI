import { Check, ChevronDown, Search } from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

export interface DropDownListOption {
  value: string;
  label: string;
}

interface DropDownListProps {
  options: DropDownListOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function DropDownList({
  options,
  value,
  onChange,
  placeholder = "Select option",
  searchPlaceholder = "Filter",
  emptyMessage = "No options found",
  disabled = false,
  className,
}: DropDownListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  // Find the selected option's label
  const selectedLabel = useMemo(() => {
    const selected = options.find((opt) => opt.value === value);
    return selected?.label || "";
  }, [options, value]);

  // Find index of selected value in filtered options
  const selectedIndexInFiltered = useMemo(() => {
    return filteredOptions.findIndex((opt) => opt.value === value);
  }, [filteredOptions, value]);

  // Set active item and scroll when dropdown opens
  useEffect(() => {
    if (isOpen) {
      // Set active index to selected item, or first item if nothing selected
      const activeIndex =
        selectedIndexInFiltered >= 0 ? selectedIndexInFiltered : 0;
      setHighlightedIndex(activeIndex);

      // Scroll to the active item after a short delay to ensure DOM is ready
      setTimeout(() => {
        const activeElement = optionRefs.current.get(activeIndex);
        if (activeElement && listRef.current) {
          activeElement.scrollIntoView({
            block: "nearest",
            behavior: "auto",
          });
        }
      }, 10);
    }
  }, [isOpen, selectedIndexInFiltered]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  const scrollHighlightedIntoView = useCallback((index: number) => {
    const element = optionRefs.current.get(index);
    if (element && listRef.current) {
      element.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const nextIndex =
              prev < filteredOptions.length - 1 ? prev + 1 : prev;
            scrollHighlightedIntoView(nextIndex);
            return nextIndex;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const nextIndex = prev > 0 ? prev - 1 : 0;
            scrollHighlightedIntoView(nextIndex);
            return nextIndex;
          });
          break;

        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;

        case "Tab":
          setIsOpen(false);
          break;

        case "Home":
          e.preventDefault();
          setHighlightedIndex(0);
          scrollHighlightedIntoView(0);
          break;

        case "End":
          e.preventDefault();
          const lastIndex = filteredOptions.length - 1;
          setHighlightedIndex(lastIndex);
          scrollHighlightedIntoView(lastIndex);
          break;
      }
    },
    [filteredOptions, highlightedIndex, scrollHighlightedIntoView]
  );

  // Handle trigger keyboard events
  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          setIsOpen(true);
          break;

        case "ArrowUp":
          e.preventDefault();
          setIsOpen(true);
          break;
      }
    },
    []
  );

  // Handle option selection
  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearch("");
    },
    [onChange]
  );

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  // Set ref for each option
  const setOptionRef = useCallback(
    (index: number, element: HTMLButtonElement | null) => {
      if (element) {
        optionRefs.current.set(index, element);
      } else {
        optionRefs.current.delete(index);
      }
    },
    []
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <span
          className={cn(
            "truncate",
            value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform flex-shrink-0 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
          role="listbox"
          aria-label={placeholder}
        >
          {/* Search input */}
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0); // Reset to first item when searching
                }}
                onKeyDown={handleKeyDown}
                aria-label={searchPlaceholder}
                aria-autocomplete="list"
                aria-controls="searchable-select-listbox"
                className="flex h-9 w-full rounded-md border border-gray-300 bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            id="searchable-select-listbox"
            className="max-h-[200px] overflow-auto p-1"
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === highlightedIndex;

                return (
                  <button
                    key={option.value}
                    ref={(el) => setOptionRef(index, el)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 pl-8 text-sm rounded-sm relative cursor-pointer",
                      "focus:outline-none",
                      // Active state (keyboard navigation) - blue tint
                      isActive && "bg-blue-50 ring-1 ring-blue-200",
                      // Selected state - bold text
                      isSelected && "font-medium",
                      // Hover state - light gray (only if not active)
                      !isActive && "hover:bg-gray-100"
                    )}
                  >
                    {isSelected && (
                      <Check className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
                    )}
                    {option.label}
                  </button>
                );
              })
            ) : (
              <div className="px-2 py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
