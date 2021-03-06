//very basic variables to create our scene
var scene;
var camera;
var renderer;
var clock;

//input
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var openDoor = false;

//atributes of vehicle
var direction = new THREE.Vector3(0, 0, 1);
var speed = 0;
var maxSpeed = 1;
var accel = 0.01;
var deaccel = 0.02;
var rotationSpeed = 0.05;

var ambientLight;

//collisions arrays
var bouding = [];
var boudingBox = [];
var boudingBoxes = [];

//stuff loaded arrays
var boxes = [];
var vehicleLoaded = [];
var wheelLoaded = [];
var doorLoaded = [];
var scenery = [];

//loaders to create stuff
var objectLoader;
var textureLoader;

var loadFinished = false;


const noventa = Math.PI / 2;

init();

function init() {

    //initializing variables 
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcce0ff );
    clock = new THREE.Clock();
    fbxLoader = new THREE.FBXLoader();
    textureLoader = new THREE.TextureLoader();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //creation functions to compose scene
    createCamera();
    createFloor();
    createVehicle();
    createBase();
    randomSpawner();
    ambientLight();
    // directionalLight();

    scene.fog = new THREE.Fog( 0x002339, 150, 800 );

    //render and loop
    render();

    //listeners for input
    document.addEventListener('keydown', onKeyDown ); 
    document.addEventListener('keyup', onKeyUp );
};

function render() {
    requestAnimationFrame( render );
    // let delta = clock.getDelta();

    if(loadFinished){
        animate();
    }

    if(loadFinished){
        for(i=0; i< 7; i++) {
            if(boudingBoxes[i].intersectsBox(boudingBox[0])){
                console.log("destroy box");
                scene.remove(boudingBoxes[i]);
            }
        }
    }

    bouding.forEach(a => {
        a.update();
        });

    if(loadFinished){
        boudingBox[0].setFromObject(vehicleLoaded[0].children[0]);
    }

    renderer.render( scene, camera );

};

function onKeyDown(event){
    console.log(event.keyCode);

    switch(event.keyCode){

        case 38://cima
        case 87:    moveForward = true; break; 

        case 40://baixo
        case 83:    moveBackward = true; break;

        case 39://direita
        case 68:    moveRight = true; break;

        case 37://esquerda
        case 65:    moveLeft = true; break;

        case 32:    openDoor = true; break;
    }
}

function onKeyUp(event){
    switch(event.keyCode){

        case 38://cima
        case 87:    moveForward = false; break;

        case 40://baixo
        case 83:    moveBackward = false; break;

        case 39://direita
        case 68:    moveRight = false; break;

        case 37://esquerda
        case 65:    moveLeft = false; break;

        case 32:    openDoor = false; break;
    }
}

function createCamera(){
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set( 0, -100, 120 );
    camera.rotation.x = Math.PI / 4;
}

function ambientLight(){
    ambientLight = new THREE.AmbientLight(0X000000);
    ambientLight.intensity = 1;

    // renderer.shadowMap.enable = true;
    // renderer.shadowMap.type = THREE.BasicShadowMap;

    scene.add(new THREE.AmbientLight(ambientLight));   
}

function directionalLight(){
    //corPixel = corPixel * corLuzDirecional * intensidade * tetha ... (integração das cores do ambeinte).

    directionalLight = new THREE.DirectionalLight(0xffffff, 1, 1000);
    directionalLight.position.y = 0;
    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.left = 1000;
    directionalLight.shadow.camera.bottom = 1000;
    directionalLight.shadow.camera.right = -1000
    directionalLight.shadow.camera.top = -1000;

    directionalLight.target = ground;

    scene.add(directionalLight);
    scene.add(directionalLight.target);

    scene.add(new THREE.DirectionalLightHelper(directionalLight));

}

function createBase(){
    fbxLoader.load('assets/models/base.fbx', function ( object ) {
        object.scale.set(0.04, 0.04, 0.04);
        object.traverse( function ( child ) {
            if (child.isMesh) {
                child.material.map = textureLoader.load("assets/textura/correio.png");
                child.material.color = 0x000000;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scenery.push(object);
        object.castShadow = true;
        object.receiveShadow = true;

        object.position.x = 0;
        object.position.y = 130;

        object.rotation.y =  0;
        object.rotation.x = noventa;

        scene.add(object);
    } );
}

function randomSpawner(){
    for (i=0; i<7; i++){
        createBox(Math.random()*40*(Math.random() > 0.5 ? -1: 1), Math.random()*40*(Math.random() > 0.5 ? -1: 1));
    }
}

function createVehicle(){
    fbxLoader.load('assets/models/vehicle.fbx', function ( object ) {
        object.scale.set(0.04, 0.04, 0.04);
        object.traverse( function ( child ) {
            if (child.isMesh) {
                child.material.map = textureLoader.load("assets/textura/correio.png");
                child.material.color = 0x000000;
                // child.material.aoMapIntensity = 0;
                // child.material.wireframe = true;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        vehicleLoaded.push(object);
        object.castShadow = true;
        object.receiveShadow = true;

        object.position.x = 10;
        object.position.y = 120;

        object.rotation.y =  0;
        object.rotation.x = noventa;

        scene.add(object);

        createWheel(100, 45, 120, 1, 0);
        createWheel(-100, 45, 120, 1, noventa*2);
        createWheel(100, 45, -120, 1, 0);
        createWheel(-100, 45, -120, 1, noventa*2);
        createDoor(90, 0, -190, 1, 0);
        createDoor(-90, 0, -190, 1, noventa*2);

        // let box = new THREE.BoxHelper( object, 0xffff00 );
        // scene.add( box );
        // bouding.push(box);
        
        boxF = new THREE.Box3().setFromObject(object.children[0]);
        boudingBox.push(boxF);
    } );
}

function createFloor(){
    textureLoader = new THREE.TextureLoader();
    groundTexture = textureLoader.load('assets/textura/ground.png');

    material = new THREE.MeshStandardMaterial({map : groundTexture});
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 20, 20 );
    ground = new  THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000, 10),material);
    ground.position.y = 0;

    ground.receiveShadow = true;

    scene.add(ground);
}
//recieves position for the mail box spawn position,
function createBox(position_x, position_y){
    fbxLoader.load('assets/models/box.fbx',function(object){
            object.traverse( function ( child ) {
                        if ( child instanceof THREE.Mesh ) {
                            // console.log(child);
                            child.material.map = textureLoader.load("assets/textura/box.png");
                            child.material.color = 0x000000;
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

            boxes.push(object);
            object.scale.x = 0.025;
            object.scale.y = 0.025;
            object.scale.z = 0.025;

            object.rotation.x = noventa;

            object.position.z = 0;
            object.position.x = position_x;
            object.position.y = position_y;

            object.castShadow = true;
            object.receiveShadow = true; 

            scene.add(object);  

            // let voBH = new THREE.BoxHelper(object, 0xffff00);
            // scene.add(voBH);
            // bouding.push(voBH);

            // object.children[0].geometry.computeBoundingBox();
            boxF = new THREE.Box3().setFromObject(object.children[0]);
            boudingBoxes.push(boxF);

  
        },
    );
}

//receveis position for the wheel spawn position, left and right positio, front and back, and how high or low, its size and rotation
function createWheel(x, y, z ,scale, rotation){
    fbxLoader.load('assets/models/wheel.fbx', function ( object ) {
        wheelLoaded.push(object);
        object.scale.set(scale, scale, scale);
        object.traverse( function ( child ) {
            if (child.isMesh) {
                child.material.map = textureLoader.load("assets/textura/correio.png");
                child.material.color = 0x000000;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        object.castShadow = true;
        object.receiveShadow = true;

        object.rotation.y =  noventa * 2;
        object.rotation.x = noventa;
        object.rotation.z = rotation;

        vehicleLoaded[0].add(object);

        object.position.x += x;
        object.position.y += y;
        object.position.z += z;
    } );
}

function createDoor(x, y, z ,scale, rotation){
    fbxLoader.load('assets/models/door.fbx', function ( object ) {
        doorLoaded.push(object);
        object.scale.set(scale, scale, scale);
        object.traverse( function ( child ) {
            if (child.isMesh) {
                child.material.map = textureLoader.load("assets/textura/correio.png");
                child.material.color = 0x000000;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        object.castShadow = true;
        object.receiveShadow = true;

        object.rotation.y =  rotation;
        object.rotation.x = noventa * 2;
        object.rotation.z = noventa * 2;

        vehicleLoaded[0].add(object);

        object.position.x += x;
        object.position.y += y;
        object.position.z += z;

        loadFinished = true;
    } );
}

function animate(){
    // requestAnimationFrame(animate);
    const time = performance.now();

    // console.log(wheelLoaded[0].rotation.z);

    if(openDoor){
        if(!(doorLoaded[0].rotation.y > 2.5)){
            doorLoaded[0].rotation.y += rotationSpeed;
            doorLoaded[1].rotation.y += -rotationSpeed;
        }
    }
    if(!openDoor){
        if(doorLoaded[0].rotation.y >= 0){
            doorLoaded[0].rotation.y -= rotationSpeed;
            doorLoaded[1].rotation.y -= -rotationSpeed;
        }
    }

    //used for animating front wheels
    if(moveLeft){
        wheelLoaded[0].rotation.z += 4*rotationSpeed;
        wheelLoaded[1].rotation.z += 4*rotationSpeed;
        if(wheelLoaded[0].rotation.z > 0.5){
            wheelLoaded[1].rotation.z = 0.5;
            wheelLoaded[0].rotation.z = 0.5;
        }
    }
    if(moveRight){
        // scene.remove(bouding[0]);
        // console.log("remove camera");
        wheelLoaded[0].rotation.z += -4*rotationSpeed;
        wheelLoaded[1].rotation.z += -4*rotationSpeed;
        if(wheelLoaded[1].rotation.z < -0.5){
            wheelLoaded[1].rotation.z = -0.5;
            wheelLoaded[0].rotation.z = -0.5;
        }
    }
    if(!moveRight && !moveLeft){
        if(wheelLoaded[0].rotation != 0){
            if(wheelLoaded[0].rotation.z > 0){
                wheelLoaded[0].rotation.z -= rotationSpeed;
                wheelLoaded[1].rotation.z -= rotationSpeed;
                if(wheelLoaded[0].rotation.z < 0){
                    wheelLoaded[0].rotation.z = 0;
                    wheelLoaded[1].rotation.z = 0;
                }
            }else{
                wheelLoaded[0].rotation.z -= -rotationSpeed;
                wheelLoaded[1].rotation.z -= -rotationSpeed;
                if(wheelLoaded[0].rotation.z > 0){
                    wheelLoaded[0].rotation.z = 0;
                    wheelLoaded[1].rotation.z = 0;
                }
            }
        }
    }

    //for applyng force and steering to vehicle
    if(speed < -0.1 || speed > 0.1){
        if(speed < 0){     
            if(moveLeft){
                vehicleLoaded[0].rotation.y += -rotationSpeed
            }
            if(moveRight){            
                vehicleLoaded[0].rotation.y += rotationSpeed
            }
        }else{
            if(moveLeft){
                vehicleLoaded[0].rotation.y += rotationSpeed
            }
            if(moveRight){            
                vehicleLoaded[0].rotation.y += -rotationSpeed
            }
        }
    }
    if(moveForward){
        // console.log(boudingBox[0]);
        speed += accel;
        if(speed > maxSpeed){
            speed = maxSpeed
        }
    }
    if(moveBackward){
        speed -= accel;
        if(speed < -maxSpeed){
            speed = -maxSpeed
        }
    }
    if(!moveForward && !moveBackward){
        if(speed > 0){
            speed -= deaccel;
            if(speed < 0){
                speed = 0;
            }
        }else{
            speed -= -deaccel;
            if(speed > 0){
                speed = 0;
            }
        }
    }
    vehicleLoaded[0].translateOnAxis(direction, speed);
}