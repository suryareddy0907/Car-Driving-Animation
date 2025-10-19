import * as THREE from 'three';
import { MyPolygon } from './MyPolygon.js';

/**
 * This class contains a vehicle
 * @extends THREE.Group
 */
class MyVehicle extends THREE.Group {
    /**
     * constructor
     * @param {string} model The model of the vehicle
     * @param {number} x The x coordinate
     * @param {number} y The y coordinate
     * @param {number} z The z coordinate
     */
    constructor(model, x = 9, y = 0.6, z = 0) {
        super();
        this.type = 'Group';

        this.model = model;
        this.x = x;
        this.y = y;
        this.z = z;
        this.speed = 0;
        this.angle = 0;
        this.angleOffset = 0;
        this.left = false;
        this.right = false;
        this.offTrack = false;
        this.specialEffect = null;
        this.specialEffectTimer = 0;
        this.laps = 0;
        this.maxSpeed = 0.4;
        this.minSpeed = -0.2;
        this.dizzy = false;
        this.block = false;
        this.selector = null;

        this.buildVehicle();
    }

    /**
     * Creates the vehicle
     */
    buildVehicle() {
        this.createStructure();
        this.createBars();
        this.createWindows();
        this.createWheels();
        this.createLights();
    }

    /**
     * Creates the vehicle structure
     */
    createStructure() {
        let texfile = null;
        let color = 0xffffff;
        let repeatX = 1;
        let repeatY = 1;
        switch (this.model) {
            case "Azure Blitz":
                texfile = "azure_blitz.jpg";
                color = 0x6666ff;
                break;
            case "Street Blue":
                texfile = "street_blue.jpg";
                color = 0x91a0e6;
                break;
            case "Aquamarine":
                texfile = "aquamarine.jpg";
                color = 0x00ffff;
                break;
            case "Crimson Comet":
                texfile = "crimson_comet.jpg";
                color = 0xc9406e;
                break;
            case "Blood Bullet":
                texfile = "blood_bullet.jpg";
                color = 0xff2222;
                break;
            case "Flame Cruiser":
                texfile = "flame_cruiser.jpg";
                color = 0xd66904;
                break;
            default:
                break;
        }

        let material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 30
        });
        let geometry = new THREE.BoxGeometry(1, 0.5, 2);
        this.body = new THREE.Mesh(geometry, material);
        this.add(this.body);

        const texture = new THREE.TextureLoader().load("./images/" + texfile);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);

        material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 30
        });
        geometry = new THREE.BoxGeometry(1, 0.05, 0.77);
        this.roof = new THREE.Mesh(geometry, material);
        this.roof.position.set(0, 0.5, 0.1);
        this.add(this.roof);

        geometry = new THREE.BoxGeometry(1, 0.05, 0.3);
        this.spoiler = new THREE.Mesh(geometry, material);
        this.spoiler.position.set(0, 0.4, 0.9);
        this.spoiler.rotation.x = - Math.PI / 10;
        this.add(this.spoiler);

        this.position.set(this.x, this.y, this.z);
    }

    /**
     * Adds a selected indicator to the vehicle
     * @param {number} color The color of the selector
     */
    addSelector(color) {
        const material = new THREE.MeshBasicMaterial({ color: color });
        const geometry = new THREE.SphereGeometry(0.3);
        this.selector = new THREE.Mesh(geometry, material);
        this.selector.position.set(0, 2.5, 0);
        this.add(this.selector);
    }

    /**
     * Removes the selected indicator from the vehicle
     */
    removeSelector() {
        if (this.selector !== null) {
            this.remove(this.selector);
            this.selector = null;
        }
    }

    /**
     * Creates the vehicle bars
     */
    createBars() {
        this.bars = []
        const material = new THREE.MeshBasicMaterial({ color: 0x111111 });
        
        let geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.34);
        const bar1 = new THREE.Mesh(geometry, material);
        bar1.position.set(-0.49, -0.138, -0.48);
        bar1.rotation.x = Math.PI / 4;
        this.bars.push(bar1);

        const bar2 = new THREE.Mesh(geometry, material);
        bar2.position.set(0.49, -0.138, -0.48);
        bar2.rotation.x = Math.PI / 4;
        this.bars.push(bar2);

        geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.22);
        const bar3 = new THREE.Mesh(geometry, material);
        bar3.position.set(-0.49, -0.135, 0.37);
        this.bars.push(bar3);

        const bar4 = new THREE.Mesh(geometry, material);
        bar4.position.set(0.49, -0.135, 0.37);
        this.bars.push(bar4);

        const bar5 = new THREE.Mesh(geometry, material);
        bar5.position.set(-0.5, -0.135, -0.05);
        this.bars.push(bar5);

        const bar6 = new THREE.Mesh(geometry, material);
        bar6.position.set(0.5, -0.135, -0.05);
        this.bars.push(bar6);

        geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.15);
        const bar7 = new THREE.Mesh(geometry, material);
        bar7.position.set(-0.3, -0.18, 0.8);
        this.bars.push(bar7);

        const bar8 = new THREE.Mesh(geometry, material);
        bar8.position.set(0.3, -0.18, 0.8);
        this.bars.push(bar8);

        for (const bar of this.bars)
            this.roof.add(bar);
    }

    /**
     * Creates the vehicle windows
     */
    createWindows() {
        this.windows = []
        const material = new THREE.MeshPhongMaterial({
            color: 0xd4d6d6,
            specular: 0xffffff,
            shininess: 50
        });

        let geometry = new THREE.BoxGeometry(0.98, 0.38, 0.05);
        const window1 = new THREE.Mesh(geometry, material);
        window1.position.set(0, -0.16, -0.48);
        window1.rotation.x = Math.PI / 4;
        this.windows.push(window1);

        geometry = new THREE.BoxGeometry(0.96, 0.22, 0.05);
        const window2 = new THREE.Mesh(geometry, material);
        window2.position.set(0, -0.135, 0.35);
        this.windows.push(window2);

        geometry = new THREE.BoxGeometry(0.7, 0.22, 0.05);
        const window3 = new THREE.Mesh(geometry, material);
        window3.position.set(-0.478, -0.135, 0);
        window3.rotation.y = Math.PI / 2;
        this.windows.push(window3);

        const window4 = new THREE.Mesh(geometry, material);
        window4.position.set(0.478, -0.135, 0);
        window4.rotation.y = Math.PI / 2;
        this.windows.push(window4);

        geometry = new MyPolygon(0.7, 3, 3, 0xd4d6d6, 0xd4d6d6);
        const window5 = new THREE.Mesh(geometry, material);
        window5.position.set(-0.495, -0.19, -0.37);
        window5.rotation.x = Math.PI / 4;
        window5.rotation.y = - Math.PI / 2;
        window5.scale.set(0.3, 0.3, 0.3);
        this.windows.push(window5);

        const window6 = new THREE.Mesh(geometry, material);
        window6.position.set(0.495, -0.19, -0.37);
        window6.rotation.x = - Math.PI / 12;
        window6.rotation.y = Math.PI / 2;
        window6.scale.set(0.3, 0.3, 0.3);
        this.windows.push(window6);

        for (const window of this.windows)
            this.roof.add(window);
    }

    /**
     * Creates the vehicle wheels
     */
    createWheels() {
        this.wheels = []
        const texture = new THREE.TextureLoader().load("./images/tire.png");
        const material = new THREE.MeshPhongMaterial({map: texture});
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1);

        const wheel1 = new THREE.Mesh(geometry, material);
        wheel1.rotation.z = Math.PI / 2;
        wheel1.position.set(-0.5, -0.2, -0.5);
        this.wheels.push(wheel1);

        const wheel2 = new THREE.Mesh(geometry, material);
        wheel2.rotation.z = Math.PI / 2;
        wheel2.position.set(0.5, -0.2, -0.5);
        this.wheels.push(wheel2);

        const wheel3 = new THREE.Mesh(geometry, material);
        wheel3.rotation.z = Math.PI / 2;
        wheel3.position.set(-0.5, -0.2, 0.5);
        this.wheels.push(wheel3);

        const wheel4 = new THREE.Mesh(geometry, material);
        wheel4.rotation.z = Math.PI / 2;
        wheel4.position.set(0.5, -0.2, 0.5);
        this.wheels.push(wheel4);

        for (const wheel of this.wheels)
            this.body.add(wheel);
    }

    /**
     * Creates the vehicle lights
     */
    createLights() {
        this.lights = []
        let material = new THREE.MeshBasicMaterial({ color: 0xfad961 });

        let geometry = new THREE.BoxGeometry(0.2, 0.1, 0.02);
        const light1 = new THREE.Mesh(geometry, material);
        light1.position.set(-0.35, 0.1, -1.01);
        this.lights.push(light1);

        if (this.model != "Crimson Comet" && this.model != "Blood Bullet" && this.model != "Flame Cruiser") {
            const spotLight1 = new THREE.SpotLight(0xfad961, 100, 6, Math.PI / 12, 1);
            spotLight1.position.x = -0.35;
            spotLight1.position.y = 0.1;
            spotLight1.position.z = -1.01;
            spotLight1.target.position.x = this.x - 0.35;
            spotLight1.target.position.y = 0;
            spotLight1.target.position.z = this.z - 4;
            this.lightHelper1 = new THREE.SpotLightHelper(spotLight1); 
            this.lights.push(spotLight1);
        }

        const light2 = new THREE.Mesh(geometry, material);
        light2.position.set(0.35, 0.1, -1.01);
        this.lights.push(light2);

        if (this.model != "Crimson Comet" && this.model != "Blood Bullet" && this.model != "Flame Cruiser") {
            const spotLight2 = new THREE.SpotLight(0xfad961, 100, 6, Math.PI / 12, 1);
            spotLight2.position.x = 0.35;
            spotLight2.position.y = 0.1;
            spotLight2.position.z = -1.01;
            spotLight2.target.position.x = this.x + 0.35;
            spotLight2.target.position.y = 0;
            spotLight2.target.position.z = this.z - 4;
            this.lightHelper2 = new THREE.SpotLightHelper(spotLight2);
            this.lights.push(spotLight2);
        }

        material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const light3 = new THREE.Mesh(geometry, material);
        light3.position.set(-0.35, 0.1, 1.01);
        this.lights.push(light3);

        const light4 = new THREE.Mesh(geometry, material);
        light4.position.set(0.35, 0.1, 1.01);
        this.lights.push(light4);

        for (const light of this.lights)
            this.body.add(light);
    }

    /**
     * Accelerates the vehicle, increasing its speed
     */
    accelerate() {
        if (this.speed < this.maxSpeed) this.speed += 0.01;
    }

    /**
     * Decelerates the vehicle, decreasing its speed
     */
    brake() {
        if (this.speed > this.minSpeed) this.speed -= 0.01;
    }

    /**
     * Turns the vehicle left
     */
    turnLeft() {
        this.left = true;
        this.right = false;
        this.angleOffset = 8;
    }

    /**
     * Turns the vehicle right
     */
    turnRight() {
        this.right = true;
        this.left = false;
        this.angleOffset = 8;
    }

    /**
     * Turns the vehicle left
     */
    turnWheels() {
        if (!this.left && !this.right) {
            this.wheels[0].rotation.y = 0;
            this.wheels[1].rotation.y = 0;
            return;
        }

        let value = 0;
        if (this.left) value = 6 * (10 - this.angleOffset);
        else if (this.right) value = -6 * (10 - this.angleOffset);
        this.wheels[0].rotation.y = THREE.MathUtils.degToRad(value);
        this.wheels[1].rotation.y = THREE.MathUtils.degToRad(value);
    }

    /**
     * Updates the vehicle lights
     */
    updateLights() {
        if (this.model == "Crimson Comet" || this.model == "Blood Bullet" || this.model == "Flame Cruiser") return;

        this.lights[1].target.position.x = this.position.x - 0.35 * Math.cos(this.angle) - 4 * Math.sin(this.angle);
        this.lights[1].target.position.z = this.position.z + 0.35 * Math.sin(this.angle) - 4 * Math.cos(this.angle);
        this.lights[1].lightHelper1 = new THREE.SpotLightHelper(this.lights[1]);

        this.lights[3].target.position.x = this.position.x + 0.35 * Math.cos(this.angle) - 4 * Math.sin(this.angle);
        this.lights[3].target.position.z = this.position.z - 0.35 * Math.sin(this.angle) - 4 * Math.cos(this.angle);
        this.lights[3].lightHelper1 = new THREE.SpotLightHelper(this.lights[3]);
    }

    /**
     * Checks if the vehicle is colliding with a given position
     * @param {number} x The x coordinate
     * @param {number} z The z coordinate
     * @returns {boolean} True if the vehicle is colliding with the given position, false otherwise
     */
    checkCollision(x, z) {
        return (Math.abs(this.position.x - x) < 1 && Math.abs(this.position.z - z) < 1);
    }
    
    /**
     * Acts upon a vehicle collision with another vehicle
     * @param {number} x The x coordinate
     * @param {number} z The z coordinate
     */
    collide(x, z) {
        const avoidanceDistance = 1.5;
        const moveX = this.position.x < x ? -avoidanceDistance : avoidanceDistance;
        const moveZ = this.position.z < z ? -avoidanceDistance : avoidanceDistance;
        this.position.x += moveX;
        this.position.z += moveZ;
        this.angle += THREE.MathUtils.degToRad(30);
        this.rotation.y = this.angle;
        this.turnWheels();
        this.updateLights();
    }

    /**
     * Applies a special effect (power up or obstacle) to the vehicle
     */
    applySpecialEffect() {
        switch (this.specialEffect) {
            case 'Speed':
                if (this.specialEffectTimer > 0) {
                    if (this.specialEffectTimer - 1 == 0) this.speed = this.maxSpeed;
                    else if (this.specialEffectTimer == 100) {
                        this.speed = this.maxSpeed * 1.7;
                        this.angle = 0;
                        this.rotation.y = this.angle;
                        this.turnWheels();
                    }
                    this.specialEffectTimer--;
                }
                break;
            case 'Portal':
                if (this.specialEffectTimer > 0) {
                    if (this.specialEffectTimer == 10) {
                        this.position.x = -65;
                        this.position.z = 30;
                        this.angle = THREE.MathUtils.degToRad(200);
                        this.rotation.y = this.angle;
                        this.turnWheels();
                    }
                    this.specialEffectTimer--;
                }
                break;
            case 'Dizzy':
                if (this.specialEffectTimer > 0) {
                    if (this.specialEffectTimer - 1 == 0) this.dizzy = false;
                    else if (this.specialEffectTimer == 200) this.dizzy = true;
                    this.specialEffectTimer--;
                }
                break;
            case 'Block':
                if (this.specialEffectTimer > 0) {
                    if (this.specialEffectTimer == 100) this.block = false;
                    else if (this.specialEffectTimer == 250) this.block = true;
                    this.specialEffectTimer--;
                }
                break;
            case 'Slow':
                if (this.specialEffectTimer > 0) {
                    if (this.specialEffectTimer - 1 == 0) {
                        this.maxSpeed = 0.4;
                        this.minSpeed = -0.2;
                    }
                    else if (this.specialEffectTimer == 200) {
                        this.speed *= 0.4;
                        this.maxSpeed *= 0.4;
                        this.minSpeed *= 0.4;
                    }
                    this.specialEffectTimer--;
                }
                break;
            default:
                break;
        }
    }

    /**
     * Updates the vehicle
     */
    update() {
        this.applySpecialEffect();
        if (this.block) return;

        this.position.x -= this.speed * Math.sin(this.angle);
        this.position.z -= this.speed * Math.cos(this.angle);

        this.angle = this.angle % (2 * Math.PI);
        let value = 10 * this.speed;

        if (this.right) {
            this.angle -= THREE.MathUtils.degToRad(value);
            this.angleOffset--;
            if (this.angleOffset == 0) {
                this.right = false;
                this.angleOffset = 0;
            }
            this.rotation.y = this.angle;
            this.turnWheels();
        }
        else if (this.left) {
            this.angle += THREE.MathUtils.degToRad(value);
            this.angleOffset--;
            if (this.angleOffset == 0) {
                this.left = false;
                this.angleOffset = 0;
            }
            this.rotation.y = this.angle;
            this.turnWheels();
        }

        this.updateLights();
    }
}

export { MyVehicle };