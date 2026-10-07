"use client";
import { mapConfig } from "@/config/maps";

import { useEffect, useMemo, useState } from "react";

import type { Marker as LeafletMarker } from "leaflet";

import { useMap, useMapEvents } from "react-leaflet";

import { LocateFixed, MapPin } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Map,
  MapMarker,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";

interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

interface DeliveryLocationPickerProps {
  latitude: number | null;
  longitude: number | null;

  onChange: (location: DeliveryLocation) => void;

  error?: string;
}

/*
 * مرکز پیش‌فرض نقشه
 * تهران
 */
const DEFAULT_CENTER: [number, number] = [35.6892, 51.389];

function MapClickHandler({
  onChange,
}: {
  onChange: (location: DeliveryLocation) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,

        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapCenterController({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return;
    }

    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 16), {
      animate: true,
      duration: 0.6,
    });
  }, [latitude, longitude, map]);

  return null;
}

export function DeliveryLocationPicker({
  latitude,
  longitude,
  onChange,
  error,
}: DeliveryLocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);

  const selectedPosition = useMemo<[number, number] | null>(() => {
    if (latitude === null || longitude === null) {
      return null;
    }

    return [latitude, longitude];
  }, [latitude, longitude]);

  const mapCenter = selectedPosition ?? DEFAULT_CENTER;

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("مرورگر شما امکان دریافت موقعیت مکانی را پشتیبانی نمی‌کند.");

      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,

          longitude: position.coords.longitude,
        };

        onChange(nextLocation);

        setIsLocating(false);

        toast.success("موقعیت فعلی شما روی نقشه ثبت شد.");
      },

      (error) => {
        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          toast.error("دسترسی به موقعیت مکانی داده نشد.", {
            description:
              "می‌توانید موقعیت تحویل را به‌صورت دستی روی نقشه انتخاب کنید.",
          });

          return;
        }

        toast.error("امکان دریافت موقعیت فعلی وجود ندارد.", {
          description: "موقعیت را به‌صورت دستی روی نقشه انتخاب کنید.",
        });
      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 30000,
      },
    );
  };

  const handleMarkerDragEnd = (event: { target: LeafletMarker }) => {
    const position = event.target.getLatLng();

    onChange({
      latitude: position.lat,

      longitude: position.lng,
    });
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <label className="block text-sm font-medium">
          موقعیت تحویل روی نقشه (اختیاری)
        </label>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLocating}
          onClick={handleCurrentLocation}
          className="rounded-md"
        >
          <LocateFixed className={isLocating ? "animate-pulse" : ""} />

          {isLocating ? "در حال دریافت..." : "موقعیت فعلی من"}
        </Button>
      </div>

      <div
        className={`relative overflow-hidden border ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        <Map
          center={mapCenter}
          zoom={selectedPosition ? 16 : 12}
          className="h-[420px] min-h-0 w-full rounded-md"
          scrollWheelZoom
        >
          <MapTileLayer
            url={mapConfig.tilesUrl}
            attribution="© OpenStreetMap contributors"
          />

          <MapClickHandler onChange={onChange} />

          <MapCenterController latitude={latitude} longitude={longitude} />

          {selectedPosition ? (
            <MapMarker
              position={selectedPosition}
              draggable
              icon={
                <MapPin className="size-7 fill-foreground text-background" />
              }
              iconAnchor={[14, 28]}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            />
          ) : null}

          <MapZoomControl />
        </Map>
      </div>

      {selectedPosition ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span>موقعیت تحویل انتخاب شد</span>

          <span dir="ltr">
            {latitude?.toFixed(6)}
            {" , "}
            {longitude?.toFixed(6)}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          برای ثبت محل تحویل، روی نقطه موردنظر در نقشه کلیک کنید یا از «موقعیت
          فعلی من» استفاده کنید.
        </p>
      )}

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
