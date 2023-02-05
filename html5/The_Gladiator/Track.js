const { generateId, make_listen, make_protocol } = require("./Component")
const Dot = require("./Dot")

module.exports = function Track(opts = {}, protocol) {
    const name = generateId('ui-track')
    const listen = make_listen({
        get: notify_state,
        add,
        remove,
        swap,
    })
    const notify = protocol ? protocol(listen, name) : undefined

    const count = opts.count ?? 3
    const dots_state = []
    const dot_protocol = make_protocol({
        update: msg => {
            dots_state.find(dot => dot.id === msg.head[0]).state = msg.data.state
            notify_state()
        }
    }, (notify, id) => dots_state.push({ id, notify }))
    const dots = Array(count).fill().map(_ => Dot(opts.dot_opts, dot_protocol))

    const track = document.createElement("div")
    Object.assign(track.style, { display: 'flex', flexFlow: 'row', gap: '0.5em', padding: '0.5em', ...opts.style })
    track.append(...dots)
    dots.forEach(dot => dot.notify({ head: [name], type: 'get' }))

    track.notify = listen

    return track

    function notify_state() {
        if (notify) notify({ head: [name], type: 'update', data: get_state(dots_state) })
    }

    function add(msg) {
        const count = msg.data.count ?? 1
        for (let i = 0; i < count; i++) {
            const new_dot = Dot(opts.dot_opts, dot_protocol)
            dots.push(new_dot)
            new_dot.notify({ head: [name], type: 'mark', data: { value: opts.dot_opts.states.indexOf(msg.data.type) } })
            track.append(new_dot)
        }
    }

    function remove(msg) {
        const count = msg.data.count ?? 1
        for (let i = 0; i < count; i++) {
            const idx_to_remove = dots_state.findLastIndex(dot => dot.state === msg.data.type)
            if (idx_to_remove < 0) return false
            const dot = dots[idx_to_remove]
            dots_state.splice(idx_to_remove, 1)
            dot.notify({ head: [name], type: 'delete' })
            dots.splice(idx_to_remove, 1)
        }
    }

    function swap(msg) {
        const { from: { type: from }, to: { type: to }, count = 1 } = msg.data
        dots_state
            .filter(dot => dot.state === from)
            .slice(0, count)
            .forEach(dot =>
                dot.notify({
                    ...msg,
                    type: 'mark',
                    data: {
                        value: opts.dot_opts.states.indexOf(to)
                    }
                })
            )
    }
}

function get_state(state) {
    const data = {}
    for (const dot of state) {
        const state = dot.state
        if (!data[state]) data[state] = 0
        data[state]++
    }
    return data
}