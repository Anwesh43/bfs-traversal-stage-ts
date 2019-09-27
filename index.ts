const w : number = window.innerWidth 
const h : number = window.innerHeight 
const scGap : number = 0.05 
const strokeFactor : number = 90
const delay : number = 50
const ballSizeFactor : number = 15
const foreColor : string = "#f44336"
const backColor : string = "#BDBDBD"


class Stage {
		
	canvas : HTMLCanvasElement = document.createElement('canvas')
	context : CanvasRenderingContext2D 

	initCanvas() {
		this.canvas.width = w 
		this.canvas.height = h 
		this.context = this.canvas.getContext('2d')
		document.body.appendChild(this.canvas)
	}

	render() {
		this.context.fillRect(0, 0, w, h)
	}

	handleTap() {
		this.canvas.onmousedown = () => {

		}
	}

	static init() {
		const stage : Stage = new Stage()
		stage.initCanvas()
		stage.render()
		stage.handleTap()
	}
}

class ScaleUtil {
		
	static maxScale(scale : number, i : number, n : number) : number {
		return Math.max(0, scale - i / n)
	}

	static divideScale(scale : number, i : number, n : number) : number {
		return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n))
	}
}

class DrawingUtil {
	
	static strokeCircle(context : CanvasRenderingContext2D, r : number) {
		context.beginPath()
		context.arc(0, 0, r, 0, 2 * Math.PI)
		context.stroke()
	}

	static fillCircle(context : CanvasRenderingContext2D, r : number) {
		context.beginPath()
		context.arc(0, 0, r, 0, 2 * Math.PI)
		context.fill()
	}

	static drawTreeNode(context : CanvasRenderingContext2D, x : number, y : number, scale : number) {
		context.lineCap = 'round'
		context.lineWidth = Math.min(w, h) / strokeFactor 
		context.strokeStyle = foreColor
		context.fillStyle = foreColor
		const r : number = Math.min(w, h) / ballSizeFactor 
		context.save()
		context.translate(x, y)
		DrawingUtil.strokeCircle(context, r)
		DrawingUtil.fillCircle(context, r * ScaleUtil.divideScale(scale, 0, 2))
		context.restore()
	}
}

class State {
	
	scale : number = 0
	dir : number = 0
	prevScale : number = 0

	update(cb : Function) {
		this.scale += this.dir * scGap 
		if (Math.abs(this.scale - this.prevScale) > 1) {
			this.scale = this.prevScale + this.dir 
			this.dir = 0
			this.prevScale = this.scale 
			cb(this.prevScale)
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
