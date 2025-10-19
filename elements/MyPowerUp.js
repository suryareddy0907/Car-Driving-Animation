import * as THREE from 'three';

/**
 * This class contains a power up
 */
class MyPowerUp {
    /**
     * constructor
     * @param {string} type The type of power up
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
        if (this.type === 'Speed') {
            this.duration = 100;
            this.speed();
        }
        else if (this.type === 'Portal') {
            this.duration = 10;
            this.portal();
        }
    }

    /**
     * Builds the speed boost power up
     */
    speed() {
        const geometry = new THREE.PlaneGeometry(2, 4.5);
        const texture = new THREE.TextureLoader().load('./images/speed.jpg');
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 0
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y + 0.01, this.z);
    }

    /**
     * Builds the portal power up
     */
    portal() {
        const geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1);
        const texture = new THREE.TextureLoader().load('./images/portal.jpg');
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 50
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y + 0.01, this.z);
    }
}

export { MyPowerUp };