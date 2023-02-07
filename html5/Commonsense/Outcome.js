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