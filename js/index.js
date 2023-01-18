const { SystemDesc, Color, Vec3, EnvMap, Scene, GLRenderer } = window.zeaEngine;
const { SelectionManager } = window.zeaUx;

import loadModel from './1-loadModel.js';
import setupMaterials from './2-setupMaterials.js';
import setupCutaway from './3-setupCutaway.js';
import setupGears from './4-setupGears.js';
import setupExplode from './5-setupExplode.js';
import setupStates from './6-setupStates.js';

const domElement = document.getElementById('renderer');

const scene = new Scene();
// scene.setupGrid(1.0, 10);

const renderer = new GLRenderer(domElement, {
  webglOptions: {
    antialias: true,
    canvasPosition: 'relative',
  },
});

if (!SystemDesc.isMobileDevice && renderer.gl.floatTexturesSupported) {
  const envMap = new EnvMap('EnvMap');
  envMap.load('data/StudioG.zenv');
  // envMap.getParameter('HeadLightMode').setValue(true)

  // renderer.gamma = 2.5;
  renderer.exposure = 1.5;
  scene.setEnvMap(envMap);
}

renderer.outlineThickness = 1.0;
renderer.outlineSensitivity = 1.0;
renderer
  .getViewport()
  .getCamera()
  .setPositionAndTarget(new Vec3({ x: 0.56971, y: -0.83733, z: 0.34243 }), new Vec3({ x: 0.03095, y: -0.05395, z: 0 }));

renderer.getViewport().backgroundColorParam.setValue(new Color('#D9EAFA'));

renderer.setScene(scene);

const camera = renderer.getViewport().getCamera();
camera.getTargetPostion = camera.getTargetPosition;

renderer.getViewport().on('pointerDown', (event) => {
  if (event.intersectionData) {
    const intersectionData = event.intersectionData;
    const geomItem = intersectionData.geomItem;
    console.log(geomItem.getPath());
  }
});

/////////////////////////////////////////////
// Set up Tree
const appData = {
  scene,
  renderer,
}
// Setup Selection Manager
const selectionColor = new Color('#F9CE03')
selectionColor.a = 0.1
const selectionManager = new SelectionManager(appData, {
  selectionOutlineColor: selectionColor,
  branchSelectionOutlineColor: selectionColor,
})
appData.selectionManager = selectionManager

// Setup TreeView Display
const $tree = document.querySelector('#tree')
$tree.setSelectionManager(selectionManager)
$tree.setTreeItem(scene.getRoot(), {
  scene,
  renderer,
  selectionManager,
  displayTreeComplexity: false,
})


////////////////////////////////////
// Load the Model
// Page 1 - load and setup the cad Model.
const asset = loadModel();
scene.getRoot().addChild(asset);
// asset.once('loaded', () => {
//   renderer.frameAll()
// })
window.setRenderingMode = setupMaterials(asset, scene);

setupCutaway(asset);
//setupGears(asset);
setupExplode(asset);
const stateMachine = setupStates(asset, renderer);

const fpsDisplay = document.createElement('zea-fps-display');
fpsDisplay.renderer = renderer;
domElement.appendChild(fpsDisplay);
