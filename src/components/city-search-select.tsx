"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, MapPin, Loader2 } from "lucide-react";

interface CityResult {
  city: string;
  state: string;
  label: string;
  population: number;
}

interface CitySearchSelectProps {
  value: string[];
  onChange: (cities: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function CitySearchSelect({
  value,
  onChange,
  placeholder = "Search cities...",
  className = "",
}: CitySearchSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const searchCities = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cities?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const filtered = (data.cities || []).filter(
        (c: CityResult) => !value.includes(c.label)
      );
      setResults(filtered);
      setOpen(filtered.length > 0);
      setHighlightIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(q), 300);
  }

  function selectCity(city: CityResult) {
    if (!value.includes(city.label)) {
      onChange([...value, city.label]);
    }
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeCity(label: string) {
    onChange(value.filter((c) => c !== label));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0 && results[highlightIndex]) {
      e.preventDefault();
      selectCity(results[highlightIndex]);
    } else if (e.key === "Backspace" && query === "" && value.length > 0) {
      removeCity(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input with tags */}
      <div
        className="flex flex-wrap items-center gap-1.5 bg-background border border-border rounded-lg px-3 py-2 min-h-[46px] cursor-text focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((city) => (
          <span
            key={city}
            className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 rounded-md px-2 py-0.5 text-sm"
          >
            <MapPin className="w-3 h-3" />
            {city}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeCity(city);
              }}
              className="ml-0.5 hover:text-accent-hover"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
            placeholder={value.length === 0 ? placeholder : "Add more..."}
            className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted text-sm py-1"
          />
          {loading && (
            <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-[240px] overflow-y-auto">
          {results.map((city, idx) => (
            <button
              key={city.label}
              type="button"
              onClick={() => selectCity(city)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                idx === highlightIndex
                  ? "bg-accent/10 text-accent"
                  : "text-foreground hover:bg-background"
              }`}
            >
              <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
              <div>
                <span className="font-medium">{city.city}</span>
                <span className="text-muted">, {city.state}</span>
                {city.population > 0 && (
                  <span className="text-muted text-xs ml-2">
                    (pop. {city.population.toLocaleString()})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg px-4 py-3 text-sm text-muted">
          No cities found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
