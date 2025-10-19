import * as THREE from 'three';
import { MyTriangle } from './MyTriangle.js';

/**  
 * This class contains a polygon
 * @extends THREE.BufferGeometry
 */
class MyPolygon extends THREE.BufferGeometry {
    /**
     * constructor
     * @param {number} radius The radius of the polygon
     * @param {number} stacks The number of stacks
     * @param {number} slices The number of slices
     * @param {string} centerColor The center color
     * @param {string} peripheryColor The periphery color
     */
    constructor(radius, stacks, slices, centerColor, peripheryColor) {
        super()
        this.radius = radius
        this.stacks = stacks
        this.slices = slices
        this.centerColor = new THREE.Color(centerColor)
        this.peripheryColor = new THREE.Color(peripheryColor)
        this.initBuffers()
    }

    /**
     * Initializes the buffers of this geometry
     */
    initBuffers() {
        const positions = []
        const normals = []
        const colors = []

        for (let slice = 0; slice < this.slices; slice++) {
            const ax = Math.cos(slice * (Math.PI * 2) / this.slices)
            const ay = Math.sin(slice * (Math.PI * 2) / this.slices)
            const bx = Math.cos((slice + 1) * (Math.PI * 2) / this.slices)
            const by = Math.sin((slice + 1) * (Math.PI * 2) / this.slices)

            for (let stack = 0; stack < this.stacks; stack++) {
                const x1 = (stack / this.stacks) * this.radius * ax
                const y1 = (stack / this.stacks) * this.radius * ay
                const z1 = 0
                const x2 = ((stack + 1) / this.stacks) * this.radius * ax
                const y2 = ((stack + 1) / this.stacks) * this.radius * ay
                const z2 = 0
                const x3 = (stack / this.stacks) * this.radius * bx
                const y3 = (stack / this.stacks) * this.radius * by
                const z3 = 0
                const x4 = ((stack + 1) / this.stacks) * this.radius * bx
                const y4 = ((stack + 1) / this.stacks) * this.radius * by
                const z4 = 0

                const colorA = this.centerColor.clone().lerp(this.peripheryColor, Math.sqrt(x1 * x1 + y1 * y1) / this.radius)
                const colorB = this.centerColor.clone().lerp(this.peripheryColor, Math.sqrt(x2 * x2 + y2 * y2) / this.radius)
                const colorC = this.centerColor.clone().lerp(this.peripheryColor, Math.sqrt(x3 * x3 + y3 * y3) / this.radius)
                const colorD = this.centerColor.clone().lerp(this.peripheryColor, Math.sqrt(x4 * x4 + y4 * y4) / this.radius)

                let triangle = new MyTriangle(x1, y1, z1, x2, y2, z2, x4, y4, z4)
                positions.push(...triangle.getAttribute('position').array)
                normals.push(...triangle.getAttribute('normal').array)
                colors.push(...colorA.toArray(), ...colorB.toArray(), ...colorD.toArray())

                if (stack > 0) {
                    triangle = new MyTriangle(x1, y1, z1, x4, y4, z4, x3, y3, z3)
                    positions.push(...triangle.getAttribute('position').array)
                    normals.push(...triangle.getAttribute('normal').array)
                    colors.push(...colorA.toArray(), ...colorD.toArray(), ...colorC.toArray())
                }
            }
        }

        this.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
        this.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
        this.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
        this.computeBoundingSphere()
    }
}

export { MyPolygon };
