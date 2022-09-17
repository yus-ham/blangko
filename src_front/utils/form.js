import { writable } from 'svelte/store';


const instances = {};
const instance = (id, o) => instances[id] = instances[id] || new Processor(id, o);


function Processor(id, o = {}) {
    o.errorsMap = o.errorsMap || {};
    o.errorClass = o.errorClass || window.formErrorClass || [];
    o.successClass = o.successClass || window.formSuccessClass || '';

    this.submitting = writable(false);

    this.initialize = model => {
        const form = elem('#' + id);
        listen(form, 'submit', submitHandler);
        if (typeof model === 'object' && model !== null) {
            setInitialValue(form, model);
        }
    }

    const w = f => [wretch, wretchAuth][+o.checkAuth || 0](f.action);
    const wb = f => f.innerHTML.match(/type=['"]?file/) ? w(f).body(new FormData(f)) : w(f).formUrl(form2Qs(f));

    w.get = f => w(f).query(form2Qs(f));
    w.post = f => wb(f);
    w.patch = w.post;

    const submitHandler = ev => {
        ev.preventDefault();

        const form = ev.target;
        const p = instances[form.id];
        const method = form.getAttribute('method') || 'get';
        const request = { url: form.action, method: method.toUpperCase() };

        p.submitting.set(true);
        clearErrorOnChanges(form);

        w[method](form)[method]()
            .error(422, err => parseErrors(form, err))
            .res(response => {
                response.json().then(data => successResponseCallback(data, request, response))
            })
            .finally(_ => p.submitting.set(false))
    }

    const successResponseCallback = async (data, request, response) => {
        response.data = data;
        o.success && (await o.success(data))
        wretch.dispatchEvent('success', { request, response })
    }

    const parseErrors = (form, err) => {
        const errors = JSON.parse(err.text)
        Object.entries(errors).forEach(item => {
            showFeedback(item, form)
        });
    }

    const showFeedback = ([field, msg], form) => {
        let input, hint;

        if (o.errorsMap[field]) {
            hint = elem(o.errorsMap[field][0])
            input = elem(o.errorsMap[field][1])
        } else {
            input = form[field];
            hint = input.nextElementSibling;
        }
        if (hint) {
            o.errorClass[0] && hint.classList.add(o.errorClass[0]);
            hint.innerHTML = msg;
        }
        input && o.errorClass[1] && input.classList.add(o.errorClass[1]);
    }

    const setInitialValue = (form, model) => {
        for (let input of form.elements) {
            if (input.value === undefined)
                continue

            if (typeof model[input.name] === 'number' || model[input.name]) {
                input.value = model[input.name]
            }
        }
    }

    const clearErrorOnChanges = form => {
        for (let input of form.elements) {
            listen(input, 'change', (_input, _hint) => {
                if (o.errorsMap[input.name]) {
                    _input = elem(o.errorsMap[input.name][1])
                    _hint = elem(o.errorsMap[input.name][0])
                } else {
                    _input = input;
                    _hint = input.nextElementSibling;
                }
                _input && _input.classList.remove(o.errorClass[1]);
                _hint && (_hint.innerHTML = '');
            });
        }
    }
}


const r = (s, c) => s.replace(new RegExp(c, 'g'), c.charCodeAt(c.length - 1).toString(16));
const encQs = s => [/* '~',*/'!', "'", '\\(', '\\)', '\\*'].reduce(r, encodeURIComponent(s)).replace(/%20/g, '+');

const form2Qs = form => {
    if (!form || !form instanceof HTMLFormElement) {
        throw new Error('Form is invalid');
    }

    let input, qs = '';
    const addQs = (k, v) => qs += `&${encQs(k)}=${encQs(v)}`;

    for (input of form) {
        if (!input.name || input.disabled)
            continue;

        if ((input.nodeName === 'INPUT') && (input.type === 'radio' || input.type === 'checkbox')) {
            input.checked && addQs(input.name, input.value);
            continue;
        }
        if (input.nodeName === 'SELECT' && input.type === 'select-multiple') {
            for (opt of input.options)
                opt.selected && addQs(input.name, opt.value);
            continue;
        }
        addQs(input.name, input.value);
    }

    return qs.slice(1);
}

export default (id, opts = {}) => {
    const { submitting, initialize } = instance(id, opts);
    return { submitting, initialize };
}
