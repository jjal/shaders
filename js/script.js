/* Author:

*/
var WIDTH = 800,
	HEIGHT = 800;
	
var VIEW_ANGLE = 45,
	ASPECT = WIDTH/HEIGHT,
	NEAR = 0.1,
	FAR = 10000;	

var renderer = new THREE.WebGLRenderer();

renderer.setSize(WIDTH,HEIGHT);

var scene = new THREE.Scene();		

function createCamera()
{
	var camera = new THREE.PerspectiveCamera(
						VIEW_ANGLE,
						ASPECT,
						NEAR,
						FAR
					);
	camera.position.z = 300;
	return camera;
}


function createSphere()
{
	var	sphereMaterial = new THREE.MeshLambertMaterial(
		{
			color: 0xCC0000
		});
	var radius = 50, segments = 16, rings = 16;
	var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius,
			segments,
			rings),
			sphereMaterial);
	return sphere;
}

var light = new THREE.PointLight ( 0xFFFFFF );
light.position.x = 10;
light.position.y = 50;
light.position.z = 130;

function main()
{
	var $container = $('#main');
	$container.append(renderer.domElement);	
	
	var camera = createCamera();
	
	renderer.domElement.onmouseover = function() {
		camera.position.x = window.event.clientX;
		camera.position.y = window.event.clientY;
		
	};
	
	scene.add(createSphere());
	scene.add(createPointLight());	
	
	renderer.render(scene, camera);
}

function mouseMoveHandler()
{
	light.position.x = window.event.clientX;
	light.position.y = window.event.clientY;
}

function renderLoop()
{
	renderer.render(scene, camera);
	setTimeout("renderLoop()",2000);
}

$(document).ready(function () { main(); });