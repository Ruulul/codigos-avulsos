const { generateId, make_listen, make_protocol } = require("./Component")
const Dot = require("./Dot")

module.exports = function Track(opts = {}, protocol) {
    const name = generateId('ui-track')
    const listen = make_listen({ get: notify_state })
    const notify = protocol ? protocol(listen, name) : undefined

    const count = opts.count ?? 3
    const dots_state = new Map()
    const dots = Array(count).fill().map((_, index) => Dot(opts.dot_opts, make_protocol({
        update: msg => {
            dots_state.get(msg.head[0]).state = msg.data
            notify_state()
        }
    }, (notify, id) => dots_state.set(id, { notify, index }))))

    const track = document.createElement("div")
    Object.assign(track.style, { display: 'flex', flexFlow: 'row', gap: '0.5em', padding: '0.5em', ...opts.style })
    track.append(...dots)
    dots.forEach(dot => dot.notify({ head: [name], type: 'get' }))

    track.notify = listen

    return track

    function notify_state() {
        notify({ head: [name], type: 'update', data: get_state(dots_state) })
    }
}

function get_state(state) {
    const data = {}
    for (const dot of state.values()) {
        const { label, marked } = dot.state ?? {}
        if (label) {
            if (!data[label]) data[label] = 0
            data[label]++
        } else {
            if (!data[marked]) data[marked] = 0
            data[marked]++
        }
    }
    return data
}