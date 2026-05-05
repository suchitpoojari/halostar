"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONE_OPTIONS } from "@/lib/geo";
import type { GeoPlace, MatchRequest, VibeCheckRequest } from "@/types/vedic";

interface Props {
  onSubmit: (data: MatchRequest) => void | Promise<void>;
  submitting?: boolean;
}

const fieldClasses =
  "h-11 w-full rounded-none border-x-0 border-t-0 border-b border-line-strong bg-transparent px-0 text-base text-paper transition-colors placeholder:text-paper-faint focus-visible:border-paper focus-visible:ring-0";

export function MatchForm({ onSubmit, submitting }: Props) {
  const [boy, setBoy] = useState<PartialBirth>({ dobIso: "", tob: "", placeQuery: "", selectedPlace: null, tz: 5.5 });
  const [girl, setGirl] = useState<PartialBirth>({ dobIso: "", tob: "", placeQuery: "", selectedPlace: null, tz: 5.5 });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const b = parseBirth(boy, "person 1");
    if (typeof b === "string") return setError(b);
    const g = parseBirth(girl, "person 2");
    if (typeof g === "string") return setError(g);
    void onSubmit({ boy: b, girl: g });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-12">
      <PersonBlock label="person 1" data={boy} setData={setBoy} disabled={submitting} />
      <hr className="border-line" />
      <PersonBlock label="person 2" data={girl} setData={setGirl} disabled={submitting} />

      {error && (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full bg-paper text-base font-medium tracking-tight text-ink transition hover:bg-paper/90 disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? "reading both charts..." : "check the match"}
      </button>

      <p className="text-center text-[11px] text-paper-faint">
        we never store anyone&rsquo;s birth data. read once, forgotten.
      </p>
    </form>
  );
}

interface PartialBirth {
  dobIso: string;
  tob: string;
  placeQuery: string;
  selectedPlace: GeoPlace | null;
  tz: number;
}

function parseBirth(p: PartialBirth, who: string): VibeCheckRequest | string {
  if (!p.dobIso) return `${who}: birth date required`;
  if (!p.tob) return `${who}: birth time required`;
  if (!p.selectedPlace) return `${who}: pick a birth place from the list`;
  const [yyyy, mm, dd] = p.dobIso.split("-");
  return {
    dob: `${dd}/${mm}/${yyyy}`,
    tob: p.tob,
    lat: p.selectedPlace.lat,
    lon: p.selectedPlace.lon,
    tz: p.tz,
    place: p.selectedPlace.label,
  };
}

function PersonBlock({
  label,
  data,
  setData,
  disabled,
}: {
  label: string;
  data: PartialBirth;
  setData: (next: PartialBirth) => void;
  disabled?: boolean;
}) {
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (data.placeQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    if (data.selectedPlace && data.selectedPlace.label === data.placeQuery) return;
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/places?q=${encodeURIComponent(data.placeQuery)}`);
        const j = (await r.json()) as { places: GeoPlace[] };
        setResults(j.places ?? []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [data.placeQuery, data.selectedPlace]);

  return (
    <fieldset className="flex flex-col gap-7">
      <legend className="label-meta mb-2">{label}</legend>

      <div className="flex flex-col gap-2">
        <Label className="label-meta">Date of birth</Label>
        <Input
          type="date"
          value={data.dobIso}
          onChange={(e) => setData({ ...data, dobIso: e.target.value })}
          disabled={disabled}
          required
          className={fieldClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="label-meta">Time of birth</Label>
        <Input
          type="time"
          value={data.tob}
          onChange={(e) => setData({ ...data, tob: e.target.value })}
          disabled={disabled}
          required
          className={fieldClasses}
        />
      </div>

      <div className="relative flex flex-col gap-2">
        <Label className="label-meta">Birth place</Label>
        <Input
          type="text"
          autoComplete="off"
          placeholder="city, country"
          value={data.placeQuery}
          onChange={(e) => setData({ ...data, placeQuery: e.target.value, selectedPlace: data.selectedPlace?.label === e.target.value ? data.selectedPlace : null })}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => window.setTimeout(() => setShowResults(false), 150)}
          disabled={disabled}
          required
          className={fieldClasses}
        />
        {searching && <span className="absolute right-0 top-9 text-xs text-paper-faint">searching...</span>}
        {showResults && results.length > 0 && (
          <ul role="listbox" className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto border border-line-strong bg-popover">
            {results.map((p, i) => (
              <li
                key={`${p.lat}-${p.lon}-${i}`}
                role="option"
                aria-selected={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setData({ ...data, placeQuery: p.label, selectedPlace: p });
                  setShowResults(false);
                }}
                className="cursor-pointer border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-secondary"
              >
                <div className="text-sm text-paper">{p.label}</div>
                <div className="mt-0.5 text-[11px] text-paper-faint">{p.display_name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="label-meta">Timezone</Label>
        <Select value={String(data.tz)} onValueChange={(v) => setData({ ...data, tz: parseFloat(v) })} disabled={disabled}>
          <SelectTrigger className="h-11 w-full rounded-none border-x-0 border-t-0 border-b border-line-strong bg-transparent px-0 text-base text-paper transition-colors focus-visible:border-paper focus-visible:ring-0 [&>span]:truncate [&_svg]:size-4 [&_svg]:opacity-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-line-strong bg-popover">
            {TIMEZONE_OPTIONS.map((o) => (
              <SelectItem key={o.label} value={String(o.value)} className="text-sm">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </fieldset>
  );
}
