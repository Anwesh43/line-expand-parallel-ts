const w : number = window.innerWidth
const h : number = window.innerHeight
const lines : number = 2
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 3
const foreColor : string = "#4527A0"
const backColor : string = "#212121"
const nodes : number = 5

const maxScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.max(0, scale - i / n)
}

const divideScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.min(1 / n, maxScale(scale, i, n)) * n
}

const scaleFactor : Function = (scale : number) : number => {
    return Math.floor(scale / scDiv)
}

const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    return (1 - scaleFactor(scale)) / a + scaleFactor(scale) / b
}

const updateValue : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawLEPNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = h / (nodes + 1)
    const size : number = gap / sizeFactor
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    console.log(`${sc1} ${sc2}`)
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.lineCap = 'round'
    context.strokeStyle = foreColor
    context.save()
    context.translate(w / 2, gap * (i + 1))
    context.rotate(Math.PI/2 * sc2)
    for (var j = 0; j < lines; j++) {
        const sc : number = divideScale(sc1, j, lines)
        context.save()
        const sfj : number = 1 - 2 * j
        const xSize : number = size / (j * 2 + 2)
        const y : number = size * sfj
        for (var k = 0; k < lines; k++) {
            const sck : number = divideScale(sc, k, lines)
            const skj : number = 1 - 2 * k
            context.save()
            context.translate(xSize * skj * sck, 0)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, size * sfj)
            context.stroke()
            context.restore()
        }
        context.restore()
    }
    context.restore()
}

class LineExpandParallelStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : LineExpandParallelStage = new LineExpandParallelStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += updateValue(this.scale, this.dir, lines * lines, 1)
        console.log(this.scale)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LEPNode {
    state : State = new State()
    next : LEPNode
    prev : LEPNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LEPNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawLEPNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LEPNode {
        var curr : LEPNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr != null) {
            return curr
        }
        cb()
        return this
    }
}

class LineExpandParallel {

    root : LEPNode = new LEPNode(0)
    curr : LEPNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    lep : LineExpandParallel = new LineExpandParallel()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.lep.draw(context)
    }

    handleTap(cb : Function) {
        this.lep.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.lep.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
