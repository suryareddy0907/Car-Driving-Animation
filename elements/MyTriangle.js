import * as THREE from 'three';

/** 
 * This class contains a triangle
 * @extends THREE.BufferGeometry
 */
class MyTriangle extends THREE.BufferGeometry {
	/**
	 * constructor
	 * @param {number} x1 The x coordinate of the first vertex
	 * @param {number} y1 The y coordinate of the first vertex
	 * @param {number} z1 The z coordinate of the first vertex
	 * @param {number} x2 The x coordinate of the second vertex
	 * @param {number} y2 The y coordinate of the second vertex
	 * @param {number} z2 The z coordinate of the second vertex
	 * @param {number} x3 The x coordinate of the third vertex
	 * @param {number} y3 The y coordinate of the third vertex
	 * @param {number} z3 The z coordinate of the third vertex
	 * @param {number} afs The horizontal texture scale factor
	 * @param {number} aft The vertical texture scale factor
	 */
	constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3, afs = 1, aft = 1) {
		super()
        this.p1 = new THREE.Vector3(x1, y1, z1)
		this.p2 = new THREE.Vector3(x2, y2, z2)
		this.p3 = new THREE.Vector3(x3, y3, z3)
        this.initBuffers()
	}

	/**
	 * Initializes the buffers of this geometry
	 */
	initBuffers() {
        let vectorAx = this.p2.x - this.p1.x
		let vectorAy = this.p2.y - this.p1.y
		let vectorAz = this.p2.z - this.p1.z

		let vectorBx = this.p3.x - this.p1.x
		let vectorBy = this.p3.y - this.p1.y
		let vectorBz = this.p3.z - this.p1.z

		let crossProductX = vectorAy * vectorBz - vectorBy * vectorAz
		let crossProductY = vectorBx * vectorAz - vectorAx * vectorBz
		let crossProductZ = vectorAx * vectorBy - vectorBx * vectorAy
		
		let normal = new THREE.Vector3(crossProductX, crossProductY, crossProductZ)
        normal.normalize()

		let a = this.p1.distanceTo(this.p2)
		let b = this.p2.distanceTo(this.p3)
		let c = this.p1.distanceTo(this.p3)
		let cos_ac = (a * a - b * b + c * c) / (2 * a * c)
		let sin_ac = Math.sqrt(1 - cos_ac * cos_ac)

		const vertices = [
            ...this.p1.toArray(),
			...this.p2.toArray(),
			...this.p3.toArray()	
        ]
		const indices = [0, 1, 2]
		const normals = [
			...normal.toArray(),
			...normal.toArray(),
			...normal.toArray()
		]
		const uvs = [
			0, 0,
			1 , 0,
			1 * cos_ac, 1 * sin_ac
		]

        this.setIndex(indices)
        this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
        this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
	}
}

export { MyTriangle };