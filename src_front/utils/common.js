import { listen } from 'svelte/internal';
import { get as $, writable } from 'svelte/store';
import { session, redirectData } from './store.js';
import { goto } from '@roxi/routify';
import wretch from './wretch.esm.js';


const wretchAuth = u => wretch(u).headers({ Authorization: 'Bearer ' + $(session).token });

const parseHeaders = res => {
    res.body.type = String(res.headers.get('Content-Type'));
    res.body.length = +res.headers.get('Content-Length');
    setPaging(res, 1)
}

function setPaging(res, page = 1) {
    const perPage = +res.headers.get('X-Pagination-Per-Page');
    const totalData = +res.headers.get('X-Pagination-Total-Count');
    const offset = (page - 1) * perPage + 1;
    const to = Math.min(totalData, offset + perPage - 1);

    res.paging = { page, perPage, totalData, offset, to };
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
    const respon = writable({
        loading: true,
        paging: {},
        data: [],
    });

    function load(page) {
        respon.set({ ...$(respon), loading: true })
        if (!page) page = this.paging.page;
        const _url = url + (`${url}`.includes('?') ? '&' : '?') + 'page=' + page;
        api.fetch(_url).then(res => {
            setPaging(res, page)
            setRespon(res)
        })
    }

    function setRespon(res) {
        respon.set({ ...res, load, loading: false });
    }

    api.fetch(url).then(setRespon);

    return respon;
}

export const getSession = _ => $(session) || JSON.fetch(wretch(api('auth/session'), { credentials: 'include', mode: 'cors' })).then(x => x.data ? session.set(x.data) || x.data : x);

export const authenticate = res => {
    if (res.status === 401) {
        session.set(undefined)
        return openAuthForm()
    }
    session.set(res.data)
}

export const openAuthForm = _ => {
    if (!$(redirectData).prevUrl)
        redirectData.set({ prevUrl: location.pathname });

    return $(goto)(signInUrl) || '';
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
