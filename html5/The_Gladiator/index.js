const Tracks = require("./Tracks")
const { make_protocol } = require("./Component")

const root = document.body
const char_state = document.createElement("ul")
const char = Tracks([{ label: "Dominant Arm", count: 3 }, { label: "Non Dominant Arm", count: 2 }, { label: "Body", count: 4 }], {
    tracks: {
        dot_opts: {
            states: ['Vigor', 'Empty', 'Fatigue', 'Wound'],
            colors: ['green', 'white', 'orange', 'red'],
        }
    },
}, make_protocol({
    update: msg =>
        char_state.innerHTML = `
            ${Object
            .entries(msg.data)
            .map(([key, { label, state }]) =>
                `<li title="track ${key}">${label}: <ul>${Object
                    .entries(state)
                    .map(([key, value]) =>
                        `<li>${key}: ${value}</li>`
                    ).join('')
                }</ul></li>`)
            .join('')
        }
     `
}))

root.append(char, char_state)