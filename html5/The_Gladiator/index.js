const Character = require("./Character")
const { make_protocol } = require("./Component")

const root = document.body
const logDots = function () {
    const count = {}
    const last = {}
    return function listen(msg) {
        let { label } = msg.data
        let [from] = msg.head
        if (!count[label]) count[label] = 0
        count[label]++
        if (from in last) count[last[from]]--
        if (!count[last[from]]) count[last[from]] = undefined
        if (!count[label]) count[label] = undefined
        last[from] = label
        console.log(JSON.stringify(count))
    }
}
const char = Character({
    tracks: {
        dot_opts: {
            colors: ['green', 'white', 'orange', 'red'],
            labels: ['Vigor', 'Empty', 'Fatigue', 'Wound'],
        }
    },
    track_protocol: make_protocol({ update: logDots() })
})

root.append(char)