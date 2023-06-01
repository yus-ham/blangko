import { writable } from 'svelte/store';


const instances = {}

function instance(id, opts) {
    opts.key = Symbol({id, opts})
    return instances[opts.key] = instances[opts.key] || new Processor(id, opts)
}

function Processor(id, opts = {}) {
    opts.errorsMap = opts.errorsMap || {}
    opts.errorClass = opts.errorClass || window.formErrorClass || []
    opts.successClass = opts.successClass || window.formSuccessClass || '';

    this.submitting = writable(false)

    this.initialize = function(model) {
        const form = elem('#' + id)
        listen(form, 'submit', submitHandler)
        opts.action || (opts.action = form.action)
        if (typeof model === 'object' && model !== null)
            setInitialValue(form, model)
    }

    const req = Promise.resolve([wretch, wretchAuth][+(opts.credentials !== 'omit')](opts.action))

    function reqWithBody(req) {
        const form = elem('#' + id)
        opts.fetch && opts.fetch()
        return form.innerHTML.match(/type=['"]?file/)
            ? req.body(new FormData(form))
            : req.formUrl(form2Qs(form))
    }

    req.get = _ => req.then(_req => _req.query(form2Qs(elem('#' + id))))
    req.post = _ => req.then(reqWithBody)
    req.patch = req.post

    function submitHandler(ev) {
        ev.preventDefault()

        const _self = instances[opts.key]
        const form = ev.target;
        const method = opts.method || form.getAttribute('method') || 'post';
        const request = { url: opts.action, method: method.toUpperCase() }

        _self.submitting.set(true)
        clearErrorOnChanges(form)

        req[method]().then(_req => {
            _req[method]()
                .error(422, err => parseErrors(form, err))
                .res(response => {
                    response.json().then(data => successResponseCallback(data, request, response))
                })
                .finally(_ => _self.submitting.set(false))
        })
    }

    async function successResponseCallback(data, request, response) {
        response.data = data;
        opts.success && (await opts.success(data))
        wretch.dispatchEvent('success', { request, response })
    }

    function parseErrors(form, err) {
        const errors = JSON.parse(err.text)
        Object.entries(errors).forEach(item => {
            showFeedback(item, form)
        })
    }

    function showFeedback([field, msg], form) {
        let input, hint;

        if (opts.errorsMap[field]) {
            hint = elem(opts.errorsMap[field][0])
            input = elem(opts.errorsMap[field][1])
        } else {
            input = form[field]
            hint = input.nextElementSibling;
        }
        if (hint) {
            opts.errorClass[0] && hint.classList.add(opts.errorClass[0])
            hint.innerHTML = msg;
        }
        input && opts.errorClass[1] && input.classList.add(opts.errorClass[1])
    }

    function setInitialValue(form, model) {
        for (let input of form.elements) {
            if (input.value === undefined)
                continue

            if (typeof model[input.name] === 'number' || model[input.name])
                input.value = model[input.name]
        }
    }

    function clearErrorOnChanges(form) {
        for (let input of form.elements) {
            listen(input, 'change', (_input, _hint) => {
                if (opts.errorsMap[input.name]) {
                    _input = elem(opts.errorsMap[input.name][1])
                    _hint = elem(opts.errorsMap[input.name][0])
                }
                else {
                    _input = input;
                    _hint = input.nextElementSibling;
                }
                _input && _input.classList.remove(opts.errorClass[1])
                _hint && (_hint.innerHTML = '')
            });
        }
    }
}


const r = (s, c) => s.replace(new RegExp(c, 'g'), c.charCodeAt(c.length - 1).toString(16))
const encQs = s => [/* '~',*/'!', "'", '\\(', '\\)', '\\*'].reduce(r, encodeURIComponent(s)).replace(/%20/g, '+')

function form2Qs(form) {
    if (!form || !form instanceof HTMLFormElement) {
        throw new Error('Form is invalid')
    }

    let input, qs = '', checkboxes = {};
    const addQs = (k, v) => qs += `&${encQs(k)}=${encQs(v)}`;

    for (input of form) {
        if (!input.name || input.disabled)
            continue;

        if (input.nodeName === 'INPUT') {
            if (input.type === 'radio')
                input.checked && addQs(input.name, input.value)

            else if (input.type === 'checkbox') {
                if (input.name.includes('[]')) {
                    checkboxes[input.name] || (checkboxes[input.name] = [])
                    input.checked && checkboxes[input.name].push(input.value)
                }
                else input.checked && addQs(input.name, input.value)
            }
            else addQs(input.name, input.value)
            continue;
        }

        if (input.nodeName === 'SELECT' && input.type === 'select-multiple') {
            for (let opt of input.options)
                opt.selected && addQs(`${input.name}[]`, opt.value)
        }
        else addQs(input.name, input.value)
    }

    for (let name in checkboxes) {
        checkboxes[name].forEach(value => addQs(name, value))
    }

    return qs.slice(1)
}

export default (id, opts = {}) => {
    const { submitting, initialize } = instance(id, opts)
    return { submitting, initialize }
}
