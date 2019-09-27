const w : number = window.innerWidth 
const h : number = window.innerHeight 
const scGap : number = 0.05 
const strokeFactor : number = 90
const delay : number = 50
const levels : number = 5
const ballSizeFactor : number = 4
const foreColor : string = "#f44336"
const backColor : string = "#BDBDBD"


class Stage {
		
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

	static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
		context.beginPath()
		context.moveTo(x1, y1)
		context.lineTo(x2, y2)
		context.stroke()
	}

	static fillCircle(context : CanvasRenderingContext2D, r : number) {
		context.beginPath()
		context.arc(0, 0, r, 0, 2 * Math.PI)
		context.fill()
	}

	static drawTreeNode(context : CanvasRenderingContext2D, i : number, j : number, scale : number) {
		const gap : number = Math.min(w, h) / (levels + 1)
		const scFactor = j + 1 == levels ? 1 : 2
		context.lineCap = 'round'
		context.lineWidth = Math.min(w, h) / strokeFactor 
		context.strokeStyle = foreColor
		context.fillStyle = foreColor
		const r : number = gap / ballSizeFactor 
		context.save()
		context.translate(gap + i * gap, gap + j * gap)
		DrawingUtil.strokeCircle(context, r)
		DrawingUtil.fillCircle(context, r * ScaleUtil.divideScale(scale, 0, scFactor))
		if (j < levels - 1) {
			const sc : number = ScaleUtil.divideScale(scale, 1, 2)
			DrawingUtil.drawLine(context, 0, 0, -gap * sc, gap * sc)
			DrawingUtil.drawLine(context, 0, 0, gap * sc, gap * sc)
		}
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

class TreeNode {
		
	right : TreeNode 
	left : TreeNode 
	state : State = new State()

	constructor(private i : number, private j : number) {
		this.addNeighbor()
	}

	addNeighbor() {
		if (this.j < levels - 1) {
			this.right = new TreeNode(this.i + 1, this.j + 1)
			this.left = new TreeNode(this.i - 1, this.j - 1)
		}
	}

	draw(context : CanvasRenderingContext2D) {
		DrawingUtil.drawTreeNode(context, this.i, this.j, this.state.scale)
	} 

	update(cb : Function) {
		this.state.update(cb)
	}

	startUpdating(cb : Function) {
		this.state.startUpdating(cb)
	}
}

class Tree {
	
	root : TreeNode = new TreeNode(0, 0)
	dir : number = 1
	nodes : Array<TreeNode> = []
	animObjects : Array<TreeNode> = []

	constructor() {
		this.nodes.push(this.root)
	}

	draw(context : CanvasRenderingContext2D) {
		this.root.draw(context)
	}

	update(cb : Function) {
		for (var i = this.animObjects.length - 1; i >= 0; i--) {
			const animObject = this.animObjects[i]
			animObject.update(() => {
				this.animObjects.splice(i, 1)
				if (animObject.left) {
					this.nodes.push(animObject.left)
				}

				if (animObject.right) {
					this.nodes.push(animObject.right)
				}
				if (this.animObjects.length == 0) {
					cb()
				}
			})
		}
	}

	startUpdating(cb : Function) {
		this.nodes.forEach((node) => {
			node.startUpdating(() => {
				this.animObjects.push(node)
				if (this.animObjects.length == this.nodes.length) {
					this.nodes = []
					cb()
				}
			})
		})
	}
}

class Renderer  {
		
	animator : Animator = new Animator()
	tree : Tree = new Tree()

	render(context : CanvasRenderingContext2D) {
		this.tree.draw(context)
	}

	handleTap(cb : Function) {
		this.tree.startUpdating(() => {
			this.animator.start(() => {
				cb()
				this.tree.update(() => {
					this.animator.stop()
					cb()
				})
			})
		})
	}
}
