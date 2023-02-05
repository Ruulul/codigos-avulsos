const Tracks = require("./Tracks")
const { make_protocol } = require("./Component")
const LabelledTrack = require("./LabelledTrack")

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
char.childNodes.forEach(track =>
    withSelectAction(track, [
        {
            label: 'Spend Vigor',
            fn: el => el.notify({ type: 'swap', data: { from: { type: 'Vigor' }, to: { type: 'Empty' } } })
        },
        {
            label: 'Rest',
            fn: el => el.notify({ type: 'swap', data: { from: { type: 'Empty' }, to: { type: 'Vigor' } } })
        },
        {
            label: 'Prepare',
            fn: _=>{}
        },
    ])
)

const tokens = LabelledTrack({ count: 0, label: 'Tokens', dot_opts: { states: ['Token'], colors: ['white'] } })

root.append(char, char_state, withSelectAction(tokens, [
    { label: 'Add', fn: el => el.notify({ type: 'add', data: { type: 'Token' } }) },
    { label: 'Remove', fn: el => el.notify({ type: 'remove', data: { type: 'Token' } }) },
]))

function withSelectAction(el, actions, target) {
    const select = document.createElement("select")
    const button = document.createElement("button")
    button.textContent = 'Do'
    select.append(...actions.map((action, index) => {
        const option = document.createElement("option")
        option.textContent = action.label
        option.value = index
        return option
    }))
    let fn = actions[0].fn
    button.onclick = _ => fn ? fn(target ?? el) : undefined
    select.oninput = _ => fn = actions[select.value].fn
    el.append(select, button)
    return el
}
function withActions(el, actions, target) {
    for (const action of actions) {
        const button = document.createElement("button")
        button.textContent = action.label
        button.onclick = _ => action.fn(target ?? el)
        el.append(button)
    }
    return el
}