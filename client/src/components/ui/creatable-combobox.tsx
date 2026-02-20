import * as React from "react";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CreatableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  createLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function CreatableCombobox({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  createLabel = "Criar",
  className,
  disabled = false,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filtered = React.useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  // Check if the search term exactly matches an existing option
  const exactMatch = React.useMemo(() => {
    return options.some(
      (opt) => opt.toLowerCase() === search.trim().toLowerCase()
    );
  }, [options, search]);

  // Show "create" option when search has text and no exact match exists
  const showCreate = search.trim().length > 0 && !exactMatch;

  const handleSelect = (val: string) => {
    onChange(val);
    setSearch("");
    setOpen(false);
  };

  const handleCreate = () => {
    const trimmed = search.trim();
    if (trimmed) {
      onChange(trimmed);
      setSearch("");
      setOpen(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      // Focus the search input when the popover opens
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-zinc-800 border-zinc-700 text-sm font-normal hover:bg-zinc-750 hover:border-zinc-600",
            !value && "text-zinc-500",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900 border-zinc-700"
        align="start"
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (showCreate) {
                  handleCreate();
                } else if (filtered.length === 1) {
                  handleSelect(filtered[0]);
                }
              }
            }}
          />
        </div>

        {/* Options List */}
        <div className="max-h-48 overflow-y-auto p-1">
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
                  value === option
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-zinc-300 hover:bg-zinc-800"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    value === option ? "opacity-100 text-amber-400" : "opacity-0"
                  )}
                />
                <span className="truncate">{option}</span>
              </button>
            ))
          ) : !showCreate ? (
            <p className="text-xs text-zinc-500 text-center py-3">
              Nenhum resultado encontrado
            </p>
          ) : null}

          {/* Create New Option */}
          {showCreate && (
            <>
              {filtered.length > 0 && (
                <div className="h-px bg-zinc-800 my-1" />
              )}
              <button
                onClick={handleCreate}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left text-emerald-400 hover:bg-emerald-500/10"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>
                  {createLabel} "<span className="font-medium">{search.trim()}</span>"
                </span>
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
