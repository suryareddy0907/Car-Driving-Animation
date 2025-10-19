import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        //this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        /*
        if (this.app.cameras['Perspective'] !== undefined) {
            const cameraFolder = this.datgui.addFolder('Camera')
            cameraFolder.add(this.app, 'activeCameraName', ['Perspective', 'Left', 'Top', 'Front']).name("Active camera");
            cameraFolder.open()
        }
        
        if (this.contents.reader !== undefined) {
            const folderGeometry = this.datgui.addFolder("Curve");
            folderGeometry
                .add(this.contents.reader.track, "segments", 10, 400)
                .step(10)
                .onChange((value)=>this.contents.reader.track.updateCurve(value));
            folderGeometry
                .add(this.contents.reader.track, "closedCurve")
                .onChange((value)=>this.contents.reader.track.updateCurveClosing(value));
            folderGeometry
                .add(this.contents.reader.track, "textureRepeat", 1, 200)
                .step(1)
                .onChange((value)=>{this.contents.reader.track.updateTextureRepeat(value)});
            folderGeometry
                .add(this.contents.reader.track, "showLine")
                .name("Show line")
                .onChange(()=>this.contents.reader.track.updateLineVisibility());
            folderGeometry
                .add(this.contents.reader.track, "showWireframe")
                .name("Show wireframe")
                .onChange(()=>this.contents.reader.track.updateWireframeVisibility());
            folderGeometry
                .add(this.contents.reader.track, "showMesh")
                .name("Show mesh")
                .onChange(()=>this.contents.reader.track.updateMeshVisibility());
            folderGeometry.close();

            const animationFolder = this.datgui.addFolder('Animation')
            animationFolder.add(this.contents.reader.route, 'mixerPause', true).name("Pause");
            animationFolder.add(this.contents.reader.route, 'enableAnimationPosition', true).name("Pos. track");
            animationFolder.add(this.contents.reader.route, 'mixerTime', 0, 6).name("Track time").onChange(() => { this.contents.reader.route.setMixerTime() });
            animationFolder.close();
        }
        */
    }

    reset() {
        this.datgui.destroy();
        this.datgui = new GUI();
        this.init();
    }
}

export { MyGuiInterface };