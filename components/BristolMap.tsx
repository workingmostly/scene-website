"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import mapboxgl, { type StyleSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { VENUES, VENUE_BOUNDS, VENUE_CENTER, VENUE_DELAY, fitPadding, type Venue } from "@/lib/venues";
import VenueField, { PinBody, VenueCornerMark, VenuePinStyle } from "@/components/mock/VenueField";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";
const SURFACE = "#121214";

type Pin = { venue: Venue; el: HTMLDivElement };

export type BristolMapProps = {
  /**
   * Switches the venue pins on (once). The page passes this from an in-view
   * hook on the card; when omitted the pins light as soon as the map has loaded.
   */
  active?: boolean;
  /** Draw the venue pins and captions. Default true; false gives the bare map. */
  showPins?: boolean;
  /** Render the small "BRISTOL · 51.45° N · 2.59° W" print bottom-left (also exported as VenueCornerMark). */
  cornerMark?: boolean;
  /** Mapbox style to load. Defaults to dark-v11; an inline style object also works (read once, on mount). */
  mapStyle?: string | StyleSpecification;
  /** Mapbox access token. Defaults to NEXT_PUBLIC_MAPBOX_TOKEN (read once, on mount). */
  accessToken?: string;
};

/**
 * The dark map of Bristol behind the final CTA card, with the venues from the
 * mockups marked as small lights that switch on once the card is in view.
 * Fills its (relatively positioned) parent at z-index 0. Without a token, or
 * if the style fails to load, it renders the VenueField fallback instead, so
 * the page just mounts <BristolMap />.
 */
export default function BristolMap({
  active = true,
  showPins = true,
  cornerMark = true,
  mapStyle = DARK_STYLE,
  accessToken = TOKEN,
}: BristolMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const [lit, setLit] = useState(false);

  // Style/token are read when the map is created; changing them on a live map is not a use case.
  const styleRef = useRef(mapStyle);
  const tokenRef = useRef(accessToken);
  styleRef.current = mapStyle;
  tokenRef.current = accessToken;

  // Once on, stays on.
  useEffect(() => {
    if (active) setLit(true);
  }, [active]);

  const useMap = Boolean(accessToken) && !failed;

  useEffect(() => {
    const container = mapEl.current;
    if (!useMap || !container) return;

    const { clientWidth: w, clientHeight: h } = container;
    const measured = w > 0 && h > 0;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container,
        accessToken: tokenRef.current,
        style: styleRef.current,
        interactive: false,
        attributionControl: false,
        // The Mapbox wordmark defaults to bottom-left, where the corner mark sits.
        logoPosition: "bottom-right",
        fadeDuration: 0,
        // Frame every venue inside the card with fitPadding margins; fall back
        // to a fixed camera if the container has no size yet.
        ...(measured
          ? { bounds: VENUE_BOUNDS, fitBoundsOptions: { padding: fitPadding(w, h) } }
          : { center: [VENUE_CENTER.lng, VENUE_CENTER.lat] as [number, number], zoom: 13.2 }),
      });
    } catch {
      // No WebGL (or a bad option): show the venues without a map.
      setFailed(true);
      return;
    }

    const markers: mapboxgl.Marker[] = [];
    let isLoaded = false;

    // A failure before the style has loaded (bad token, offline) is fatal:
    // swap in the fallback. Later resource errors are harmless.
    map.on("error", () => {
      if (!isLoaded) setFailed(true);
    });

    // Keep the venues framed when the card changes size.
    const refit = () => {
      const { clientWidth: cw, clientHeight: ch } = container;
      if (cw > 0 && ch > 0) map.fitBounds(VENUE_BOUNDS, { padding: fitPadding(cw, ch), duration: 0 });
    };
    map.on("resize", refit);

    map.on("load", () => {
      isLoaded = true;

      // Quieten the style: land becomes the card colour, labels go.
      map.getStyle().layers.forEach((layer) => {
        if (layer.type === "symbol") {
          map.removeLayer(layer.id);
        } else if (layer.type === "background") {
          map.setPaintProperty(layer.id, "background-color", SURFACE);
        } else if (layer.type === "fill" && !layer.id.includes("water")) {
          map.setPaintProperty(layer.id, "fill-color", SURFACE);
        }
      });

      if (showPins) {
        // One Marker per venue with a custom element; React portals the dot
        // and caption into it (see VenueField for the shared markup/CSS).
        const next: Pin[] = VENUES.map((venue) => {
          const el = document.createElement("div");
          el.className = "vp";
          if (venue.label) el.setAttribute("data-label", "");
          el.style.setProperty("--d", `${VENUE_DELAY[venue.name]}ms`);
          markers.push(
            new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([venue.lng, venue.lat]).addTo(map)
          );
          return { venue, el };
        });
        setPins(next);
      }

      // Reveal the map only after the overrides are applied.
      setLoaded(true);
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
      setPins([]);
      setLoaded(false);
    };
  }, [useMap, showPins]);

  if (!useMap) {
    return <VenueField active={active} showPins={showPins} cornerMark={cornerMark} />;
  }

  return (
    <div
      aria-hidden="true"
      data-active={lit && loaded ? "" : undefined}
      style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}
    >
      <VenuePinStyle />
      <div
        ref={mapEl}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
      {pins.map((p) => createPortal(<PinBody name={p.venue.name} />, p.el, p.venue.name))}
      {cornerMark && <VenueCornerMark />}
    </div>
  );
}
