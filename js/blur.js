<script type="text/javascript">


if (! THREE.Detector.webgl) THREE.Detector.addGetWebGLMessage();

window.onload = init;

var container, stats;
var camera, scene, renderer,
    materials = [], objects = [],
    singleMaterial, zmaterial = [],
    parameters, i, j, k, h, color, x, y, z, s, n, nobjects,
    material_depth, material_base, cubeMaterial;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var height = window.innerHeight;

var postprocessing = {

  enabled  : true

};

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.Camera(70, window.innerWidth / height, 1, 3000);
  camera.position.z = 200;

  scene = new THREE.Scene();

  /*
   var light = new THREE.DirectionalLight( 0xffffff );
   light.position.set( 0, 0.5, 1 );
   light.position.normalize();
   scene.addLight( light );
   */

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, height);
  container.appendChild(renderer.domElement);

  material_depth = new THREE.MeshDepthMaterial();

  var path = "../shared/textures/cube/SwedishRoyalCastle/";
  var format = '.jpg';
  var urls = [
    path + 'px' + format, path + 'nx' + format,
    path + 'py' + format, path + 'ny' + format,
    path + 'pz' + format, path + 'nz' + format
  ];

  var images = ImageUtils.loadArray(urls);

  var reflectionCube = new THREE.Texture(images);

  parameters = { color: 0xff1100, env_map: reflectionCube, combine: THREE.MixOperationa, reflectivity: 0.3, shading: THREE.FlatShading };
  //parameters = { color: 0xff1100, shading: THREE.FlatShading };
  cubeMaterial = new THREE.MeshBasicMaterial(parameters);

  singleMaterial = false;

  if (singleMaterial) zmaterial = [ cubeMaterial ];

  //var geo = new Cube( 1, 1, 1 );
  var geo = new Sphere(1, 20, 10);
  //var geo = new Icosahedron( 2 );

  material_base = cubeMaterial;

  renderer.initMaterial(material_base, scene.lights, scene.fog);

  var xgrid = 14,
      ygrid = 9,
      zgrid = 14;

  nobjects = xgrid * ygrid * zgrid;

  c = 0;

  //var s = 0.25;
  var s = 60;

  for (i = 0; i < xgrid; i++)
    for (j = 0; j < ygrid; j++)
      for (k = 0; k < zgrid; k++) {

        materials[c] = new THREE.MeshBasicMaterial(parameters);
        materials[c].program = material_base.program;
        materials[c].uniforms = Uniforms.clone(THREE.ShaderLib[ 'basic' ].uniforms);

        if (singleMaterial)
          mesh = new THREE.Mesh(geo, zmaterial);
        else
          mesh = new THREE.Mesh(geo, materials[c]);

        x = 200 * ( i - xgrid / 2 );
        y = 200 * ( j - ygrid / 2 );
        z = 200 * ( k - zgrid / 2 );

        mesh.position.set(x, y, z);
        mesh.scale.set(s, s, s);

        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();

        scene.addObject(mesh);
        objects.push(mesh);

        c++;

      }

  scene.matrixAutoUpdate = false;

  initPostprocessing();

  renderer.autoClear = false;

  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.left = "0px";

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  //container.appendChild( stats.domElement );

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  var effectController = {

    focus:     1.0,
    aperture:  0.025,
    maxblur:  1.0

  };

  var matChanger = function() {

    postprocessing.bokeh_uniforms["focus"].value = effectController.focus;
    postprocessing.bokeh_uniforms["aperture"].value = effectController.aperture;
    postprocessing.bokeh_uniforms["maxblur"].value = effectController.maxblur;

  };

  var gui = new GUI();
  gui.add(effectController, "focus", 0.0, 3.0, 0.025).onChange(matChanger);
  gui.add(effectController, "aperture", 0.001, 0.2, 0.001).onChange(matChanger);
  gui.add(effectController, "maxblur", 0.0, 3.0, 0.025).onChange(matChanger);

  loop();

}

function onDocumentMouseMove(event) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart(event) {

  if (event.touches.length == 1) {

    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;

  }
}

function onDocumentTouchMove(event) {

  if (event.touches.length == 1) {

    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;

  }

}

function initPostprocessing() {

  postprocessing.scene = new THREE.Scene();

  postprocessing.camera = new THREE.Camera();
  postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000);
  postprocessing.camera.position.z = 100;

  var pars = { min_filter: THREE.LinearFilter, mag_filter: THREE.LinearFilter };
  postprocessing.rtTextureDepth = new THREE.RenderTarget(window.innerWidth, height, pars);
  postprocessing.rtTextureColor = new THREE.RenderTarget(window.innerWidth, height, pars);

  var bokeh_shader = ShaderExtras["bokeh"];

  postprocessing.bokeh_uniforms = Uniforms.clone(bokeh_shader.uniforms);

  postprocessing.bokeh_uniforms["tColor"].texture = postprocessing.rtTextureColor;
  postprocessing.bokeh_uniforms["tDepth"].texture = postprocessing.rtTextureDepth;
  postprocessing.bokeh_uniforms["focus"].value = 1.1;
  postprocessing.bokeh_uniforms["aspect"].value = window.innerWidth / height;

  postprocessing.materialBokeh = new THREE.MeshShaderMaterial({

        uniforms: postprocessing.bokeh_uniforms,
        vertex_shader: bokeh_shader.vertex_shader,
        fragment_shader: bokeh_shader.fragment_shader

      });

  postprocessing.quad = new THREE.Mesh(new Plane(window.innerWidth, window.innerHeight), postprocessing.materialBokeh);
  postprocessing.quad.position.z = -500;
  postprocessing.scene.addObject(postprocessing.quad);

}

function loop() {

  requestAnimationFrame(loop, renderer.domElement);

  var time = new Date().getTime() * 0.00005;

  camera.position.x += ( mouseX - camera.position.x ) * 0.036;
  camera.position.y += ( - (mouseY) - camera.position.y ) * 0.036;

  for (i = 0; i < nobjects; i++) {

    h = ( 360 * ( i / nobjects + time ) % 360 ) / 360;
    //materials[i].color.setHSV( h, 0.5 + 0.5 * ( i % 20 / 20 ), 1 );
    materials[i].color.setHSV(h, 1, 1);

  }


  if (postprocessing.enabled) {

    renderer.clear();

    // Render scene into texture

    if (singleMaterial)
      zmaterial[0] = cubeMaterial;
    else
      for (i = 0; i < nobjects; i++) objects[i].materials = [ materials[i] ];


    renderer.render(scene, camera, postprocessing.rtTextureColor);

    // Render depth into texture

    if (singleMaterial)
      zmaterial[0] = material_depth;
    else
      for (i = 0; i < nobjects; i++) objects[i].materials = [ material_depth ];

    renderer.render(scene, camera, postprocessing.rtTextureDepth);

    // Render bokeh composite

    renderer.render(postprocessing.scene, postprocessing.camera);


  } else {

    renderer.clear();
    renderer.render(scene, camera);

  }

  stats.update();

}


</script>
