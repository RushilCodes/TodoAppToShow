import { s as setPlatform, j as jsx, e as _renderSSR, f as _pauseFromContexts, F as Fragment, c as componentQrl, d as _jsxQ, i as inlinedQrl, g as _wrapSignal, u as useContext, h as useServerData, k as _jsxBranch, b as _jsxC, l as _qrlSync, m as eventQrl, n as SkipRender, o as useStylesQrl, p as noSerialize, q as useStore, r as _weakSerialize, t as useSignal, w as useContextProvider, x as useTaskQrl, S as Slot, y as createContextId, z as _noopQrl, A as useLexicalScope, B as getLocale, C as withLocale, D as _fnSignal, E as _jsxS } from "./q-D8W9Q_oD.js";
/**
 * @license
 * @builder.io/qwik/server 1.12.1-dev+7061ec0-20250220223946
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/QwikDev/qwik/blob/main/LICENSE
 */
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var SYNC_QRL = "<sync>";
function createPlatform(opts, resolvedManifest) {
  const mapper = resolvedManifest == null ? void 0 : resolvedManifest.mapper;
  const mapperFn = opts.symbolMapper ? opts.symbolMapper : (symbolName, _chunk, parent) => {
    var _a;
    if (mapper) {
      const hash2 = getSymbolHash(symbolName);
      const result = mapper[hash2];
      if (!result) {
        if (hash2 === SYNC_QRL) {
          return [hash2, ""];
        }
        const isRegistered = (_a = globalThis.__qwik_reg_symbols) == null ? void 0 : _a.has(hash2);
        if (isRegistered) {
          return [symbolName, "_"];
        }
        if (parent) {
          return [symbolName, `${parent}?qrl=${symbolName}`];
        }
        console.error("Cannot resolve symbol", symbolName, "in", mapper, parent);
      }
      return result;
    }
  };
  const serverPlatform = {
    isServer: true,
    async importSymbol(_containerEl, url, symbolName) {
      var _a;
      const hash2 = getSymbolHash(symbolName);
      const regSym = (_a = globalThis.__qwik_reg_symbols) == null ? void 0 : _a.get(hash2);
      if (regSym) {
        return regSym;
      }
      let modulePath = String(url);
      if (!modulePath.endsWith(".js")) {
        modulePath += ".js";
      }
      const module = __require(modulePath);
      if (!(symbolName in module)) {
        throw new Error(`Q-ERROR: missing symbol '${symbolName}' in module '${modulePath}'.`);
      }
      return module[symbolName];
    },
    raf: () => {
      console.error("server can not rerender");
      return Promise.resolve();
    },
    nextTick: (fn) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn());
        });
      });
    },
    chunkForSymbol(symbolName, _chunk, parent) {
      return mapperFn(symbolName, mapper, parent);
    }
  };
  return serverPlatform;
}
async function setServerPlatform(opts, manifest2) {
  const platform = createPlatform(opts, manifest2);
  setPlatform(platform);
}
var getSymbolHash = (symbolName) => {
  const index = symbolName.lastIndexOf("_");
  if (index > -1) {
    return symbolName.slice(index + 1);
  }
  return symbolName;
};
var QInstance = "q:instance";
function getValidManifest(manifest2) {
  if (manifest2 != null && manifest2.mapping != null && typeof manifest2.mapping === "object" && manifest2.symbols != null && typeof manifest2.symbols === "object" && manifest2.bundles != null && typeof manifest2.bundles === "object") {
    return manifest2;
  }
  return void 0;
}
function workerFetchScript() {
  const fetch2 = `Promise.all(e.data.map(u=>fetch(u))).finally(()=>{setTimeout(postMessage({}),9999)})`;
  const workerBody = `onmessage=(e)=>{${fetch2}}`;
  const blob = `new Blob(['${workerBody}'],{type:"text/javascript"})`;
  const url = `URL.createObjectURL(${blob})`;
  let s = `const w=new Worker(${url});`;
  s += `w.postMessage(u.map(u=>new URL(u,origin)+''));`;
  s += `w.onmessage=()=>{w.terminate()};`;
  return s;
}
function prefetchUrlsEventScript(base, prefetchResources) {
  const data = {
    bundles: flattenPrefetchResources(prefetchResources).map((u) => u.split("/").pop())
  };
  const args = JSON.stringify(["prefetch", base, ...data.bundles]);
  return `document.dispatchEvent(new CustomEvent("qprefetch",{detail:${JSON.stringify(data)}}));
          (window.qwikPrefetchSW||(window.qwikPrefetchSW=[])).push(${args});`;
}
function flattenPrefetchResources(prefetchResources) {
  const urls = [];
  const addPrefetchResource = (prefetchResources2) => {
    if (Array.isArray(prefetchResources2)) {
      for (const prefetchResource of prefetchResources2) {
        if (!urls.includes(prefetchResource.url)) {
          urls.push(prefetchResource.url);
          addPrefetchResource(prefetchResource.imports);
        }
      }
    }
  };
  addPrefetchResource(prefetchResources);
  return urls;
}
function getMostReferenced(prefetchResources) {
  const common = /* @__PURE__ */ new Map();
  let total = 0;
  const addPrefetchResource = (prefetchResources2, visited2) => {
    if (Array.isArray(prefetchResources2)) {
      for (const prefetchResource of prefetchResources2) {
        const count = common.get(prefetchResource.url) || 0;
        common.set(prefetchResource.url, count + 1);
        total++;
        if (!visited2.has(prefetchResource.url)) {
          visited2.add(prefetchResource.url);
          addPrefetchResource(prefetchResource.imports, visited2);
        }
      }
    }
  };
  const visited = /* @__PURE__ */ new Set();
  for (const resource of prefetchResources) {
    visited.clear();
    addPrefetchResource(resource.imports, visited);
  }
  const threshold = total / common.size * 2;
  const urls = Array.from(common.entries());
  urls.sort((a, b) => b[1] - a[1]);
  return urls.slice(0, 5).filter((e) => e[1] > threshold).map((e) => e[0]);
}
function applyPrefetchImplementation(base, prefetchStrategy, prefetchResources, nonce) {
  const prefetchImpl = normalizePrefetchImplementation(prefetchStrategy == null ? void 0 : prefetchStrategy.implementation);
  const prefetchNodes = [];
  if (prefetchImpl.prefetchEvent === "always") {
    prefetchUrlsEvent(base, prefetchNodes, prefetchResources, nonce);
  }
  if (prefetchImpl.linkInsert === "html-append") {
    linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl);
  }
  if (prefetchImpl.linkInsert === "js-append") {
    linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl, nonce);
  } else if (prefetchImpl.workerFetchInsert === "always") {
    workerFetchImplementation(prefetchNodes, prefetchResources, nonce);
  }
  if (prefetchNodes.length > 0) {
    return jsx(Fragment, { children: prefetchNodes });
  }
  return null;
}
function prefetchUrlsEvent(base, prefetchNodes, prefetchResources, nonce) {
  const mostReferenced = getMostReferenced(prefetchResources);
  for (const url of mostReferenced) {
    prefetchNodes.push(
      jsx("link", {
        rel: "modulepreload",
        href: url,
        nonce
      })
    );
  }
  prefetchNodes.push(
    jsx("script", {
      "q:type": "prefetch-bundles",
      dangerouslySetInnerHTML: prefetchUrlsEventScript(base, prefetchResources) + `document.dispatchEvent(new CustomEvent('qprefetch', {detail:{links: [location.pathname]}}))`,
      nonce
    })
  );
}
function linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl) {
  const urls = flattenPrefetchResources(prefetchResources);
  const rel = prefetchImpl.linkRel || "prefetch";
  const priority = prefetchImpl.linkFetchPriority;
  for (const url of urls) {
    const attributes = {};
    attributes["href"] = url;
    attributes["rel"] = rel;
    if (priority) {
      attributes["fetchpriority"] = priority;
    }
    if (rel === "prefetch" || rel === "preload") {
      if (url.endsWith(".js")) {
        attributes["as"] = "script";
      }
    }
    prefetchNodes.push(jsx("link", attributes));
  }
}
function linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl, nonce) {
  const rel = prefetchImpl.linkRel || "prefetch";
  const priority = prefetchImpl.linkFetchPriority;
  let s = ``;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `let supportsLinkRel = true;`;
  }
  s += `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += `u.map((u,i)=>{`;
  s += `const l=document.createElement('link');`;
  s += `l.setAttribute("href",u);`;
  s += `l.setAttribute("rel","${rel}");`;
  if (priority) {
    s += `l.setAttribute("fetchpriority","${priority}");`;
  }
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(i===0){`;
    s += `try{`;
    s += `supportsLinkRel=l.relList.supports("${rel}");`;
    s += `}catch(e){}`;
    s += `}`;
  }
  s += `document.body.appendChild(l);`;
  s += `});`;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(!supportsLinkRel){`;
    s += workerFetchScript();
    s += `}`;
  }
  if (prefetchImpl.workerFetchInsert === "always") {
    s += workerFetchScript();
  }
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      "q:type": "link-js",
      dangerouslySetInnerHTML: s,
      nonce
    })
  );
}
function workerFetchImplementation(prefetchNodes, prefetchResources, nonce) {
  let s = `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += workerFetchScript();
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      "q:type": "prefetch-worker",
      dangerouslySetInnerHTML: s,
      nonce
    })
  );
}
function normalizePrefetchImplementation(input) {
  return { ...PrefetchImplementationDefault, ...input };
}
var PrefetchImplementationDefault = {
  linkInsert: null,
  linkRel: null,
  linkFetchPriority: null,
  workerFetchInsert: null,
  prefetchEvent: "always"
};
function createTimer() {
  if (typeof performance === "undefined") {
    return () => 0;
  }
  const start = performance.now();
  return () => {
    const end = performance.now();
    const delta = end - start;
    return delta / 1e6;
  };
}
function getBuildBase(opts) {
  let base = opts.base;
  if (typeof opts.base === "function") {
    base = opts.base(opts);
  }
  if (typeof base === "string") {
    if (!base.endsWith("/")) {
      base += "/";
    }
    return base;
  }
  return `${"/"}build/`;
}
function getPrefetchResources(snapshotResult, opts, resolvedManifest) {
  if (!resolvedManifest) {
    return [];
  }
  const prefetchStrategy = opts.prefetchStrategy;
  const buildBase = getBuildBase(opts);
  if (prefetchStrategy !== null) {
    if (!prefetchStrategy || !prefetchStrategy.symbolsToPrefetch || prefetchStrategy.symbolsToPrefetch === "auto") {
      return getAutoPrefetch(snapshotResult, resolvedManifest, buildBase);
    }
    if (typeof prefetchStrategy.symbolsToPrefetch === "function") {
      try {
        return prefetchStrategy.symbolsToPrefetch({ manifest: resolvedManifest.manifest });
      } catch (e) {
        console.error("getPrefetchUrls, symbolsToPrefetch()", e);
      }
    }
  }
  return [];
}
function getAutoPrefetch(snapshotResult, resolvedManifest, buildBase) {
  const prefetchResources = [];
  const qrls = snapshotResult == null ? void 0 : snapshotResult.qrls;
  const { mapper, manifest: manifest2 } = resolvedManifest;
  const urls = /* @__PURE__ */ new Map();
  if (Array.isArray(qrls)) {
    for (const qrl of qrls) {
      const qrlSymbolName = qrl.getHash();
      const resolvedSymbol = mapper[qrlSymbolName];
      if (resolvedSymbol) {
        const bundleFileName = resolvedSymbol[1];
        addBundle(manifest2, urls, prefetchResources, buildBase, bundleFileName);
      }
    }
  }
  return prefetchResources;
}
function addBundle(manifest2, urls, prefetchResources, buildBase, bundleFileName) {
  const url = buildBase + bundleFileName;
  let prefetchResource = urls.get(url);
  if (!prefetchResource) {
    prefetchResource = {
      url,
      imports: []
    };
    urls.set(url, prefetchResource);
    const bundle = manifest2.bundles[bundleFileName];
    if (bundle) {
      if (Array.isArray(bundle.imports)) {
        for (const importedFilename of bundle.imports) {
          addBundle(manifest2, urls, prefetchResource.imports, buildBase, importedFilename);
        }
      }
    }
  }
  prefetchResources.push(prefetchResource);
}
var QWIK_LOADER_DEFAULT_MINIFIED = '(()=>{var e=Object.defineProperty,t=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,r=Object.prototype.propertyIsEnumerable,n=(t,o,r)=>o in t?e(t,o,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[o]=r,s=(e,s)=>{for(var a in s||(s={}))o.call(s,a)&&n(e,a,s[a]);if(t)for(var a of t(s))r.call(s,a)&&n(e,a,s[a]);return e};((e,t)=>{const o="__q_context__",r=window,n=new Set,a=new Set([e]),i="replace",c="forEach",l="target",f="getAttribute",p="isConnected",b="qvisible",u="_qwikjson_",y=(e,t)=>Array.from(e.querySelectorAll(t)),h=e=>{const t=[];return a.forEach((o=>t.push(...y(o,e)))),t},d=e=>{S(e),y(e,"[q\\\\:shadowroot]").forEach((e=>{const t=e.shadowRoot;t&&d(t)}))},m=e=>e&&"function"==typeof e.then,w=(e,t,o=t.type)=>{h("[on"+e+"\\\\:"+o+"]")[c]((r=>g(r,e,t,o)))},q=t=>{if(void 0===t[u]){let o=(t===e.documentElement?e.body:t).lastElementChild;for(;o;){if("SCRIPT"===o.tagName&&"qwik/json"===o[f]("type")){t[u]=JSON.parse(o.textContent[i](/\\\\x3C(\\/?script)/gi,"<$1"));break}o=o.previousElementSibling}}},v=(e,t)=>new CustomEvent(e,{detail:t}),g=async(t,r,n,a=n.type)=>{const c="on"+r+":"+a;t.hasAttribute("preventdefault:"+a)&&n.preventDefault(),t.hasAttribute("stoppropagation:"+a)&&n.stopPropagation();const l=t._qc_,b=l&&l.li.filter((e=>e[0]===c));if(b&&b.length>0){for(const e of b){const o=e[1].getFn([t,n],(()=>t[p]))(n,t),r=n.cancelBubble;m(o)&&await o,r&&n.stopPropagation()}return}const u=t[f](c);if(u){const r=t.closest("[q\\\\:container]"),a=r[f]("q:base"),c=r[f]("q:version")||"unknown",l=r[f]("q:manifest-hash")||"dev",b=new URL(a,e.baseURI);for(const f of u.split("\\n")){const u=new URL(f,b),y=u.href,h=u.hash[i](/^#?([^?[|]*).*$/,"$1")||"default",d=performance.now();let w,v,g;const A=f.startsWith("#"),_={qBase:a,qManifest:l,qVersion:c,href:y,symbol:h,element:t,reqTime:d};if(A){const t=r.getAttribute("q:instance");w=(e["qFuncs_"+t]||[])[Number.parseInt(h)],w||(v="sync",g=Error("sync handler error for symbol: "+h))}else{const e=u.href.split("#")[0];try{const t=import(e);q(r),w=(await t)[h],w||(v="no-symbol",g=Error(`${h} not in ${e}`))}catch(e){v||(v="async"),g=e}}if(!w){E("qerror",s({importError:v,error:g},_)),console.error(g);break}const k=e[o];if(t[p])try{e[o]=[t,n,u],A||E("qsymbol",s({},_));const r=w(n,t);m(r)&&await r}catch(e){E("qerror",s({error:e},_))}finally{e[o]=k}}}},E=(t,o)=>{e.dispatchEvent(v(t,o))},A=e=>e[i](/([A-Z])/g,(e=>"-"+e.toLowerCase())),_=async e=>{let t=A(e.type),o=e[l];for(w("-document",e,t);o&&o[f];){const r=g(o,"",e,t);let n=e.cancelBubble;m(r)&&await r,n=n||e.cancelBubble||o.hasAttribute("stoppropagation:"+e.type),o=e.bubbles&&!0!==n?o.parentElement:null}},k=e=>{w("-window",e,A(e.type))},C=()=>{var o;const s=e.readyState;if(!t&&("interactive"==s||"complete"==s)&&(a.forEach(d),t=1,E("qinit"),(null!=(o=r.requestIdleCallback)?o:r.setTimeout).bind(r)((()=>E("qidle"))),n.has(b))){const e=h("[on\\\\:"+b+"]"),t=new IntersectionObserver((e=>{for(const o of e)o.isIntersecting&&(t.unobserve(o[l]),g(o[l],"",v(b,o)))}));e[c]((e=>t.observe(e)))}},O=(e,t,o,r=!1)=>e.addEventListener(t,o,{capture:r,passive:!1}),S=(...e)=>{for(const t of e)"string"==typeof t?n.has(t)||(a.forEach((e=>O(e,t,_,!0))),O(r,t,k,!0),n.add(t)):a.has(t)||(n.forEach((e=>O(t,e,_,!0))),a.add(t))};if(!(o in e)){e[o]=0;const t=r.qwikevents;Array.isArray(t)&&S(...t),r.qwikevents={events:n,roots:a,push:S},O(e,"readystatechange",C),C()}})(document)})()';
var QWIK_LOADER_DEFAULT_DEBUG = '(() => {\n    var __defProp = Object.defineProperty;\n    var __getOwnPropSymbols = Object.getOwnPropertySymbols;\n    var __hasOwnProp = Object.prototype.hasOwnProperty;\n    var __propIsEnum = Object.prototype.propertyIsEnumerable;\n    var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {\n        enumerable: !0,\n        configurable: !0,\n        writable: !0,\n        value: value\n    }) : obj[key] = value;\n    var __spreadValues = (a, b) => {\n        for (var prop in b || (b = {})) {\n            __hasOwnProp.call(b, prop) && __defNormalProp(a, prop, b[prop]);\n        }\n        if (__getOwnPropSymbols) {\n            for (var prop of __getOwnPropSymbols(b)) {\n                __propIsEnum.call(b, prop) && __defNormalProp(a, prop, b[prop]);\n            }\n        }\n        return a;\n    };\n    ((doc, hasInitialized) => {\n        const Q_CONTEXT = "__q_context__";\n        const win = window;\n        const events =  new Set;\n        const roots =  new Set([ doc ]);\n        const nativeQuerySelectorAll = (root, selector) => Array.from(root.querySelectorAll(selector));\n        const querySelectorAll = query => {\n            const elements = [];\n            roots.forEach((root => elements.push(...nativeQuerySelectorAll(root, query))));\n            return elements;\n        };\n        const findShadowRoots = fragment => {\n            processEventOrNode(fragment);\n            nativeQuerySelectorAll(fragment, "[q\\\\:shadowroot]").forEach((parent => {\n                const shadowRoot = parent.shadowRoot;\n                shadowRoot && findShadowRoots(shadowRoot);\n            }));\n        };\n        const isPromise = promise => promise && "function" == typeof promise.then;\n        const broadcast = (infix, ev, type = ev.type) => {\n            querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((el => dispatch(el, infix, ev, type)));\n        };\n        const resolveContainer = containerEl => {\n            if (void 0 === containerEl._qwikjson_) {\n                let script = (containerEl === doc.documentElement ? doc.body : containerEl).lastElementChild;\n                while (script) {\n                    if ("SCRIPT" === script.tagName && "qwik/json" === script.getAttribute("type")) {\n                        containerEl._qwikjson_ = JSON.parse(script.textContent.replace(/\\\\x3C(\\/?script)/gi, "<$1"));\n                        break;\n                    }\n                    script = script.previousElementSibling;\n                }\n            }\n        };\n        const createEvent = (eventName, detail) => new CustomEvent(eventName, {\n            detail: detail\n        });\n        const dispatch = async (element, onPrefix, ev, eventName = ev.type) => {\n            const attrName = "on" + onPrefix + ":" + eventName;\n            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();\n            element.hasAttribute("stoppropagation:" + eventName) && ev.stopPropagation();\n            const ctx = element._qc_;\n            const relevantListeners = ctx && ctx.li.filter((li => li[0] === attrName));\n            if (relevantListeners && relevantListeners.length > 0) {\n                for (const listener of relevantListeners) {\n                    const results = listener[1].getFn([ element, ev ], (() => element.isConnected))(ev, element);\n                    const cancelBubble = ev.cancelBubble;\n                    isPromise(results) && await results;\n                    cancelBubble && ev.stopPropagation();\n                }\n                return;\n            }\n            const attrValue = element.getAttribute(attrName);\n            if (attrValue) {\n                const container = element.closest("[q\\\\:container]");\n                const qBase = container.getAttribute("q:base");\n                const qVersion = container.getAttribute("q:version") || "unknown";\n                const qManifest = container.getAttribute("q:manifest-hash") || "dev";\n                const base = new URL(qBase, doc.baseURI);\n                for (const qrl of attrValue.split("\\n")) {\n                    const url = new URL(qrl, base);\n                    const href = url.href;\n                    const symbol = url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";\n                    const reqTime = performance.now();\n                    let handler;\n                    let importError;\n                    let error;\n                    const isSync = qrl.startsWith("#");\n                    const eventData = {\n                        qBase: qBase,\n                        qManifest: qManifest,\n                        qVersion: qVersion,\n                        href: href,\n                        symbol: symbol,\n                        element: element,\n                        reqTime: reqTime\n                    };\n                    if (isSync) {\n                        const hash = container.getAttribute("q:instance");\n                        handler = (doc["qFuncs_" + hash] || [])[Number.parseInt(symbol)];\n                        if (!handler) {\n                            importError = "sync";\n                            error = new Error("sync handler error for symbol: " + symbol);\n                        }\n                    } else {\n                        const uri = url.href.split("#")[0];\n                        try {\n                            const module = import(\n                                                        uri);\n                            resolveContainer(container);\n                            handler = (await module)[symbol];\n                            if (!handler) {\n                                importError = "no-symbol";\n                                error = new Error(`${symbol} not in ${uri}`);\n                            }\n                        } catch (err) {\n                            importError || (importError = "async");\n                            error = err;\n                        }\n                    }\n                    if (!handler) {\n                        emitEvent("qerror", __spreadValues({\n                            importError: importError,\n                            error: error\n                        }, eventData));\n                        console.error(error);\n                        break;\n                    }\n                    const previousCtx = doc[Q_CONTEXT];\n                    if (element.isConnected) {\n                        try {\n                            doc[Q_CONTEXT] = [ element, ev, url ];\n                            isSync || emitEvent("qsymbol", __spreadValues({}, eventData));\n                            const results = handler(ev, element);\n                            isPromise(results) && await results;\n                        } catch (error2) {\n                            emitEvent("qerror", __spreadValues({\n                                error: error2\n                            }, eventData));\n                        } finally {\n                            doc[Q_CONTEXT] = previousCtx;\n                        }\n                    }\n                }\n            }\n        };\n        const emitEvent = (eventName, detail) => {\n            doc.dispatchEvent(createEvent(eventName, detail));\n        };\n        const camelToKebab = str => str.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));\n        const processDocumentEvent = async ev => {\n            let type = camelToKebab(ev.type);\n            let element = ev.target;\n            broadcast("-document", ev, type);\n            while (element && element.getAttribute) {\n                const results = dispatch(element, "", ev, type);\n                let cancelBubble = ev.cancelBubble;\n                isPromise(results) && await results;\n                cancelBubble = cancelBubble || ev.cancelBubble || element.hasAttribute("stoppropagation:" + ev.type);\n                element = ev.bubbles && !0 !== cancelBubble ? element.parentElement : null;\n            }\n        };\n        const processWindowEvent = ev => {\n            broadcast("-window", ev, camelToKebab(ev.type));\n        };\n        const processReadyStateChange = () => {\n            var _a;\n            const readyState = doc.readyState;\n            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {\n                roots.forEach(findShadowRoots);\n                hasInitialized = 1;\n                emitEvent("qinit");\n                (null != (_a = win.requestIdleCallback) ? _a : win.setTimeout).bind(win)((() => emitEvent("qidle")));\n                if (events.has("qvisible")) {\n                    const results = querySelectorAll("[on\\\\:qvisible]");\n                    const observer = new IntersectionObserver((entries => {\n                        for (const entry of entries) {\n                            if (entry.isIntersecting) {\n                                observer.unobserve(entry.target);\n                                dispatch(entry.target, "", createEvent("qvisible", entry));\n                            }\n                        }\n                    }));\n                    results.forEach((el => observer.observe(el)));\n                }\n            }\n        };\n        const addEventListener = (el, eventName, handler, capture = !1) => el.addEventListener(eventName, handler, {\n            capture: capture,\n            passive: !1\n        });\n        const processEventOrNode = (...eventNames) => {\n            for (const eventNameOrNode of eventNames) {\n                if ("string" == typeof eventNameOrNode) {\n                    if (!events.has(eventNameOrNode)) {\n                        roots.forEach((root => addEventListener(root, eventNameOrNode, processDocumentEvent, !0)));\n                        addEventListener(win, eventNameOrNode, processWindowEvent, !0);\n                        events.add(eventNameOrNode);\n                    }\n                } else if (!roots.has(eventNameOrNode)) {\n                    events.forEach((eventName => addEventListener(eventNameOrNode, eventName, processDocumentEvent, !0)));\n                    roots.add(eventNameOrNode);\n                }\n            }\n        };\n        if (!(Q_CONTEXT in doc)) {\n            doc[Q_CONTEXT] = 0;\n            const qwikevents = win.qwikevents;\n            Array.isArray(qwikevents) && processEventOrNode(...qwikevents);\n            win.qwikevents = {\n                events: events,\n                roots: roots,\n                push: processEventOrNode\n            };\n            addEventListener(doc, "readystatechange", processReadyStateChange);\n            processReadyStateChange();\n        }\n    })(document);\n})()';
function getQwikLoaderScript(opts = {}) {
  return opts.debug ? QWIK_LOADER_DEFAULT_DEBUG : QWIK_LOADER_DEFAULT_MINIFIED;
}
var DOCTYPE = "<!DOCTYPE html>";
async function renderToStream(rootNode, opts) {
  var _a, _b, _c;
  let stream = opts.stream;
  let bufferSize = 0;
  let totalSize = 0;
  let networkFlushes = 0;
  let firstFlushTime = 0;
  let buffer = "";
  let snapshotResult;
  const inOrderStreaming = ((_a = opts.streaming) == null ? void 0 : _a.inOrder) ?? {
    strategy: "auto",
    maximunInitialChunk: 5e4,
    maximunChunk: 3e4
  };
  const containerTagName = opts.containerTagName ?? "html";
  const containerAttributes = opts.containerAttributes ?? {};
  const nativeStream = stream;
  const firstFlushTimer = createTimer();
  const buildBase = getBuildBase(opts);
  const resolvedManifest = resolveManifest(opts.manifest);
  function flush() {
    if (buffer) {
      nativeStream.write(buffer);
      buffer = "";
      bufferSize = 0;
      networkFlushes++;
      if (networkFlushes === 1) {
        firstFlushTime = firstFlushTimer();
      }
    }
  }
  function enqueue(chunk) {
    const len = chunk.length;
    bufferSize += len;
    totalSize += len;
    buffer += chunk;
  }
  switch (inOrderStreaming.strategy) {
    case "disabled":
      stream = {
        write: enqueue
      };
      break;
    case "direct":
      stream = nativeStream;
      break;
    case "auto":
      let count = 0;
      let forceFlush = false;
      const minimunChunkSize = inOrderStreaming.maximunChunk ?? 0;
      const initialChunkSize = inOrderStreaming.maximunInitialChunk ?? 0;
      stream = {
        write(chunk) {
          if (chunk === "<!--qkssr-f-->") {
            forceFlush || (forceFlush = true);
          } else if (chunk === "<!--qkssr-pu-->") {
            count++;
          } else if (chunk === "<!--qkssr-po-->") {
            count--;
          } else {
            enqueue(chunk);
          }
          const chunkSize = networkFlushes === 0 ? initialChunkSize : minimunChunkSize;
          if (count === 0 && (forceFlush || bufferSize >= chunkSize)) {
            forceFlush = false;
            flush();
          }
        }
      };
      break;
  }
  if (containerTagName === "html") {
    stream.write(DOCTYPE);
  } else {
    stream.write("<!--cq-->");
    if (opts.qwikLoader) {
      if (opts.qwikLoader.include === void 0) {
        opts.qwikLoader.include = "never";
      }
      if (opts.qwikLoader.position === void 0) {
        opts.qwikLoader.position = "bottom";
      }
    } else {
      opts.qwikLoader = {
        include: "never"
      };
    }
    if (!opts.qwikPrefetchServiceWorker) {
      opts.qwikPrefetchServiceWorker = {};
    }
    if (!opts.qwikPrefetchServiceWorker.include) {
      opts.qwikPrefetchServiceWorker.include = false;
    }
    if (!opts.qwikPrefetchServiceWorker.position) {
      opts.qwikPrefetchServiceWorker.position = "top";
    }
  }
  if (!opts.manifest) {
    console.warn(
      `Missing client manifest, loading symbols in the client might 404. Please ensure the client build has run and generated the manifest for the server build.`
    );
  }
  await setServerPlatform(opts, resolvedManifest);
  const injections = resolvedManifest == null ? void 0 : resolvedManifest.manifest.injections;
  const beforeContent = injections ? injections.map((injection) => jsx(injection.tag, injection.attributes ?? {})) : [];
  const includeMode = ((_b = opts.qwikLoader) == null ? void 0 : _b.include) ?? "auto";
  const positionMode = ((_c = opts.qwikLoader) == null ? void 0 : _c.position) ?? "bottom";
  if (positionMode === "top" && includeMode !== "never") {
    const qwikLoaderScript = getQwikLoaderScript({
      debug: opts.debug
    });
    beforeContent.push(
      jsx("script", {
        id: "qwikloader",
        dangerouslySetInnerHTML: qwikLoaderScript
      })
    );
    beforeContent.push(
      jsx("script", {
        dangerouslySetInnerHTML: `window.qwikevents.push('click')`
      })
    );
  }
  const renderTimer = createTimer();
  const renderSymbols = [];
  let renderTime = 0;
  let snapshotTime = 0;
  await _renderSSR(rootNode, {
    stream,
    containerTagName,
    containerAttributes,
    serverData: opts.serverData,
    base: buildBase,
    beforeContent,
    beforeClose: async (contexts, containerState, _dynamic, textNodes) => {
      var _a2, _b2, _c2, _d, _e;
      renderTime = renderTimer();
      const snapshotTimer = createTimer();
      snapshotResult = await _pauseFromContexts(contexts, containerState, void 0, textNodes);
      const children = [];
      if (opts.prefetchStrategy !== null) {
        const prefetchResources = getPrefetchResources(snapshotResult, opts, resolvedManifest);
        const base = containerAttributes["q:base"];
        if (prefetchResources.length > 0) {
          const prefetchImpl = applyPrefetchImplementation(
            base,
            opts.prefetchStrategy,
            prefetchResources,
            (_a2 = opts.serverData) == null ? void 0 : _a2.nonce
          );
          if (prefetchImpl) {
            children.push(prefetchImpl);
          }
        }
      }
      const jsonData = JSON.stringify(snapshotResult.state, void 0, void 0);
      children.push(
        jsx("script", {
          type: "qwik/json",
          dangerouslySetInnerHTML: escapeText(jsonData),
          nonce: (_b2 = opts.serverData) == null ? void 0 : _b2.nonce
        })
      );
      if (snapshotResult.funcs.length > 0) {
        const hash2 = containerAttributes[QInstance];
        children.push(
          jsx("script", {
            "q:func": "qwik/json",
            dangerouslySetInnerHTML: serializeFunctions(hash2, snapshotResult.funcs),
            nonce: (_c2 = opts.serverData) == null ? void 0 : _c2.nonce
          })
        );
      }
      const needLoader = !snapshotResult || snapshotResult.mode !== "static";
      const includeLoader = includeMode === "always" || includeMode === "auto" && needLoader;
      if (includeLoader) {
        const qwikLoaderScript = getQwikLoaderScript({
          debug: opts.debug
        });
        children.push(
          jsx("script", {
            id: "qwikloader",
            dangerouslySetInnerHTML: qwikLoaderScript,
            nonce: (_d = opts.serverData) == null ? void 0 : _d.nonce
          })
        );
      }
      const extraListeners = Array.from(containerState.$events$, (s) => JSON.stringify(s));
      if (extraListeners.length > 0) {
        const content = (includeLoader ? `window.qwikevents` : `(window.qwikevents||=[])`) + `.push(${extraListeners.join(", ")})`;
        children.push(
          jsx("script", {
            dangerouslySetInnerHTML: content,
            nonce: (_e = opts.serverData) == null ? void 0 : _e.nonce
          })
        );
      }
      collectRenderSymbols(renderSymbols, contexts);
      snapshotTime = snapshotTimer();
      return jsx(Fragment, { children });
    },
    manifestHash: (resolvedManifest == null ? void 0 : resolvedManifest.manifest.manifestHash) || "dev" + hash()
  });
  if (containerTagName !== "html") {
    stream.write("<!--/cq-->");
  }
  flush();
  const isDynamic = snapshotResult.resources.some((r) => r._cache !== Infinity);
  const result = {
    prefetchResources: void 0,
    snapshotResult,
    flushes: networkFlushes,
    manifest: resolvedManifest == null ? void 0 : resolvedManifest.manifest,
    size: totalSize,
    isStatic: !isDynamic,
    timing: {
      render: renderTime,
      snapshot: snapshotTime,
      firstFlush: firstFlushTime
    },
    _symbols: renderSymbols
  };
  return result;
}
function hash() {
  return Math.random().toString(36).slice(2);
}
function resolveManifest(manifest2) {
  if (!manifest2) {
    return void 0;
  }
  if ("mapper" in manifest2) {
    return manifest2;
  }
  manifest2 = getValidManifest(manifest2);
  if (manifest2) {
    const mapper = {};
    Object.entries(manifest2.mapping).forEach(([symbol, bundleFilename]) => {
      mapper[getSymbolHash(symbol)] = [symbol, bundleFilename];
    });
    return {
      mapper,
      manifest: manifest2
    };
  }
  return void 0;
}
var escapeText = (str) => {
  return str.replace(/<(\/?script)/gi, "\\x3C$1");
};
function collectRenderSymbols(renderSymbols, elements) {
  var _a;
  for (const ctx of elements) {
    const symbol = (_a = ctx.$componentQrl$) == null ? void 0 : _a.getSymbol();
    if (symbol && !renderSymbols.includes(symbol)) {
      renderSymbols.push(symbol);
    }
  }
}
var Q_FUNCS_PREFIX = 'document["qFuncs_HASH"]=';
function serializeFunctions(hash2, funcs) {
  return Q_FUNCS_PREFIX.replace("HASH", hash2) + `[${funcs.join(",\n")}]`;
}
async function setServerPlatform2(manifest2) {
  const platform = createPlatform({}, resolveManifest(manifest2));
  setPlatform(platform);
}
const manifest = { "manifestHash": "hdm0gc", "symbols": { "s_Ysfvd0zsHZc": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_QwikCityProvider_component_useTask", "canonicalFilename": "index.qwik.mjs_QwikCityProvider_component_useTask_Ysfvd0zsHZc", "hash": "Ysfvd0zsHZc", "ctxKind": "function", "ctxName": "useTask$", "captures": true, "parent": "s_p1yCGpFL1xE", "loc": [28920, 38296] }, "s_26Zk9LevwR4": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_usePreventNavigateQrl_useVisibleTask", "canonicalFilename": "index.qwik.mjs_usePreventNavigateQrl_useVisibleTask_26Zk9LevwR4", "hash": "26Zk9LevwR4", "ctxKind": "function", "ctxName": "useVisibleTask$", "captures": true, "parent": null, "loc": [22667, 22695] }, "s_0vphQYqOdZI": { "origin": "components/router-head/router-head.tsx", "displayName": "router-head.tsx_RouterHead_component", "canonicalFilename": "router-head.tsx_RouterHead_component_0vphQYqOdZI", "hash": "0vphQYqOdZI", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [243, 1201] }, "s_1raneLGffO8": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_Link_component", "canonicalFilename": "index.qwik.mjs_Link_component_1raneLGffO8", "hash": "1raneLGffO8", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [39776, 42066] }, "s_B0lqk5IDDy4": { "origin": "routes/index.tsx", "displayName": "index.tsx_routes_component", "canonicalFilename": "index.tsx_routes_component_B0lqk5IDDy4", "hash": "B0lqk5IDDy4", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [134, 311] }, "s_MiPVFWJLcMo": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_QwikCityMockProvider_component", "canonicalFilename": "index.qwik.mjs_QwikCityMockProvider_component_MiPVFWJLcMo", "hash": "MiPVFWJLcMo", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [38544, 39749] }, "s_ScE8eseirUA": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_RouterOutlet_component", "canonicalFilename": "index.qwik.mjs_RouterOutlet_component_ScE8eseirUA", "hash": "ScE8eseirUA", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [7013, 8167] }, "s_VKFlAWJuVm8": { "origin": "routes/layout.tsx", "displayName": "layout.tsx_layout_component", "canonicalFilename": "layout.tsx_layout_component_VKFlAWJuVm8", "hash": "VKFlAWJuVm8", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [582, 610] }, "s_p1yCGpFL1xE": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_QwikCityProvider_component", "canonicalFilename": "index.qwik.mjs_QwikCityProvider_component_p1yCGpFL1xE", "hash": "p1yCGpFL1xE", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [24103, 38342] }, "s_pWsmcogutG8": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_GetForm_component", "canonicalFilename": "index.qwik.mjs_GetForm_component_pWsmcogutG8", "hash": "pWsmcogutG8", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [58619, 59772] }, "s_tntnak2DhJ8": { "origin": "root.tsx", "displayName": "root.tsx_root_component", "canonicalFilename": "root.tsx_root_component_tntnak2DhJ8", "hash": "tntnak2DhJ8", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null, "loc": [310, 943] }, "s_K4gvalEGCME": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_QwikCityProvider_component_useStyles", "canonicalFilename": "index.qwik.mjs_QwikCityProvider_component_useStyles_K4gvalEGCME", "hash": "K4gvalEGCME", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_p1yCGpFL1xE", "loc": [24129, 24163] }, "s_9KRx0IOCHt8": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_spaInit_event", "canonicalFilename": "index.qwik.mjs_spaInit_event_9KRx0IOCHt8", "hash": "9KRx0IOCHt8", "ctxKind": "function", "ctxName": "event$", "captures": false, "parent": null, "loc": [1315, 6978] }, "s_A5SCimyrjAE": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_Form_form_onSubmit", "canonicalFilename": "index.qwik.mjs_Form_form_onSubmit_A5SCimyrjAE", "hash": "A5SCimyrjAE", "ctxKind": "function", "ctxName": "$", "captures": true, "parent": null, "loc": [57750, 57864] }, "s_N26RLdG0oBg": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_routeActionQrl_action_submit", "canonicalFilename": "index.qwik.mjs_routeActionQrl_action_submit_N26RLdG0oBg", "hash": "N26RLdG0oBg", "ctxKind": "function", "ctxName": "$", "captures": true, "parent": null, "loc": [44769, 46414] }, "s_WfTOxT4IrdA": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_serverQrl_rpc", "canonicalFilename": "index.qwik.mjs_serverQrl_rpc_WfTOxT4IrdA", "hash": "WfTOxT4IrdA", "ctxKind": "function", "ctxName": "$", "captures": true, "parent": null, "loc": [52847, 55821] }, "s_FdQ8zERN4uM": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_Link_component_handleClick", "canonicalFilename": "index.qwik.mjs_Link_component_handleClick_FdQ8zERN4uM", "hash": "FdQ8zERN4uM", "ctxKind": "function", "ctxName": "$", "captures": true, "parent": "s_1raneLGffO8", "loc": [41087, 41513] }, "s_PmWjL2RrvZM": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_QwikCityMockProvider_component_goto", "canonicalFilename": "index.qwik.mjs_QwikCityMockProvider_component_goto_PmWjL2RrvZM", "hash": "PmWjL2RrvZM", "ctxKind": "function", "ctxName": "$", "captures": false, "parent": "s_MiPVFWJLcMo", "loc": [38934, 39012] }, "s_aww2BzpANGM": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_QwikCityProvider_component_goto", "canonicalFilename": "index.qwik.mjs_QwikCityProvider_component_goto_aww2BzpANGM", "hash": "aww2BzpANGM", "ctxKind": "function", "ctxName": "$", "captures": true, "parent": "s_p1yCGpFL1xE", "loc": [26317, 28391] }, "s_qGVD1Sz413o": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_QwikCityProvider_component_registerPreventNav", "canonicalFilename": "index.qwik.mjs_QwikCityProvider_component_registerPreventNav_qGVD1Sz413o", "hash": "qGVD1Sz413o", "ctxKind": "function", "ctxName": "$", "captures": false, "parent": "s_p1yCGpFL1xE", "loc": [25420, 26297] }, "s_xe8duyQ5aaU": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_GetForm_component_form_onSubmit_1", "canonicalFilename": "index.qwik.mjs_GetForm_component_form_onSubmit_1_xe8duyQ5aaU", "hash": "xe8duyQ5aaU", "ctxKind": "function", "ctxName": "$", "captures": false, "parent": "s_pWsmcogutG8", "loc": [59374, 59710] }, "s_zPJUEsxZLIA": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_Link_component_handlePrefetch", "canonicalFilename": "index.qwik.mjs_Link_component_handlePrefetch_zPJUEsxZLIA", "hash": "zPJUEsxZLIA", "ctxKind": "function", "ctxName": "$", "captures": false, "parent": "s_1raneLGffO8", "loc": [40488, 40837] }, "s_zpHcJzYZ88E": { "origin": "../node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "displayName": "index.qwik.mjs_GetForm_component_form_onSubmit", "canonicalFilename": "index.qwik.mjs_GetForm_component_form_onSubmit_zpHcJzYZ88E", "hash": "zpHcJzYZ88E", "ctxKind": "function", "ctxName": "$", "captures": true, "parent": "s_pWsmcogutG8", "loc": [58983, 59363] } }, "mapping": { "s_Ysfvd0zsHZc": "q-nbnfKuei.js", "s_26Zk9LevwR4": "q-B2hChV7v.js", "s_0vphQYqOdZI": "q-FsKK2o8Q.js", "s_1raneLGffO8": "q-CXkYYwBX.js", "s_B0lqk5IDDy4": "q-DxrJnHZn.js", "s_MiPVFWJLcMo": "q-BZMkvzB8.js", "s_ScE8eseirUA": "q-Cmiv5ziN.js", "s_VKFlAWJuVm8": "q-B0MOf1Tk.js", "s_p1yCGpFL1xE": "q-D9ArkCLr.js", "s_pWsmcogutG8": "q-hLiP_QQ9.js", "s_tntnak2DhJ8": "q-MWUKG-_7.js", "s_K4gvalEGCME": "q-CCIkjQ4Q.js", "s_9KRx0IOCHt8": "q-BRBr7aun.js", "s_A5SCimyrjAE": "q-BS4JghmY.js", "s_N26RLdG0oBg": "q-O5C7FhMB.js", "s_WfTOxT4IrdA": "q-BWn_F_Pu.js", "s_FdQ8zERN4uM": "q-C83BZWwA.js", "s_PmWjL2RrvZM": "q-BytOEhTU.js", "s_aww2BzpANGM": "q-DTJfbfKs.js", "s_qGVD1Sz413o": "q-0B0LiPa7.js", "s_xe8duyQ5aaU": "q-174He3fV.js", "s_zPJUEsxZLIA": "q-BU-d306Q.js", "s_zpHcJzYZ88E": "q-BmQH0Ibu.js" }, "bundles": { "../service-worker.js": { "size": 2808, "origins": ["node_modules/@builder.io/qwik-city/lib/service-worker.mjs", "src/routes/service-worker.ts"] }, "q-0B0LiPa7.js": { "size": 130, "isTask": true, "imports": ["q-BS4JghmY.js", "q-D9ArkCLr.js", "q-hLiP_QQ9.js"], "symbols": ["s_qGVD1Sz413o"] }, "q-174He3fV.js": { "size": 111, "isTask": true, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "symbols": ["s_xe8duyQ5aaU"] }, "q-7J3Mx7rq.js": { "size": 274, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "dynamicImports": ["q-B0MOf1Tk.js"], "origins": ["src/routes/layout.tsx"] }, "q-aIpG4piD.js": { "size": 149, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "dynamicImports": ["../service-worker.js"], "origins": ["@qwik-city-entries"] }, "q-B0MOf1Tk.js": { "size": 102, "imports": ["q-BS4JghmY.js"], "origins": ["src/routes/layout.tsx_layout_component_VKFlAWJuVm8.js"], "symbols": ["s_VKFlAWJuVm8"] }, "q-B2hChV7v.js": { "size": 152, "isTask": true, "imports": ["q-BS4JghmY.js"], "origins": ["node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_usePreventNavigateQrl_useVisibleTask_26Zk9LevwR4.js"], "symbols": ["s_26Zk9LevwR4"] }, "q-BmQH0Ibu.js": { "size": 111, "isTask": true, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "symbols": ["s_zpHcJzYZ88E"] }, "q-BRBr7aun.js": { "size": 2297, "origins": ["node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_spaInit_event_9KRx0IOCHt8.js"], "symbols": ["s_9KRx0IOCHt8"] }, "q-BS4JghmY.js": { "size": 65454, "isTask": true, "origins": ["@builder.io/qwik/build", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_Form_form_onSubmit_A5SCimyrjAE.js", "node_modules/@builder.io/qwik/dist/core.prod.mjs"], "symbols": ["s_A5SCimyrjAE"] }, "q-BU-d306Q.js": { "size": 1684, "isTask": true, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "origins": ["node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_Link_component_1raneLGffO8.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_Link_component_handleClick_FdQ8zERN4uM.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_Link_component_handlePrefetch_zPJUEsxZLIA.js"], "symbols": ["s_zPJUEsxZLIA"] }, "q-BWn_F_Pu.js": { "size": 1235, "isTask": true, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "origins": ["node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_serverQrl_rpc_WfTOxT4IrdA.js"], "symbols": ["s_WfTOxT4IrdA"] }, "q-BytOEhTU.js": { "size": 807, "isTask": true, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "origins": ["node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_QwikCityMockProvider_component_MiPVFWJLcMo.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_QwikCityMockProvider_component_goto_PmWjL2RrvZM.js"], "symbols": ["s_PmWjL2RrvZM"] }, "q-BZMkvzB8.js": { "size": 112, "imports": ["q-BS4JghmY.js", "q-BytOEhTU.js", "q-hLiP_QQ9.js"], "symbols": ["s_MiPVFWJLcMo"] }, "q-C83BZWwA.js": { "size": 135, "isTask": true, "imports": ["q-BS4JghmY.js", "q-BU-d306Q.js", "q-hLiP_QQ9.js"], "symbols": ["s_FdQ8zERN4uM"] }, "q-CBZfj--a.js": { "size": 171, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "dynamicImports": ["q-MWUKG-_7.js"], "origins": ["src/global.css", "src/root.tsx"] }, "q-CCIkjQ4Q.js": { "size": 112, "imports": ["q-BS4JghmY.js", "q-D9ArkCLr.js", "q-hLiP_QQ9.js"], "symbols": ["s_K4gvalEGCME"] }, "q-CMETQwju.js": { "size": 269, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "dynamicImports": ["q-DxrJnHZn.js"], "origins": ["src/routes/index.tsx"] }, "q-Cmiv5ziN.js": { "size": 982, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "origins": ["node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_RouterOutlet_component_ScE8eseirUA.js"], "symbols": ["s_ScE8eseirUA"] }, "q-CXkYYwBX.js": { "size": 112, "imports": ["q-BS4JghmY.js", "q-BU-d306Q.js", "q-hLiP_QQ9.js"], "symbols": ["s_1raneLGffO8"] }, "q-D9ArkCLr.js": { "size": 6912, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "dynamicImports": ["q-7J3Mx7rq.js", "q-CMETQwju.js"], "origins": ["@qwik-city-plan", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_QwikCityProvider_component_goto_aww2BzpANGM.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_QwikCityProvider_component_p1yCGpFL1xE.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_QwikCityProvider_component_registerPreventNav_qGVD1Sz413o.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_QwikCityProvider_component_useStyles_K4gvalEGCME.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_QwikCityProvider_component_useTask_Ysfvd0zsHZc.js"], "symbols": ["s_p1yCGpFL1xE"] }, "q-DTJfbfKs.js": { "size": 135, "isTask": true, "imports": ["q-BS4JghmY.js", "q-D9ArkCLr.js", "q-hLiP_QQ9.js"], "symbols": ["s_aww2BzpANGM"] }, "q-DxrJnHZn.js": { "size": 270, "imports": ["q-BS4JghmY.js"], "origins": ["src/routes/index.tsx_routes_component_B0lqk5IDDy4.js"], "symbols": ["s_B0lqk5IDDy4"] }, "q-FsKK2o8Q.js": { "size": 879, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "origins": ["src/components/router-head/router-head.tsx_RouterHead_component_0vphQYqOdZI.js"], "symbols": ["s_0vphQYqOdZI"] }, "q-hLiP_QQ9.js": { "size": 10196, "imports": ["q-BS4JghmY.js"], "dynamicImports": ["q-BRBr7aun.js", "q-Cmiv5ziN.js", "q-D9ArkCLr.js"], "origins": ["@qwik-city-sw-register", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_GetForm_component_form_onSubmit_1_xe8duyQ5aaU.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_GetForm_component_form_onSubmit_zpHcJzYZ88E.js", "node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_GetForm_component_pWsmcogutG8.js", "node_modules/zod/lib/index.mjs"], "symbols": ["s_pWsmcogutG8"] }, "q-MWUKG-_7.js": { "size": 493, "imports": ["q-BS4JghmY.js", "q-hLiP_QQ9.js"], "dynamicImports": ["q-FsKK2o8Q.js"], "origins": ["src/components/router-head/router-head.tsx", "src/root.tsx_root_component_tntnak2DhJ8.js"], "symbols": ["s_tntnak2DhJ8"] }, "q-nbnfKuei.js": { "size": 135, "isTask": true, "imports": ["q-BS4JghmY.js", "q-D9ArkCLr.js", "q-hLiP_QQ9.js"], "symbols": ["s_Ysfvd0zsHZc"] }, "q-O5C7FhMB.js": { "size": 813, "isTask": true, "imports": ["q-BS4JghmY.js"], "origins": ["node_modules/@builder.io/qwik-city/lib/index.qwik.mjs_routeActionQrl_action_submit_N26RLdG0oBg.js"], "symbols": ["s_N26RLdG0oBg"] } }, "injections": [{ "tag": "style", "location": "head", "attributes": { "data-src": "/assets/Dae-T0Io-style.css", "dangerouslySetInnerHTML": '/*! tailwindcss v4.0.14 | MIT License | https://tailwindcss.com */@layer theme{:root,:host{--font-sans:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--default-font-family:var(--font-sans);--default-font-feature-settings:var(--font-sans--font-feature-settings);--default-font-variation-settings:var(--font-sans--font-variation-settings);--default-mono-font-family:var(--font-mono);--default-mono-font-feature-settings:var(--font-mono--font-feature-settings);--default-mono-font-variation-settings:var(--font-mono--font-variation-settings)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;line-height:1.5;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-family:var(--default-font-family,ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji");font-feature-settings:normal;font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:normal;font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}body{line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-family:var(--default-mono-font-family,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace);font-feature-settings:normal;font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:normal;font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::-moz-placeholder{opacity:1;color:color-mix(in oklab,currentColor 50%,transparent)}::placeholder{opacity:1;color:color-mix(in oklab,currentColor 50%,transparent)}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){-webkit-appearance:button;-moz-appearance:button;appearance:button}::file-selector-button{-webkit-appearance:button;-moz-appearance:button;appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}}@layer components;@layer utilities{.static{position:static}.container{width:100%}@media (min-width:40rem){.container{max-width:40rem}}@media (min-width:48rem){.container{max-width:48rem}}@media (min-width:64rem){.container{max-width:64rem}}@media (min-width:80rem){.container{max-width:80rem}}@media (min-width:96rem){.container{max-width:96rem}}}\n' } }], "version": "1", "options": { "target": "client", "buildMode": "production", "entryStrategy": { "type": "smart" } }, "platform": { "qwik": "1.12.1-dev+7061ec0-20250220223946", "vite": "", "rollup": "4.36.0", "env": "node", "os": "linux", "node": "23.7.0" } };
const swRegister = '((i,r,a,o)=>{a=e=>{const t=document.querySelector("[q\\\\:base]");t&&r.active&&r.active.postMessage({type:"qprefetch",base:t.getAttribute("q:base"),...e})},document.addEventListener("qprefetch",e=>{const t=e.detail;r?a(t):i.push(t)}),"serviceWorker"in navigator?navigator.serviceWorker.register("/service-worker.js").then(e=>{o=()=>{r=e,i.forEach(a),a({bundles:i})},e.installing?e.installing.addEventListener("statechange",t=>{t.target.state=="activated"&&o()}):e.active&&o()}).catch(e=>console.error(e)):console.log("Service worker not supported in this browser.")})([])';
const RouteStateContext = /* @__PURE__ */ createContextId("qc-s");
const ContentContext = /* @__PURE__ */ createContextId("qc-c");
const ContentInternalContext = /* @__PURE__ */ createContextId("qc-ic");
const DocumentHeadContext = /* @__PURE__ */ createContextId("qc-h");
const RouteLocationContext = /* @__PURE__ */ createContextId("qc-l");
const RouteNavigateContext = /* @__PURE__ */ createContextId("qc-n");
const RouteActionContext = /* @__PURE__ */ createContextId("qc-a");
const RouteInternalContext = /* @__PURE__ */ createContextId("qc-ir");
const RoutePreventNavigateContext = /* @__PURE__ */ createContextId("qc-p");
const spaInit = eventQrl(/* @__PURE__ */ _noopQrl("s_9KRx0IOCHt8"));
const s_ScE8eseirUA = () => {
  const serverData = useServerData("containerAttributes");
  if (!serverData) throw new Error("PrefetchServiceWorker component must be rendered on the server.");
  _jsxBranch();
  const context = useContext(ContentInternalContext);
  if (context.value && context.value.length > 0) {
    const contentsLen = context.value.length;
    let cmp = null;
    for (let i = contentsLen - 1; i >= 0; i--) if (context.value[i].default) cmp = _jsxC(context.value[i].default, {
      children: cmp
    }, 1, "ni_0");
    return /* @__PURE__ */ _jsxC(Fragment, {
      children: [
        cmp,
        /* @__PURE__ */ _jsxQ("script", {
          "document:onQCInit$": spaInit,
          "document:onQInit$": _qrlSync(() => {
            ((w, h) => {
              var _a;
              if (!w._qcs && h.scrollRestoration === "manual") {
                w._qcs = true;
                const s = (_a = h.state) == null ? void 0 : _a._qCityScroll;
                if (s) w.scrollTo(s.x, s.y);
                document.dispatchEvent(new Event("qcinit"));
              }
            })(window, history);
          }, '()=>{((w,h)=>{if(!w._qcs&&h.scrollRestoration==="manual"){w._qcs=true;const s=h.state?._qCityScroll;if(s){w.scrollTo(s.x,s.y);}document.dispatchEvent(new Event("qcinit"));}})(window,history);}')
        }, null, null, 2, "ni_1")
      ]
    }, 1, "ni_2");
  }
  return SkipRender;
};
const RouterOutlet = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_ScE8eseirUA, "s_ScE8eseirUA"));
const toUrl = (url, baseUrl) => new URL(url, baseUrl.href);
const isSameOrigin = (a, b) => a.origin === b.origin;
const withSlash = (path) => path.endsWith("/") ? path : path + "/";
const isSamePathname = ({ pathname: a }, { pathname: b }) => {
  const lDiff = Math.abs(a.length - b.length);
  return lDiff === 0 ? a === b : lDiff === 1 && withSlash(a) === withSlash(b);
};
const isSameSearchQuery = (a, b) => a.search === b.search;
const isSamePath = (a, b) => isSameSearchQuery(a, b) && isSamePathname(a, b);
const isPromise = (value) => {
  return value && typeof value.then === "function";
};
const resolveHead = (endpoint, routeLocation, contentModules, locale) => {
  const head = createDocumentHead();
  const getData = (loaderOrAction) => {
    const id = loaderOrAction.__id;
    if (loaderOrAction.__brand === "server_loader") {
      if (!(id in endpoint.loaders)) throw new Error("You can not get the returned data of a loader that has not been executed for this request.");
    }
    const data = endpoint.loaders[id];
    if (isPromise(data)) throw new Error("Loaders returning a promise can not be resolved for the head function.");
    return data;
  };
  const headProps = {
    head,
    withLocale: (fn) => withLocale(locale, fn),
    resolveValue: getData,
    ...routeLocation
  };
  for (let i = contentModules.length - 1; i >= 0; i--) {
    const contentModuleHead = contentModules[i] && contentModules[i].head;
    if (contentModuleHead) {
      if (typeof contentModuleHead === "function") resolveDocumentHead(head, withLocale(locale, () => contentModuleHead(headProps)));
      else if (typeof contentModuleHead === "object") resolveDocumentHead(head, contentModuleHead);
    }
  }
  return headProps.head;
};
const resolveDocumentHead = (resolvedHead, updatedHead) => {
  if (typeof updatedHead.title === "string") resolvedHead.title = updatedHead.title;
  mergeArray(resolvedHead.meta, updatedHead.meta);
  mergeArray(resolvedHead.links, updatedHead.links);
  mergeArray(resolvedHead.styles, updatedHead.styles);
  mergeArray(resolvedHead.scripts, updatedHead.scripts);
  Object.assign(resolvedHead.frontmatter, updatedHead.frontmatter);
};
const mergeArray = (existingArr, newArr) => {
  if (Array.isArray(newArr)) for (const newItem of newArr) {
    if (typeof newItem.key === "string") {
      const existingIndex = existingArr.findIndex((i) => i.key === newItem.key);
      if (existingIndex > -1) {
        existingArr[existingIndex] = newItem;
        continue;
      }
    }
    existingArr.push(newItem);
  }
};
const createDocumentHead = () => ({
  title: "",
  meta: [],
  links: [],
  styles: [],
  scripts: [],
  frontmatter: {}
});
const useDocumentHead = () => useContext(DocumentHeadContext);
const useLocation = () => useContext(RouteLocationContext);
const useQwikCityEnv = () => noSerialize(useServerData("qwikcity"));
const preventNav = {};
const internalState = {
  navCount: 0
};
const s_K4gvalEGCME = `:root{view-transition-name:none}`;
const s_qGVD1Sz413o = (fn$) => {
  return;
};
const s_aww2BzpANGM = async (path, opt) => {
  const [actionState, navResolver, routeInternal, routeLocation] = useLexicalScope();
  const { type = "link", forceReload = path === void 0, replaceState = false, scroll = true } = typeof opt === "object" ? opt : {
    forceReload: opt
  };
  internalState.navCount++;
  const lastDest = routeInternal.value.dest;
  const dest = path === void 0 ? lastDest : typeof path === "number" ? path : toUrl(path, routeLocation.url);
  if (preventNav.$cbs$ && (forceReload || typeof dest === "number" || !isSamePath(dest, lastDest) || !isSameOrigin(dest, lastDest))) {
    const ourNavId = internalState.navCount;
    const prevents = await Promise.all([
      ...preventNav.$cbs$.values()
    ].map((cb) => cb(dest)));
    if (ourNavId !== internalState.navCount || prevents.some(Boolean)) {
      if (ourNavId === internalState.navCount && type === "popstate") history.pushState(null, "", lastDest);
      return;
    }
  }
  if (typeof dest === "number") return;
  if (!isSameOrigin(dest, lastDest)) return;
  if (!forceReload && isSamePath(dest, lastDest)) return;
  routeInternal.value = {
    type,
    dest,
    forceReload,
    replaceState,
    scroll
  };
  actionState.value = void 0;
  routeLocation.isNavigating = true;
  return new Promise((resolve) => {
    navResolver.r = resolve;
  });
};
const s_Ysfvd0zsHZc = ({ track }) => {
  const [actionState, content, contentInternal, documentHead, env, goto, loaderState, navResolver, props, routeInternal, routeLocation] = useLexicalScope();
  async function run() {
    const [navigation, action] = track(() => [
      routeInternal.value,
      actionState.value
    ]);
    const locale = getLocale("");
    const prevUrl = routeLocation.url;
    const navType = action ? "form" : navigation.type;
    navigation.replaceState;
    let trackUrl;
    let clientPageData;
    let loadedRoute = null;
    trackUrl = new URL(navigation.dest, routeLocation.url);
    loadedRoute = env.loadedRoute;
    clientPageData = env.response;
    if (loadedRoute) {
      const [routeName, params, mods, menu] = loadedRoute;
      const contentModules = mods;
      const pageModule = contentModules[contentModules.length - 1];
      const isRedirect = navType === "form" && !isSamePath(trackUrl, prevUrl);
      if (navigation.dest.search && !isRedirect) trackUrl.search = navigation.dest.search;
      if (!isSamePath(trackUrl, prevUrl)) routeLocation.prevUrl = prevUrl;
      routeLocation.url = trackUrl;
      routeLocation.params = {
        ...params
      };
      routeInternal.untrackedValue = {
        type: navType,
        dest: trackUrl
      };
      const resolvedHead = resolveHead(clientPageData, routeLocation, contentModules, locale);
      content.headings = pageModule.headings;
      content.menu = menu;
      contentInternal.value = noSerialize(contentModules);
      documentHead.links = resolvedHead.links;
      documentHead.meta = resolvedHead.meta;
      documentHead.styles = resolvedHead.styles;
      documentHead.scripts = resolvedHead.scripts;
      documentHead.title = resolvedHead.title;
      documentHead.frontmatter = resolvedHead.frontmatter;
    }
  }
  const promise = run();
  return promise;
};
const s_p1yCGpFL1xE = (props) => {
  useStylesQrl(/* @__PURE__ */ inlinedQrl(s_K4gvalEGCME, "s_K4gvalEGCME"));
  const env = useQwikCityEnv();
  if (!(env == null ? void 0 : env.params)) throw new Error(`Missing Qwik City Env Data for help visit https://github.com/QwikDev/qwik/issues/6237`);
  const urlEnv = useServerData("url");
  if (!urlEnv) throw new Error(`Missing Qwik URL Env Data`);
  const url = new URL(urlEnv);
  const routeLocation = useStore({
    url,
    params: env.params,
    isNavigating: false,
    prevUrl: void 0
  }, {
    deep: false
  });
  const navResolver = {};
  const loaderState = _weakSerialize(useStore(env.response.loaders, {
    deep: false
  }));
  const routeInternal = useSignal({
    type: "initial",
    dest: url,
    forceReload: false,
    replaceState: false,
    scroll: true
  });
  const documentHead = useStore(createDocumentHead);
  const content = useStore({
    headings: void 0,
    menu: void 0
  });
  const contentInternal = useSignal();
  const currentActionId = env.response.action;
  const currentAction = currentActionId ? env.response.loaders[currentActionId] : void 0;
  const actionState = useSignal(currentAction ? {
    id: currentActionId,
    data: env.response.formData,
    output: {
      result: currentAction,
      status: env.response.status
    }
  } : void 0);
  const registerPreventNav = /* @__PURE__ */ inlinedQrl(s_qGVD1Sz413o, "s_qGVD1Sz413o");
  const goto = /* @__PURE__ */ inlinedQrl(s_aww2BzpANGM, "s_aww2BzpANGM", [
    actionState,
    navResolver,
    routeInternal,
    routeLocation
  ]);
  useContextProvider(ContentContext, content);
  useContextProvider(ContentInternalContext, contentInternal);
  useContextProvider(DocumentHeadContext, documentHead);
  useContextProvider(RouteLocationContext, routeLocation);
  useContextProvider(RouteNavigateContext, goto);
  useContextProvider(RouteStateContext, loaderState);
  useContextProvider(RouteActionContext, actionState);
  useContextProvider(RouteInternalContext, routeInternal);
  useContextProvider(RoutePreventNavigateContext, registerPreventNav);
  useTaskQrl(/* @__PURE__ */ inlinedQrl(s_Ysfvd0zsHZc, "s_Ysfvd0zsHZc", [
    actionState,
    content,
    contentInternal,
    documentHead,
    env,
    goto,
    loaderState,
    navResolver,
    props,
    routeInternal,
    routeLocation
  ]));
  return /* @__PURE__ */ _jsxC(Slot, null, 3, "ni_3");
};
const QwikCityProvider = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_p1yCGpFL1xE, "s_p1yCGpFL1xE"));
const ServiceWorkerRegister = (props) => _jsxQ("script", {
  nonce: _wrapSignal(props, "nonce")
}, {
  dangerouslySetInnerHTML: swRegister
}, null, 3, "ni_7");
const s_0vphQYqOdZI = () => {
  const head = useDocumentHead();
  const loc = useLocation();
  return /* @__PURE__ */ _jsxC(Fragment, {
    children: [
      /* @__PURE__ */ _jsxQ("title", null, null, head.title, 1, null),
      /* @__PURE__ */ _jsxQ("link", null, {
        rel: "canonical",
        href: _fnSignal((p0) => p0.url.href, [
          loc
        ], "p0.url.href")
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("meta", null, {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }, null, 3, null),
      /* @__PURE__ */ _jsxQ("link", null, {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg"
      }, null, 3, null),
      head.meta.map((m) => /* @__PURE__ */ _jsxS("meta", {
        ...m
      }, null, 0, m.key)),
      head.links.map((l) => /* @__PURE__ */ _jsxS("link", {
        ...l
      }, null, 0, l.key)),
      head.styles.map((s) => {
        var _a;
        return /* @__PURE__ */ _jsxS("style", {
          ...s.props,
          ...((_a = s.props) == null ? void 0 : _a.dangerouslySetInnerHTML) ? {} : {
            dangerouslySetInnerHTML: s.style
          }
        }, null, 0, s.key);
      }),
      head.scripts.map((s) => {
        var _a;
        return /* @__PURE__ */ _jsxS("script", {
          ...s.props,
          ...((_a = s.props) == null ? void 0 : _a.dangerouslySetInnerHTML) ? {} : {
            dangerouslySetInnerHTML: s.script
          }
        }, null, 0, s.key);
      })
    ]
  }, 1, "0D_0");
};
const RouterHead = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_0vphQYqOdZI, "s_0vphQYqOdZI"));
const s_tntnak2DhJ8 = () => {
  _jsxBranch();
  return /* @__PURE__ */ _jsxC(QwikCityProvider, {
    children: [
      /* @__PURE__ */ _jsxQ("head", null, null, [
        /* @__PURE__ */ _jsxQ("meta", null, {
          charset: "utf-8"
        }, null, 3, null),
        /* @__PURE__ */ _jsxQ("link", null, {
          rel: "manifest",
          href: `${"/"}manifest.json`
        }, null, 3, "vp_0"),
        /* @__PURE__ */ _jsxC(RouterHead, null, 3, "vp_1")
      ], 1, null),
      /* @__PURE__ */ _jsxQ("body", null, {
        lang: "en"
      }, [
        /* @__PURE__ */ _jsxC(RouterOutlet, null, 3, "vp_2"),
        /* @__PURE__ */ _jsxC(ServiceWorkerRegister, null, 3, "vp_3")
      ], 1, null)
    ]
  }, 1, "vp_4");
};
const Root = /* @__PURE__ */ componentQrl(/* @__PURE__ */ inlinedQrl(s_tntnak2DhJ8, "s_tntnak2DhJ8"));
function render(opts) {
  return renderToStream(/* @__PURE__ */ _jsxC(Root, null, 3, "Qb_0"), {
    manifest,
    ...opts,
    // Use container attributes to set attributes on the html tag.
    containerAttributes: {
      lang: "en-us",
      ...opts.containerAttributes
    },
    serverData: {
      ...opts.serverData
    }
  });
}
export {
  manifest as m,
  render as r,
  setServerPlatform2 as s
};
