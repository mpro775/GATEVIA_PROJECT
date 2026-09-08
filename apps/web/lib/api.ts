const API=process.env.NEXT_PUBLIC_API_URL??'http://localhost:3002/api/v1';
export interface Language {code:string;name:string;nativeName:string;direction:'ltr'|'rtl';isDefault:boolean}
async function request<T>(path:string,revalidate=60):Promise<T>{const response=await fetch(`${API}${path}`,{headers:{Accept:'application/json'},next:{revalidate,tags:['gatevia-content']}});if(!response.ok)throw new Error(`CMS request failed: ${response.status}`);const body=await response.json() as {data:T};return body.data}
export const getLanguages=()=>request<Language[]>('/public/languages',300);
export const getPage=(locale:string,slug:string)=>request<Record<string,unknown>>(`/public/pages/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`);
export const getList=(resource:string,locale:string,params='')=>request<Record<string,unknown>[]>(`/public/${resource}?locale=${encodeURIComponent(locale)}${params}`);
export const getDetail=(resource:string,locale:string,slug:string)=>request<Record<string,unknown>>(`/public/${resource}/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`);
export async function safe<T>(promise:Promise<T>,fallback:T):Promise<T>{try{return await promise}catch{return fallback}}
export const publicApiUrl=API;
