const Character = require("./Character")
const { make_protocol } = require("./Component")

const root = document.body
const char_state = document.createElement("ul")
const char = Character({
    tracks: {
        dot_opts: {
            colors: ['green', 'white', 'orange', 'red'],
            labels: ['Vigor', 'Empty', 'Fatigue', 'Wound'],
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