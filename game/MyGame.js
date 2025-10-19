import * as THREE from 'three';
import { MyReader } from "./MyReader.js";
import { MyMenu } from './MyMenu.js';
import { MyOver } from "./MyOver.js";
import { MyRoute } from "../elements/MyRoute.js";
import { MyObstacle } from "../elements/MyObstacle.js";

/**
 * This class contains the game logic
 */
class MyGame {
    /**
     * constructor
     * @param {MyApp} app
     */
    constructor(app) {
        this.app = app;
        this.reader = null;
        this.menu = null;
        this.over = null;
        this.playerName = null;
        this.difficulty = 'normal';
        this.playerCar = null;
        this.playerIndex = 0;
        this.autoCar = null;
        this.autoIndex = 3;
        this.state = 'menu';
        this.follow = false;
        this.paused = false;
        this.elapsedTime = 0;
        this.startTime = 0;
        this.playerTime = 0;
        this.lapCooldown = 0;
        this.maxLaps = 3;
        this.obstacles = [];
        this.pickingObstacle = false;
        this.route = null;
    }

    /**
     * Initializes the game
     */
    init() {
        this.reader = new MyReader(this.app);
        this.reader.init();

        this.mainMenu();
    }

    /**
     * Handles the game's main menu logic
     */
    mainMenu() {
        this.state = 'menu';
        this.app.cameras['Perspective'].position.set(-100, 10, 50);
        this.app.cameras['Perspective'].lookAt(0, 0, 10);
        this.app.deactivateControls();

        this.menu = new MyMenu(this.app);
        this.menu.init();

        this.inputListener = (event) => {this.playerName = event.target.value;}
        this.menu.input.addEventListener('input', this.inputListener);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.difficultyListener = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersectNormal = raycaster.intersectObjects(this.menu.normal.children, true);
            const intersectHard = raycaster.intersectObjects(this.menu.hard.children, true);
            if (intersectNormal.length > 0) {
                this.menu.setDifficulty('normal');
                this.difficulty = 'normal';
            }
            else if (intersectHard.length > 0) {
                this.menu.setDifficulty('hard');
                this.difficulty = 'hard';
            }
        }
        document.addEventListener('click', this.difficultyListener);

        this.carSelector = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersectCars = [];
            for (let i = 0; i < this.reader.cars.length; i++)
                intersectCars.push(raycaster.intersectObjects(this.reader.cars[i].children, true));
            for (let i = 0; i < intersectCars.length; i++) {
                if (intersectCars[i].length > 0) {
                    if (i < 3) {
                        if (this.playerCar !== null) this.playerCar.removeSelector();
                        this.playerCar = this.reader.cars[i];
                        this.playerIndex = i;
                        this.playerCar.addSelector(0x0000ff);
                    }
                    else if (i >= 3) {
                        if (this.autoCar !== null) this.autoCar.removeSelector();
                        this.autoCar = this.reader.cars[i];
                        this.autoIndex = i;
                        this.autoCar.addSelector(0xff0000);
                    }
                }
            }
        }
        document.addEventListener('click', this.carSelector);

        this.startListener = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersectStart = raycaster.intersectObjects(this.menu.start.children, true);
            if (intersectStart.length > 0) {
                document.removeEventListener('click', this.difficultyListener);
                document.removeEventListener('click', this.carSelector);
                document.removeEventListener('click', this.startListener);

                this.menu.removeInput();
                this.app.scene.remove(this.menu);
                this.menu = null;

                this.gameplay();
            }
        };
    }

    /**
     * Handles the game's gameplay logic
     */
    gameplay() {
        if (this.route === null)
            this.route = new MyRoute(this.app, this.difficulty);

        this.playerCar.removeSelector();
        this.playerCar.position.set(-2, 0.4, 8);
        this.playerCar.rotation.y = 0;
        this.playerCar.angle = 0;

        this.autoCar.removeSelector();
        this.autoCar.position.set(2, 0.4, 5);
        this.autoCar.rotation.y = 0;
        this.autoCar.angle = 0;

        this.state = 'gameplay';
        this.app.activateControls();
        this.createHUD();

        this.follow = true;
        this.paused = true;      

        this.accelerateListener = (event) => {if (event.key === 'w' && !this.paused) this.playerCar.accelerate();};
        this.brakeListener = (event) => {if (event.key === 's' && !this.paused) this.playerCar.brake();};
        this.turnLeftListener = (event) => {
            if (event.key === 'a' && !this.paused) {
                if (!this.playerCar.dizzy) this.playerCar.turnLeft();
                else this.playerCar.turnRight();
            }
        };
        this.turnRightListener = (event) => {
            if (event.key === 'd' && !this.paused) {
                if (!this.playerCar.dizzy) this.playerCar.turnRight();
                else this.playerCar.turnLeft();
            }
        };
        this.gameListener = (event) => {
            if (event.key === 'Escape') this.endGameplay();

            if (!this.pickingObstacle && Math.floor(this.startTime / 1000) > 3) {
                if (event.key === 'e') this.follow = !this.follow;
                else if (event.key === 'q') {
                    if (this.paused) this.route.clock.start();
                    else this.route.clock.stop();
                    this.paused = !this.paused;
                }
            }
        };

        document.addEventListener('keydown', this.accelerateListener);
        document.addEventListener('keydown', this.brakeListener);
        document.addEventListener('keydown', this.turnLeftListener);
        document.addEventListener('keydown', this.turnRightListener);
        document.addEventListener('keydown', this.gameListener);
    }

    /**
     * Handles obstacle selection logic
     */
    pickObstacle() {
        this.paused = true;
        this.route.clock.stop();
        this.follow = false;
        this.pickingObstacle = true;

        this.app.cameras['Perspective'].position.set(-25, 20, 65);
        this.app.cameras['Perspective'].lookAt(-50, 0, 90);
        this.app.deactivateControls();

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const pickListener = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersectObstacles = [];
            for (const obstacle of this.reader.obstacles)
                intersectObstacles.push(raycaster.intersectObject(obstacle.mesh));
            for (let i = 0; i < intersectObstacles.length; i++) {
                if (intersectObstacles[i].length > 0) {
                    document.removeEventListener('click', pickListener);
                    this.placeObstacle(i);
                }
            }
        }
        document.addEventListener('click', pickListener);
    }

    /**
     * Handles obstacle placement logic
     * @param {number} index The index of the obstacle to be placed
     */
    placeObstacle(index) {
        this.app.activateControls();

        this.app.cameras['Perspective'].position.x = -30;
        this.app.cameras['Perspective'].position.y = 110;
        this.app.cameras['Perspective'].position.z = 20;
        this.app.controls.target.x = -30;
        this.app.controls.target.y = 0;
        this.app.controls.target.z = 20;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.placeListener = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersectTrack = raycaster.intersectObjects(this.reader.track.children, true);
            if (intersectTrack.length > 0) {
                document.removeEventListener('click', this.placeListener);
                let obstacle = new MyObstacle(this.reader.obstacles[index].type, intersectTrack[0].point.x, 0, intersectTrack[0].point.z);
                this.obstacles.push(obstacle);
                this.app.scene.add(obstacle.mesh);

                this.paused = false;
                this.route.clock.start();
                this.follow = true;
                this.pickingObstacle = false;
            }
        } 
        document.addEventListener('click', this.placeListener);
    }

    /**
     * Handles the game's end logic
     */
    endGameplay() {
        document.removeEventListener('keydown', this.accelerateListener);
        document.removeEventListener('keydown', this.brakeListener);
        document.removeEventListener('keydown', this.turnLeftListener);
        document.removeEventListener('keydown', this.turnRightListener);
        document.removeEventListener('keydown', this.gameListener);

        this.follow = false;
        this.deleteHUD();

        for (const obstacle of this.obstacles) 
            this.app.scene.remove(obstacle.mesh);
        this.obstacles = [];

        for (const car of this.reader.cars) 
            car.position.y = -5;

        this.playerCar.position.set(-85, 0.4, 21);
        this.playerCar.rotation.y = Math.PI / 1.7;
        this.playerCar.angle = Math.PI / 1.7;
        this.playerCar.updateLights();

        this.autoCar.position.set(-70, 0.4, 60);
        this.autoCar.rotation.y = Math.PI / 1.6;
        this.autoCar.angle = Math.PI / 1.6;
        this.autoCar.updateLights();

        this.gameOver();
    }

    /**
     * Handles the game's final menu logic
     */
    gameOver() {
        this.state = 'over';
        this.app.cameras['Perspective'].position.set(-100, 10, 50);
        this.app.cameras['Perspective'].lookAt(0, 0, 10);
        this.app.deactivateControls();

        let autoTime = 0;
        if (Math.floor(this.elapsedTime / 1000) < this.maxLaps * (this.route.animationMaxDuration + 1)) {
            autoTime = Math.floor(this.elapsedTime / 1000);
            this.playerTime = 999;
        }
        else {
            autoTime = this.maxLaps * (this.route.animationMaxDuration + 1);
        }

        this.over = new MyOver(this.app, this.difficulty, this.playerTime, autoTime);
        this.over.init();

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.returnListener = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersectReturn = raycaster.intersectObjects(this.over.returnMenu.children, true);
            if (intersectReturn.length > 0) {
                document.removeEventListener('click', this.returnListener);
                document.removeEventListener('click', this.restartListener);
                this.app.scene.remove(this.over);
                this.over = null;

                this.route = new MyRoute(this.app, this.difficulty);
                for (const car of this.reader.cars) this.app.scene.remove(car);
                this.reader.cars = [];
                this.reader.createCars();
                this.playerName = null;
                this.difficulty = 'normal';
                this.playerCar = null;
                this.autoCar = null;
                this.follow = false;
                this.paused = false;
                this.elapsedTime = 0;
                this.startTime = 0;
                this.playerTime = 0;
                this.lapCooldown = 0;

                this.mainMenu();
            }
        }
        document.addEventListener('click', this.returnListener);

        this.restartListener = (event) => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.app.getActiveCamera());
            const intersectRestart = raycaster.intersectObjects(this.over.restart.children, true);
            if (intersectRestart.length > 0) {
                document.removeEventListener('click', this.returnListener);
                document.removeEventListener('click', this.restartListener);
                this.app.scene.remove(this.over);
                this.over = null;

                this.route = new MyRoute(this.app, this.difficulty);
                for (const car of this.reader.cars) this.app.scene.remove(car);
                this.reader.cars = [];
                this.reader.createCars();
                this.playerCar = this.reader.cars[this.playerIndex];
                this.autoCar = this.reader.cars[this.autoIndex];
                this.follow = false;
                this.paused = false;
                this.elapsedTime = 0;
                this.startTime = 0;
                this.playerTime = 0;
                this.lapCooldown = 0;

                this.gameplay();
            }
        }
        document.addEventListener('click', this.restartListener);
    }

    /**
     * Initializes the game's HUD
     */
    createHUD() {
        this.controlsElement = document.createElement('div');
        this.controlsElement.style.position = 'absolute';
        this.controlsElement.style.top = '5vw';
        this.controlsElement.style.left = '1vw';
        this.controlsElement.style.width = '150px';
        this.controlsElement.style.height = 'auto';
        this.controlsElement.style.backgroundColor = '#000';
        this.controlsElement.style.opacity = '0.8';
        this.controlsElement.style.color = '#aaa';
        this.controlsElement.style.padding = '10px';
        this.controlsElement.style.fontFamily = 'monospace';
        this.controlsElement.innerHTML = '[CONTROLS] \
                                          <br> \
                                          <br>[W] Accelerate \
                                          <br>[S] Brake/Reverse \
                                          <br>[A] Turn Left \
                                          <br>[D] Turn Right \
                                          <br> \
                                          <br>[Q] Pause \
                                          <br>[E] Camera Mode \
                                          <br>[ESC] Quit Race';
        document.body.appendChild(this.controlsElement);

        this.statusElement = document.createElement('div');
        this.statusElement.style.position = 'absolute';
        this.statusElement.style.bottom = '4vw';
        this.statusElement.style.left = '45vw';
        this.statusElement.style.width = '150px';
        this.statusElement.style.height = 'auto';
        this.statusElement.style.backgroundColor = '#000';
        this.statusElement.style.opacity = '0.8';
        this.statusElement.style.color = '#aaa';
        this.statusElement.style.padding = '10px';
        this.statusElement.style.textAlign = 'center';
        this.statusElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.statusElement);

        this.lapsElement = document.createElement('div');
        this.lapsElement.style.position = 'absolute';
        this.lapsElement.style.bottom = '1vw';
        this.lapsElement.style.left = '45vw';
        this.lapsElement.style.width = '150px';
        this.lapsElement.style.height = 'auto';
        this.lapsElement.style.backgroundColor = '#000';
        this.lapsElement.style.opacity = '0.8';
        this.lapsElement.style.color = '#bd8b02';
        this.lapsElement.style.padding = '10px';
        this.lapsElement.style.textAlign = 'center';
        this.lapsElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.lapsElement);

        this.timeElement = document.createElement('div');
        this.timeElement.style.position = 'absolute';
        this.timeElement.style.bottom = '4vw';
        this.timeElement.style.left = '1vw';
        this.timeElement.style.width = '115px';
        this.timeElement.style.height = 'auto';
        this.timeElement.style.backgroundColor = '#000';
        this.timeElement.style.opacity = '0.8';
        this.timeElement.style.color = '#bd8b02';
        this.timeElement.style.padding = '10px';
        this.timeElement.style.textAlign = 'center';
        this.timeElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.timeElement);

        this.speedElement = document.createElement('div');
        this.speedElement.style.position = 'absolute';
        this.speedElement.style.bottom = '1vw';
        this.speedElement.style.left = '1vw';
        this.speedElement.style.width = '200px';
        this.speedElement.style.height = 'auto';
        this.speedElement.style.backgroundColor = '#000';
        this.speedElement.style.opacity = '0.8';
        this.speedElement.style.color = '#bd8b02';
        this.speedElement.style.padding = '10px';
        this.speedElement.style.textAlign = 'center';
        this.speedElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.speedElement);

        this.specialEffectElement = document.createElement('div');
        this.specialEffectElement.style.position = 'absolute';
        this.specialEffectElement.style.bottom = '4vw';
        this.specialEffectElement.style.right = '1vw';
        this.specialEffectElement.style.width = '200px';
        this.specialEffectElement.style.height = 'auto';
        this.specialEffectElement.style.backgroundColor = '#000';
        this.specialEffectElement.style.opacity = '0.8';
        this.specialEffectElement.style.color = '#bd8b02';
        this.specialEffectElement.style.padding = '10px';
        this.specialEffectElement.style.textAlign = 'center';
        this.specialEffectElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.specialEffectElement);

        this.specialTimeElement = document.createElement('div');
        this.specialTimeElement.style.position = 'absolute';
        this.specialTimeElement.style.bottom = '1vw';
        this.specialTimeElement.style.right = '1vw';
        this.specialTimeElement.style.width = '150px';
        this.specialTimeElement.style.height = 'auto';
        this.specialTimeElement.style.backgroundColor = '#000';
        this.specialTimeElement.style.opacity = '0.8';
        this.specialTimeElement.style.color = '#bd8b02';
        this.specialTimeElement.style.padding = '10px';
        this.specialTimeElement.style.textAlign = 'center';
        this.specialTimeElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.specialTimeElement);

        this.ranksElement = document.createElement('div');
        this.ranksElement.style.position = 'absolute';
        this.ranksElement.style.top = '7vw';
        this.ranksElement.style.right = '1vw';
        this.ranksElement.style.width = '250px';
        this.ranksElement.style.height = 'auto';
        this.ranksElement.style.backgroundColor = '#000';
        this.ranksElement.style.opacity = '0.8';
        this.ranksElement.style.color = '#bd8b02';
        this.ranksElement.style.padding = '10px';
        this.ranksElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.ranksElement);

        this.extraElement = document.createElement('div');
        this.extraElement.style.position = 'absolute';
        this.extraElement.style.top = '14vw';
        this.extraElement.style.right = '1vw';
        this.extraElement.style.width = '200px';
        this.extraElement.style.height = 'auto';
        this.extraElement.style.backgroundColor = '#000';
        this.extraElement.style.opacity = '0.8';
        this.extraElement.style.color = '#bd8b02';
        this.extraElement.style.padding = '10px';
        this.extraElement.style.fontFamily = 'monospace';
        document.body.appendChild(this.extraElement);
    }

    /**
     * Updates the game's HUD
     */
    updateHUD() {
        this.statusElement.innerText = this.paused ? '[STATUS] Paused' : '[STATUS] Running';
        this.lapsElement.innerText = '[LAPS] ' + this.playerCar.laps + ' / ' + this.maxLaps;
        this.timeElement.innerText = '[TIME] ' + Math.floor(this.elapsedTime / 1000) + ' s';
        this.speedElement.innerText = '[SPEED] ' + Math.floor(this.playerCar.speed * 250) + ' / 100 (km/h)';
        
        if (this.playerCar.specialEffectTimer > 0) {
            this.specialEffectElement.innerText = '[EFFECT] ' + this.playerCar.specialEffect;
            this.specialTimeElement.innerText = '[REMAINING] ' + (this.playerCar.specialEffectTimer / 50).toFixed(2) + ' s';
        }
        else {
            this.specialEffectElement.innerText = '[EFFECT] None';
            this.specialTimeElement.innerText = '[REMAINING] 0 s';
        }

        const playerLabel = this.playerName + ' (' + this.playerCar.model + ')';
        const autoLabel = 'Opponent (' + this.autoCar.model + ')';
        const autoLaps = Math.floor(Math.floor(this.elapsedTime / 1000) / (this.route.animationMaxDuration + 1));
        if (this.playerCar.laps > autoLaps) {
            this.ranksElement.innerHTML = '[POSITIONS]<br> \
                                        <br>[1] ' + playerLabel +
                                        '<br>[2] ' + autoLabel; 
        }
        else {
            this.ranksElement.innerHTML = '[POSITIONS]<br> \
                                        <br>[1] ' + autoLabel +
                                        '<br>[2] ' + playerLabel; 
        }

        const startCount = Math.floor(this.startTime / 1000);
        if (startCount <= 3) {
            this.extraElement.innerText = 'Starting in... [' + (3 - startCount) + ']';
        }
        else if (this.extraElement !== null) {
            document.body.removeChild(this.extraElement);
            this.extraElement = null;
        }
    }

    /**
     * Deletes the game's HUD
     */
    deleteHUD() {
        document.body.removeChild(this.controlsElement);
        document.body.removeChild(this.statusElement);
        document.body.removeChild(this.lapsElement);
        document.body.removeChild(this.timeElement);
        document.body.removeChild(this.speedElement);
        document.body.removeChild(this.specialEffectElement);
        document.body.removeChild(this.specialTimeElement);
        document.body.removeChild(this.ranksElement);
        if (this.extraElement !== null) document.body.removeChild(this.extraElement);
    }

    /**
     * Makes the camera follow the player's car
     */
    followCar() {
        this.app.controls.target.x = this.playerCar.position.x;
        this.app.controls.target.y = this.playerCar.position.y;
        this.app.controls.target.z = this.playerCar.position.z;

        this.app.cameras['Perspective'].position.x = this.playerCar.position.x - 10;
        this.app.cameras['Perspective'].position.y = 10;
        this.app.cameras['Perspective'].position.z = this.playerCar.position.z - 10;
    }

    /**
     * Checks if the player's car is off track
     */
    offTrack() {
        let x = this.playerCar.position.x;
        let z = this.playerCar.position.z;
        const points = this.reader.track.path.getPoints(this.reader.track.segments);
        let onTrack = false;
        for (const point of points)
            if (Math.abs(-point.x - x) < 5 && Math.abs(point.z - z) < 5)
                onTrack = true;

        if (onTrack) {
            if (this.playerCar.offTrack) {
                this.playerCar.offTrack = false;
                this.playerCar.maxSpeed = 0.4;
                this.playerCar.minSpeed = -0.2;
            }
            return;
        }

        if (!this.playerCar.offTrack) {
            this.playerCar.offTrack = true;
            this.playerCar.speed *= 0.2;
            this.playerCar.maxSpeed *= 0.2;
            this.playerCar.minSpeed *= 0.2;
        }
    }

    /**
     * Checks if the player's car has completed a lap
     */
    lapCompleted() {
        const finishLine = Math.abs(this.playerCar.position.x) < 5 && Math.abs(this.playerCar.position.z) < 1;
        if (finishLine && Math.floor(this.lapCooldown / 1000) > 10) {
            this.lapCooldown = 0;
            this.playerCar.laps++;
        }
    }

    /**
     * Checks if the player's car has collided with a power-up or obstacle
     */
    specialEffect() {
        if (this.playerCar.specialEffectTimer === 0) {
            for (const powerUp of this.reader.powerUps) {
                if (this.playerCar.checkCollision(powerUp.mesh.position.x, powerUp.mesh.position.z)) {
                    this.playerCar.specialEffect = powerUp.type;
                    this.playerCar.specialEffectTimer = powerUp.duration;
                    this.pickObstacle();
                    return;
                }
            }

            for (const obstacle of this.obstacles) {
                if (this.playerCar.checkCollision(obstacle.mesh.position.x, obstacle.mesh.position.z)) {
                    this.playerCar.specialEffect = obstacle.type;
                    this.playerCar.specialEffectTimer = obstacle.duration;
                    return;
                }
            }
        }
    }

    /**
     * Updates the game logic
     */
    update() {
        if (this.state === 'menu') {
            if (this.playerName != null && this.playerName != '' && this.playerCar !== null
                && this.autoCar !== null && this.menu.start === null) {
                this.menu.startLabel();
                document.addEventListener('click', this.startListener);
            }
            if (this.menu.start !== null && this.playerName === '') {
                document.removeEventListener('click', this.startListener);
                this.menu.remove(this.menu.start);
                this.menu.start = null;
            }
        }
        else if (this.state === 'gameplay') {
            this.updateHUD();
            if (this.app.controls !== null && this.follow) this.followCar();

            this.startTime += 17;
            if (Math.floor(this.startTime / 1000) === 3) {
                this.paused = false;
                this.route.playAnimation(this.autoCar);
            }

            if (this.paused) return;
            this.elapsedTime += 17;

            if (this.playerCar.laps < this.maxLaps) {
                this.lapCooldown += 17;
                this.playerTime = Math.floor(this.elapsedTime / 1000);
                this.lapCompleted();
            }

            let x = this.autoCar.position.x;
            let z = this.autoCar.position.z;
            if (this.playerCar.checkCollision(x, z)) this.playerCar.collide(x, z);
            else this.playerCar.update();
            this.offTrack();
            this.specialEffect();

            if (Math.floor(this.elapsedTime / 1000) < this.maxLaps * (this.route.animationMaxDuration + 1)) {
                x = this.playerCar.position.x;
                z = this.playerCar.position.z;
                if (this.autoCar.checkCollision(x, z)) this.autoCar.collide(x, z);
                else this.autoCar.update();
                this.route.update();
            }

            for (const obstacle of this.obstacles)
                obstacle.update();

            if (this.playerCar.laps === this.maxLaps && 
                Math.floor(this.elapsedTime / 1000) >= this.maxLaps * (this.route.animationMaxDuration + 1))
                this.endGameplay();
        }
        else if (this.state === 'over') {
            this.over.update();
        }
    }
}

export { MyGame };