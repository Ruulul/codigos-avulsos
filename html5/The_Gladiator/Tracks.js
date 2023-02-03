const { make_listen, generateId, make_protocol } = require("./Component")
const LabelledTrack = require("./LabelledTrack")

module.exports = function Tracks(opts = {}, protocol) {
    const root = document.createElement("div")
    Object.assign(root.style, {
        display: 'grid', width: 'fit-content', justifyItems: 'right',
        ...opts.root_style
    })

    const name = generateId('ui-tracks')
    const listen = make_listen({ get: notify_state })
    const notify = protocol ? protocol(listen, name) : undefined
    root.notify = listen

    const tracks_state = new Map()
    const tracks = opts.tracks.map(({ label, count }) => Track(label, count))

    root.append(...tracks)

    return root

    function Track(label, count) {
        return LabelledTrack({ label, count, ...opts.tracks_opts }, make_protocol({
            update(msg) {
                tracks_state.get(msg.head[0]).state = msg.data
                notify_state()
            }
        }, (notify, id) => tracks_state.set(id, { notify, label })))
    }

    function notify_state() {
        notify({ head: [name], type: 'update', data: Object.fromEntries(tracks_state.entries()) })
    }
}