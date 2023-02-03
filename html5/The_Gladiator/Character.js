const { make_listen, generateId } = require("./Component")
const LabelledTrack = require("./LabelledTrack")

module.exports = function Character(opts = {}, protocol) {
    const root = document.createElement("div")
    Object.assign(root.style, {
        display: 'grid', width: 'fit-content', justifyItems: 'right',
        ...opts.root_style
    })

    const dominant_arm = Track("Dominant Arm", 3)
    const non_dominant_arm = Track("Non Dominant Arm", 2)
    const body = Track("Body", 4)

    root.append(dominant_arm, non_dominant_arm, body)

    const name = generateId('ui-character')
    const listen = make_listen({})
    const notify = protocol ? protocol(listen, name) : undefined
    root.notify = listen

    return root

    function Track(label, count) {
        return LabelledTrack({ label, count, ...opts.tracks }, opts.track_protocol)
    }
}