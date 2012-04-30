window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;
	
var VIEW_ANGLE = 50,
	ASPECT = WIDTH/HEIGHT,
	NEAR = .1,
	FAR = 10000;	

var renderer = new THREE.WebGLRenderer();

renderer.setSize(WIDTH,HEIGHT);

var scene = new THREE.Scene();		

function createCamera()
{
	//var camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, - 2000, 1000 );
	var camera = new THREE.PerspectiveCamera(
					 VIEW_ANGLE,
					 ASPECT,
					 NEAR,
					 FAR
				 );
				 
	camera.position.x = 400;
	camera.position.y = 1000;
	camera.position.z = 400;
	
	return camera;
}

var light = new THREE.PointLight ( 0xFFFFFF );
light.position.x = 200;
light.position.y = 100;
light.position.z = 200;

var camera = createCamera();
var uniforms;
var particleSystem;
var planes = new Array();
var planesxy = new Array();
var planesyz = new Array();

var particleCount = 1800,
    particles = new THREE.Geometry();

	renderer.domElement.onmousemove = function() {
		light.position.x = window.event.clientX- WIDTH/2;
		light.position.y = HEIGHT/2 - window.event.clientY;
	};

function init()
{
	var $container = $('#main');
	$container.append(renderer.domElement);	
	
	// Cubes
	var geometryxy = new THREE.CubeGeometry( 50, 50 , 50);
	var geometryxy = new THREE.CubeGeometry( 50, 50 , 50);
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: true } );

	for ( var i = 0; i < 200; i ++ ) {
		var cube = new THREE.Mesh( geometryxy, material );

		cube.scale.y = Math.floor( Math.pow(3,Math.random() * 2 + 1)/4 );
		cube.position.x = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
		cube.position.y = ( cube.scale.y * 50 ) / 2;
		cube.position.z = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
		//cube.velocity.x = Math.random()*0.1;
		planes.push(cube);
		scene.add(cube);
	}

	for ( var i = 0; i < 100; i ++ ) {
		//planes[i].rotation.x = 90;
	}
	for ( var i = 100; i < 200; i ++ ) {
		//planes[i].rotation.y = 90;
		//planes[i].rotation.x = 90;
	}
	
	
	// Lights

	var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
	scene.add( ambientLight );
	
	
	// add it to the scene
	
	scene.add(light);	
	
	camera.lookAt( scene.position );
	
	renderLoop();
}

function mouseMoveHandler()
{ 	
	light.position.x = window.event.clientX;
	light.position.y = window.event.clientY;
}

var frame = 0;
function renderLoop()
{	
	frame += 0.1;
	renderer.render(scene, camera);
	requestAnimFrame(renderLoop);
}

$(document).ready(function () { init(); });