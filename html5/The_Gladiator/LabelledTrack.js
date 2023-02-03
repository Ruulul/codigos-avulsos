const Track = require("./Track")

module.exports = function LabelledTrack(opts = {}, protocol) {
    const root = document.createElement("div")
    Object.assign(root.style, { display: 'flex', flexFlow: 'row', width: 'fit-content', alignItems: 'center', ...opts.root_style })

    const track = Track(opts, protocol)
    const label = document.createElement("span")
    label.textContent = opts.label ?? "Label"
    Object.assign(root.style, opts.label_style)

    root.append(label, track)

    root.notify = track.notify

    return root
}