(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./Component":2,"./LabelledTrack":4}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
const { generateId, make_listen } = require("./Component")

module.exports = function Dot(opts = {}, protocol) {
    const dot = document.createElement("div")
    const size = opts.size ?? '2em'
    Object.assign(dot.style, { border: 'solid black', borderRadius: '2em', width: size, height: size, ...opts.style })

    const colors = opts.colors ?? ['transparent', 'black']
    const labels = opts.labels
    let marked = opts.initial ?? 0
    ensureColor()

    const name = generateId('ui-dot')
    const listen = make_listen({ mark, increment, decrement, get: do_protocol })
    const notify = protocol ? protocol(listen, name) : undefined
    dot.onclick = event(increment)
    dot.oncontextmenu = event(decrement)

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
        if (notify) notify({ head: [name], type: 'update', data: { marked, label: labels ? labels[marked] : undefined } })
    }

    function mark(msg) {
        marked = msg.data.value
        ensureColor()
    }
    function increment() {
        marked = (marked + 1) % colors.length
        ensureColor()
    }
    function decrement() {
        marked--
        if (marked < 0) marked += colors.length
        ensureColor()
    }
    function ensureColor() {
        dot.style.backgroundColor = colors[marked]
        if (labels) dot.title = labels[marked]
    }
}
},{"./Component":2}],4:[function(require,module,exports){
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
},{"./Track":5}],5:[function(require,module,exports){
const { generateId, make_listen, make_protocol } = require("./Component")
const Dot = require("./Dot")

module.exports = function Track(opts = {}, protocol) {
    const name = generateId('ui-track')
    const listen = make_listen({})
    const notify = protocol ? protocol(listen, name) : undefined

    const count = opts.count ?? 3
    const dots = Array(count).fill().map(_ => Dot(opts.dot_opts, make_protocol({
        update: msg => notify ? notify(msg) : undefined
    })))

    const track = document.createElement("div")
    Object.assign(track.style, { display: 'flex', flexFlow: 'row', gap: '0.5em', padding: '0.5em', ...opts.style })
    track.append(...dots)
    dots.forEach(dot => dot.notify({ head: [name], type: 'get' }))

    track.notify = listen

    return track
}
},{"./Component":2,"./Dot":3}],6:[function(require,module,exports){
const Character = require("./Character")
const { make_protocol } = require("./Component")

const root = document.body
const logDots = function () {
    const count = {}
    last = {}
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
},{"./Character":1,"./Component":2}]},{},[6]);
