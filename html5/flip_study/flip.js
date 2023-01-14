if (typeof module === 'object') {
    module.exports = exports = FLIP 
    exports.flip = flip
} else {
    globalThis.FLIP = FLIP
    globalThis.flip = flip
}
function FLIP(root = null) {
    this.root = root ?? document.body
    this.first = new Map()
}
FLIP.prototype.read = function () {
    const children = [...this.root.children]
    this.first.clear()
    children.forEach(el=>this.first.set(el, {
        getBoundingClientRect: (_ => {
            const rect = el.getBoundingClientRect()
            return _ => rect
        })(),
        style: el.style,
    }))
}
FLIP.prototype.flip = function (options) {
    for (const [last, first] of this.first) flip({ first, last }, undefined, options)
}
FLIP.prototype.wrap = function (fn) {
    this.read()
    fn()
    this.flip()
}

function flip(el, fn, options = {}) {
    const { duration = 200, easing = 'ease-in-out', fill = 'both', iterations = 1, iterationStart = 0 } = options
    const first_el = el?.first || el
    const first = first_el.getBoundingClientRect()
    const f_opacity = first_el.style.opacity || 1
    const last_el = (fn ? fn() : undefined) || el?.last || el
    const last = last_el.getBoundingClientRect()
    const l_opacity = last_el.style.opacity || 1

    const i = {
        top: first.top - last.top,
        left: first.left - last.left,
        width: first.width / last.width,
        height: first.height / last.height
    }

    last_el.animate([
        { transformOrigin: 'top left', opacity: f_opacity, transform: ` translate(${i.left}px, ${i.top}px)` },
        { transformOrigin: 'top left', opacity: l_opacity, transform: 'none' }
    ], {
        duration, easing, fill, iterations, iterationStart
    })
}