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
import type { GeoPlace, VibeCheckRequest } from "@/types/vedic";

interface Props {
  onSubmit: (data: VibeCheckRequest) => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
}

export function BirthDataForm({
  onSubmit,
  submitting,
  submitLabel = "read my chart",
}: Props) {
  const [dobIso, setDobIso] = useState("");
  const [tob, setTob] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<GeoPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeoPlace | null>(null);
  const [tz, setTz] = useState<number>(5.5);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (placeQuery.trim().length < 2) {
      setPlaceResults([]);
      return;
    }
    if (selectedPlace && selectedPlace.label === placeQuery) return;
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/places?q=${encodeURIComponent(placeQuery)}`);
        const j = (await r.json()) as { places: GeoPlace[] };
        setPlaceResults(j.places ?? []);
        setShowResults(true);
      } catch {
        setPlaceResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [placeQuery, selectedPlace]);

  function selectPlace(p: GeoPlace) {
    setSelectedPlace(p);
    setPlaceQuery(p.label);
    setShowResults(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!dobIso) return setFormError("birth date required");
    if (!tob) return setFormError("birth time required");
    if (!selectedPlace) return setFormError("pick a birth place from the list");

    const [yyyy, mm, dd] = dobIso.split("-");
    const dob = `${dd}/${mm}/${yyyy}`;

    void onSubmit({
      dob,
      tob,
      lat: selectedPlace.lat,
      lon: selectedPlace.lon,
      tz,
      place: selectedPlace.label,
    });
  }

  const fieldClasses =
    "h-11 w-full rounded-none border-x-0 border-t-0 border-b border-line-strong bg-transparent px-0 text-base text-paper transition-colors placeholder:text-paper-faint focus-visible:border-paper focus-visible:ring-0";

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-9">
      <Field label="Date of birth">
        <Input
          type="date"
          required
          value={dobIso}
          onChange={(e) => setDobIso(e.target.value)}
          disabled={submitting}
          className={fieldClasses}
        />
      </Field>

      <Field label="Time of birth" hint="best guess works.">
        <Input
          type="time"
          required
          value={tob}
          onChange={(e) => setTob(e.target.value)}
          disabled={submitting}
          className={fieldClasses}
        />
      </Field>

      <Field label="Birth place" className="relative">
        <Input
          type="text"
          autoComplete="off"
          required
          placeholder="city, country"
          value={placeQuery}
          onChange={(e) => {
            setPlaceQuery(e.target.value);
            if (selectedPlace) setSelectedPlace(null);
          }}
          onFocus={() => placeResults.length > 0 && setShowResults(true)}
          onBlur={() => window.setTimeout(() => setShowResults(false), 150)}
          disabled={submitting}
          className={fieldClasses}
        />
        {searching && (
          <span className="absolute right-0 top-9 text-xs text-paper-faint">searching...</span>
        )}
        {showResults && placeResults.length > 0 && (
          <ul
            role="listbox"
            className="
              absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto
              border border-line-strong bg-popover
            "
          >
            {placeResults.map((p, i) => (
              <li
                key={`${p.lat}-${p.lon}-${i}`}
                role="option"
                aria-selected={false}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectPlace(p);
                }}
                className="
                  cursor-pointer border-b border-line px-4 py-3 transition
                  last:border-b-0 hover:bg-secondary
                "
              >
                <div className="text-sm text-paper">{p.label}</div>
                <div className="mt-0.5 text-[11px] text-paper-faint">{p.display_name}</div>
              </li>
            ))}
          </ul>
        )}
      </Field>

      <Field label="Timezone">
        <Select
          value={String(tz)}
          onValueChange={(v) => setTz(parseFloat(v))}
          disabled={submitting}
        >
          <SelectTrigger
            className="h-11 w-full rounded-none border-x-0 border-t-0 border-b border-line-strong bg-transparent px-0 text-base text-paper transition-colors focus-visible:border-paper focus-visible:ring-0 [&>span]:truncate [&_svg]:size-4 [&_svg]:opacity-60"
          >
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
      </Field>

      {formError && (
        <p role="alert" className="-mt-3 text-sm text-destructive">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="
          mt-2 h-12 w-full bg-paper text-base font-medium tracking-tight text-ink
          transition hover:bg-paper/90 disabled:cursor-wait disabled:opacity-70
        "
      >
        {submitting ? "reading the chart..." : submitLabel}
      </button>

      <p className="text-center text-[11px] text-paper-faint">
        no signup. nothing stored. read once, forgotten.
      </p>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Label className="label-meta">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-paper-faint">{hint}</p>}
    </div>
  );
}
