(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { generateId, make_listen } = require('@v142857/component-helpers')
const Outcome = require('./Outcome')

module.exports = function Argument(opts = {}, protocol) {
    const el = document.createElement("div")

    const outcomes = document.createElement("ul")

    const add_outcome = document.createElement("button")
    add_outcome.textContent = 'Add Outcome'
    add_outcome.onclick = _ => outcomes.append(Outcome())

    const evaluate = document.createElement("button")
    evaluate.textContent = 'Roll!'

    el.append(add_outcome, outcomes, evaluate)

    const name = generateId('argument')
    const listen = make_listen({})
    const notify = protocol ? protocol(listen, name) : undefined
    el.notify = listen

    return el
}

function item(el) {
    const item = document.createElement("li")
    item.append(el)
    return item
}
},{"./Outcome":2,"@v142857/component-helpers":4}],2:[function(require,module,exports){
const { generateId, make_listen } = require('@v142857/component-helpers')

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
    reasons.append(supporting_reasons, opposing_reasons)
    add_supporting_reason.onclick = _ => supporting_reasons.append(Reason())
    add_opposing_reason.onclick = _ => opposing_reasons.append(Reason())

    buttons.append(add_supporting_reason, add_opposing_reason, remove)

    remove.onclick = _ => el.remove()

    const outcome_container = iFlex(document.createElement("div"))
    outcome_container.append(outcome, buttons)
    el.append(outcome_container, reasons)

    const name = generateId('outcome')
    const listen = make_listen({})
    const notify = protocol ? protocol(listen, name) : undefined
    el.notify = listen

    return el
}

function Reason() {
    const el = document.createElement("input")
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
