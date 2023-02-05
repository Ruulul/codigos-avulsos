const { generateId, make_listen } = require("./Component")

module.exports = function Dot(opts = {}, protocol) {
    let dot = document.createElement("div")
    const size = opts.size ?? '2em'
    Object.assign(dot.style, { border: 'solid black', borderRadius: '2em', width: size, height: size, ...opts.style })

    const states = opts.states
    const colors = opts.colors ?? Array(states.length).fill().map(_ => `#${Math.random().toString(16).slice(2, 8)}`)
    let state = opts.initial ?? 0
    ensureColor()

    const name = generateId('ui-dot')
    let listen = make_listen({ delete: do_delete, mark: prtcl(color(mark)), increment: prtcl(color(increment)), decrement: prtcl(color(decrement)), get: do_protocol })
    let notify = protocol ? protocol(listen, name) : undefined
    if (!opts.no_click) {
        dot.onclick = event(color(increment))
        dot.oncontextmenu = event(color(decrement))
    }

    dot.notify = listen

    return dot

    function do_delete() {
        dot.remove()
        dot.onclick = undefined
        dot.oncontextmenu = undefined
        dot.notify = undefined
        dot = undefined
        notify = undefined
        listen = undefined
    }
    function event(fn) {
        return prtcl(e => {
            e.preventDefault()
            fn()
        })
    }
    function prtcl(fn) {
        return (...args) => {
            fn(...args)
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