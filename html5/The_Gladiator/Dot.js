const { generateId, make_listen } = require("./Component")

module.exports = function Dot(opts = {}, protocol) {
    const dot = document.createElement("div")
    const size = opts.size ?? '2em'
    Object.assign(dot.style, { border: 'solid black', borderRadius: '2em', width: size, height: size, ...opts.style })

    const colors = opts.colors ?? ['transparent', 'black']
    const labels = opts.labels
    let marked = opts.initial ?? 0
    ensureColor()

    const name = generateId('ui-dot')
    const listen = make_listen({ mark, increment, decrement, get: do_protocol })
    const notify = protocol ? protocol(listen, name) : undefined
    dot.onclick = event(increment)
    dot.oncontextmenu = event(decrement)

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
        if (notify) notify({ head: [name], type: 'update', data: { marked, label: labels ? labels[marked] : undefined } })
    }

    function mark(msg) {
        marked = msg.data.value
        ensureColor()
    }
    function increment() {
        marked = (marked + 1) % colors.length
        ensureColor()
    }
    function decrement() {
        marked--
        if (marked < 0) marked += colors.length
        ensureColor()
    }
    function ensureColor() {
        dot.style.backgroundColor = colors[marked]
        if (labels) dot.title = labels[marked]
    }
}