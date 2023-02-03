(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Component = {
    generateId: (_ => {
        let count = 0
        return (component = 'component', id) => `${component}-${id ?? count++}`
    })(),
    handle_handle(handle, type, msg) {
        if (type in handle) return handle[type](msg)
        else console.trace("There is no handle for", type, ", emitted by", msg.head[0], "\nFull msg:", JSON.stringify(msg))
    },
    make_listen(handles) {
        return function (msg) {
            return Component.handle_handle(handles, msg.type, msg)
        }
    },
    make_protocol(obj_listen, protocol_fn) {
        const listen = Component.make_listen(obj_listen)
        return function protocol(notify, id) {
            if (protocol_fn) protocol_fn(notify, id)
            return listen
        }
    },
}
module.exports = Component
},{}],2:[function(require,module,exports){
const { generateId, make_listen } = require("./Component")

module.exports = function Dot(opts = {}, protocol) {
    const dot = document.createElement("div")
    const size = opts.size ?? '2em'
    Object.assign(dot.style, { border: 'solid black', borderRadius: '2em', width: size, height: size, ...opts.style })

    const states = opts.states
    const colors = opts.colors ?? Array(states.length).fill().map(_ =>  `#${Math.random().toString(16).slice(2, 8)}`)
    let state = opts.initial ?? 0
    ensureColor()

    const name = generateId('ui-dot')
    const listen = make_listen({ mark: color(mark), increment: color(increment), decrement: color(decrement), get: do_protocol })
    const notify = protocol ? protocol(listen, name) : undefined
    dot.onclick = event(color(increment))
    dot.oncontextmenu = event(color(decrement))

    dot.notify = listen

    return dot

    function event(fn) {
        return e => {
            e.preventDefault()
            fn()
            do_protocol()
        }
    }
    function do_protocol() {
        if (notify) notify({ head: [name], type: 'update', data: { state: states[state] } })
    }

    function mark(msg) {
        state = msg.data.value
    }
    function increment() {
        state = (state + 1) % colors.length
    }
    function decrement() {
        state--
        if (state < 0) state += colors.length
    }
    function color(fn) {
        return (...args) => {
            fn(...args)
            ensureColor()
        }
    }
    function ensureColor() {
        dot.style.backgroundColor = colors[state]
        dot.title = states[state]
    }
}
},{"./Component":1}],3:[function(require,module,exports){
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
},{"./Track":4}],4:[function(require,module,exports){
const { generateId, make_listen, make_protocol } = require("./Component")
const Dot = require("./Dot")

module.exports = function Track(opts = {}, protocol) {
    const name = generateId('ui-track')
    const listen = make_listen({ get: notify_state })
    const notify = protocol ? protocol(listen, name) : undefined

    const count = opts.count ?? 3
    const dots_state = new Map()
    const dots = Array(count).fill().map((_, index) => Dot(opts.dot_opts, make_protocol({
        update: msg => {
            dots_state.get(msg.head[0]).state = msg.data.state
            notify_state()
        }
    }, (notify, id) => dots_state.set(id, { notify, index }))))

    const track = document.createElement("div")
    Object.assign(track.style, { display: 'flex', flexFlow: 'row', gap: '0.5em', padding: '0.5em', ...opts.style })
    track.append(...dots)
    dots.forEach(dot => dot.notify({ head: [name], type: 'get' }))

    track.notify = listen

    return track

    function notify_state() {
        if (notify) notify({ head: [name], type: 'update', data: get_state(dots_state) })
    }
}

function get_state(state) {
    const data = {}
    for (const dot of state.values()) {
        const state = dot.state
        if (!data[state]) data[state] = 0
        data[state]++
    }
    return data
}
},{"./Component":1,"./Dot":2}],5:[function(require,module,exports){
const { make_listen, generateId, make_protocol } = require("./Component")
const LabelledTrack = require("./LabelledTrack")

module.exports = function Tracks(_tracks, opts = {}, protocol) {
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
    const tracks = _tracks.map(({ label, count }) => Track(label, count))

    root.append(...tracks)

    return root

    function Track(label, count) {
        return LabelledTrack({ label, count, ...opts.tracks }, make_protocol({
            update(msg) {
                tracks_state.get(msg.head[0]).state = msg.data
                notify_state()
            }
        }, (notify, id) => tracks_state.set(id, { notify, label })))
    }

    function notify_state() {
        if (notify) notify({ head: [name], type: 'update', data: Object.fromEntries(tracks_state.entries()) })
    }
}
},{"./Component":1,"./LabelledTrack":3}],6:[function(require,module,exports){
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

root.append(char, char_state,
    Tracks([{ label: "Tokens", count: 6 }], 
    { tracks: { dot_opts: { states: ["Empty, Token"], colors: ["black", "white"] } } })
)
},{"./Component":1,"./Tracks":5}]},{},[6]);
