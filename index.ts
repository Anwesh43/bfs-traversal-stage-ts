const w : number = window.innerWidth 
const h : number = window.innerHeight 
const scGap : number = 0.05 
const strokeFactor : number = 90
const delay : number = 50

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