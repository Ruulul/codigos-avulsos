const Tracks = require("./Tracks")
const { make_protocol } = require("./Component")

const root = document.body
const char_state = document.createElement("ul")
const char = Tracks({
    tracks: [{ label: "Dominant Arm", count: 3 }, { label: "Non Dominant Arm", count: 2 }, { label: "Body", count: 4 }],
    tracks_opts: {
        dot_opts: {
            states: ['Vigor', 'Empty', 'Fatigue', 'Wound'],
            colors: ['green', 'white', 'orange', 'red'],
        }
    },
    track_protocol: make_protocol({
        update: msg =>
            char_state.innerHTML = `
                ${Object
                .entries(msg.data)
                .map(([key, value]) =>
                    `<li>${key}: ${value}</li>`)
                .join('')
            }
            `
    })
})


root.append(char, char_state)