const { generateId, make_listen, make_protocol } = require("./Component")
const Dot = require("./Dot")

module.exports = function Track(opts = {}, protocol) {
    const name = generateId('ui-track')
    const listen = make_listen({})
    const notify = protocol ? protocol(listen, name) : undefined

    const count = opts.count ?? 3
    const dots = Array(count).fill().map(_ => Dot(opts.dot_opts, make_protocol({
        update: msg => notify ? notify(msg) : undefined
    })))

    const track = document.createElement("div")
    Object.assign(track.style, { display: 'flex', flexFlow: 'row', gap: '0.5em', padding: '0.5em', ...opts.style })
    track.append(...dots)
    dots.forEach(dot => dot.notify({ head: [name], type: 'get' }))

    track.notify = listen

    return track
}