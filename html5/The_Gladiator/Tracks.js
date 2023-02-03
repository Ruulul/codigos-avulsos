const { make_listen, generateId } = require("./Component")
const LabelledTrack = require("./LabelledTrack")

module.exports = function Tracks(opts = {}, protocol) {
    const root = document.createElement("div")
    Object.assign(root.style, {
        display: 'grid', width: 'fit-content', justifyItems: 'right',
        ...opts.root_style
    })

    const tracks = opts.tracks.map(({label, count})=>Track(label, count))

    root.append(...tracks)

    const name = generateId('ui-tracks')
    const listen = make_listen({})
    const notify = protocol ? protocol(listen, name) : undefined
    root.notify = listen

    return root

    function Track(label, count) {
        return LabelledTrack({ label, count, ...opts.tracks_opts }, opts.track_protocol)
    }
}