// سرویس نقشه client مستقل دارد و هیچ کوکی یا توکن فروشگاه به آن ارسال نمی‌شود.
export const mapConfig = {
  reverseGeocodingUrl: process.env.NEXT_PUBLIC_REVERSE_GEOCODING_URL || "https://photon.komoot.io/reverse",
  geocodingUrl:
    process.env.NEXT_PUBLIC_GEOCODING_URL || "https://photon.komoot.io/api",
  tilesUrl:
    process.env.NEXT_PUBLIC_MAP_TILES_URL ||
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  lightTilesUrl:
    process.env.NEXT_PUBLIC_MAP_LIGHT_TILES_URL ||
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  darkTilesUrl:
    process.env.NEXT_PUBLIC_MAP_DARK_TILES_URL ||
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
};
