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