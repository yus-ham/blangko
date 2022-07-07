import { listen, element } from 'svelte/internal';
import { get as $, writable } from 'svelte/store';
import { session, prevUrl } from './store';
import { goto, url } from '@roxi/routify';
import flatpickr from 'flatpickr';
import wretch from './wretch.esm';


const alert = (text, icon, opts = {}) => {
  opts.text = text;
  opts.icon = icon;
  opts.width = opts.width || '35%';
  return Swal.fire(opts);
};

const swalDefaultOpts = { allowOutsideClick: false, allowEscapeKey: false };

const swal_view = opts => {
  if (typeof opts.html === 'function')
    opts.html = opts.html()

  const didRender = opts.didRender;
  return Swal.fire({
    ...opts,
    ...swalDefaultOpts,
    didRender: modal => {
      didRender(modal)
      window[opts.swalDidOpen] && window[opts.swalDidOpen](modal)
    },
  })
};

const swal_form = opts => {
  const parseError = err => {
    if (err.status === 422) {
      let errors = JSON.parse(err.text)
      let form = elem('.swal2-content form');

      errors.forEach(err => {
        if (form[err.field]) {
          // form[err.field].nextElementSibling.innerHTML = err.message;
          // form[err.field].closest('.row').classList.add('has-error');
        }
      });
    }
    return false
  }

  return swal_view({
    ...opts,
    preConfirm: async _ => {
      let form = elem('.swal2-content form');
      for (let inp of form) inp.nextElementSibling.innerHTML = '';
      let method = form.getAttribute('method') || 'get';
      let _wretch = d => wretch(form.action).body(d)[method]().text();
      let html = await _wretch(new FormData(form)).catch(parseError);
      // html = await window[opts.swalPreConfirm](_wretch, new FormData(form));
      try {
        html = JSON.parse(html)
      } catch (err) {
      }

      if (html === false) return false;
      if (typeof html !== 'string') return true;
      Swal.update({ html });
      return false;
    },
    width: '40%',
    showCancelButton: true,
    showLoaderOnConfirm: true,
    confirmButtonText: 'Submit',
  })
};

// `click` event handler
const isTag = (n, t) => n.nodeName === t;
const isBtn = n => isTag(n, 'A') || isTag(n, 'BUTTON');
const setBtnId = b => b._id = b.id || b.nodeName + '_' + Date.now();
const btnRules = [
  // [ condition(node), action(event, node) ],
  [
    (b) => isTag('A'),
    (e, a, url) => (url = a.getAttribute('href')) && !url.includes(BASE_URL) && url.startsWith('/') && (a.href = BASE_URL + url)
  ],
  // [
  //   (b) => b.type === 'submit' && b.form,
  //   (e, btn) => {
  //     e.preventDefault();
  //   },
  // ],
  [
    (b) => b.classList.contains('modal-toggle'),
    (e, btn, _swalOpts) => {
      e.preventDefault();
      _swalOpts = { ...btn.dataset };
      if (btn.classList.contains('modal-view')) {
        return wretch(btn.href).get()
          .text(x => swal_view({ ..._swalOpts, ...swalDefaultOpts, html: x }))
          .catch(err => swal_error(err.message))
      }
      if (btn.classList.contains('modal-form')) {
        let form, data;
        if (form = btn.getAttribute('form')) {
          form = elem(form).cloneNode(true);
          form.classList.remove('d-none');
          form.method = btn.getAttribute('form-method') || 'post';
          form.action = btn.href;
        }
        return wretch(btn.href).get()
          .res(async respon => {
            try {
              data = await respon.json();
              _swalOpts.didRender = modal => {
                elem('.swal2-content', modal).innerHTML = '';
                elem('.swal2-content', modal).append(form);

                for (let [name, value] of Object.entries(data)) {
                  form[name] && (form[name].value = value);
                }
              }
            } catch (err) {
              _swalOpts.html = await respon.text();
            }
            return swal_form(_swalOpts);
          })
          .catch(err => swal_error(err.message))
      }
      if (btn.classList.contains('modal-pdf')) {
        let html = `<object type="application/pdf" data="${btn.href}" style="width:100%; height:81vh">No Support</object>`;
        return swal_static({ html, width: '80%', heightAuto: false, title: 'Dokumen ' + data.name })
      }
    }
  ],
  [
    (b) => b.classList.contains('clear-form'),
    (e, btn, _form) => {
      _form = btn.form || elem(btn.dataset.form)
      for (i = 0; i < _form.length; i++) {
        switch (_form[i].type) {
          case 'radio':
          case 'checkbox':
            _form[i].checked = false;
            break;

          case 'select-one':
          case 'select-multi':
            _form[i].selectedIndex = _form[i].item(0).value - 0 ? -1 : 0;
            break;

          default: _form[i].value = '';
        }
        trigger(_form[i], 'change');
      }
    }
  ],
  [
    b => b.dataset.method,
    async (e, btn) => {
      e.preventDefault();
      let submit = { isConfirmed: true };

      if (btn.dataset.confirm) {
        submit = await alert(btn.dataset.confirm, 'question');
        btn.isConfirmed = submit.isConfirmed;
      }

      if (!submit.isConfirmed)
        return false;

      let url = btn.getAttribute('href');

      if (String(btn.dataset.method).toLowerCase() === 'delete') {
        url = btn.getAttribute('api-url') ? api(btn.getAttribute('api-url')) : url;
        return !wretchAuth(url).delete().res(_ => btn.after && btn.after());
      }

      let form = createElem('form');
      let input = createElem('input');
      document.body.append(form);
      btn.onSubmit && btn.onSubmit();
      form.method = 'post';
      form.action = url;
      form.submit();
    }
  ]
];

const handleBtn = (ev, b, i) => {
  for (i = 0; i < btnRules.length; i++) {
    if (ev.defaultPrevented) return;
    if (!btnRules[i][0](b)) continue;
    btnRules[i][1](ev, b);
  }
};

export const registerClickHandler = _ => {
  listen(document, 'click', (ev, _node, _btn, _i) => {
    _node = ev.target;
    let checkNum = 3;
    do {
      if (isBtn(_node))
        return handleBtn(ev, _node);
      _node = _node.parentNode;
    } while (_node !== document.body && --checkNum);
  });
};

// example: <a on:click={afterClick(() => console.log(`clicked`))}>click me!</a>
export const afterClick = fn => (e => e.currentTarget.after = fn);

export const wretchAuth = u => wretch(u).headers({ Authorization: 'Bearer ' + $(session).token });

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
};

const fetchJSON = (w, d = {}) => {
  d = { data: d };
  const resolver = _r => _r.res(async _res => {
    if (maybeLoginRequired(_res)) {
      return d;
    }
    _res.data = await _res.json();
    parseHeaders(_res);
    return _res;
  }).catch(err => d);
  return w.resolve(resolver).get();
};

const api = u => API_URL + '/' + (u ? String(u).replace(/^\/+/, '') : '');
api.fetch = (u, d) => fetchJSON(wretchAuth(api(u)), d);
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
    apply: url => url.startsWith('/') ? BASE_URL + url : location.pathname + '/../' + url, // for browser
    remove: url => url === BASE_URL ? '/' : url.substr(BASE_URL.length), // for routify
  }
};

export const IDRMask = {
  mask: 'Rp000',
  blocks: { '000': { thousandsSeparator: '.', mask: Number } },
};

export const toRupiah = v => 'Rp' + v.toLocaleString('id');

export const getSession = async _ => $(session) || (await fetchJSON(wretch(api('auth/session'), {credentials: 'include', mode: 'cors'}))).data;

export const validateSession = sess => {
  if (maybeLoginRequired(sess)) return;
  session.set(sess);
  return sess;
};

export const maybeLoginRequired = sess => {
  if (!sess) {
    if (!$(prevUrl))
      prevUrl.set($(url)().substr(BASE_URL.length));
    return !$(goto)(signInUrl);
  }
};

const formatDate = (format, date) => {
  if (typeof date === 'string')
    date = flatpickr.parseDate(date, format);
  else if (date === undefined)
    date = new Date();

  return flatpickr.formatDate(date, format);
}

!(function () {
  // globals
  for (let [prop, fn] of Object.entries({
    onReady: fn => document.addEventListener('DOMContentLoaded', fn),
    elems: (s, c) => (c || document).querySelectorAll(s),
    elem: (s, c) => (c || document).querySelector(s),
    createElem: element,
    show: n => n.style.display = 'block',
    hide: n => n.style.display = 'none',
    trigger: (n, e) => n.dispatchEvent(new CustomEvent(e)),
    listen,
    date: formatDate,
    humanize: s => s.toLowerCase().replace(/(^([a-zA-Z\p{M}]))|([ -_]+[a-zA-Z\p{M}])/g, m => ' ' + m.toUpperCase().trim()),
    swal_success: m => alert(m, 'success'),
    swal_error: m => alert(m, 'error'),
    signInUrl: '/auth/session/sign-in',
    wretch, api,
    ucfirst: s => s.charAt(0).toUpperCase() + s.slice(1),
    format: d => d || '<belum diset>',
    formErrorClass: ['is-invalid', 'invalid-feedback'],
  })) window[prop] = fn;

  JSON.fetch = fetchJSON;
})();
