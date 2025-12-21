export function setCookie(
   key: string,
   value: string,
   days = 7
) {
   const expires = new Date(Date.now() + days * 864e5).toUTCString();
   document.cookie =
      `${encodeURIComponent(key)}=${encodeURIComponent(value)}; ` +
      `expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(key: string): string | null {
   const name = encodeURIComponent(key) + "=";
   const parts = document.cookie.split("; ");

   for (const part of parts) {
      if (part.startsWith(name)) {
         return decodeURIComponent(part.slice(name.length));
      }
   }

   return null;
}