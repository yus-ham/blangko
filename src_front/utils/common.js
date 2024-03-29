import { listen } from 'svelte/internal';
import { get as $, writable } from 'svelte/store';
import { session, redirectData } from './store.js';
import { goto } from '@roxi/routify';
import wretch from './wretch.esm.js';


export const urlRewrite = {
    toExternal: u => u.startsWith('/') ? BASE_URL + u : location.pathname + '/../' + u,
    toInternal: u => u === BASE_URL ? '/' : u.substr(BASE_URL.length),
}

function parseHeaders(res) {
    res.body.type = String(res.headers.get('Content-Type'))
    res.body.length = +res.headers.get('Content-Length')
    setPaging(res, 1)
}

function setPaging(res, page = 1) {
    const perPage = +res.headers.get('X-Pagination-Per-Page')
    const totalData = +res.headers.get('X-Pagination-Total-Count')
    const offset = (page - 1) * perPage + 1;
    const to = Math.min(totalData, offset + perPage - 1)

    res.paging = { page, perPage, totalData, offset, to }
}

JSON.fetch = function(req, d = {}) {
    d = { data: d }
    const resolver = _req => _req
        .unauthorized(err => err)
        .res(async _res => {
            if (!_res) {
                return openAuthForm()
            }
            _res.data = await _res.json();
            parseHeaders(_res);
            return _res;
        })

    return Promise.resolve(req).then(_req => _req.resolve(resolver).get())
}

export async function getSession() {
    const sess = $(session)
    
    if (sess && Date.now() < $(session).expired_at)
        return sess;

    const res = await JSON.fetch(wretch(SESS_API_URL))

    if (res.data) {
        res.data.expired_at = Date.now() + (res.data.duration * 1000)
        session.set(res.data)
        return res.data
    }

    return res;
}

const wretchAuth = u => getSession().then(sess => wretch(u).auth(`Bearer ${sess.token}`))

const api = u => API_URL + '/' + (u ? String(u).replace(/^\/+/, '') : '')
api.fetch = (u, d) => JSON.fetch(wretchAuth(api(u)), d)
api.data = (u, d) => api.fetch(u, d).then(res => res.data)

api.list = function(url) {
    const respon = writable({
        loading: true,
        paging: {},
        data: [],
    });

    const setRespon = res => respon.set({ ...res, load, loading: false })

    function load(page, qp = '') {
        respon.set({ ...$(respon), loading: true })
        if (!page) page = this.paging.page;
        const _url = url + (`${url}`.includes('?') ? '&' : '?') + 'page=' + page +'&'+ qp;
        api.fetch(_url).then(res => {
            setPaging(res, page)
            setRespon(res)
        })
    }

    api.fetch(url).then(setRespon)

    return respon;
}

export function authenticate(res) {
    if (res.status === 401) {
        session.set(undefined)
        return openAuthForm()
    }
    session.set(res.data)
}

export function openAuthForm() {
    if (!$(redirectData).prevUrl)
        redirectData.set({ prevUrl: location.pathname.slice(BASE_URL.length) })

    return $(goto)(signInUrl) || '';
}

export function logout() {
    return wretch(SESS_API_URL).delete().res(_ => {
        redirectData.set({ prevUrl: undefined })
        session.set(undefined)
    })
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
