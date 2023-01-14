class FLIP {
    constructor(root = null) {
        this.root = root ?? document.body
        this.first = new Map()
    }
    read() {
        const children = [...this.root.children]
        this.first.clear()
        children.forEach(el => this.first.set(el, FLIP.snap(el)))
    }
    flip(options) {
        this.first.forEach((first, last) => FLIP.flip({ first, last }, options))
    }
    wrap(fn) {
        return _ => {
            this.read()
            fn()
            this.flip()
        }
    }
    static snap(el) {
        const rect = el.getBoundingClientRect()
        return {
            getBoundingClientRect: _ => rect,
            style: Object.assign({}, el.style),
        }
    }
    static flip(el, options = {}) {
        requestAnimationFrame(_ => {
            const { duration = 200, easing = 'ease-in-out', fill = 'both', iterations = 1, iterationStart = 0 } = options
            const first_el = el?.first || el
            const first = first_el.getBoundingClientRect()
            const f_opacity = first_el.style.opacity || 1
            const last_el = el?.last || el
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
        })
    }
}

if (typeof module === 'object') {
    module.exports = exports = FLIP
} else {
    globalThis.FLIP = FLIP
}
