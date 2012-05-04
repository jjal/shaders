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
var deg2rad = Math.PI / 180.0;
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;
var height = HEIGHT;
var width = WIDTH;
var VIEW_ANGLE = 80,
	ASPECT = WIDTH/HEIGHT,
	NEAR = .1,
	FAR = 10000;	
var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
var renderer;

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
				 
	camera.position.x = 1600;
	camera.position.y = 1200;
	camera.position.z = 1200;
	return camera;
}

var light = new THREE.PointLight ( 0xFFFFFF );
light.position.x =-900;
light.position.y = 3000;
light.position.z = -900;

var camera, scene, renderer,
				materials = [], objects = [],
				singleMaterial, zmaterial = [],
				parameters, i, j, k, h, color, x, y, z, s, n, nobjects,
				material_depth, cubeMaterial;
var isMouseDown;
var postprocessing = {

  enabled  : true

};

var particleCount = 1800,
    particles = new THREE.Geometry();

function init()
{
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.sortObjects = false;
	renderer.setSize(WIDTH,HEIGHT);

	var $container = $('#main');
	$container.append(renderer.domElement);	
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false);
	document.addEventListener( 'mouseup', onDocumentMouseUp, false);
	
	camera = createCamera();
	scene.add(camera);
	
	material_depth = new THREE.MeshDepthMaterial();
	
	// Cubes
	var geometryxy = new THREE.CubeGeometry( 5, 5 , 5);
	
	cubeMaterialw = new THREE.MeshPhongMaterial( { color: 0xffffff,ambient:0xffffff, specular: 0xffffaa, shininess: 30 } );
	cubeMaterialb = new THREE.MeshPhongMaterial( { color: 0x111111, ambient:0xffffff, specular: 0xffffaa, shininess: 30} );
	cubeMaterialo = new THREE.MeshPhongMaterial( { color: 0xff3300, ambient:0xffffff, specular: 0xffffaa, shininess: 30 } );
	
	var path = "img/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var textureCube = THREE.ImageUtils.loadTextureCube( urls );

	parameters = { color: 0x888800, envMap: textureCube, shading: THREE.FlatShading,ambient:0xffffff, specular: 0xffffaa, shininess: 30 };
	cubeMaterialm = new THREE.MeshBasicMaterial( parameters );
	
	material_depth = new THREE.MeshDepthMaterial();
	
	renderer.initMaterial( cubeMaterialw, scene.__lights, scene.fog );
	renderer.initMaterial( cubeMaterialb, scene.__lights, scene.fog );
	renderer.initMaterial( cubeMaterialo, scene.__lights, scene.fog );
				
	for ( var i = 0; i < 6000; i ++ ) {
		var dir = Math.floor(Math.random()*3);
		
		var cube;
		var color = Math.floor(Math.random()*4);
		
		if(color == 0)
			cube = new THREE.Mesh( geometryxy, cubeMaterialw );
		if(color == 1)
			cube = new THREE.Mesh( geometryxy, cubeMaterialo );
		if(color == 2)
			cube = new THREE.Mesh( geometryxy, cubeMaterialb );
		if(color == 3)
			cube = new THREE.Mesh( geometryxy, cubeMaterialm );
			
		if(dir != 0)
		{
			cube.scale.x =Math.pow(3,Math.random() * 4 + 1) / 4;
			cube.position.y = (Math.pow(4,Math.random() * 4+ 1) / 4  *25 ) / 2;
		}
		if(dir != 1)
		{
			cube.scale.y =Math.pow(3,Math.random() * 4+ 1) / 4;
			cube.position.y = ( cube.scale.y *25 ) / 2;
		}
		if(dir != 2)
		{
			cube.scale.z =Math.pow(3,Math.random() * 4 + 1) / 4;
			cube.position.y = ( Math.pow(4,Math.random() * 3+ 1) / 4  *25 ) / 2;
		}
		
		var rot = Math.random()*10;
		if(rot < 3)
		{
			cube.rotation.y = 90* deg2rad;
		}
		
		cube.position.x = Math.floor( ( Math.random() * 4000 - 500 ) / 50 ) * 30 + 25;
		//cube.position.y = ( cube.scale.y *25 ) / 2;
		cube.position.z = Math.floor( ( Math.random() * 4000 - 500 ) / 50 ) * 30 + 25;
		
		scene.add(cube);
	}
	geometryxy = new THREE.CubeGeometry( 2000, 2000 , 2000);
	var room = new THREE.Mesh( geometryxy, cubeMaterial );
	room.doubleSided = true;
	room.position.x =  room.position.z = 0;
	room.position.y = 2000;
	//scene.add(room);

	// Lights

	var ambientLight = new THREE.AmbientLight( Math.random() * 0xff );
	//scene.add( ambientLight );
	
	scene.matrixAutoUpdate = false;

	initPostprocessing();

	renderer.autoClear = false;
	  
	var effectController  = {

		focus: 		0.955,
		aperture:	0.202,
		maxblur:	3.0,

	};

	var matChanger = function( ) {

		postprocessing.bokeh_uniforms[ "focus" ].value = effectController.focus;
		postprocessing.bokeh_uniforms[ "aperture" ].value = effectController.aperture;
		postprocessing.bokeh_uniforms[ "maxblur" ].value = effectController.maxblur;

	};
	
	var gui = new DAT.GUI();
	gui.add( effectController, "focus", 0.9, 1.1, 0.001 ).onChange( matChanger );
	gui.add( effectController, "aperture", 0.001, 0.5, 0.001 ).onChange( matChanger );
	gui.add( effectController, "maxblur", 0.0, 3.0, 0.025 ).onChange( matChanger );
	gui.close();
	
	
	var pointLight = new THREE.PointLight ( 0xFFFFFF );
	pointLight.position.x = -400;
	pointLight.position.y = 1000;
	pointLight.position.z = -400;
	scene.add(pointLight);
	scene.add(light);	
	
	camera.lookAt( scene.position );
	matChanger(); //init
	renderLoop();
}

// Rotate an object around an axis in object space
function rotateAroundObjectAxis( object, axis, radians ) {

    var rotationMatrix = new THREE.Matrix4();

    rotationMatrix.setRotationAxis( axis.normalize(), radians );
    object.matrix.multiplySelf( rotationMatrix );                       // post-multiply
    object.rotation.setRotationFromMatrix( object.matrix );
}

function initPostprocessing() {

	postprocessing.scene = new THREE.Scene();

	postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
	postprocessing.camera.position.z = 100;

	postprocessing.scene.add( postprocessing.camera );

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );
	postprocessing.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

	var bokeh_shader = THREE.ShaderExtras[ "bokeh" ];

	postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );

	postprocessing.bokeh_uniforms[ "tColor" ].texture = postprocessing.rtTextureColor;
	postprocessing.bokeh_uniforms[ "tDepth" ].texture = postprocessing.rtTextureDepth;
	postprocessing.bokeh_uniforms[ "focus" ].value = 1.1;
	postprocessing.bokeh_uniforms[ "aspect" ].value = window.innerWidth / height;

	postprocessing.materialBokeh = new THREE.ShaderMaterial( {

		uniforms: postprocessing.bokeh_uniforms,
		vertexShader: bokeh_shader.vertexShader,
		fragmentShader: bokeh_shader.fragmentShader

	} );

	postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), postprocessing.materialBokeh );
	postprocessing.quad.position.z = 1000;
	postprocessing.quad.rotation.x = Math.PI / 2;
	postprocessing.scene.add( postprocessing.quad );

}

var frame = 0;
function renderLoop()
{	
	frame += 0.1;
	if(isMouseDown)
	{
		camera.position.x += ( mouseX+800 - camera.position.x ) * 0.036;
		camera.position.y += ( - (mouseY)+800 - camera.position.y ) * 0.036;
		light.position.x = camera.position.x*-1;
		light.position.y = camera.position.y;
		light.position.z = camera.position.z*-1;
	};
	camera.lookAt( scene.position );	
	requestAnimFrame(renderLoop);
	var camPos = camera.position;
	
	
				
	if ( postprocessing.enabled ) {
//camera.position.divideSelf(2);// = camPos - (camPos.normalize()*100);
		renderer.clear();

		// Render scene into texture
		scene.overrideMaterial = null;
		renderer.render( scene, camera, postprocessing.rtTextureColor, true );

		// Render depth into texture
		scene.overrideMaterial = material_depth;
		renderer.render( scene, camera, postprocessing.rtTextureDepth, true );
	
		// Render bokeh composite
		renderer.render( postprocessing.scene, postprocessing.camera );
		//camera.position.multiplySelf(2);
	} else {
		renderer.clear();
		renderer.render( scene, camera );
	}

}
		
		
function onDocumentMouseDown( event ) {
	isMouseDown=true;
}
		
function onDocumentMouseUp( event ) {
	isMouseDown = false;
}		
function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();
		if(isMouseDown)
		{

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;
		}

	}
}
function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;
	mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		mouseY = event.touches[ 0 ].pageY - windowHalfY;

	}
}

$(document).ready(function () { init(); });