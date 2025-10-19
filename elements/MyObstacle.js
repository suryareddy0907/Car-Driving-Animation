import * as THREE from 'three';

/**
 * This class contains an obstacle
 */
class MyObstacle {
    /**
     * Constructs the object
     * @param {string} type The type of the obstacle
     * @param {number} x The x coordinate
     * @param {number} y The y coordinate
     * @param {number} z The z coordinate
     */
    constructor(type, x, y, z) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;

        this.duration = 0;
        this.mesh = null;
        this.buildObstacle();
    }

    /**
     * Builds the obstacle
     */
    buildObstacle() {
        let texFile = null;
        switch (this.type) {
            case "Dizzy":
                texFile = 'dizzy.png';
                this.duration = 200;
                break;
            case "Block":
                texFile = 'block.jpg';
                this.duration = 250;
                break;
            case "Slow":
                texFile = 'slow.jpg';
                this.duration = 200;
                break;
            default:
                break;
        }

        const texture = new THREE.TextureLoader().load('./images/' + texFile);
        texture.flipY = false;

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                textureSampler: { value: texture },
            },
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
            
                void main() {
                    vUv = uv;
            
                    vec3 newPosition = position;
            
                    float pulse = sin(time) * 0.2;
                    newPosition.x *= 1.0 + pulse;
                    newPosition.y *= 1.0 + pulse;
                    newPosition.z *= 1.0 + pulse;
            
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D textureSampler;
                varying vec2 vUv;
            
                void main() {
                    vec4 textureColor = texture2D(textureSampler, vUv);
                    gl_FragColor = textureColor;
                }
            `
        });

        const geometry = new THREE.CylinderGeometry(1, 1, 0.3, 32);

        this.mesh = new THREE.Mesh(geometry, shaderMaterial);
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.rotation.z = Math.PI / 4;
        this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        this.mesh.position.set(this.x, this.y + 1, this.z);
    }

    /**
     * Updates the obstacle
     */
    update() {
        this.mesh.material.uniforms.time.value = performance.now() / 1000;
        this.mesh.rotation.y += 0.01;
    }
}

export { MyObstacle };
