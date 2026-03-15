import { Request } from "express";

  function getSidFromRequest(request: Request) {
    const cookieString = (request.headers as any).cookie;
    const sid = getValueByKeyInCookie(cookieString, 'sid');
    
    return sid
  }

  function getValueByKeyInCookie(cookieString: string, key: string) {
    const valueCookie = cookieString
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${key}=`));

    let tokenValue: string | undefined;
    if (valueCookie) {
      const [, value] = valueCookie.split('=');
      tokenValue = value;
    }

    return tokenValue;
  }

  export {
    getSidFromRequest, getValueByKeyInCookie
  }