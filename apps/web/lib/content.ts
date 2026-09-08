export interface Translation {title?:string;name?:string;slug?:string;excerpt?:string;shortDescription?:string;overview?:string;content?:unknown;seoTitle?:string;seoDescription?:string;[key:string]:unknown}
export const translation=(entity:Record<string,unknown>):Translation=>{const rows=entity.translations;return Array.isArray(rows)&&rows[0]&&typeof rows[0]==='object'?rows[0] as Translation:{}};
export const text=(value:unknown,fallback=''):string=>typeof value==='string'?value:fallback;
export const list=(value:unknown):unknown[]=>Array.isArray(value)?value:[];
export const plainText=(value:unknown):string=>{if(typeof value==='string')return value.replace(/<[^>]+>/g,' ');if(Array.isArray(value))return value.map(plainText).join(' ');if(value&&typeof value==='object')return Object.values(value).map(plainText).join(' ');return ''};
