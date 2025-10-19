import * as THREE from 'three';
import { MyParkingLot } from "../elements/MyParkingLot.js";
import { MyTrack } from "../elements/MyTrack.js";
import { MyVehicle } from "../elements/MyVehicle.js";
import { MyPowerUp } from "../elements/MyPowerUp.js";
import { MyObstacle } from "../elements/MyObstacle.js";
import { MyBillboard } from "../elements/MyBillboard.js";

/**
 * This class contains the game elements
 */
class MyReader {
    /**
     * constructor
     * @param {MyApp} app The application object
     */
    constructor(app) {
        this.app = app;
        this.ground = null;
        this.poles = [];
        this.stadium = null;
        this.billboard = null;
        this.playerPark = null;
        this.autoPark = null;
        this.obstaclePark = null;
        this.cars = [];
        this.track = null;
        this.powerUps = [];
        this.obstacles = [];
    }

    /**
     * Initializes the game elements
     */
    init() {
        if (this.ground === null)
            this.createGround();

        if (this.poles.length === 0)
            this.createLights();

        if (this.stadium === null)
            this.createStadium();

        if (this.billboard === null) {
            this.billboard = new MyBillboard(15, 0, -55);
            this.billboard.rotation.y = Math.PI / 5;
            this.app.scene.add(this.billboard);
        }

        if (this.playerPark === null && this.autoPark === null && this.obstaclePark === null)
            this.createParkingLots();

        if (this.cars.length === 0)
            this.createCars();

        if (this.track === null) {
            const path = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -50),
                new THREE.Vector3(40, 0, -50),
                new THREE.Vector3(40, 0, 0),
                new THREE.Vector3(70, 0, 10),
                new THREE.Vector3(65, 0, 30),
                new THREE.Vector3(40, 0, 80),
                new THREE.Vector3(0, 0, 90),
                new THREE.Vector3(0, 0, 0)
            ]);
            this.track = new MyTrack(path);
            this.app.scene.add(this.track);
        }

        if (this.powerUps.length === 0)
            this.createPowerUps();

        if (this.obstacles.length === 0) 
            this.createObstacles();
    }

    /**
     * Creates the ground
     */
    createGround() {
        const geometry = new THREE.PlaneGeometry(1000, 1000);
        let texture = new THREE.TextureLoader().load("./images/grass.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 100);
        let material = new THREE.MeshPhongMaterial({ map: texture });
        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = - Math.PI / 2;
        this.ground.position.y = - 0.1;
        this.app.scene.add(this.ground);
    }

    /**
     * Creates the lights and light poles
     */
    createLights() {
        let light = new THREE.PointLight(0xffffff, 1000, 400);
        light.position.set(-30, 70, 10);
        this.app.scene.add(light);

        light = new THREE.PointLight(0xffffff, 150, 50);
        light.position.set(-93, 15, 23);
        this.app.scene.add(light);

        light = new THREE.PointLight(0xffffff, 150, 50);
        light.position.set(-77, 15, 60);
        this.app.scene.add(light);

        let pole = this.createPole(15, 0, 20);
        this.poles.push(pole);

        pole = this.createPole(20, 0, 60);
        this.poles.push(pole);

        pole = this.createPole(5, 0, 100);
        pole.rotation.y = - Math.PI / 4;
        this.poles.push(pole);

        pole = this.createPole(-30, 0, 100);
        pole.rotation.y = - Math.PI / 2;
        this.poles.push(pole);

        pole = this.createPole(-65, 0, 75);
        pole.rotation.y = - Math.PI;
        this.poles.push(pole);

        pole = this.createPole(-80, 0, 0);
        pole.rotation.y = - Math.PI;
        this.poles.push(pole);

        pole = this.createPole(-55, 0, -30);
        pole.rotation.y = - Math.PI;
        this.poles.push(pole);

        pole = this.createPole(-20, 0, -70);
        pole.rotation.y = Math.PI / 2;
        this.poles.push(pole);

        pole = this.createPole(20, 0, -30);
        this.poles.push(pole);

        for (const pole of this.poles) 
            this.app.scene.add(pole);
    }

    /**
     * Creates a light pole
     * @param {number} x The x coordinate
     * @param {number} y The y coordinate
     * @param {number} z The z coordinate
     * @returns {THREE.Object3D} The light pole
     */
    createPole(x, y, z) {
        let material = new THREE.MeshPhongMaterial({ color: 0x000000 });
        let sourceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        let geometry = new THREE.CylinderGeometry(0.3, 0.3, 20);
        let topGeo = new THREE.BoxGeometry(2, 0.6, 1);
        let sourceGeo = new THREE.BoxGeometry(1.4, 0.5, 1);

        const pole = new THREE.Mesh(geometry, material);
        const top = new THREE.Mesh(topGeo, material);
        top.position.set(-0.7, 10.3, 0);
        pole.add(top);
        const source = new THREE.Mesh(sourceGeo, sourceMat);
        source.position.set(-1, 9.75, 0);
        pole.add(source);
        const light = new THREE.PointLight(0xffffff, 200, 100);
        pole.add(light);
        pole.position.set(x, y + 8, z);
        
        return pole;
    }

    /**
     * Creates the stadium
     */
    createStadium() {
        this.stadium = new THREE.Group();

        let material = new THREE.MeshPhongMaterial({ color: 0x000000 });
        let geometry = new THREE.BoxGeometry(1, 20, 100);
        let box = new THREE.Mesh(geometry, material);
        box.position.set(0, 9, 0);
        this.stadium.add(box);

        const texture = new THREE.TextureLoader().load("./images/seats.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 2);
        material = new THREE.MeshPhongMaterial({ map: texture });
        geometry = new THREE.BoxGeometry(1, 30, 100);
        let seats = new THREE.Mesh(geometry, material);
        seats.position.set(-10.5, 8, 0);
        seats.rotation.z = - Math.PI / 4;
        this.stadium.add(seats);

        this.stadium.position.set(50, 0, 20);
        this.app.scene.add(this.stadium);
    }

    /**
     * Creates the parking lots
     */
    createParkingLots() {
        this.playerPark = new MyParkingLot(-85, 0, 20);
        this.app.scene.add(this.playerPark);

        this.autoPark = new MyParkingLot(-70, 0, 60);
        this.app.scene.add(this.autoPark);

        this.obstaclePark = new MyParkingLot(-50, 0, 90);
        this.obstaclePark.rotation.y = Math.PI / 3.5;
        this.app.scene.add(this.obstaclePark);
    }

    /**
     * Creates the cars
     */
    createCars() {
        let car = new MyVehicle("Aquamarine", -88, 0.4, 17);
        car.rotation.y = Math.PI / 2;
        car.angle = Math.PI / 2;
        car.updateLights();
        this.cars.push(car);

        car = new MyVehicle("Street Blue", -85, 0.4, 21);
        car.rotation.y = Math.PI / 2;
        car.angle = Math.PI / 2;
        car.updateLights();
        this.cars.push(car);

        car = new MyVehicle("Azure Blitz", -82, 0.4, 25);
        car.rotation.y = Math.PI / 2;
        car.angle = Math.PI / 2;
        car.updateLights();
        this.cars.push(car);

        car = new MyVehicle("Flame Cruiser", -71, 0.4, 55);
        car.rotation.y = Math.PI / 1.3;
        car.angle = Math.PI / 1.3;
        car.updateLights();
        this.cars.push(car);

        car = new MyVehicle("Crimson Comet", -70, 0.4, 60);
        car.rotation.y = Math.PI / 1.3;
        car.angle = Math.PI / 1.3;
        car.updateLights();
        this.cars.push(car);

        car = new MyVehicle("Blood Bullet", -69, 0.4, 65);
        car.rotation.y = Math.PI / 1.3;
        car.angle = Math.PI / 1.3;
        car.updateLights();
        this.cars.push(car);

        for (const car of this.cars)
            this.app.scene.add(car);
    }

    /**
     * Creates the power ups
     */
    createPowerUps() {
        let powerUp = new MyPowerUp('Speed', 2, 0, 80);
        powerUp.mesh.rotation.x = - Math.PI / 2;
        powerUp.mesh.rotation.z = - Math.PI / 15;
        this.powerUps.push(powerUp);

        powerUp = new MyPowerUp('Portal', -44, 0, 0.5);
        this.powerUps.push(powerUp);

        for (const powerUp of this.powerUps)
            this.app.scene.add(powerUp.mesh);
    }

    /**
     * Creates the obstacles
     */
    createObstacles() {
        let obstacle = new MyObstacle('Slow', -55, 0, 86);
        this.obstacles.push(obstacle);

        obstacle = new MyObstacle('Block', -50, 0, 90);
        this.obstacles.push(obstacle);

        obstacle = new MyObstacle('Dizzy', -45, 0, 94);
        this.obstacles.push(obstacle);

        for (const obstacle of this.obstacles)
            this.app.scene.add(obstacle.mesh);
    }
}

export { MyReader };