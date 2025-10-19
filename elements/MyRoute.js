import * as THREE from 'three';

/**
 * This class contains the automated car route
 */
class MyRoute {
    /**
     * constructor
     * @param {MyApp} app The application object
     * @param {string} difficulty The race difficulty level
     */
    constructor(app, difficulty) {
        this.app = app;
        this.difficulty = difficulty;

        this.keyPoints = [
            new THREE.Vector3(2, 0.4, 5),
            new THREE.Vector3(2, 0.4, -51),
            new THREE.Vector3(-42, 0.4, -52),
            new THREE.Vector3(-42, 0.4, -2),
            new THREE.Vector3(-72, 0.4, 8),
            new THREE.Vector3(-67, 0.4, 32),
            new THREE.Vector3(-40, 0.4, 82),
            new THREE.Vector3(0, 0.4, 92),
            new THREE.Vector3(2, 0.4, 5)
        ];
        this.clock = new THREE.Clock();
        this.mixerTime = 0;
        this.mixerPause = false;
        this.enableAnimationPosition = true;

        this.animationMaxDuration = 0;
        if (this.difficulty === 'normal') this.animationMaxDuration = 22;
        else if (this.difficulty === 'hard') this.animationMaxDuration = 18;

        //this.debugKeyFrames();
    }

    /**
     * Build control points and a visual path for debug
     */
    debugKeyFrames() {
        let spline = new THREE.CatmullRomCurve3([...this.keyPoints])
        for (let i = 0; i < this.keyPoints.length; i++) {
            const geometry = new THREE.SphereGeometry(1, 32, 32)
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
            const sphere = new THREE.Mesh(geometry, material)
            sphere.scale.set(0.2, 0.2, 0.2)
            sphere.position.set(... this.keyPoints[i])
            this.app.scene.add(sphere)
        }
        const tubeGeometry = new THREE.TubeGeometry(spline, 100, 0.05, 10, false)
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial)
        this.app.scene.add(tubeMesh)
    }

    /**
     * Generate times for the animation
     * @param {Array} durations
     * @returns {Array} times
     */
    generateTimes(durations) {
        let times = [];
        let sum = 0;
        for (let i = 0; i < durations.length; i++) {
            sum += durations[i];
            times.push(sum);
        }
        return times;
    }

    /**
     * Play the animation
     * @param {THREE.Group} car
     */
    playAnimation(car) {
        let times = [];
        if (this.difficulty === 'normal') times = this.generateTimes([0, 4, 3, 3, 2, 2, 2, 2, 4]);
        else if (this.difficulty === 'hard') times = this.generateTimes([0, 3.5, 2.5, 2.5, 1.5, 1.5, 1.5, 1.5, 3.5]);

        const positionKF = new THREE.VectorKeyframeTrack(
            '.position',
            times, 
            [
                ...this.keyPoints[0],
                ...this.keyPoints[1],
                ...this.keyPoints[2],
                ...this.keyPoints[3],
                ...this.keyPoints[4],
                ...this.keyPoints[5],
                ...this.keyPoints[6],
                ...this.keyPoints[7],
                ...this.keyPoints[8]
            ],
            THREE.InterpolateSmooth
        )

        const yAxis = new THREE.Vector3(0, 1, 0)
        const q1 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(0))
        const q2 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(90))
        const q3 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(180))
        const q4 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(90))
        const q5 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(200))
        const q6 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(220))
        const q7 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(250))
        const q8 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(0))
        const q9 = new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(0))

        const quaternionKF = new THREE.QuaternionKeyframeTrack(
            '.quaternion',
            times,
            [
                q1.x, q1.y, q1.z, q1.w,
                q2.x, q2.y, q2.z, q2.w,
                q3.x, q3.y, q3.z, q3.w,
                q4.x, q4.y, q4.z, q4.w,
                q5.x, q5.y, q5.z, q5.w,
                q6.x, q6.y, q6.z, q6.w,
                q7.x, q7.y, q7.z, q7.w,
                q8.x, q8.y, q8.z, q8.w,
                q9.x, q9.y, q9.z, q9.w
            ]
        );

        const positionClip = new THREE.AnimationClip('positionAnimation', this.animationMaxDuration, [positionKF])
        const rotationClip = new THREE.AnimationClip('rotationAnimation', this.animationMaxDuration, [quaternionKF])

        // Create an AnimationMixer
        this.mixer = new THREE.AnimationMixer(car)

        // Create AnimationActions for each clip
        const positionAction = this.mixer.clipAction(positionClip)
        const rotationAction = this.mixer.clipAction(rotationClip)

        // Play both animations
        positionAction.play()
        rotationAction.play()
    }

    /**
     * Set a specific point in the animation clip
     */
    setMixerTime() {
        this.mixer.setTime(this.mixerTime)
    }

    /**
     * Start/Stop all animations
     */
    checkAnimationStateIsPause() {
        if (this.mixerPause)
            this.mixer.timeScale = 0
        else
            this.mixer.timeScale = 1
    }

    /**
     * Start/Stop if position or rotation animation track is running
     */
    checkTracksEnabled() {
        const actions = this.mixer._actions
        for (let i = 0; i < actions.length; i++) {
            const track = actions[i]._clip.tracks[0]
            if (track.name === '.position' && this.enableAnimationPosition === false) {
                actions[i].stop()
            }
            else {
                if (!actions[i].isRunning())
                    actions[i].play()
            }
        }
    }

    /**
     * Update the animation
     */
    update() {
        if (this.mixer !== undefined) {
            const delta = this.clock.getDelta()
            this.mixer.update(delta)
            this.checkAnimationStateIsPause()
            this.checkTracksEnabled()
        }
    }
}

export { MyRoute };