import { listen } from 'svelte/internal';
import { get as $, writable } from 'svelte/store';
import { session, prevUrl } from './store.js';
import { redirect, url } from '@roxi/routify';
import wretch from './wretch.esm.js';


const wretchAuth = u => wretch(u).headers({ Authorization: 'Bearer ' + $(session).token });

const parseHeaders = res => {
  res.body.type = String(res.headers.get('Content-Type'));
  res.body.length = +res.headers.get('Content-Length');

  res.paging = {
    perPage: +res.headers.get('X-Pagination-Per-Page'),
    page: +res.headers.get('X-Pagination-Current-Page'),
    pageCount: +res.headers.get('X-Pagination-Page-Count'),
    totalData: +res.headers.get('X-Pagination-Total-Count'),
  };
  res.paging.offset = (res.paging.page - 1) * res.paging.perPage + 1;
  res.paging.to = Math.min(res.paging.totalData, res.paging.offset + res.paging.perPage - 1);
}

JSON.fetch = (w, d = {}) => {
  d = { data: d };
  const resolver = _w => _w
    .unauthorized(err => err)
    .res(async _res => {
      if (!_res) {
        return openAuthForm()
      }
      _res.data = await _res.json();
      parseHeaders(_res);
      return _res;
    })

  return w.resolve(resolver).get();
}

const api = u => API_URL + '/' + (u ? String(u).replace(/^\/+/, '') : '');
api.fetch = (u, d) => JSON.fetch(wretchAuth(api(u)), d);
api.data = (u, d) => api.fetch(u, d).then(res => res.data);

api.list = url => {
  const respon = writable({ paging: {}, data: [], loading: true });

  async function selectPage(page, reload) {
    if (reload || this.paging.page != page) {
      respon.set({ ...$(respon), loading: true });
      return api.fetch(url + (`${url}`.includes('?') ? '&' : '?') + 'page=' + page).then(setRespon);
    }
  }

  const setRespon = res => respon.set({ ...res, selectPage, loading: false });
  api.fetch(url).then(setRespon);

  return respon;
}

export const routifyConfig = {
  urlTransform: {
    apply: u => u.startsWith('/') ? BASE_URL + u : location.pathname + '/../' + u, // for browser
    remove: u => u === BASE_URL ? '/' : u.substr(BASE_URL.length), // for routify
  }
}

export const getSession = _ => $(session) || JSON.fetch(wretch(api('auth/session'), {credentials: 'include', mode: 'cors'})).then(x => x.data ? session.set(x.data) || x.data : x);

export const authenticate = res => {
  if (res.status === 401) {
    session.set(undefined)
    return openAuthForm()
  }
  session.set(res.data)
}

export const openAuthForm = _ => {
  if (!$(prevUrl))
    prevUrl.set($(url)().slice(BASE_URL.length));

  return $(redirect)(signInUrl)||'';
}

!(function () {
  // globals
  for (let [prop, fn] of Object.entries({
    onReady: fn => document.addEventListener('DOMContentLoaded', fn),
    elems: (s, c) => (c || document).querySelectorAll(s),
    elem: (s, c) => (c || document).querySelector(s),
    createElem: n => document.createElement(n),
    show: n => n.style.display = 'block',
    hide: n => n.style.display = 'none',
    trigger: (n, e) => n.dispatchEvent(new CustomEvent(e)),
    listen, wretch, wretchAuth, api,
    signInUrl: '/auth/session/sign-in',
  })) globalThis[prop] = fn;
})();
