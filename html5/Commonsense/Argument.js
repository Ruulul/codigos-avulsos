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