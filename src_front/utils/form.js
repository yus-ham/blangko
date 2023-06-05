import { writable } from 'svelte/store';


const instances = {}

function instance(id, opts) {
    opts.key = Symbol({id, opts})
    return instances[opts.key] = instances[opts.key] || new Processor(id, opts)
}

function Processor(id, opts = {}) {
    opts.feedback = opts.feedback || {}
    opts.feedback.classes || (opts.feedback.classes = {valid:[], error:[]})

    Object.entries(window.formFeedbackClasses||{}).forEach(([type, cls]) => {
        opts.feedback.classes[type].push(...cls)
    })

    this.submitting = writable(false)

    this.initialize = function(model) {
        const form = elem('#' + id)
        listen(form, 'submit', onSubmit)
        listen(form, 'change', inputChanged)
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

    function setInitialValue(form, model) {
        for (let input of form.elements) {
            if (input.value === undefined)
                continue

            if (typeof model[input.name] === 'number' || model[input.name])
                input.value = model[input.name]
        }
    }

    function onSubmit(ev) {
        ev.preventDefault()

        const _self = instances[opts.key]
        const form = ev.target;
        const method = opts.method || form.getAttribute('method') || 'post';

        _self.submitting.set(true)

        req[method]().then(_req => {
            _req[method]()
                .error(422, err => parseErrors(form, err))
                .res(response => response.json().then(data => onSuccess(data)))
                .finally(_ => _self.submitting.set(false))
        })
    }

    function onSuccess(data) {
        opts.success && opts.success(data)
    }

    function parseErrors(form, err) {
        const errors = JSON.parse(err.text)
        Object.entries(errors).forEach(item => showErrors(item, form))
    }

    function showErrors([field, msg], form) {
        let errClass, input = form[field]
        let hint = input.nextElementSibling;
        let feedback = opts.feedback;

        if (feedback.elem && Array.isArray(feedback.elem[field])) {
            hint = elem(feedback.elem[field][0])
            input = elem(feedback.elem[field][1]) || input
        }

        Array.isArray(feedback.classes?.error) && (errClass = feedback.classes.error[0])

        if (hint && errClass) {
            hint.classList.add(errClass)
            hint.innerHTML = msg;
            errClass = feedback.classes.error[1]
        }

        input && errClass && input.classList.add(errClass)
    }

    function inputChanged(e) {
        if (!['INPUT','SELECT','TEXTAREA'].includes(e.target.nodeName)) return
        if (['checkbox','radio'].includes(e.target.type)) return

        let input = e.target, hint = e.target.nextElementSibling;
        let classes = opts.feedback?.classes ||{}

        if (!classes) return;

        if (opts.feedback?.elem && Array.isArray(opts.feedback.elem[e.target.name])) {
            input = elem(opts.feedback.elem[e.target.name][1])
            hint = elem(opts.feedback.elem[e.target.name][0])
        }

        let validClass, errClass;

        Array.isArray(classes.valid) && (validClass = classes.valid[0])
        Array.isArray(classes.error) && (errClass = classes.error[0])

        if (hint && validClass) {
            hint.classList.remove(errClass) || (hint.innerHTML = '') || (errClass = classes.error[1])
            hint.classList.add(validClass) || (validClass = classes.valid[1])
        }

        validClass && input.classList.remove(errClass) || input.classList.add(validClass)
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
