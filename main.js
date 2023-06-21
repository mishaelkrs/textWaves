import './style.css';
import { initializeAudio } from './src/audio.js';
import initializeThree from './src/threeSetup.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import Word from './src/Word';


//setup three.js
const container = document.getElementById("app");
const [scene, camera, renderer] = initializeThree(container);

//load font
const loader = new FontLoader();
const font = await loader.loadAsync("Alef_Bold.json");

const word = new Word("םילג םילגמ\nDiscover Waves", font, 6);
scene.add(...word.getMeshes());
scene.add(...word.getHolesMeshes());
// console.log(word.getHolesMeshes());
console.log(scene);
// get the audio streaming
let analyser;
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', function () {
  startButton.style.display = 'none';
  initializeAudio().then(function (result) {
    animate();
    analyser = result;
    console.log("streaming audio");
    // animate();
  });
});


let t = 0;
function animate() {
  if (analyser) {
    let frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
    word.update(frequencyData);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  // 
  // if (t < 10) {
  //   requestAnimationFrame(animate);
  //   t++;
  // }
}
animate()



