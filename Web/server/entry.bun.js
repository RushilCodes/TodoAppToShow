var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _a, _b, _c, _pendingHighSurrogate, _handle, _transform, _d;
import { getNotFound } from "./@qwik-city-not-found-paths.js";
import { isStaticPath } from "./@qwik-city-static-paths.js";
import { v as verifySerializable$1, _ as _serializeData, a as _deserializeData } from "./q-D8W9Q_oD.js";
import { s as setServerPlatform2, m as manifest, r as render } from "./q-nEw09dZ9.js";
import { join, extname } from "node:path";
import qwikCityPlan from "./@qwik-city-plan.js";
var ServerError = class extends Error {
  constructor(status, data) {
    super();
    this.status = status;
    this.data = data;
  }
};
var ErrorResponse = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
function getErrorHtml(status, e) {
  let message = "Server Error";
  if (e != null) {
    if (typeof e.message === "string") {
      message = e.message;
    } else {
      message = String(e);
    }
  }
  return `<html>` + minimalHtmlResponse(status, message) + `</html>`;
}
function minimalHtmlResponse(status, message) {
  if (typeof status !== "number") {
    status = 500;
  }
  if (typeof message === "string") {
    message = escapeHtml(message);
  } else {
    message = "";
  }
  const width = typeof message === "string" ? "600px" : "300px";
  const color = status >= 500 ? COLOR_500 : COLOR_400;
  return `
<head>
  <meta charset="utf-8">
  <meta http-equiv="Status" content="${status}">
  <title>${status} ${message}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { color: ${color}; background-color: #fafafa; padding: 30px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    p { max-width: ${width}; margin: 60px auto 30px auto; background: white; border-radius: 4px; box-shadow: 0px 0px 50px -20px ${color}; overflow: hidden; }
    strong { display: inline-block; padding: 15px; background: ${color}; color: white; }
    span { display: inline-block; padding: 15px; }
  </style>
</head>
<body><p><strong>${status}</strong> <span>${message}</span></p></body>
`;
}
var ESCAPE_HTML = /[&<>]/g;
var escapeHtml = (s) => {
  return s.replace(ESCAPE_HTML, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      default:
        return "";
    }
  });
};
var COLOR_400 = "#006ce9";
var COLOR_500 = "#713fc2";
var SAMESITE = {
  lax: "Lax",
  Lax: "Lax",
  None: "None",
  none: "None",
  strict: "Strict",
  Strict: "Strict"
};
var UNIT = {
  seconds: 1,
  minutes: 1 * 60,
  hours: 1 * 60 * 60,
  days: 1 * 60 * 60 * 24,
  weeks: 1 * 60 * 60 * 24 * 7
};
var createSetCookieValue = (cookieName, cookieValue, options) => {
  const c = [`${cookieName}=${cookieValue}`];
  if (typeof options.domain === "string") {
    c.push(`Domain=${options.domain}`);
  }
  if (typeof options.maxAge === "number") {
    c.push(`Max-Age=${options.maxAge}`);
  } else if (Array.isArray(options.maxAge)) {
    c.push(`Max-Age=${options.maxAge[0] * UNIT[options.maxAge[1]]}`);
  } else if (typeof options.expires === "number" || typeof options.expires == "string") {
    c.push(`Expires=${options.expires}`);
  } else if (options.expires instanceof Date) {
    c.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.httpOnly) {
    c.push("HttpOnly");
  }
  if (typeof options.path === "string") {
    c.push(`Path=${options.path}`);
  }
  const sameSite = resolveSameSite(options.sameSite);
  if (sameSite) {
    c.push(`SameSite=${sameSite}`);
  }
  if (options.secure) {
    c.push("Secure");
  }
  return c.join("; ");
};
function tryDecodeUriComponent(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
var parseCookieString = (cookieString) => {
  const cookie = {};
  if (typeof cookieString === "string" && cookieString !== "") {
    const cookieSegments = cookieString.split(";");
    for (const cookieSegment of cookieSegments) {
      const separatorIndex = cookieSegment.indexOf("=");
      if (separatorIndex !== -1) {
        cookie[tryDecodeUriComponent(cookieSegment.slice(0, separatorIndex).trim())] = tryDecodeUriComponent(cookieSegment.slice(separatorIndex + 1).trim());
      }
    }
  }
  return cookie;
};
function resolveSameSite(sameSite) {
  if (sameSite === true) {
    return "Strict";
  }
  if (sameSite === false) {
    return "None";
  }
  if (sameSite) {
    return SAMESITE[sameSite];
  }
  return void 0;
}
var REQ_COOKIE = Symbol("request-cookies");
var RES_COOKIE = Symbol("response-cookies");
var LIVE_COOKIE = Symbol("live-cookies");
var Cookie = (_c = REQ_COOKIE, _b = RES_COOKIE, _a = LIVE_COOKIE, class {
  constructor(cookieString) {
    __publicField(this, _c);
    __publicField(this, _b, {});
    __publicField(this, _a, {});
    __publicField(this, "appendCounter", 0);
    this[REQ_COOKIE] = parseCookieString(cookieString);
    this[LIVE_COOKIE] = { ...this[REQ_COOKIE] };
  }
  get(cookieName, live = true) {
    const value = this[live ? LIVE_COOKIE : REQ_COOKIE][cookieName];
    if (!value) {
      return null;
    }
    return {
      value,
      json() {
        return JSON.parse(value);
      },
      number() {
        return Number(value);
      }
    };
  }
  getAll(live = true) {
    return Object.keys(this[live ? LIVE_COOKIE : REQ_COOKIE]).reduce(
      (cookies, cookieName) => {
        cookies[cookieName] = this.get(cookieName);
        return cookies;
      },
      {}
    );
  }
  has(cookieName, live = true) {
    return !!this[live ? LIVE_COOKIE : REQ_COOKIE][cookieName];
  }
  set(cookieName, cookieValue, options = {}) {
    this[LIVE_COOKIE][cookieName] = typeof cookieValue === "string" ? cookieValue : JSON.stringify(cookieValue);
    const resolvedValue = typeof cookieValue === "string" ? cookieValue : encodeURIComponent(JSON.stringify(cookieValue));
    this[RES_COOKIE][cookieName] = createSetCookieValue(cookieName, resolvedValue, options);
  }
  append(cookieName, cookieValue, options = {}) {
    this[LIVE_COOKIE][cookieName] = typeof cookieValue === "string" ? cookieValue : JSON.stringify(cookieValue);
    const resolvedValue = typeof cookieValue === "string" ? cookieValue : encodeURIComponent(JSON.stringify(cookieValue));
    this[RES_COOKIE][++this.appendCounter] = createSetCookieValue(
      cookieName,
      resolvedValue,
      options
    );
  }
  delete(name, options) {
    this.set(name, "deleted", { ...options, maxAge: 0 });
    this[LIVE_COOKIE][name] = null;
  }
  headers() {
    return Object.values(this[RES_COOKIE]);
  }
});
var mergeHeadersCookies = (headers, cookies) => {
  const cookieHeaders = cookies.headers();
  if (cookieHeaders.length > 0) {
    const newHeaders = new Headers(headers);
    for (const cookie of cookieHeaders) {
      newHeaders.append("Set-Cookie", cookie);
    }
    return newHeaders;
  }
  return headers;
};
var AbortMessage = class {
};
var RedirectMessage = class extends AbortMessage {
};
var MODULE_CACHE = /* @__PURE__ */ new WeakMap();
var QACTION_KEY = "qaction";
var QFN_KEY = "qfunc";
var QDATA_KEY = "qdata";
function matchRoute(route, path) {
  const routeIdx = startIdxSkipSlash(route);
  const routeLength = lengthNoTrailingSlash(route);
  const pathIdx = startIdxSkipSlash(path);
  const pathLength = lengthNoTrailingSlash(path);
  return matchRoutePart(route, routeIdx, routeLength, path, pathIdx, pathLength);
}
function matchRoutePart(route, routeIdx, routeLength, path, pathIdx, pathLength) {
  let params = null;
  while (routeIdx < routeLength) {
    const routeCh = route.charCodeAt(routeIdx++);
    const pathCh = path.charCodeAt(pathIdx++);
    if (routeCh === 91) {
      const isMany = isThreeDots(route, routeIdx);
      const paramNameStart = routeIdx + (isMany ? 3 : 0);
      const paramNameEnd = scan(
        route,
        paramNameStart,
        routeLength,
        93
        /* CLOSE_BRACKET */
      );
      const paramName = route.substring(paramNameStart, paramNameEnd);
      const paramSuffixEnd = scan(
        route,
        paramNameEnd + 1,
        routeLength,
        47
        /* SLASH */
      );
      const suffix = route.substring(paramNameEnd + 1, paramSuffixEnd);
      routeIdx = paramNameEnd + 1;
      const paramValueStart = pathIdx - 1;
      if (isMany) {
        const match = recursiveScan(
          paramName,
          suffix,
          path,
          paramValueStart,
          pathLength,
          route,
          routeIdx + suffix.length + 1,
          routeLength
        );
        if (match) {
          return Object.assign(params || (params = {}), match);
        }
      }
      const paramValueEnd = scan(path, paramValueStart, pathLength, 47, suffix);
      if (paramValueEnd == -1) {
        return null;
      }
      const paramValue = path.substring(paramValueStart, paramValueEnd);
      if (!isMany && !suffix && !paramValue) {
        return null;
      }
      pathIdx = paramValueEnd;
      (params || (params = {}))[paramName] = decodeURIComponent(paramValue);
    } else if (routeCh !== pathCh) {
      if (!(isNaN(pathCh) && isRestParameter(route, routeIdx))) {
        return null;
      }
    }
  }
  if (allConsumed(route, routeIdx) && allConsumed(path, pathIdx)) {
    return params || {};
  } else {
    return null;
  }
}
function isRestParameter(text, idx) {
  return text.charCodeAt(idx) === 91 && isThreeDots(text, idx + 1);
}
function lengthNoTrailingSlash(text) {
  const length = text.length;
  return length > 1 && text.charCodeAt(length - 1) === 47 ? length - 1 : length;
}
function allConsumed(text, idx) {
  const length = text.length;
  return idx >= length || idx == length - 1 && text.charCodeAt(idx) === 47;
}
function startIdxSkipSlash(text) {
  return text.charCodeAt(0) === 47 ? 1 : 0;
}
function isThreeDots(text, idx) {
  return text.charCodeAt(idx) === 46 && text.charCodeAt(idx + 1) === 46 && text.charCodeAt(idx + 2) === 46;
}
function scan(text, idx, end, ch, suffix = "") {
  while (idx < end && text.charCodeAt(idx) !== ch) {
    idx++;
  }
  const suffixLength = suffix.length;
  for (let i = 0; i < suffixLength; i++) {
    if (text.charCodeAt(idx - suffixLength + i) !== suffix.charCodeAt(i)) {
      return -1;
    }
  }
  return idx - suffixLength;
}
function recursiveScan(paramName, suffix, path, pathStart, pathLength, route, routeStart, routeLength) {
  if (path.charCodeAt(pathStart) === 47) {
    pathStart++;
  }
  let pathIdx = pathLength;
  const sep = suffix + "/";
  while (pathIdx >= pathStart) {
    const match = matchRoutePart(route, routeStart, routeLength, path, pathIdx, pathLength);
    if (match) {
      let value = path.substring(pathStart, Math.min(pathIdx, pathLength));
      if (value.endsWith(sep)) {
        value = value.substring(0, value.length - sep.length);
      }
      match[paramName] = decodeURIComponent(value);
      return match;
    }
    const newPathIdx = lastIndexOf(path, pathStart, sep, pathIdx, pathStart - 1) + sep.length;
    if (pathIdx === newPathIdx) {
      break;
    }
    pathIdx = newPathIdx;
  }
  return null;
}
function lastIndexOf(text, start, match, searchIdx, notFoundIdx) {
  let idx = text.lastIndexOf(match, searchIdx);
  if (idx == searchIdx - match.length) {
    idx = text.lastIndexOf(match, searchIdx - match.length - 1);
  }
  return idx > start ? idx : notFoundIdx;
}
var loadRoute = async (routes, menus, cacheModules, pathname) => {
  if (!Array.isArray(routes)) {
    return null;
  }
  for (const routeData of routes) {
    const routeName = routeData[0];
    const params = matchRoute(routeName, pathname);
    if (!params) {
      continue;
    }
    const loaders = routeData[1];
    const routeBundleNames = routeData[3];
    const modules = new Array(loaders.length);
    const pendingLoads = [];
    loaders.forEach((moduleLoader, i) => {
      loadModule(
        moduleLoader,
        pendingLoads,
        (routeModule) => modules[i] = routeModule,
        cacheModules
      );
    });
    const menuLoader = getMenuLoader(menus, pathname);
    let menu = void 0;
    loadModule(
      menuLoader,
      pendingLoads,
      (menuModule) => menu = menuModule == null ? void 0 : menuModule.default,
      cacheModules
    );
    if (pendingLoads.length > 0) {
      await Promise.all(pendingLoads);
    }
    return [routeName, params, modules, menu, routeBundleNames];
  }
  return null;
};
var loadModule = (moduleLoader, pendingLoads, moduleSetter, cacheModules) => {
  if (typeof moduleLoader === "function") {
    const loadedModule = MODULE_CACHE.get(moduleLoader);
    if (loadedModule) {
      moduleSetter(loadedModule);
    } else {
      const moduleOrPromise = moduleLoader();
      if (typeof moduleOrPromise.then === "function") {
        pendingLoads.push(
          moduleOrPromise.then((loadedModule2) => {
            if (cacheModules !== false) {
              MODULE_CACHE.set(moduleLoader, loadedModule2);
            }
            moduleSetter(loadedModule2);
          })
        );
      } else if (moduleOrPromise) {
        moduleSetter(moduleOrPromise);
      }
    }
  }
};
var getMenuLoader = (menus, pathname) => {
  if (menus) {
    pathname = pathname.endsWith("/") ? pathname : pathname + "/";
    const menu = menus.find(
      (m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith("/") ? "" : "/"))
    );
    if (menu) {
      return menu[1];
    }
  }
};
function createCacheControl(cacheControl) {
  const controls = [];
  if (cacheControl === "day") {
    cacheControl = 60 * 60 * 24;
  } else if (cacheControl === "week") {
    cacheControl = 60 * 60 * 24 * 7;
  } else if (cacheControl === "month") {
    cacheControl = 60 * 60 * 24 * 30;
  } else if (cacheControl === "year") {
    cacheControl = 60 * 60 * 24 * 365;
  } else if (cacheControl === "private") {
    cacheControl = {
      private: true,
      noCache: true
    };
  } else if (cacheControl === "immutable") {
    cacheControl = {
      public: true,
      immutable: true,
      maxAge: 60 * 60 * 24 * 365,
      staleWhileRevalidate: 60 * 60 * 24 * 365
    };
  } else if (cacheControl === "no-cache") {
    cacheControl = {
      noCache: true
    };
  }
  if (typeof cacheControl === "number") {
    cacheControl = {
      maxAge: cacheControl,
      sMaxAge: cacheControl,
      staleWhileRevalidate: cacheControl
    };
  }
  if (cacheControl.immutable) {
    controls.push("immutable");
  }
  if (cacheControl.maxAge) {
    controls.push(`max-age=${cacheControl.maxAge}`);
  }
  if (cacheControl.sMaxAge) {
    controls.push(`s-maxage=${cacheControl.sMaxAge}`);
  }
  if (cacheControl.noStore) {
    controls.push("no-store");
  }
  if (cacheControl.noCache) {
    controls.push("no-cache");
  }
  if (cacheControl.private) {
    controls.push("private");
  }
  if (cacheControl.public) {
    controls.push("public");
  }
  if (cacheControl.staleWhileRevalidate) {
    controls.push(`stale-while-revalidate=${cacheControl.staleWhileRevalidate}`);
  }
  if (cacheControl.staleIfError) {
    controls.push(`stale-if-error=${cacheControl.staleIfError}`);
  }
  return controls.join(", ");
}
var asyncStore;
import("node:async_hooks").then((module) => {
  const AsyncLocalStorage = module.AsyncLocalStorage;
  asyncStore = new AsyncLocalStorage();
  globalThis.qcAsyncRequestStore = asyncStore;
}).catch((err) => {
  console.warn(
    "AsyncLocalStorage not available, continuing without it. This might impact concurrent server calls.",
    err
  );
});
function runQwikCity(serverRequestEv, loadedRoute, requestHandlers, manifest2, trailingSlash = true, basePathname = "/", qwikSerializer) {
  let resolve;
  const responsePromise = new Promise((r) => resolve = r);
  const requestEv = createRequestEvent(
    serverRequestEv,
    loadedRoute,
    requestHandlers,
    manifest2,
    trailingSlash,
    basePathname,
    qwikSerializer,
    resolve
  );
  return {
    response: responsePromise,
    requestEv,
    completion: asyncStore ? asyncStore.run(requestEv, runNext, requestEv, resolve) : runNext(requestEv, resolve)
  };
}
async function runNext(requestEv, resolve) {
  try {
    await requestEv.next();
  } catch (e) {
    if (e instanceof RedirectMessage) {
      const stream = requestEv.getWritableStream();
      await stream.close();
    } else if (e instanceof ErrorResponse) {
      console.error(e);
      if (!requestEv.headersSent) {
        const html = getErrorHtml(e.status, e);
        const status = e.status;
        requestEv.html(status, html);
      }
    } else if (!(e instanceof AbortMessage)) {
      if (getRequestMode(requestEv) !== "dev") {
        try {
          if (!requestEv.headersSent) {
            requestEv.headers.set("content-type", "text/html; charset=utf-8");
            requestEv.cacheControl({ noCache: true });
            requestEv.status(500);
          }
          const stream = requestEv.getWritableStream();
          if (!stream.locked) {
            const writer = stream.getWriter();
            await writer.write(encoder.encode(minimalHtmlResponse(500, "Internal Server Error")));
            await writer.close();
          }
        } catch {
          console.error("Unable to render error page");
        }
      }
      return e;
    }
  } finally {
    if (!requestEv.isDirty()) {
      resolve(null);
    }
  }
  return void 0;
}
function getRouteMatchPathname(pathname, trailingSlash) {
  if (pathname.endsWith(QDATA_JSON)) {
    const trimEnd = pathname.length - QDATA_JSON_LEN + (trailingSlash ? 1 : 0);
    pathname = pathname.slice(0, trimEnd);
    if (pathname === "") {
      pathname = "/";
    }
  }
  return pathname;
}
var IsQData = "@isQData";
var QDATA_JSON = "/q-data.json";
var QDATA_JSON_LEN = QDATA_JSON.length;
var isPromise = (value) => {
  return value && typeof value.then === "function";
};
var RequestEvLoaders = Symbol("RequestEvLoaders");
var RequestEvMode = Symbol("RequestEvMode");
var RequestEvRoute = Symbol("RequestEvRoute");
var RequestEvQwikSerializer = Symbol("RequestEvQwikSerializer");
var RequestEvTrailingSlash = Symbol("RequestEvTrailingSlash");
var RequestRouteName = "@routeName";
var RequestEvSharedActionId = "@actionId";
var RequestEvSharedActionFormData = "@actionFormData";
var RequestEvSharedNonce = "@nonce";
function createRequestEvent(serverRequestEv, loadedRoute, requestHandlers, manifest2, trailingSlash, basePathname, qwikSerializer, resolved) {
  const { request, platform, env } = serverRequestEv;
  const sharedMap = /* @__PURE__ */ new Map();
  const cookie = new Cookie(request.headers.get("cookie"));
  const headers = new Headers();
  const url = new URL(request.url);
  if (url.pathname.endsWith(QDATA_JSON)) {
    url.pathname = url.pathname.slice(0, -QDATA_JSON_LEN);
    if (trailingSlash && !url.pathname.endsWith("/")) {
      url.pathname += "/";
    }
    sharedMap.set(IsQData, true);
  }
  sharedMap.set("@manifest", manifest2);
  let routeModuleIndex = -1;
  let writableStream = null;
  let requestData = void 0;
  let locale = serverRequestEv.locale;
  let status = 200;
  const next = async () => {
    routeModuleIndex++;
    while (routeModuleIndex < requestHandlers.length) {
      const moduleRequestHandler = requestHandlers[routeModuleIndex];
      const asyncStore2 = globalThis.qcAsyncRequestStore;
      const result = (asyncStore2 == null ? void 0 : asyncStore2.run) ? asyncStore2.run(requestEv, moduleRequestHandler, requestEv) : moduleRequestHandler(requestEv);
      if (isPromise(result)) {
        await result;
      }
      routeModuleIndex++;
    }
  };
  const check = () => {
    if (writableStream !== null) {
      throw new Error("Response already sent");
    }
  };
  const send = (statusOrResponse, body) => {
    check();
    if (typeof statusOrResponse === "number") {
      status = statusOrResponse;
      const writableStream2 = requestEv.getWritableStream();
      const writer = writableStream2.getWriter();
      writer.write(typeof body === "string" ? encoder.encode(body) : body);
      writer.close();
    } else {
      status = statusOrResponse.status;
      statusOrResponse.headers.forEach((value, key) => {
        headers.append(key, value);
      });
      if (statusOrResponse.body) {
        const writableStream2 = requestEv.getWritableStream();
        statusOrResponse.body.pipeTo(writableStream2);
      } else {
        if (status >= 300 && status < 400) {
          return new RedirectMessage();
        } else {
          requestEv.getWritableStream().getWriter().close();
        }
      }
    }
    return exit();
  };
  const exit = () => {
    routeModuleIndex = ABORT_INDEX;
    return new AbortMessage();
  };
  const loaders = {};
  const requestEv = {
    [RequestEvLoaders]: loaders,
    [RequestEvMode]: serverRequestEv.mode,
    [RequestEvTrailingSlash]: trailingSlash,
    [RequestEvRoute]: loadedRoute,
    [RequestEvQwikSerializer]: qwikSerializer,
    cookie,
    headers,
    env,
    method: request.method,
    signal: request.signal,
    params: (loadedRoute == null ? void 0 : loadedRoute[1]) ?? {},
    pathname: url.pathname,
    platform,
    query: url.searchParams,
    request,
    url,
    basePathname,
    sharedMap,
    get headersSent() {
      return writableStream !== null;
    },
    get exited() {
      return routeModuleIndex >= ABORT_INDEX;
    },
    get clientConn() {
      return serverRequestEv.getClientConn();
    },
    next,
    exit,
    cacheControl: (cacheControl, target = "Cache-Control") => {
      check();
      headers.set(target, createCacheControl(cacheControl));
    },
    resolveValue: async (loaderOrAction) => {
      const id = loaderOrAction.__id;
      if (loaderOrAction.__brand === "server_loader") {
        if (!(id in loaders)) {
          throw new Error(
            "You can not get the returned data of a loader that has not been executed for this request."
          );
        }
      }
      return loaders[id];
    },
    status: (statusCode) => {
      if (typeof statusCode === "number") {
        check();
        status = statusCode;
        return statusCode;
      }
      return status;
    },
    locale: (_locale) => {
      if (typeof _locale === "string") {
        locale = _locale;
      }
      return locale || "";
    },
    error: (statusCode, message) => {
      status = statusCode;
      return new ErrorResponse(statusCode, message);
    },
    redirect: (statusCode, url2) => {
      check();
      status = statusCode;
      if (url2) {
        const fixedURL = url2.replace(/([^:])\/{2,}/g, "$1/");
        if (url2 !== fixedURL) {
          console.warn(`Redirect URL ${url2} is invalid, fixing to ${fixedURL}`);
        }
        headers.set("Location", fixedURL);
      }
      if (statusCode > 301 && !headers.get("Cache-Control")) {
        headers.set("Cache-Control", "no-store");
      }
      exit();
      return new RedirectMessage();
    },
    defer: (returnData) => {
      return typeof returnData === "function" ? returnData : () => returnData;
    },
    fail: (statusCode, data) => {
      check();
      status = statusCode;
      return {
        failed: true,
        ...data
      };
    },
    text: (statusCode, text) => {
      headers.set("Content-Type", "text/plain; charset=utf-8");
      return send(statusCode, text);
    },
    html: (statusCode, html) => {
      headers.set("Content-Type", "text/html; charset=utf-8");
      return send(statusCode, html);
    },
    parseBody: async () => {
      if (requestData !== void 0) {
        return requestData;
      }
      return requestData = parseRequest(requestEv, sharedMap, qwikSerializer);
    },
    json: (statusCode, data) => {
      headers.set("Content-Type", "application/json; charset=utf-8");
      return send(statusCode, JSON.stringify(data));
    },
    send,
    isDirty: () => {
      return writableStream !== null;
    },
    getWritableStream: () => {
      if (writableStream === null) {
        if (serverRequestEv.mode === "dev") {
          const serverTiming = sharedMap.get("@serverTiming");
          if (serverTiming) {
            headers.set("Server-Timing", serverTiming.map((a) => `${a[0]};dur=${a[1]}`).join(","));
          }
        }
        writableStream = serverRequestEv.getWritableStream(
          status,
          headers,
          cookie,
          resolved,
          requestEv
        );
      }
      return writableStream;
    }
  };
  return Object.freeze(requestEv);
}
function getRequestLoaders(requestEv) {
  return requestEv[RequestEvLoaders];
}
function getRequestTrailingSlash(requestEv) {
  return requestEv[RequestEvTrailingSlash];
}
function getRequestRoute(requestEv) {
  return requestEv[RequestEvRoute];
}
function getRequestMode(requestEv) {
  return requestEv[RequestEvMode];
}
var ABORT_INDEX = Number.MAX_SAFE_INTEGER;
var parseRequest = async ({ request, method, query }, sharedMap, qwikSerializer) => {
  var _a2;
  const type = ((_a2 = request.headers.get("content-type")) == null ? void 0 : _a2.split(/[;,]/, 1)[0].trim()) ?? "";
  if (type === "application/x-www-form-urlencoded" || type === "multipart/form-data") {
    const formData = await request.formData();
    sharedMap.set(RequestEvSharedActionFormData, formData);
    return formToObj(formData);
  } else if (type === "application/json") {
    const data = await request.json();
    return data;
  } else if (type === "application/qwik-json") {
    if (method === "GET" && query.has(QDATA_KEY)) {
      const data = query.get(QDATA_KEY);
      if (data) {
        try {
          return qwikSerializer._deserializeData(decodeURIComponent(data));
        } catch (err) {
        }
      }
    }
    return qwikSerializer._deserializeData(await request.text());
  }
  return void 0;
};
var formToObj = (formData) => {
  const values = [...formData.entries()].reduce((values2, [name, value]) => {
    name.split(".").reduce((object, key, index, keys) => {
      if (key.endsWith("[]")) {
        const arrayKey = key.slice(0, -2);
        object[arrayKey] = object[arrayKey] || [];
        return object[arrayKey] = [...object[arrayKey], value];
      }
      if (index < keys.length - 1) {
        return object[key] = object[key] || (Number.isNaN(+keys[index + 1]) ? {} : []);
      }
      return object[key] = value;
    }, values2);
    return values2;
  }, {});
  return values;
};
function getQwikCityServerData(requestEv) {
  const { url, params, request, status, locale } = requestEv;
  const requestHeaders = {};
  request.headers.forEach((value, key) => requestHeaders[key] = value);
  const action = requestEv.sharedMap.get(RequestEvSharedActionId);
  const formData = requestEv.sharedMap.get(RequestEvSharedActionFormData);
  const routeName = requestEv.sharedMap.get(RequestRouteName);
  const nonce = requestEv.sharedMap.get(RequestEvSharedNonce);
  const headers = requestEv.request.headers;
  const reconstructedUrl = new URL(url.pathname + url.search, url);
  const host = headers.get("X-Forwarded-Host");
  const protocol = headers.get("X-Forwarded-Proto");
  if (host) {
    reconstructedUrl.port = "";
    reconstructedUrl.host = host;
  }
  if (protocol) {
    reconstructedUrl.protocol = protocol;
  }
  return {
    url: reconstructedUrl.href,
    requestHeaders,
    locale: locale(),
    nonce,
    containerAttributes: {
      "q:route": routeName
    },
    qwikcity: {
      routeName,
      ev: requestEv,
      params: { ...params },
      loadedRoute: getRequestRoute(requestEv),
      response: {
        status: status(),
        loaders: getRequestLoaders(requestEv),
        action,
        formData
      }
    }
  };
}
var resolveRequestHandlers = (serverPlugins, route, method, checkOrigin, renderHandler) => {
  const routeLoaders = [];
  const routeActions = [];
  const requestHandlers = [];
  const isPageRoute = !!(route && isLastModulePageRoute(route[2]));
  if (serverPlugins) {
    _resolveRequestHandlers(
      routeLoaders,
      routeActions,
      requestHandlers,
      serverPlugins,
      isPageRoute,
      method
    );
  }
  if (route) {
    const routeName = route[0];
    if (checkOrigin && (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE")) {
      requestHandlers.unshift(csrfCheckMiddleware);
    }
    if (isPageRoute) {
      if (method === "POST" || method === "GET") {
        requestHandlers.push(pureServerFunction);
      }
      requestHandlers.push(fixTrailingSlash);
      requestHandlers.push(renderQData);
    }
    const routeModules = route[2];
    requestHandlers.push(handleRedirect);
    _resolveRequestHandlers(
      routeLoaders,
      routeActions,
      requestHandlers,
      routeModules,
      isPageRoute,
      method
    );
    if (isPageRoute) {
      requestHandlers.push((ev) => {
        ev.sharedMap.set(RequestRouteName, routeName);
      });
      requestHandlers.push(actionsMiddleware(routeActions, routeLoaders));
      requestHandlers.push(renderHandler);
    }
  }
  return requestHandlers;
};
var _resolveRequestHandlers = (routeLoaders, routeActions, requestHandlers, routeModules, collectActions, method) => {
  for (const routeModule of routeModules) {
    if (typeof routeModule.onRequest === "function") {
      requestHandlers.push(routeModule.onRequest);
    } else if (Array.isArray(routeModule.onRequest)) {
      requestHandlers.push(...routeModule.onRequest);
    }
    let methodReqHandler;
    switch (method) {
      case "GET": {
        methodReqHandler = routeModule.onGet;
        break;
      }
      case "POST": {
        methodReqHandler = routeModule.onPost;
        break;
      }
      case "PUT": {
        methodReqHandler = routeModule.onPut;
        break;
      }
      case "PATCH": {
        methodReqHandler = routeModule.onPatch;
        break;
      }
      case "DELETE": {
        methodReqHandler = routeModule.onDelete;
        break;
      }
      case "OPTIONS": {
        methodReqHandler = routeModule.onOptions;
        break;
      }
      case "HEAD": {
        methodReqHandler = routeModule.onHead;
        break;
      }
    }
    if (typeof methodReqHandler === "function") {
      requestHandlers.push(methodReqHandler);
    } else if (Array.isArray(methodReqHandler)) {
      requestHandlers.push(...methodReqHandler);
    }
    if (collectActions) {
      for (const module of Object.values(routeModule)) {
        if (typeof module === "function") {
          if (module.__brand === "server_loader") {
            routeLoaders.push(module);
          } else if (module.__brand === "server_action") {
            routeActions.push(module);
          }
        }
      }
    }
  }
};
function actionsMiddleware(routeActions, routeLoaders) {
  return async (requestEv) => {
    if (requestEv.headersSent) {
      requestEv.exit();
      return;
    }
    const { method } = requestEv;
    const loaders = getRequestLoaders(requestEv);
    const isDev = getRequestMode(requestEv) === "dev";
    const qwikSerializer = requestEv[RequestEvQwikSerializer];
    if (isDev && method === "GET") {
      if (requestEv.query.has(QACTION_KEY)) {
        console.warn(
          'Seems like you are submitting a Qwik Action via GET request. Qwik Actions should be submitted via POST request.\nMake sure your <form> has method="POST" attribute, like this: <form method="POST">'
        );
      }
    }
    if (method === "POST") {
      const selectedActionId = requestEv.query.get(QACTION_KEY);
      if (selectedActionId) {
        const serverActionsMap = globalThis._qwikActionsMap;
        const action = routeActions.find((action2) => action2.__id === selectedActionId) ?? (serverActionsMap == null ? void 0 : serverActionsMap.get(selectedActionId));
        if (action) {
          requestEv.sharedMap.set(RequestEvSharedActionId, selectedActionId);
          const data = await requestEv.parseBody();
          if (!data || typeof data !== "object") {
            throw new Error(
              `Expected request data for the action id ${selectedActionId} to be an object`
            );
          }
          const result = await runValidators(requestEv, action.__validators, data, isDev);
          if (!result.success) {
            loaders[selectedActionId] = requestEv.fail(result.status ?? 500, result.error);
          } else {
            const actionResolved = isDev ? await measure(
              requestEv,
              action.__qrl.getSymbol().split("_", 1)[0],
              () => action.__qrl.call(requestEv, result.data, requestEv)
            ) : await action.__qrl.call(requestEv, result.data, requestEv);
            if (isDev) {
              verifySerializable(qwikSerializer, actionResolved, action.__qrl);
            }
            loaders[selectedActionId] = actionResolved;
          }
        }
      }
    }
    if (routeLoaders.length > 0) {
      const resolvedLoadersPromises = routeLoaders.map((loader) => {
        const loaderId = loader.__id;
        loaders[loaderId] = runValidators(
          requestEv,
          loader.__validators,
          void 0,
          // data
          isDev
        ).then((res) => {
          if (res.success) {
            if (isDev) {
              return measure(
                requestEv,
                loader.__qrl.getSymbol().split("_", 1)[0],
                () => loader.__qrl.call(requestEv, requestEv)
              );
            } else {
              return loader.__qrl.call(requestEv, requestEv);
            }
          } else {
            return requestEv.fail(res.status ?? 500, res.error);
          }
        }).then((resolvedLoader) => {
          if (typeof resolvedLoader === "function") {
            loaders[loaderId] = resolvedLoader();
          } else {
            if (isDev) {
              verifySerializable(qwikSerializer, resolvedLoader, loader.__qrl);
            }
            loaders[loaderId] = resolvedLoader;
          }
          return resolvedLoader;
        });
        return loaders[loaderId];
      });
      await Promise.all(resolvedLoadersPromises);
    }
  };
}
async function runValidators(requestEv, validators, data, isDev) {
  let lastResult = {
    success: true,
    data
  };
  if (validators) {
    for (const validator of validators) {
      if (isDev) {
        lastResult = await measure(
          requestEv,
          `validator$`,
          () => validator.validate(requestEv, data)
        );
      } else {
        lastResult = await validator.validate(requestEv, data);
      }
      if (!lastResult.success) {
        return lastResult;
      } else {
        data = lastResult.data;
      }
    }
  }
  return lastResult;
}
function isAsyncIterator(obj) {
  return obj ? typeof obj === "object" && Symbol.asyncIterator in obj : false;
}
async function pureServerFunction(ev) {
  const fn = ev.query.get(QFN_KEY);
  if (fn && ev.request.headers.get("X-QRL") === fn && ev.request.headers.get("Content-Type") === "application/qwik-json") {
    ev.exit();
    const isDev = getRequestMode(ev) === "dev";
    const qwikSerializer = ev[RequestEvQwikSerializer];
    const data = await ev.parseBody();
    if (Array.isArray(data)) {
      const [qrl, ...args] = data;
      if (isQrl(qrl) && qrl.getHash() === fn) {
        let result;
        try {
          if (isDev) {
            result = await measure(
              ev,
              `server_${qrl.getSymbol()}`,
              () => qrl.apply(ev, args)
            );
          } else {
            result = await qrl.apply(ev, args);
          }
        } catch (err) {
          if (err instanceof ServerError) {
            ev.headers.set("Content-Type", "application/qwik-json");
            ev.send(err.status, await qwikSerializer._serializeData(err.data, true));
            return;
          }
          ev.headers.set("Content-Type", "application/qwik-json");
          ev.send(500, await qwikSerializer._serializeData(err, true));
          return;
        }
        if (isAsyncIterator(result)) {
          ev.headers.set("Content-Type", "text/qwik-json-stream");
          const writable = ev.getWritableStream();
          const stream = writable.getWriter();
          for await (const item of result) {
            if (isDev) {
              verifySerializable(qwikSerializer, item, qrl);
            }
            const message = await qwikSerializer._serializeData(item, true);
            if (ev.signal.aborted) {
              break;
            }
            await stream.write(encoder.encode(`${message}
`));
          }
          stream.close();
        } else {
          verifySerializable(qwikSerializer, result, qrl);
          ev.headers.set("Content-Type", "application/qwik-json");
          const message = await qwikSerializer._serializeData(result, true);
          ev.send(200, message);
        }
        return;
      }
    }
    throw ev.error(500, "Invalid request");
  }
}
function fixTrailingSlash(ev) {
  const trailingSlash = getRequestTrailingSlash(ev);
  const { basePathname, pathname, url, sharedMap } = ev;
  const isQData = sharedMap.has(IsQData);
  if (!isQData && pathname !== basePathname && !pathname.endsWith(".html")) {
    if (trailingSlash) {
      if (!pathname.endsWith("/")) {
        throw ev.redirect(301, pathname + "/" + url.search);
      }
    } else {
      if (pathname.endsWith("/")) {
        throw ev.redirect(
          301,
          pathname.slice(0, pathname.length - 1) + url.search
        );
      }
    }
  }
}
function verifySerializable(qwikSerializer, data, qrl) {
  try {
    qwikSerializer._verifySerializable(data, void 0);
  } catch (e) {
    if (e instanceof Error && qrl.dev) {
      e.loc = qrl.dev;
    }
    throw e;
  }
}
var isQrl = (value) => {
  return typeof value === "function" && typeof value.getSymbol === "function";
};
function isLastModulePageRoute(routeModules) {
  const lastRouteModule = routeModules[routeModules.length - 1];
  return lastRouteModule && typeof lastRouteModule.default === "function";
}
function getPathname(url, trailingSlash) {
  url = new URL(url);
  if (url.pathname.endsWith(QDATA_JSON)) {
    url.pathname = url.pathname.slice(0, -QDATA_JSON.length);
  }
  if (trailingSlash) {
    if (!url.pathname.endsWith("/")) {
      url.pathname += "/";
    }
  } else {
    if (url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
  }
  const search = url.search.slice(1).replaceAll(/&?q(action|data|func)=[^&]+/g, "");
  return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
}
var encoder = /* @__PURE__ */ new TextEncoder();
function csrfCheckMiddleware(requestEv) {
  const isForm = isContentType(
    requestEv.request.headers,
    "application/x-www-form-urlencoded",
    "multipart/form-data",
    "text/plain"
  );
  if (isForm) {
    const inputOrigin = requestEv.request.headers.get("origin");
    const origin = requestEv.url.origin;
    const forbidden = inputOrigin !== origin;
    if (forbidden) {
      throw requestEv.error(
        403,
        `CSRF check failed. Cross-site ${requestEv.method} form submissions are forbidden.
The request origin "${inputOrigin}" does not match the server origin "${origin}".`
      );
    }
  }
}
function renderQwikMiddleware(render2) {
  return async (requestEv) => {
    if (requestEv.headersSent) {
      return;
    }
    const isPageDataReq = requestEv.sharedMap.has(IsQData);
    if (isPageDataReq) {
      return;
    }
    requestEv.request.headers.forEach((value, key) => value);
    const responseHeaders = requestEv.headers;
    if (!responseHeaders.has("Content-Type")) {
      responseHeaders.set("Content-Type", "text/html; charset=utf-8");
    }
    const trailingSlash = getRequestTrailingSlash(requestEv);
    const { readable, writable } = new TextEncoderStream();
    const writableStream = requestEv.getWritableStream();
    const pipe = readable.pipeTo(writableStream, { preventClose: true });
    const stream = writable.getWriter();
    const status = requestEv.status();
    try {
      const isStatic = getRequestMode(requestEv) === "static";
      const serverData = getQwikCityServerData(requestEv);
      const result = await render2({
        base: requestEv.basePathname + "build/",
        stream,
        serverData,
        containerAttributes: {
          ["q:render"]: isStatic ? "static" : "",
          ...serverData.containerAttributes
        }
      });
      const qData = {
        loaders: getRequestLoaders(requestEv),
        action: requestEv.sharedMap.get(RequestEvSharedActionId),
        status: status !== 200 ? status : 200,
        href: getPathname(requestEv.url, trailingSlash)
      };
      if (typeof result.html === "string") {
        await stream.write(result.html);
      }
      requestEv.sharedMap.set("qData", qData);
    } finally {
      await stream.ready;
      await stream.close();
      await pipe;
    }
    await writableStream.close();
  };
}
async function handleRedirect(requestEv) {
  const isPageDataReq = requestEv.sharedMap.has(IsQData);
  if (!isPageDataReq) {
    return;
  }
  try {
    await requestEv.next();
  } catch (err) {
    if (!(err instanceof RedirectMessage)) {
      throw err;
    }
  }
  if (requestEv.headersSent) {
    return;
  }
  const status = requestEv.status();
  const location = requestEv.headers.get("Location");
  const isRedirect = status >= 301 && status <= 308 && location;
  if (isRedirect) {
    const adaptedLocation = makeQDataPath(location);
    if (adaptedLocation) {
      requestEv.headers.set("Location", adaptedLocation);
      requestEv.getWritableStream().close();
      return;
    } else {
      requestEv.status(200);
      requestEv.headers.delete("Location");
    }
  }
}
async function renderQData(requestEv) {
  const isPageDataReq = requestEv.sharedMap.has(IsQData);
  if (!isPageDataReq) {
    return;
  }
  await requestEv.next();
  if (requestEv.headersSent || requestEv.exited) {
    return;
  }
  const status = requestEv.status();
  const location = requestEv.headers.get("Location");
  const trailingSlash = getRequestTrailingSlash(requestEv);
  requestEv.request.headers.forEach((value, key) => value);
  requestEv.headers.set("Content-Type", "application/json; charset=utf-8");
  const qData = {
    loaders: getRequestLoaders(requestEv),
    action: requestEv.sharedMap.get(RequestEvSharedActionId),
    status: status !== 200 ? status : 200,
    href: getPathname(requestEv.url, trailingSlash),
    redirect: location ?? void 0
  };
  const writer = requestEv.getWritableStream().getWriter();
  const qwikSerializer = requestEv[RequestEvQwikSerializer];
  const data = await qwikSerializer._serializeData(qData, true);
  writer.write(encoder.encode(data));
  requestEv.sharedMap.set("qData", qData);
  writer.close();
}
function makeQDataPath(href) {
  if (href.startsWith("/")) {
    const append = QDATA_JSON;
    const url = new URL(href, "http://localhost");
    const pathname = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
    return pathname + (append.startsWith("/") ? "" : "/") + append + url.search;
  } else {
    return void 0;
  }
}
function now() {
  return typeof performance !== "undefined" ? performance.now() : 0;
}
async function measure(requestEv, name, fn) {
  const start = now();
  try {
    return await fn();
  } finally {
    const duration = now() - start;
    let measurements = requestEv.sharedMap.get("@serverTiming");
    if (!measurements) {
      requestEv.sharedMap.set("@serverTiming", measurements = []);
    }
    measurements.push([name, duration]);
  }
}
function isContentType(headers, ...types) {
  var _a2;
  const type = ((_a2 = headers.get("content-type")) == null ? void 0 : _a2.split(/;/, 1)[0].trim()) ?? "";
  return types.includes(type);
}
async function requestHandler(serverRequestEv, opts, qwikSerializer) {
  const { render: render2, qwikCityPlan: qwikCityPlan2, manifest: manifest2, checkOrigin } = opts;
  const pathname = serverRequestEv.url.pathname;
  const matchPathname = getRouteMatchPathname(pathname, qwikCityPlan2.trailingSlash);
  const routeAndHandlers = await loadRequestHandlers(
    qwikCityPlan2,
    matchPathname,
    serverRequestEv.request.method,
    checkOrigin ?? true,
    render2
  );
  if (routeAndHandlers) {
    const [route, requestHandlers] = routeAndHandlers;
    return runQwikCity(
      serverRequestEv,
      route,
      requestHandlers,
      manifest2,
      qwikCityPlan2.trailingSlash,
      qwikCityPlan2.basePathname,
      qwikSerializer
    );
  }
  return null;
}
async function loadRequestHandlers(qwikCityPlan2, pathname, method, checkOrigin, renderFn) {
  const { routes, serverPlugins, menus, cacheModules } = qwikCityPlan2;
  const route = await loadRoute(routes, menus, cacheModules, pathname);
  const requestHandlers = resolveRequestHandlers(
    serverPlugins,
    route,
    method,
    checkOrigin,
    renderQwikMiddleware(renderFn)
  );
  if (requestHandlers.length > 0) {
    return [route, requestHandlers];
  }
  return null;
}
var _TextEncoderStream_polyfill = (_d = class {
  constructor() {
    __privateAdd(this, _pendingHighSurrogate, null);
    __privateAdd(this, _handle, new TextEncoder());
    __privateAdd(this, _transform, new TransformStream({
      transform: (chunk, controller) => {
        chunk = String(chunk);
        let finalChunk = "";
        for (let i = 0; i < chunk.length; i++) {
          const item = chunk[i];
          const codeUnit = item.charCodeAt(0);
          if (__privateGet(this, _pendingHighSurrogate) !== null) {
            const highSurrogate = __privateGet(this, _pendingHighSurrogate);
            __privateSet(this, _pendingHighSurrogate, null);
            if (56320 <= codeUnit && codeUnit <= 57343) {
              finalChunk += highSurrogate + item;
              continue;
            }
            finalChunk += "�";
          }
          if (55296 <= codeUnit && codeUnit <= 56319) {
            __privateSet(this, _pendingHighSurrogate, item);
            continue;
          }
          if (56320 <= codeUnit && codeUnit <= 57343) {
            finalChunk += "�";
            continue;
          }
          finalChunk += item;
        }
        if (finalChunk) {
          controller.enqueue(__privateGet(this, _handle).encode(finalChunk));
        }
      },
      flush: (controller) => {
        if (__privateGet(this, _pendingHighSurrogate) !== null) {
          controller.enqueue(new Uint8Array([239, 191, 189]));
        }
      }
    }));
  }
  get encoding() {
    return __privateGet(this, _handle).encoding;
  }
  get readable() {
    return __privateGet(this, _transform).readable;
  }
  get writable() {
    return __privateGet(this, _transform).writable;
  }
  get [Symbol.toStringTag]() {
    return "TextEncoderStream";
  }
}, _pendingHighSurrogate = new WeakMap(), _handle = new WeakMap(), _transform = new WeakMap(), _d);
var MIME_TYPES = {
  "3gp": "video/3gpp",
  "3gpp": "video/3gpp",
  asf: "video/x-ms-asf",
  asx: "video/x-ms-asf",
  avi: "video/x-msvideo",
  avif: "image/avif",
  bmp: "image/x-ms-bmp",
  css: "text/css",
  flv: "video/x-flv",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jng: "image/x-jng",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  kar: "audio/midi",
  m4a: "audio/x-m4a",
  m4v: "video/x-m4v",
  mid: "audio/midi",
  midi: "audio/midi",
  mng: "video/x-mng",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  ogg: "audio/ogg",
  pdf: "application/pdf",
  png: "image/png",
  rar: "application/x-rar-compressed",
  shtml: "text/html",
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "video/mp2t",
  txt: "text/plain",
  wbmp: "image/vnd.wap.wbmp",
  webm: "video/webm",
  webp: "image/webp",
  wmv: "video/x-ms-wmv",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "text/xml",
  zip: "application/zip"
};
function createQwikCity(opts) {
  var _a2;
  globalThis.TextEncoderStream || (globalThis.TextEncoderStream = _TextEncoderStream_polyfill);
  const qwikSerializer = {
    _deserializeData,
    _serializeData,
    _verifySerializable: verifySerializable$1
  };
  if (opts.manifest) {
    setServerPlatform2(opts.manifest);
  }
  const staticFolder = ((_a2 = opts.static) == null ? void 0 : _a2.root) ?? join(Bun.fileURLToPath(import.meta.url), "..", "..", "dist");
  async function router2(request) {
    try {
      const url = new URL(request.url);
      const serverRequestEv = {
        mode: "server",
        locale: void 0,
        url,
        env: {
          get(key) {
            return Bun.env[key];
          }
        },
        request,
        getWritableStream: (status, headers, cookies, resolve) => {
          const { readable, writable } = new TransformStream();
          const response = new Response(readable, {
            status,
            headers: mergeHeadersCookies(headers, cookies)
          });
          resolve(response);
          return writable;
        },
        platform: {
          ssr: true
        },
        getClientConn: () => {
          return opts.getClientConn ? opts.getClientConn(request) : {};
        }
      };
      const handledResponse = await requestHandler(serverRequestEv, opts, qwikSerializer);
      if (handledResponse) {
        handledResponse.completion.then((v) => {
          if (v) {
            console.error(v);
          }
        });
        const response = await handledResponse.response;
        if (response) {
          const status = response.status;
          const location = response.headers.get("Location");
          const isRedirect = status >= 301 && status <= 308 && location;
          if (isRedirect) {
            return new Response(null, response);
          }
          return response;
        }
      }
      return null;
    } catch (e) {
      console.error(e);
      return new Response(String(e || "Error"), {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Error": "bun-server" }
      });
    }
  }
  const notFound2 = async (request) => {
    try {
      const url = new URL(request.url);
      const notFoundHtml = isStaticPath(request.method || "GET", url) ? "Not Found" : getNotFound(url.pathname);
      return new Response(notFoundHtml, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", "X-Not-Found": url.pathname }
      });
    } catch (e) {
      console.error(e);
      return new Response(String(e || "Error"), {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Error": "bun-server" }
      });
    }
  };
  const openStaticFile = async (url) => {
    const pathname = url.pathname;
    const fileName = pathname.slice(url.pathname.lastIndexOf("/"));
    let filePath;
    if (fileName.includes(".")) {
      filePath = join(staticFolder, pathname);
    } else if (opts.qwikCityPlan.trailingSlash) {
      filePath = join(staticFolder, pathname + "index.html");
    } else {
      filePath = join(staticFolder, pathname, "index.html");
    }
    return {
      filePath,
      content: Bun.file(filePath)
    };
  };
  const staticFile2 = async (request) => {
    var _a22;
    try {
      const url = new URL(request.url);
      if (isStaticPath(request.method || "GET", url)) {
        const { filePath, content } = await openStaticFile(url);
        if (!await content.exists()) {
          return new Response("Not Found", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8", "X-Not-Found": url.pathname }
          });
        }
        const ext = extname(filePath).replace(/^\./, "");
        return new Response(await content.stream(), {
          status: 200,
          headers: {
            "content-type": MIME_TYPES[ext] || "text/plain; charset=utf-8",
            "Cache-Control": ((_a22 = opts.static) == null ? void 0 : _a22.cacheControl) || "max-age=3600"
          }
        });
      }
      return null;
    } catch (e) {
      console.error(e);
      return new Response(String(e || "Error"), {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8", "X-Error": "bun-server" }
      });
    }
  };
  return {
    router: router2,
    notFound: notFound2,
    staticFile: staticFile2
  };
}
const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  manifest
});
const port = Number(Bun.env.PORT ?? 3e3);
console.log(`Server started: http://localhost:${port}/`);
Bun.serve({
  async fetch(request) {
    const staticResponse = await staticFile(request);
    if (staticResponse) return staticResponse;
    const qwikCityResponse = await router(request);
    if (qwikCityResponse) return qwikCityResponse;
    return notFound(request);
  },
  port
});
