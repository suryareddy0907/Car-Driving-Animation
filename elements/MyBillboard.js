import * as THREE from 'three';

/**
 * This class represents a billboard
 * @extends THREE.Group
 */
class MyBillboard extends THREE.Group {
    /**
     * constructor
     * @param {number} x The x position
     * @param {number} y The y position
     * @param {number} z The z position
     */
    constructor(x, y, z) {
        super();
        this.type = 'Group';

        this.createBillboard();
        this.position.set(x, y + 6, z);
    }

    /**
     * Creates the billboard
     */
    createBillboard() {
        let material = new THREE.MeshPhongMaterial({ color: 0x333333 });
        let geometry = new THREE.BoxGeometry(1, 12, 6);
        let box = new THREE.Mesh(geometry, material);
        this.add(box);

        const texture = new THREE.TextureLoader().load('../images/billboard.png');
        const lgray = new THREE.TextureLoader().load('../images/lgray.png');
        material = new THREE.ShaderMaterial({
            uniforms: {
                textureSampler: {type: 'sampler2D', value: texture },
                lgraySampler: {type: 'sampler2D', value: lgray },
                blendScale: {type: 'f', value: 0.4 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                uniform sampler2D lgraySampler;
                uniform float blendScale;
                
                void main() {
                    vUv = uv;
                    vNormal = normal;

                    vec3 offset = vec3(0.0, 0.0, 0.0);
                    offset = vNormal * blendScale * texture2D(lgraySampler, vUv).r;
                
                    vec4 modelViewPosition = modelViewMatrix * vec4(position + offset, 1.0);
                    gl_Position = projectionMatrix * modelViewPosition;
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
        geometry = new THREE.PlaneGeometry(5.5, 11, 100, 100);
        let poster = new THREE.Mesh(geometry, material);
        poster.rotation.y = - Math.PI / 2;
        poster.position.set(-0.55, 0, 0);
        this.add(poster);
    }
}

export { MyBillboard };
