var scene,
    camera,
    renderer;

var
    cube = [],
    plane,
    light,
    mesh;

var 
    raycaster;


var 
    client = deepstream('localhost:6020'),
    items;

window.onload = init;

function init(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera);
    camera.position.set(10,3,10);
    camera.lookAt(new THREE.Vector3(0,0,0));
    scene.add(new THREE.AxisHelper(3));
    var geometry2 = new THREE.PlaneGeometry(6, 6), material2 = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
    plane = new THREE.Mesh(geometry2, material2);
    scene.add(plane);
    plane.rotateX(-Math.PI/2);
    light = new THREE.SpotLight(0xFF0000, 1);
    light.position.set(0, 3, 0);
    scene.add(light);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xFF00FF));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);


    mesh = new THREE.Mesh( new THREE.BoxGeometry(.3, .3, .3), new THREE.MeshBasicMaterial( { color: 0x00FFFF, wireframe : true } ));

    client.login({}, function(success){
        console.log(success);

        items = client.record.getList('TEST-ITEMS');

        items.whenReady(function(e){
            // console.log(e.getEntries());
            e.getEntries().forEach(function(entry){
                // console.log(entry);
                client.record.getRecord(entry).whenReady(function(e){
                    // console.log(e.get());
                    create(entry, e.get());
                });

            });

        });

        items.subscribe(function(entries){
            console.log('subscribe ',entries);
            entries.forEach(function(entry){
                // console.log('entry ',entry);
                var 
                    entryRecord = client.record.getRecord(entry);
                entryRecord.whenReady(function(record){
                    // console.log(record.get());
                });
            });

        });

        items.on('entry-added', function(recordName, index){
            console.log('add ', recordName, index);

            client.record.getRecord(recordName).whenReady(function(e){
                // console.log(e.get());
                create(recordName, e.get());
            });

        });

        items.on('entry-removed', function(recordName, index){
            console.log('remove ', recordName, index);

            cube.forEach(function(e){
                if(e.name === recordName) scene.remove(e);
            });

        });

    });
    
    raycaster = new THREE.Raycaster();


    window.addEventListener('resize', resize);
    document.addEventListener('mousedown', shot);
    render();
}

function add(content, position){
    var uid = new Date().getTime();

    items.addEntry('TEST-ITEMS'+uid);

    var 
        addRecord = client.record.getRecord('TEST-ITEMS'+uid);

    // addRecord.whenReady(function(e){ // event on, subscribe시 get()을 받지 못함.
        addRecord.set({ content : content, position : position });
    // });
    
}

function remove(content){
    items.removeEntry(content);
    
}

function create(name, data){
    var 
        object = mesh.clone();

    object.position.set(data.position.x , data.position.y, data.position.z);
    scene.add(object);
    cube.push(object);
    object.name = name;

}



function shot(e){
    e.preventDefault();

    raycaster.setFromCamera({ x :  (e.clientX/window.innerWidth)  * 2 - 1, y : -(e.clientY/window.innerHeight) * 2 + 1 }, camera);
    
    var 
        intersects = raycaster.intersectObjects(cube);

    if(intersects.length){
        console.log('shot ', intersects[0].object.name);
        remove(intersects[0].object.name);
    }

}

function resize(){ 
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function render(){
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    scene.traverse(function(e){
        if(e instanceof THREE.Mesh && e !== plane) e.rotateY(.05);
    });

}

function setup(){
    var margin = {
        y : .5,
        z : -1.5
    };

    for(var i=0; i < 10; i++){
        for(var k=0; k < 10; k++){
            add('선물', {
                x : 0,
                y : (i * .3) + margin.y,
                z : (k * .3) + margin.z
            });
        }
    }            
}

