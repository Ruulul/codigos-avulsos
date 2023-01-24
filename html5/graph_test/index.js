const Graph = require("graphology")
const FA2 = require("graphology-layout-forceatlas2")
const FA2_worker = require("graphology-layout-forceatlas2/worker")
const { Sigma } = require("sigma")
const root = document.body

const graph_container = document.createElement("div")
const width = 500
Object.assign(graph_container.style, { width: `${width}px`, height: `${width}px`, outline: 'solid' })
root.append(graph_container)

const graph = new Graph()
const renderer = new Sigma(graph, graph_container)
const force_options = {
    iterations: 5,
    settings: {
        slowDown: 5000,
    }
}
const layout = new FA2_worker(graph, force_options)
fillGraph(layout, 1000, 5)

async function fillGraph(layout, n = 50, time = 50) {
    if (layout.isRunning()) layout.stop()
    for (let i = 0; i < n; i++) {
        const r_factor = 50
        const r = Math.random
        layout.graph.addNode(i, { label: `Node ${i}`, color: `#${r().toString(16).slice(2, 8)}`, x: r() * r_factor, y: r() * r_factor })
        layout.graph.addEdge(Math.floor(Math.sqrt(i)), i)
        FA2.assign(graph, force_options)
        await wait(time)
    }
    if (!layout.isRunning()) layout.start()
}

async function wait(n) {
    return new Promise(res => setTimeout(res, n))
}