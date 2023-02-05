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
    let dot = document.createElement("div")
    const size = opts.size ?? '2em'
    Object.assign(dot.style, { border: 'solid black', borderRadius: '2em', width: size, height: size, ...opts.style })

    const states = opts.states
    const colors = opts.colors ?? Array(states.length).fill().map(_ => `#${Math.random().toString(16).slice(2, 8)}`)
    let state = opts.initial ?? 0
    ensureColor()

    const name = generateId('ui-dot')
    let listen = make_listen({ delete: do_delete, mark: prtcl(color(mark)), increment: prtcl(color(increment)), decrement: prtcl(color(decrement)), get: do_protocol })
    let notify = protocol ? protocol(listen, name) : undefined
    if (!opts.no_click) {
        dot.onclick = event(color(increment))
        dot.oncontextmenu = event(color(decrement))
    }

    dot.notify = listen

    return dot

    function do_delete() {
        dot.remove()
        dot.onclick = undefined
        dot.oncontextmenu = undefined
        dot.notify = undefined
        dot = undefined
        notify = undefined
        listen = undefined
    }
    function event(fn) {
        return prtcl(e => {
            e.preventDefault()
            fn()
        })
    }
    function prtcl(fn) {
        return (...args) => {
            fn(...args)
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
    const listen = make_listen({
        get: notify_state,
        add,
        remove,
        swap,
    })
    const notify = protocol ? protocol(listen, name) : undefined

    const count = opts.count ?? 3
    const dots_state = []
    const dot_protocol = make_protocol({
        update: msg => {
            dots_state.find(dot => dot.id === msg.head[0]).state = msg.data.state
            notify_state()
        }
    }, (notify, id) => dots_state.push({ id, notify }))
    const dots = Array(count).fill().map(_ => Dot(opts.dot_opts, dot_protocol))

    const track = document.createElement("div")
    Object.assign(track.style, { display: 'flex', flexFlow: 'row', gap: '0.5em', padding: '0.5em', ...opts.style })
    track.append(...dots)
    dots.forEach(dot => dot.notify({ head: [name], type: 'get' }))

    track.notify = listen

    return track

    function notify_state() {
        if (notify) notify({ head: [name], type: 'update', data: get_state(dots_state) })
    }

    function add(msg) {
        const count = msg.data.count ?? 1
        for (let i = 0; i < count; i++) {
            const new_dot = Dot(opts.dot_opts, dot_protocol)
            dots.push(new_dot)
            new_dot.notify({ head: [name], type: 'mark', data: { value: opts.dot_opts.states.indexOf(msg.data.type) } })
            track.append(new_dot)
        }
    }

    function remove(msg) {
        const count = msg.data.count ?? 1
        for (let i = 0; i < count; i++) {
            const idx_to_remove = dots_state.findLastIndex(dot => dot.state === msg.data.type)
            if (idx_to_remove < 0) return false
            const dot = dots[idx_to_remove]
            dots_state.splice(idx_to_remove, 1)
            dot.notify({ head: [name], type: 'delete' })
            dots.splice(idx_to_remove, 1)
        }
    }

    function swap(msg) {
        const { from: { type: from }, to: { type: to }, count = 1 } = msg.data
        dots_state
            .filter(dot => dot.state === from)
            .slice(0, count)
            .forEach(dot =>
                dot.notify({
                    ...msg,
                    type: 'mark',
                    data: {
                        value: opts.dot_opts.states.indexOf(to)
                    }
                })
            )
    }
}

function get_state(state) {
    const data = {}
    for (const dot of state) {
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
},{"./Component":1,"./LabelledTrack":3,"./Tracks":5}]},{},[6]);
