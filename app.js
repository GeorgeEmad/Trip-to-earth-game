import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import {OBJLoader2} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/OBJLoader2.js';
import {MTLLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';
import {GUI} from 'https://threejsfundamentals.org/threejs/../3rdparty/dat.gui.module.js';


function main() {
  var obstacleposition = [];
  var start_flag = 0;
  var options = {
    speed : 4,
    perspective : false,
    background_color : new THREE.Color(0xB1E1FF),
    sunset: function(){
      this.background_color = new THREE.Color(0xfab175);
    },
    day: function(){
      this.background_color = new THREE.Color(0xB1E1FF);
    },
    night: function(){
      this.background_color = new THREE.Color(0x261a3d);
    }
  };
  
  
    
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 50;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 3000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  const controls = new OrbitControls(camera, canvas);
  camera.position.set(0, 10, -20);
  controls.target.set(0, 5, 0);
  controls.enableKeys = false;
  controls.update();
  document.addEventListener( 'keydown', onKeyDown );
  document.addEventListener( 'keydown', start );

  const scene = new THREE.Scene();
  scene.background = options.background_color;

  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();
  camera.add( listener );

  // create a global audio source
  const sound = new THREE.Audio( listener );
    
  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'song.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 1.5 );
    sound.play(true);
  });


  {//road
    const planeSize = 40;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./street.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize*3;
    texture.repeat.set(1, repeats);
    const planeGeo = new THREE.BoxGeometry(planeSize, 1,3000);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.position.z = 1490;
    mesh.position.y = -0.5;
    scene.add(mesh);
  }

  { // planet
    
    const tilt = 0.41;
    const geometry_Earth = new THREE.SphereBufferGeometry( 5, 60, 60 );
    const loader_earth = new THREE.TextureLoader();
    const texture_earth = loader_earth.load('earth.jpg');
    texture_earth.wrapS = THREE.RepeatWrapping;
    texture_earth.wrapT = THREE.RepeatWrapping;
    texture_earth.magFilter = THREE.NearestFilter;
    //  const material = new THREE.MeshBasicMaterial( texture );
    const Earthmat = new THREE.MeshPhongMaterial({
      map: texture_earth
    });
    const sphere = new THREE.Mesh( geometry_Earth, Earthmat );
    sphere.position.x=300;
    sphere.position.y=190;
    sphere.position.z=3000;
    sphere.scale.set( 20, 20, 20 );
    sphere.rotation.z = tilt;
    sphere.name = "planet"
    scene.add( sphere );
  
    }

  {
    const planeSize = 40;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./grass.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.set(6, 120);
    const planeGeo = new THREE.BoxGeometry(150, 1,3000);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const meshLeft = new THREE.Mesh(planeGeo, planeMat);
    const meshRight = new THREE.Mesh(planeGeo, planeMat);
    meshRight.position.z = 1490;
    meshRight.position.y = -0.5;
    meshRight.position.x =  95;
    scene.add(meshRight);

    meshLeft.position.z = 1490;
    meshLeft.position.y = -0.5;
    meshLeft.position.x =  -95;
    scene.add(meshLeft);
  }

  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 0.2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 0.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('./bugatti_final.mtl', (mtlParseResult) => {
      const objLoader = new OBJLoader2();
      const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      objLoader.addMaterials(materials);
      objLoader.load('bugatti_final.obj', (root) => {
        root.rotation.y = 12.4;
        root.name = "car";
        scene.add(root);
      });
    });
  }

  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('./Road_Barrier.mtl', (mtlParseResult) => {
      const objLoader = new OBJLoader2();
      const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      objLoader.addMaterials(materials);

        objLoader.load('Road_Barrier.obj', (barrier) => {
          for(var i = 0; i <= 10; i++){
            var cloned = barrier.clone(true);
            cloned.scale.set(3.2,3.5,3.5);
            cloned.position.z = getRandomInt(2850) + 130;
            cloned.position.x = -16 + getRandomInt(35);
            cloned.name = "barrier" + i.toString();
            let barrier_positions ={
              x: cloned.position.x,
              z: cloned.position.z
            };
            obstacleposition.push(barrier_positions);
            scene.add(cloned);
          }
         //this function was used to know the car and barrier sizes and to print them so that we can make the game logic (win & loss)
         //var size = new THREE.Box3().setFromObject(barrier).getSize(new THREE.Vector3());
         //console.log(size.x);

      });
    });
  }


{// Clouds
{
  const mtlLoader = new MTLLoader();
  mtlLoader.load('./cloud.mtl', (mtlParseResult) => {
    const objLoader = new OBJLoader2();
    const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
    objLoader.addMaterials(materials);
    objLoader.load('cloud.obj', (cloud) => {
      for(var i = 0; i <= 50; i++){
        var cloned = cloud.clone(true);
        cloned.scale.set(0.02, 0.02, 0.02);
        //set the clouds location up high in the sky :D
        cloned.position.z = getRandomInt(3000); // Distribute clouds over road
        cloned.position.x = -300 + getRandomInt(500);
        cloned.position.y = 20 + getRandomInt(20); // Give hight to clouds
        cloned.name = "cloud" + i.toString();
        scene.add(cloned);
      }
    });
  });
}
}


  var gui = new GUI();
  gui.add(options, 'perspective').name('1st person view').listen().onChange(function(){changePerspective()});
  gui.add(options, 'speed', 0, 10).listen();
  var sky = gui.addFolder('Sky Options');
  sky.add(options, 'day');
  sky.add(options, 'sunset');
  sky.add(options, 'night');
  sky.open();
  function changePerspective(){
    if(options.perspective == true){
      camera.position.set(0, 10, -20); // Reset camera position before zoom in
      camera.lookAt(0, 0, 25); // Adjust camera orientation to 1st person
      // Adjust camera position to 1st person with respect to the car
      camera.position.y = scene.getObjectByName('car').position.y + 5;
      camera.position.z = scene.getObjectByName('car').position.z - 2;

    }
    else{
      camera.position.set(0, 10, -20); // Reset camera position before zoom out
      camera.lookAt(0, 0, 20); // Adjust camera orientation to 1st person
      // Adjust camera position to 3st person with respect to the car
      camera.position.z = scene.getObjectByName('car').position.z - 20;
    }
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }


    renderer.render(scene, camera);
    requestAnimationFrame(render);
    scene.background = options.background_color;
    var fov = scene.getObjectByName('car');
    var earth = scene.getObjectByName('planet');
    const rotationSpeed = 0.02;
    //Earth motion
    earth.rotation.y += rotationSpeed;
    const listener = new THREE.AudioListener();
    camera.add( listener );
    

    if(start_flag == 1){
        fov.position.z += 1 * options.speed;
        camera.position.z += 1* options.speed;
        // Clouds motion
        for(var i = 0; i <= 50; i++){
          scene.getObjectByName("cloud" + i.toString()).position.x += 0.25;
        }
        
        obstacleposition.forEach(function(obstacle)
        
        {

        //losing condition of roadside, you have to be on road 
            if((fov.position.x +6) > 20 || (fov.position.x -6) < -20 ){
              end_game();
              lose();
            }   
          
        // losing condition when hitting a barrier
            if(  ((obstacle.z + 0.25) <= (fov.position.z + 7.5))  &&  ( (obstacle.z - 0.25) >= (fov.position.z - 7.5) ) ){
              if(   ( (fov.position.x + 6) >= (obstacle.x - 1.1) ) &&  ( (fov.position.x - 6) <= (obstacle.x +1.01) )  ){
                end_game();
                lose();
              }

            }
        // winning condition
           if((fov.position.z + 7.5) > 3000){
            end_game();
            win();
           } 

       });
       
    }
  }

  requestAnimationFrame(render);

  function start(e){
    if (e.keyCode == '38'){
      start_flag = 1;

      // Prepare the camera and controls when game starts
      controls.enabled = false; // Disable orbit controls
      // Reset the camera to 3rd person view
      camera.position.set(0, 10, -20); // Reset camera position before zoom out
      camera.lookAt(0, 0, 20); // Adjust camera orientation to 1st person
      // Adjust camera position to 3st person with respect to the car
      camera.position.z = scene.getObjectByName('car').position.z - 20;
    }
  }
  
  function onKeyDown(e){
    var distance = 2.5;
    var fov = scene.getObjectByName('car');
    if(e.keyCode =='37'){
        fov.position.x += distance;
        }
    else if (e.keyCode == '39'){
      fov.position.x -= distance;
    }
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

 function end_game(){
    start_flag =0;
    canvas.parentNode.removeChild(canvas);
    gui.destroy()
    sound.stop();
  }



  function lose(){
    var img = document.createElement('img'); 
    img.src =  'lose.png'; 
    document.getElementById('body').appendChild(img);
    img.classList.add("img_game");
  }

  function win(){
    var img = document.createElement('img'); 
    img.src =  'win.png'; 
    document.getElementById('body').appendChild(img);
    img.classList.add("img_game");
  }

}

main();
 
