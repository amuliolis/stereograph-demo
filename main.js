import * as THREE from 'three';

const scene = new THREE.Scene();
const cameraL = new THREE.PerspectiveCamera( 75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000 );
const cameraR = new THREE.PerspectiveCamera( 75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000 );
const rendererL = new THREE.WebGLRenderer();
const rendererR = new THREE.WebGLRenderer();
rendererL.domElement.classList.add( "left" );
rendererR.domElement.classList.add( "right" );
document.body.appendChild( rendererL.domElement );
document.body.appendChild( rendererR.domElement );

var currentObject = 0;
var objects = [];
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.BoxGeometry(2,2,2))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.BoxGeometry(2,2,2,4,4,4))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2,0))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2,1))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2,2))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(2,3,2))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(2,16,8))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.TorusGeometry(1,0.5,10,10))));
objects.push(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.TorusKnotGeometry())));

scene.add( objects[0] );

const focalPointGeometry = new THREE.BufferGeometry();
focalPointGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3) );
const focalPoint = new THREE.Points(focalPointGeometry, new THREE.PointsMaterial({ color: 0xBBBBBB, size: 0.1 }));

scene.add( focalPoint );

const distanceStep = 0.1;
const spaceStep = 0.05;

var distanceFromObject = 5.0;
var spaceBetweenEyes = 0.3;

window.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'ArrowDown':
			distanceFromObject += distanceStep;
			break;
		case 'ArrowUp':
			distanceFromObject -= distanceStep;
			break;
		case 'ArrowLeft':
			spaceBetweenEyes -= spaceStep;
			break;
		case 'ArrowRight':
			spaceBetweenEyes += spaceStep;
			break;
	}
	if (spaceBetweenEyes < 0) spaceBetweenEyes = 0;
	if (distanceFromObject < 0) distanceFromObject = 0;

	for (var i of document.getElementsByClassName('angle'))
		i.innerHTML = 'Eye angle: ' + (Math.round( (Math.atan( spaceBetweenEyes / distanceFromObject ) / Math.PI * 180)*100)/100 ).toFixed(2);
	for (var i of document.getElementsByClassName('eye'))
		i.innerHTML = 'Eye space: ' + (Math.round( spaceBetweenEyes*100)/100 ).toFixed(2);
	for (var i of document.getElementsByClassName('dist'))
		i.innerHTML = 'Distance: ' + (Math.round( distanceFromObject*100)/100 ).toFixed(2);
});

// On click, switch to the next wireframe model as the displayed object
window.addEventListener('click', (event) => {
	scene.remove( objects[currentObject] );
	currentObject++;
	if (currentObject >= objects.length) currentObject = 0;
	scene.add( objects[currentObject] );
});

var canvasL = document.getElementById('leftCanvas');
var canvasR = document.getElementById('rightCanvas');

var ctxL = canvasL.getContext("2d");
var ctxR = canvasR.getContext("2d");

var r_x = 0, r_y = 0, r_z = 0;
var rotation_speed = 0.01;
// Called every frame
function animate() {
	requestAnimationFrame( animate );

	// --- THREE.JS ---

	// Constantly update the renderer size so that resizing the window never breaks the display
	rendererL.setSize( window.innerWidth / 2, window.innerHeight );
	rendererR.setSize( window.innerWidth / 2, window.innerHeight );
	cameraL.aspect = window.innerWidth / 2 / window.innerHeight;
	cameraR.aspect = window.innerWidth / 2 / window.innerHeight;

	// Rotate object on all three euclidean axis
	r_x += rotation_speed; r_y += rotation_speed; r_z += rotation_speed;
	objects[currentObject].rotation.x = r_x;
	objects[currentObject].rotation.y = r_y;
	objects[currentObject].rotation.z = r_z;

	cameraL.position.z = distanceFromObject;
	cameraR.position.z = distanceFromObject;

	cameraL.position.x = +spaceBetweenEyes;
	cameraR.position.x = -spaceBetweenEyes;

	// Have both cameras rotate to look directly at the object of focus, at (0, 0, 0)
	cameraL.rotation.y = +Math.atan( spaceBetweenEyes / distanceFromObject );
	cameraR.rotation.y = -Math.atan( spaceBetweenEyes / distanceFromObject );

	rendererL.render( scene, cameraL );
	rendererR.render( scene, cameraR );

	// --- CANVAS --- (w, h) = (1000, 1000)

	var x = 500; // mapping to (0, 0) for focal point
	var y = 200;
	var size = 20; // size of object representations
	var factor = 80; // mapping distances between threejs space and canvas space

	// clear
	ctxL.fillStyle = "black";
	ctxL.fillRect(0, 0, 1000, 1000);

	// camera lines
	ctxL.strokeStyle = "white";
	ctxL.lineWidth = 7.5;
	ctxL.beginPath();
	ctxL.moveTo((x) - (spaceBetweenEyes * factor), (y) + (distanceFromObject * factor));
	ctxL.lineTo((x), (y));
	ctxL.lineTo((x) + (spaceBetweenEyes * factor), (y) + (distanceFromObject * factor));
	ctxL.stroke();

	// object representation
	ctxL.fillStyle = "gray";
	ctxL.fillRect((x-size), (y-size), (size*2), (size*2));
	
	// camera representation
	ctxL.fillStyle = "red";
	ctxL.fillRect((x-size) - (spaceBetweenEyes * factor), (y-size) + (distanceFromObject * factor), (size*2), (size*2));
	ctxL.fillStyle = "blue";
	ctxL.fillRect((x-size) + (spaceBetweenEyes * factor), (y-size) + (distanceFromObject * factor), (size*2), (size*2));

	// clear
	ctxR.fillStyle = "black";
	ctxR.fillRect(0, 0, 1000, 1000);

	// camera lines
	ctxR.strokeStyle = "white";
	ctxR.lineWidth = 7.5;
	ctxR.beginPath();
	ctxR.moveTo((x) - (spaceBetweenEyes * factor), (y) + (distanceFromObject * factor));
	ctxR.lineTo((x), (y));
	ctxR.lineTo((x) + (spaceBetweenEyes * factor), (y) + (distanceFromObject * factor));
	ctxR.stroke();

	// object representation
	ctxR.fillStyle = "gray";
	ctxR.fillRect((x-size), (y-size), (size*2), (size*2));

	// camera representation
	ctxR.fillStyle = "red";
	ctxR.fillRect((x-size) - (spaceBetweenEyes * factor), (y-size) + (distanceFromObject * factor), (size*2), (size*2));
	ctxR.fillStyle = "blue";
	ctxR.fillRect((x-size) + (spaceBetweenEyes * factor), (y-size) + (distanceFromObject * factor), (size*2), (size*2));
}

animate();