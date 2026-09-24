"use client";
import { useEffect, useRef, useState } from "react";
import { reverseGeocode } from "@/services/geocoding.service";
/** هر انتخاب جدید درخواست قبلی را لغو می‌کند؛ تایپ دستی هم پاسخ دیررس را بی‌اثر می‌کند تا آدرس کاربر بازنویسی نشود. */
export function useAddressSuggestion(apply:(address:string)=>void){
 const request=useRef<AbortController|null>(null);const version=useRef(0);const [loading,setLoading]=useState(false);const [message,setMessage]=useState("");
 useEffect(()=>()=>request.current?.abort(),[]);
 function cancel(){version.current++;request.current?.abort();setLoading(false);setMessage("");}
 async function suggest(latitude:number,longitude:number){cancel();const current=version.current;const controller=new AbortController();request.current=controller;setLoading(true);
  try{const address=await reverseGeocode(latitude,longitude,controller.signal);if(current!==version.current)return;if(address){apply(address);setMessage("آدرس پیشنهادی را بررسی و در صورت نیاز ویرایش کنید.");}else setMessage("آدرس دقیقی پیدا نشد؛ آدرس کامل را بنویسید.");}
  catch{if(!controller.signal.aborted)setMessage("دریافت آدرس ممکن نشد؛ می‌توانید آن را دستی وارد کنید.");}
  finally{if(current===version.current)setLoading(false);}
 }
 return {suggest,cancel,loading,message};
}
