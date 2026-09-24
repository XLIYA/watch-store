import { mapConfig } from "@/config/maps";
/** نقشهٔ checkout از این GET مستقل استفاده می‌کند؛ هیچ کوکی فروشگاه به سرویس آدرس فرستاده نمی‌شود. */
export async function reverseGeocode(latitude:number,longitude:number,signal?:AbortSignal):Promise<string>{
 const url=new URL(mapConfig.reverseGeocodingUrl);url.searchParams.set("lat",String(latitude));url.searchParams.set("lon",String(longitude));url.searchParams.set("limit","1");
 const response=await fetch(url,{signal,credentials:"omit",headers:{"Accept-Language":"fa"}});if(!response.ok)throw new Error("REVERSE_GEOCODING_FAILED");
 const data=await response.json();const properties=data.features?.[0]?.properties;
 if(!properties)return "";
 return [...new Set([properties.state,properties.city,properties.district,properties.street,properties.name,properties.housenumber].filter((value):value is string=>typeof value==='string'&&!!value))].join("، ");
}
