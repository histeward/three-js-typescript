import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Create a WebGLRenderer with antialiasing and set the canvas element
function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('app') as HTMLCanvasElement });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  renderer.autoClearColor = false;
  renderer.autoClearDepth = false;
  renderer.autoClearStencil = false;
  return renderer;
};

// Create a PerspectiveCamera with an initial position
function createCamera() {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 2);
  return camera;
};

// Create a scene with ambient, directional, and point lights
function createScene() {
  const scene = new THREE.Scene();
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  directionalLight.position.set(0, 4, 2);
  pointLight.position.set(0, 3, 0);
  scene.add(ambientLight, directionalLight, pointLight);
  return scene;
};

// Update renderer size and camera aspect ratio on window resize
function onWindowResize(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Update renderer size
  renderer.setSize(width, height);

  // Update camera aspect ratio and projection matrix
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

// Add a window resize event listener
window.addEventListener('resize', () => {
  onWindowResize(renderer, mainCamera);
});

// Load a GLTF model and add it to the scene
function loadModel(scene: THREE.Scene, onModelLoaded: (model: THREE.Object3D) => void) {
  const loader = new GLTFLoader();
  let model: THREE.Object3D | null = null;
  loader.load(
    '/kuma_heavy_robot_r-9000s/scene.gltf',
    function (gltf) {
      model = gltf.scene;
      // model.rotation.x = -Math.PI / 3; // you can rotate the model if needed

      // Scale the model down
      const scaleFactor = 0.00005; // Scale the model if it is either too big or small
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(model);
      onModelLoaded(model as THREE.Object3D);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  return model;
};

// Setup zoom controls for the camera with mouse wheel events
function setupZoomControls(camera: THREE.PerspectiveCamera) {
  const zoomSpeed = 0.05;
  const minZoom = 0.1;
  const maxZoom = 10;

  document.addEventListener('wheel', (event) => {
    if (event.target instanceof HTMLCanvasElement) {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 1 : -1;
      const zoom = camera.zoom + delta * zoomSpeed;

      if (zoom >= minZoom && zoom <= maxZoom) {
        camera.zoom = zoom;
        camera.updateProjectionMatrix();
      };
    };
  });
};

// Setup drag controls for the model with mouse and touch events
function setupDragControls(model: THREE.Object3D | null) {
  let isDragging = false;
  let previousPosition = { x: 0, y: 0 };

  function startDragging(event: MouseEvent | TouchEvent) {
    isDragging = true;
    const position = 'touches' in event ? event.touches[0] : event;
    previousPosition = { x: position.clientX, y: position.clientY };
  };

  function moveDragging(event: MouseEvent | TouchEvent) {
    if (!isDragging || !model) return;

    const position = 'touches' in event ? event.touches[0] : event;
    const deltaMove = {
      x: position.clientX - previousPosition.x,
      y: position.clientY - previousPosition.y,
    };

    model.rotation.y += deltaMove.x * 0.01;
    model.rotation.x += deltaMove.y * 0.01;

    previousPosition = { x: position.clientX, y: position.clientY };
  };

  function stopDragging() {
    isDragging = false;
  };

  // Mouse events
  document.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', moveDragging);
  document.addEventListener('mouseup', stopDragging);

  // Touch events
  document.addEventListener('touchstart', startDragging, { passive: false });
  document.addEventListener('touchmove', moveDragging, { passive: false });
  document.addEventListener('touchend', stopDragging);
};

// Animate the camera position around the model
function animateCamera(camera: THREE.PerspectiveCamera, model: THREE.Object3D | null) {
  let time = 0;
  function animate() {
    if (model) {
      time += 0.01;
      const radius = 0.3;
      const angle = time;
      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      camera.position.set(x, 0, z);
      camera.lookAt(model.position);
    };
    requestAnimationFrame(animate);
  };
  animate();
};

// Main render loop
function render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  function loop() {
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  loop();
};

// Main execution
const renderer = createRenderer();
const mainCamera = createCamera();
const scene = createScene();
loadModel(scene, (model: THREE.Object3D) => {
  animateCamera(mainCamera, model);
  setupDragControls(model);
});
setupZoomControls(mainCamera);
render(renderer, scene, mainCamera);

// Add a window resize event listener
window.addEventListener('resize', () => {
  onWindowResize(renderer, mainCamera);
});
