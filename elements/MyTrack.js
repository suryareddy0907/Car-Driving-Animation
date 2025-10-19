import * as THREE from 'three';

/**
 * This class contains the track object
 * @extends THREE.Group
 */
class MyTrack extends THREE.Group {
    /**
     * constructor
     * @param {THREE.CatmullRomCurve3} path The points that define the curve
     * @param {number} segments The number of segments of the curve
     * @param {number} width The width of the curve
     */
    constructor(path, segments = 1000, width = 5) {
        super();
        this.type = 'Group';

        this.path = path;
        this.segments = segments;
        this.width = width;
        this.showWireframe = false;
        this.showMesh = true;
        this.showLine = true;
        this.closedCurve = false;

        this.buildCurve();
        this.buildFinishLine();
        this.position.y -= 0.5;
    }

    /**
     * Creates the finish line
     */
    buildFinishLine() {
        let material = new THREE.MeshPhongMaterial({ color: 0x000000 });
        let geometry = new THREE.CylinderGeometry(0.1, 0.1, 4);

        let stick1 = new THREE.Mesh(geometry, material);
        stick1.position.set(-4.3, 2, 0);
        this.add(stick1);

        let stick2 = new THREE.Mesh(geometry, material);
        stick2.position.set(4.3, 2, 0);
        this.add(stick2);

        const texture = new THREE.TextureLoader().load("./images/finish.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 1);
        material = new THREE.MeshPhongMaterial({
            map: texture
        });
        geometry = new THREE.BoxGeometry(8.8, 3, 0.2);
        let box = new THREE.Mesh(geometry, material);
        box.position.set(0, 5.5, 0);
        this.add(box);
    }

    /**
     * Creates the necessary elements for the curve
     */
    buildCurve() {
        this.createCurveMaterialsTextures();
        this.createCurveObjects();
    }

    /**
     * Create materials for the curve elements: the mesh, the line and the wireframe
     */
    createCurveMaterialsTextures() {
        const texture = new THREE.TextureLoader().load("./images/track.jpg");
        texture.wrapS = THREE.RepeatWrapping;

        this.material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 0
        });
        this.material.map.repeat.set(100, 100);
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;

        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            opacity: 0.3,
            wireframe: true,
            transparent: true,
        });

        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    }

    /**
     * Creates the mesh, the line and the wireframe used to visualize the curve
     */
    createCurveObjects() {
        let geometry = new THREE.TubeGeometry(
            this.path,
            this.segments,
            this.width,
            3,
            this.closedCurve
        );
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.wireframe = new THREE.Mesh(geometry, this.wireframeMaterial);

        let points = this.path.getPoints(this.segments);
        let bGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        this.line = new THREE.Line(bGeometry, this.lineMaterial);
        this.line.position.y -= 2.7;

        this.curve = new THREE.Group();

        this.mesh.visible = this.showMesh;
        this.wireframe.visible = this.showWireframe;
        this.line.visible = this.showLine;

        this.curve.add(this.mesh);
        this.curve.add(this.wireframe);
        this.curve.add(this.line);

        this.curve.rotateZ(Math.PI);
        this.curve.scale.set(1,0.2,1);
        this.add(this.curve);
    }

    /**
     * Called when user changes number of segments in UI. Recreates the curve's objects accordingly.
     */
    updateCurve() {
        if (this.curve !== undefined && this.curve !== null) {
            this.remove(this.curve);
        }
        this.buildCurve();
    }

    /**
     * Called when user curve's closed parameter in the UI. Recreates the curve's objects accordingly.
     */
    updateCurveClosing() {
        if (this.curve !== undefined && this.curve !== null) {
            this.remove(this.curve);
        }
        this.buildCurve();
    }

    /**
     * Called when user changes number of texture repeats in UI. Updates the repeat vector for the curve's texture.
     * @param {number} value - repeat value in S (or U) provided by user
     */
    updateTextureRepeat(value) {
        this.material.map.repeat.set(value, 3);
    }

    /**
     * Called when user changes line visibility. Shows/hides line object.
     */
    updateLineVisibility() {
        this.line.visible = this.showLine;
    }
    
    /**
     * Called when user changes wireframe visibility. Shows/hides wireframe object.
     */
    updateWireframeVisibility() {
        this.wireframe.visible = this.showWireframe;
    }

    /**
     * Called when user changes mesh visibility. Shows/hides mesh object.
     */
    updateMeshVisibility() {
        this.mesh.visible = this.showMesh;
    }
}

export { MyTrack };