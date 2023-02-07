(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { generateId, make_listen, make_protocol } = require('@v142857/component-helpers')
const Outcome = require('./Outcome')

module.exports = function Argument(opts = {}, protocol) {
    const el = document.createElement("div")

    const outcomes = document.createElement("ul")

    const outcomes_state = new Map
    const outcomes_protocol = make_protocol({
        update(msg) {
            Object.assign(outcomes_state.get(msg.head[0]), msg.data)
        }
    }, (notify, id) => outcomes_state.set(id, { notify }))

    const add_outcome = document.createElement("button")
    add_outcome.textContent = 'Add Outcome'
    add_outcome.onclick = _ => outcomes.append(Outcome({}, outcomes_protocol))

    const evaluate = document.createElement("button")
    evaluate.textContent = 'Roll!'
    const clear = document.createElement("button")
    clear.textContent = 'Reset'

    el.append(add_outcome, evaluate, clear, outcomes)

    evaluate.onclick = _ => {
        const outcomes = Array.from(outcomes_state.values()).sort((a, b) => b.reasons - a.reasons).map(outcome => Object.create(outcome))
        const most_reasons = outcomes[0].reasons
        outcomes.forEach(outcome => outcome.roll =
            Array(1 + most_reasons - outcome.reasons).fill()
                .map(_ => Math.ceil(Math.random() * 6)).sort())
        outcomes.sort((a, b) => b.roll[0] - a.roll[0])
        alert(`
        The rolled outcome is ${outcomes[0].label}
        The full roll is: 
        ${outcomes.map(outcome => `\r${outcome.label}: ${outcome.roll}`).join('')}
        `)
    }
    clear.onclick = _ => {
        Array.from(outcomes_state.values()).forEach(outcome => outcome.notify({ head: [name], type: 'delete' }))
        outcomes_state.clear()
    }

    const name = generateId('argument')
    const listen = make_listen({})
    const notify = protocol ? protocol(listen, name) : undefined
    el.notify = listen

    return el
}
},{"./Outcome":2,"@v142857/component-helpers":4}],2:[function(require,module,exports){
const { generateId, make_listen, make_protocol } = require('@v142857/component-helpers')

module.exports = function Outcome(opts = {}, protocol) {
    const el = flowColumn(iFlex(document.createElement("div")))
    el.style.gap = '0.5em'

    const outcome = document.createElement("textarea")
    outcome.textContent = opts.outcome
    const add_supporting_reason = document.createElement("button"),
        add_opposing_reason = document.createElement("button"),
        remove = document.createElement("button"),
        buttons = flowColumnReverse(iFlex(document.createElement("div")))
    add_supporting_reason.textContent = 'Add Reason'
    add_opposing_reason.textContent = 'Add Opposing Reason'
    remove.textContent = 'X'

    const reasons = iFlex(document.createElement("div"))
    const supporting_reasons = flowColumn(iFlex(document.createElement("ul"))),
        opposing_reasons = flowColumn(iFlex(document.createElement("ul")))
    supporting_reasons.textContent = 'Supporting'
    opposing_reasons.textContent = 'Opposing'
    reasons.append(supporting_reasons, opposing_reasons)

    buttons.append(add_opposing_reason, add_supporting_reason, remove)

    remove.onclick = _ => el.remove()

    const outcome_container = iFlex(document.createElement("div"))
    outcome_container.append(outcome, buttons)

    const reason_protocol = make_protocol({
        delete: calcDisplay,
    })

    const display_reasons = document.createElement("p")
    const reasons_count = document.createElement("span")
    display_reasons.textContent = 'Effective Reasons: '
    display_reasons.append(reasons_count)
    add_supporting_reason.onclick = _ => {
        supporting_reasons.append(Reason({}, reason_protocol))
        calcDisplay()
    }
    add_opposing_reason.onclick = _ => {
        opposing_reasons.append(Reason({}, reason_protocol))
        calcDisplay()
    }
    el.append(outcome_container, reasons, display_reasons)

    const name = generateId('outcome')
    const listen = make_listen({
        delete() {
            el.remove()
        },
        get: notify_state
    })
    const notify = protocol ? protocol(listen, name) : undefined
    el.notify = listen

    outcome.oninput = _ => {
        if (notify) notify({ head: [name], type: 'update', data: { label: outcome.value } })
    }

    return el

    function calcDisplay() {
        const reasons = supporting_reasons.children.length - opposing_reasons.children.length
        reasons_count.textContent = reasons
        if (notify) notify({ head: [name], type: 'update', data: { reasons } })
    }
    function notify_state() {
        const reasons = supporting_reasons.children.length - opposing_reasons.children.length
        const label = outcome.value
        if (notify) notify({ head: [name], type: 'update', data: { reasons, label }})
    }
}

function Reason(opts = {}, protocol) {
    const listen = make_listen({})
    const name = generateId('reason')
    const notify = protocol ? protocol(listen, name) : undefined

    const el = iFlex(document.createElement("div"))
    const reason = document.createElement("input")
    const close = document.createElement("button")
    close.textContent = 'X'
    close.onclick = _ => {
        el.remove()
        if (notify) notify({ head: [name], type: 'delete' })
    }
    el.append(reason, close)
    return el
}

function iFlex(el) {
    el.style.display = 'inline-flex'
    return el
}

function flowColumn(el) {
    el.style.flexFlow = 'column'
    return el
}
function flowColumnReverse(el) {
    el.style.flexFlow = 'column-reverse'
    return el
}
},{"@v142857/component-helpers":4}],3:[function(require,module,exports){
const Argument = require("./Argument")

document.body.append(Argument())
},{"./Argument":1}],4:[function(require,module,exports){
const Component = {
    generateId: (_ => {
        let count = 0
        return (component = 'component', id) => `${component}-${id ?? count++}`
    })(),
    handle_handle(handle, type, msg) {
        if (type in handle) return handle[type](msg)
        else console.trace("There is no handle for", type, ", emitted by", msg.head[0], "\nFull msg:", JSON.stringify(msg))
    },
    make_listen(handles) {
        return function (msg) {
            return Component.handle_handle(handles, msg.type, msg)
        }
    },
    make_protocol(obj_listen, protocol_fn) {
        const listen = Component.make_listen(obj_listen)
        return function protocol(notify, id) {
            if (protocol_fn) protocol_fn(notify, id)
            return listen
        }
    },
}
module.exports = Component
},{}]},{},[3]);
