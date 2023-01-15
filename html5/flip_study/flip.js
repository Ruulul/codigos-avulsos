class FLIP {
    static flip_batch = new Set()
    constructor(root = null) {
        this.root = root ?? document.body
        this.first = new Map()
    }
    read() {
        const children = this.root.childNodes
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
            rect,
            style: {
                opacity: el.style.opacity,
                transform: el.style.transform,
            },
        }
    }
    static flip(el, options = {}) {
        if (FLIP.flip_batch.size === 0) requestAnimationFrame(do_batch)
        FLIP.flip_batch.add(el)
        
        function do_batch () {
            FLIP.flip_batch.forEach(el=>_flip(el, options))
            FLIP.flip_batch.clear()
        }

        function _flip(el, options) {
            const { duration = 200, easing = 'ease-in-out', fill = 'both', iterations = 1, iterationStart = 0 } = options
            
            const first_el = el.first
            const first = first_el.rect
            const f_transform = first_el.style.transform
            const f_opacity = first_el.style.opacity || 1

            const last_el = el.last
            const last = last_el.getBoundingClientRect()
            const l_transform = last_el.style.transform
            const l_opacity = last_el.style.opacity || 1

            const i = {
                top: first.top - last.top,
                left: first.left - last.left,
                width: first.width / last.width,
                height: first.height / last.height
            }

            last_el.animate([
                { transformOrigin: 'top left', opacity: f_opacity, transform: f_transform + ` translate(${i.left}px, ${i.top}px)` },
                { transformOrigin: 'top left', opacity: l_opacity, transform: l_transform || 'none' }
            ], {
                duration, easing, fill, iterations, iterationStart
            })
        }
    }
}

if (typeof module === 'object') {
    module.exports = exports = FLIP
} else {
    globalThis.FLIP = FLIP
}
