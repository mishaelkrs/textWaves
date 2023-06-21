import * as THREE from 'three';

export default function initializeThree(container) {
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xeeeeee);
    scene.background = new THREE.Color(0x000000);

    const width = container.clientWidth;
    const height = container.clientHeight;
    // const aspectRatio = width / height;
    console.log(width,height);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z =6;
    camera.position.x =7;
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width,height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement)

    return [scene, camera, renderer] ;

}