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

const scaleFactor : Function = (scale : number, i : number, n : number) : number => {
    return Math.floor(scale / scDiv)
}

const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    return (1 - scaleFactor()) / a + scaleFactor() / b
}

const updateValue : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawLEPNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = h / (nodes + 1)
    const size : number = gap / sizeFactor
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.lineCap = 'round'
    context.strokeStyle = foreColor
    context.save()
    context.translate(w / 2, gap * (i + 1))
    context.rotate(Math.PI/2 * sc2)
    for (var j = 0; j < lines; j++) {
        const sc : number = divideScale(sc2, j, lines)
        context.save()
        const sfj : number = 1 - 2 * j
        const xSize : number = size / (j + 1)
        const y : number = size * sfj
        for (var k = 0; k < lines; k++) {
            const sck : number = divideScale(sc, k, lines)
            const skj : number = 1 - 2 * k
            context.save()
            context.translate(xSize * skj, 0)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, size * sfj * sck)
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

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : LineExpandParallelStage = new LineExpandParallelStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}
