import { createCharacter } from './character-maquette.js';

/*
 * STUDIO / 01 — Architectural cinematography test set.
 *
 * One immutable, spatially legible set shared by the observer and shot cameras.
 * All assets are procedural. No outside texture, image, model or video assets.
 * The camera controller remains in lab.js.
 */
export function createStudio(THREE) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#26353c');
  scene.fog = new THREE.Fog('#29383f',20,62);

  const mat = (color, roughness=.87, metalness=.02) =>
    new THREE.MeshStandardMaterial({color,roughness,metalness});
  const floorStone=mat('#838b85',.95);
  const stone=mat('#7e8581',.94);
  const darkStone=mat('#303f45',.9);
  const bronze=mat('#a77c60',.59,.28);
  const frame=mat('#27383e',.62,.35);
  const skin=mat('#bd9b86',.9);
  const coat=mat('#24353a',.94);
  const collar=mat('#536369',.9);
  const hair=mat('#1b252a',.9);
  const leather=mat('#172126',.85);
  function box(w,h,d,x,y,z,material,cast=true) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);
    mesh.castShadow=cast;
    mesh.receiveShadow=true;
    scene.add(mesh);
    return mesh;
  }

  // Mineral grain, seeded for deterministic captures and repeated sessions.
  function concrete() {
    const canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=256;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#878c85';ctx.fillRect(0,0,256,256);
    let seed=1937;
    function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
    for(let i=0;i<3500;i++){
      const v=Math.round(65+random()*165);
      ctx.fillStyle='rgba('+v+','+v+','+v+','+(0.025+random()*.07)+')';
      const size=.4+random()*2;
      ctx.fillRect(random()*256,random()*256,size,size);
    }
    for(let i=0;i<18;i++){
      const y=random()*256;
      ctx.strokeStyle='rgba(22,31,36,'+(random()*.02)+')';
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y+random());ctx.stroke();
    }
    const texture=new THREE.CanvasTexture(canvas);
    texture.wrapS=THREE.RepeatWrapping;
    texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.set(24,24);
    texture.colorSpace=THREE.SRGBColorSpace;
    return texture;
  }

  const floorMat=mat('#77817d',.96);
  floorMat.map=concrete();
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(72,72),floorMat);
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.075;
  floor.receiveShadow=true;
  scene.add(floor);

  // A restrained construction grid is visible only from the spatial camera.
  const grid=new THREE.GridHelper(18,18,0x6e8b91,0x6e8b91);
  grid.position.y=-.064;
  grid.layers.set(1);
  grid.material.transparent=true;
  grid.material.opacity=.16;
  scene.add(grid);

  // A luminous inner courtyard, with genuinely overlapping facade planes.
  box(18,7,.48,0,3.45,-13.4,mat('#4d5c5e',.94));
  box(5.45,5.65,.3,0,3.38,-13.06,mat('#a9a399',.97),false);
  const portal=new THREE.MeshStandardMaterial({
    color:'#c4b09c',roughness:1,metalness:0,
    emissive:new THREE.Color('#c3987c'),emissiveIntensity:.39
  });
  box(4.27,4.86,.16,0,3.18,-12.82,portal,false);
  box(1.05,6.64,1.1,-3.02,3.32,-12.45,stone);
  box(1.05,6.64,1.1,3.02,3.32,-12.45,stone);
  box(7.4,.69,1.4,0,6.57,-12.12,darkStone);
  box(6.42,.075,.29,0,5.89,-12.37,bronze,false);
  for(const x of [-2.24,2.24])box(.062,4.82,.16,x,3.16,-12.7,frame,false);
  box(4.5,.06,.15,0,2.64,-12.68,frame,false);
  box(7.4,.15,.65,0,.055,-12.1,mat('#5a6969',.91));

  // Left wing: deep shadowed recessed openings and a continuous bronze fin.
  box(4.0,6.55,5.9,-6.05,3.25,-10.6,mat('#45575e',.94));
  box(1.15,6.4,6.1,-8.44,3.2,-9.1,darkStone);
  box(.18,6.12,5.6,-4.14,3.06,-10.35,bronze);
  for(const y of [1.3,2.79,4.26]){
    box(2.16,.95,.15,-6.05,y,-7.60,frame,false);
    box(1.91,.71,.07,-6.05,y,-7.5,mat('#7b8b8b',.82),false);
    box(2.1,.05,.21,-6.05,y-.5,-7.42,bronze,false);
  }

  // Right wing: luminous limestone fins in a different spatial rhythm.
  box(4.38,6.15,4.3,6.73,3.05,-9.65,mat('#79817e',.92));
  box(2.25,6.55,4.1,9.90,3.28,-10.55,darkStone);
  for(const x of [4.65,5.60,6.55,7.50]){
    box(.16,5.82,.82,x,2.99,-7.08,mat('#a1aca4',.93));
  }
  box(3.7,.65,.14,6.73,3.85,-6.90,frame,false);
  box(3.7,.43,.1,6.73,3.84,-6.79,mat('#aeb4ad',.86),false);

  // Mid-ground furniture and a near measuring fin provide real parallax.
  box(2.0,.13,.53,3.14,.54,-3.89,stone);
  for(const x of [2.34,3.93])box(.105,.57,.38,x,.22,-3.89,frame);
  box(.52,.27,2.6,-3.85,.12,-5.25,mat('#77857d',.93));
  box(.12,3.18,.17,-1.32,1.57,1.08,bronze);
  box(.027,3.02,.06,-1.247,1.53,1.20,mat('#d5b39a',.59,.12),false);
  box(.20,.055,.23,-1.32,3.17,1.08,darkStone);
  box(.14,1.08,.16,1.72,.55,.66,mat('#53666a',.94));

  // Character art is independent of the architectural scene and camera maths.
  // The smooth sculpt may later be replaced with an authored Blender GLB
  // without touching the educational camera/framing experiments.
  createCharacter(THREE,scene);

  // Camera-agnostic key/fill/rim: deliberate chiaroscuro and material separation.
  scene.add(new THREE.HemisphereLight(0xb5cdd9,0x354043,1.08));
  const key=new THREE.DirectionalLight(0xffd6b6,3.2);
  key.position.set(-4.5,8,4.5);
  key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);
  key.shadow.camera.left=-15;key.shadow.camera.right=15;
  key.shadow.camera.top=15;key.shadow.camera.bottom=-15;
  key.shadow.camera.near=.2;key.shadow.camera.far=42;
  key.shadow.bias=-.00018;key.shadow.normalBias=.028;key.shadow.radius=2;
  scene.add(key);
  const fill=new THREE.DirectionalLight(0x9cbfcf,1.0);
  fill.position.set(5.5,4.5,5.4);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffb88a,2.0);
  rim.position.set(1.5,6.4,-5.7);scene.add(rim);
  const portalLight=new THREE.PointLight(0xf1b78c,11,11,2);
  portalLight.position.set(0,3.1,-9.8);scene.add(portalLight);

  return { scene, mat };
}
