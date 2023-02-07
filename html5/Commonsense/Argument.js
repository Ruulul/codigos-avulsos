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