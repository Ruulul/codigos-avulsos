const { generateId, make_listen } = require("./Component")

module.exports = function Dot(opts = {}, protocol) {
    const dot = document.createElement("div")
    const size = opts.size ?? '2em'
    Object.assign(dot.style, { border: 'solid black', borderRadius: '2em', width: size, height: size, ...opts.style })

    const states = opts.states
    const colors = opts.colors ?? Array(states.length).fill().map(_ =>  `#${Math.random().toString(16).slice(2, 8)}`)
    let state = opts.initial ?? 0
    ensureColor()

    const name = generateId('ui-dot')
    const listen = make_listen({ mark: color(mark), increment: color(increment), decrement: color(decrement), get: do_protocol })
    const notify = protocol ? protocol(listen, name) : undefined
    dot.onclick = event(color(increment))
    dot.oncontextmenu = event(color(decrement))

    dot.notify = listen

    return dot

    function event(fn) {
        return e => {
            e.preventDefault()
            fn()
            do_protocol()
        }
    }
    function do_protocol() {
        if (notify) notify({ head: [name], type: 'update', data: { state: states[state] } })
    }

    function mark(msg) {
        state = msg.data.value
    }
    function increment() {
        state = (state + 1) % colors.length
    }
    function decrement() {
        state--
        if (state < 0) state += colors.length
    }
    function color(fn) {
        return (...args) => {
            fn(...args)
            ensureColor()
        }
    }
    function ensureColor() {
        dot.style.backgroundColor = colors[state]
        dot.title = states[state]
    }
}