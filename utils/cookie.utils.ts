interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}
  
export const setCookie = (name: string, value: string, options?: CookieOptions) => {
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (!options) options = {};

  if (!options.expires) {
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    cookieStr += `; expires=${date.toUTCString()}`;
  } else if (typeof options.expires === 'number') {
    const date = new Date();
    date.setTime(date.getTime() + options.expires * 60 * 60 * 1000);
    cookieStr += `; expires=${date.toUTCString()}`;
  } else {
    cookieStr += `; expires=${options.expires.toUTCString()}`;
  }

  if (options.path) {
    cookieStr += `; path=${options.path}`;
  } else {
    cookieStr += `; path=/`;
  }

  if (options.domain) {
    cookieStr += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieStr += `; secure`;
  }

  if (options.sameSite) {
    cookieStr += `; SameSite=${options.sameSite}`;
  }

  document.cookie = cookieStr;
};
  
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};
  
export const removeCookie = (name: string, options?: CookieOptions) => {
  setCookie(name, '', { 
      ...options, 
      expires: new Date(0), 
      path: '/'
  });
};