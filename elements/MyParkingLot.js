import * as THREE from 'three';

/**
 * This class contains a parking lot
 * @extends THREE.Group
 */
class MyParkingLot extends THREE.Group {
    /**
     * constructor
     * @param {number} x The x coordinate
     * @param {number} y The y coordinate
     * @param {number} z The z coordinate
     */
    constructor(x, y, z) {
        super();
        this.type = 'Group';

        this.createParkingLot();

        this.position.set(x, y, z);
        this.rotation.y = Math.PI / 8;
    }

    /**
     * Creates the parking lot
     */
    createParkingLot() {
        const material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 0
        });
        const geometry = new THREE.PlaneGeometry(10, 20);
        this.plane = new THREE.Mesh(geometry, material);
        this.plane.rotation.x = - Math.PI / 2;
        this.add(this.plane);
    }
}

export { MyParkingLot };