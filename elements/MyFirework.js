import * as THREE from 'three'

/**
 * This class contains the firework object
 */
class MyFirework {
    /**
     * constructor
     * @param {*} parent 
     * @param {THREE.Vector3} origin 
     */
    constructor(parent, origin) {
        this.parent = parent
        this.origin = origin

        this.done = false 
        this.dest = [] 
        
        this.vertices = null
        this.colors = null
        this.geometry = null
        this.points = null
        
        this.material = new THREE.PointsMaterial({
            size: 0.1,
            opacity: 1,
            vertexColors: true,
            transparent: true,
            depthTest: false,
        })
        
        this.height = 20
        this.speed = 60

        this.launch() 
    }

    /**
     * compute particle launch
     */
    launch() {
        let color = new THREE.Color()
        color.setHSL(THREE.MathUtils.randFloat( 0.1, 0.9 ), 1, 0.5)
        let colors = [color.r, color.g, color.b]

        let x = this.origin.x + THREE.MathUtils.randFloat(-5, 5) 
        let y = this.origin.y + THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1)
        let z = this.origin.z + THREE.MathUtils.randFloat(-5, 5) 
        this.dest.push(x, y, z) 
        let vertices = [this.origin.x, this.origin.y, this.origin.z]
        
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.points = new THREE.Points(this.geometry, this.material)
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.parent.add(this.points)  
    }

    /**
     * compute explosion
     * @param {*} vector 
     */
    explode(origin, n, rangeBegin, rangeEnd) {
        this.parent.remove(this.points)
        this.points.geometry.dispose()

        let vertices = []
        let colors = []
        this.dest = []

        for(let i=0; i<n; i++) {
            vertices.push(origin[0], origin[1], origin[2])
            
            let angle1 = Math.random() * 2*Math.PI
            let angle2 = Math.random() * 2*Math.PI
            let distance = rangeBegin + Math.random() * (rangeEnd-rangeBegin)

            this.dest.push(
                origin[0] + distance * Math.cos(angle1) * Math.cos(angle2),
                origin[1] + distance * Math.sin(angle1) * Math.cos(angle2),
                origin[2] + distance * Math.cos(angle1) * Math.sin(angle2)
            )

            let color = new THREE.Color()
            color.setHSL(THREE.MathUtils.randFloat( 0.1, 0.9 ), 1, 0.5)
            colors.push(color.r, color.g, color.b)
        }
        

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.points = new THREE.Points(this.geometry, this.material)
        //this.points.castShadow = true;
        //this.points.receiveShadow = true;
        this.parent.add(this.points)  
    }
    
    /**
     * cleanup
     */
    reset() {
        this.parent.remove(this.points)  
        this.dest = [] 
        this.vertices = null
        this.colors = null 
        this.geometry = null
        this.points = null
    }

    /**
     * update firework
     * @returns 
     */
    update() {
        // do only if objects exist
        if (this.points && this.geometry) {
            let verticesAtribute = this.geometry.getAttribute('position')
            let vertices = verticesAtribute.array
            let count = verticesAtribute.count

            // lerp particle positions 
            let j = 0
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] += (this.dest[i] - vertices[i]) / this.speed
                vertices[i + 1] += (this.dest[i + 1] - vertices[i + 1]) / this.speed
                vertices[i + 2] += (this.dest[i + 2] - vertices[i + 2]) / this.speed
            }
            verticesAtribute.needsUpdate = true
            
            // only one particle?
            if (count === 1) {
                //is YY coordinate higher close to destination YY? 
                if (Math.ceil(vertices[1]) > (this.dest[1] * 0.95)) {
                    // add n particles departing from the location at (vertices[0], vertices[1], vertices[2])
                    this.explode(vertices, 32, this.height * 0.05, this.height * 0.8) 
                    return 
                }
            }
            
            // are there a lot of particles (aka already exploded)?
            if (count > 1) {
                // fade out exploded particles 
                this.material.opacity -= 0.015 
                this.material.needsUpdate = true
            }
            
            // remove, reset and stop animating 
            if (this.material.opacity <= 0) {
                this.reset() 
                this.done = true 
                return 
            }
        }
    }
}

export { MyFirework }