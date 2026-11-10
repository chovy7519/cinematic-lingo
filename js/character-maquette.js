/*
 * CINEMATIC LINGO — Character maquette / procedural sculpt V2
 *
 * A single, recognizable human-scale reference, not a realistic digital actor.
 * The portrait is made from continuous smooth surfaces with integrated facial
 * planes. Keep the character at the scene origin so the shot-camera teaching
 * math, horizon and distance comparisons remain unchanged.
 *
 * Future hero GLB imports can replace ONLY this group via createCharacter();
 * no camera control, set lighting, or dictionary code belongs here.
 */
export function createCharacter(THREE, scene) {
  const coat = new THREE.MeshStandardMaterial({color:'#243339', roughness:.94, metalness:0});
  const seams = new THREE.MeshStandardMaterial({color:'#3a4a4a',roughness:.96, metalness:0,side:THREE.DoubleSide});
  const undershirt = new THREE.MeshStandardMaterial({color:'#53615f',roughness:.96,metalness:0,side:THREE.DoubleSide});
  const skin = new THREE.MeshStandardMaterial({color:'#a58d7d',roughness:.91,metalness:0});
  const hair = new THREE.MeshStandardMaterial({color:'#1a252b',roughness:.95,metalness:0});
  const leather = new THREE.MeshStandardMaterial({color:'#151d22',roughness:.86,metalness:.035});
  const figure = new THREE.Group();
  figure.name = 'cinematic-protagonist-maquette';

  function add(geometry, material, name) {
    const mesh = new THREE.Mesh(geometry,material);
    mesh.name=name;
    mesh.castShadow=true;
    mesh.receiveShadow=true;
    figure.add(mesh);
    return mesh;
  }

  // Rotational elliptical loft: widths describe the actual outer silhouette
  // rather than a series of boxes or a cartoon barrel.
  function loft(rings, radial=40) {
    const points=[],indices=[];
    for (let i=0;i<rings.length;i++){
      const [y,rx,rz,forward=0] = rings[i];
      for(let j=0;j<=radial;j++){
        const a=j/radial*Math.PI*2;
        points.push(Math.cos(a)*rx,y,Math.sin(a)*rz+forward);
      }
    }
    for (let i=0;i<rings.length-1;i++){
      for(let j=0;j<radial;j++){
        const a=i*(radial+1)+j,b=a+radial+1;
        indices.push(a,b,a+1,b,b+1,a+1);
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }

  const jacket=add(loft([
    [.70,.18,.127,0],[.735,.235,.155,0],[.86,.284,.181,0],
    [1.10,.265,.178,0],[1.31,.292,.178,0],
    [1.435,.340,.174,-.013],[1.48,.344,.160,-.015],
    [1.535,.212,.120,-.012],[1.566,.10,.069,0]
  ]),coat,'tailored-jacket');
  jacket.material.side=THREE.DoubleSide;

  const neck=add(new THREE.CylinderGeometry(.066,.074,.135,24),skin,'neck');
  neck.position.set(0,1.615,.012);

  // A quiet high-neck stand-in rather than an imitation business suit.
  // The torso remains a single uninterrupted matte form at medium distance.
  const neckBand=add(new THREE.CylinderGeometry(.095,.115,.11,32,1,true),coat,'integrated-high-collar');
  neckBand.position.set(0,1.574,.005);
  const neckline=add(new THREE.TorusGeometry(.082,.006,8,48,Math.PI*1.34),seams,'collar-seam');
  neckline.rotation.x=Math.PI/2;
  neckline.rotation.z=.14;
  neckline.position.set(0,1.62,.014);
  // Subtle garment seam: a narrow tonal cue, never a floating polygon.
  const seamCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,1.485,.173),
    new THREE.Vector3(-.005,1.365,.182),
    new THREE.Vector3(.003,1.15,.182)
  ]);
  add(new THREE.TubeGeometry(seamCurve,14,.0025,6,false),seams,'front-seam');

  // Segmentless tapered appendages built from a smooth centerline curve.
  // This removes the ringed cuffs and capsule joints of the first whitebox.
  function taperedTube(control, radii, radial=18, steps=18){
    const curve=new THREE.CatmullRomCurve3(control.map(p=>new THREE.Vector3(...p)));
    const frames=curve.computeFrenetFrames(steps,false);
    const verts=[],indices=[];
    for(let i=0;i<=steps;i++){
      const t=i/steps, point=curve.getPointAt(t);
      const scale=t*(radii.length-1),j=Math.min(radii.length-2,Math.floor(scale));
      const r=THREE.MathUtils.lerp(radii[j],radii[j+1],scale-j);
      for(let k=0;k<=radial;k++){
        const theta=k/radial*Math.PI*2;
        const p=point.clone()
          .addScaledVector(frames.normals[i],Math.cos(theta)*r)
          .addScaledVector(frames.binormals[i],Math.sin(theta)*r*.79);
        verts.push(p.x,p.y,p.z);
      }
    }
    for(let i=0;i<steps;i++) for(let k=0;k<radial;k++){
      const a=i*(radial+1)+k,b=a+radial+1;
      indices.push(a,a+1,b,a+1,b+1,b);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }

  for (const side of [-1,1]) {
    add(taperedTube([
      [side*.31,1.445,-.012],[side*.37,1.25,-.025],
      [side*.40,1.03,-.012],[side*.405,.79,.028]
    ],[.106,.107,.087,.064]),coat,'sleeve-'+(side<0?'left':'right'));
    add(taperedTube([
      [side*.147,.735,.005],[side*.15,.48,.006],
      [side*.155,.30,.018],[side*.16,.128,.035]
    ],[.122,.116,.10,.082]),coat,'trouser-'+(side<0?'left':'right'));

    // A low, close-fitting shoe last with a restrained toe, not a round ball.
    const footprint=new THREE.Shape();
    footprint.moveTo(-.075,.135);
    footprint.lineTo(-.075,-.085);
    footprint.quadraticCurveTo(-.074,-.175,-.025,-.177);
    footprint.lineTo(.025,-.177);
    footprint.quadraticCurveTo(.076,-.172,.076,-.095);
    footprint.lineTo(.076,.135);
    footprint.closePath();
    const shoeGeometry=new THREE.ExtrudeGeometry(footprint,{
      depth:.062,bevelEnabled:true,bevelSegments:3,
      bevelSize:.014,bevelThickness:.011,curveSegments:8
    });
    shoeGeometry.rotateX(-Math.PI/2);
    const shoe=add(shoeGeometry,leather,'shoe-'+(side<0?'left':'right'));
    shoe.position.set(side*.16,.027,.082);
    shoe.rotation.y=side*.03;
  }

  // Surface anatomy: facial proportions are built into one continuous topology.
  // +Z faces the shot camera. The nose, eye sockets, cheeks and chin are volume,
  // never textural sticker eyes or a disconnected cylinder on a white oval.
  function gaussian(x,y,cx,cy,sx,sy){
    return Math.exp(-.5*(Math.pow((x-cx)/sx,2)+Math.pow((y-cy)/sy,2)));
  }
  const headCenter=new THREE.Vector3(-.008,1.803,.012);
  const W=.160,H=.187,D=.145;
  function surface(phi,theta,offset=0){
    const sy=Math.cos(phi),circ=Math.sin(phi);
    const y=H*sy;
    const lowerJaw=1-.24*Math.max(0,(-y-.035)/.15);
    const x=Math.sin(theta)*(W+offset)*circ*lowerJaw;
    let z=Math.cos(theta)*(D+offset)*circ;
    const front=Math.pow(Math.max(0,Math.cos(theta)),3);
    const eyeSocket = -.011*(gaussian(x,y,-.061,.028,.036,.029)+gaussian(x,y,.061,.028,.036,.029));
    const cheek = .012*(gaussian(x,y,-.09,-.054,.040,.055)+gaussian(x,y,.09,-.054,.040,.055));
    const bridge = .025*gaussian(x,y,.005,-.005,.033,.090);
    const tip = .027*gaussian(x,y,.005,-.063,.033,.032);
    const chin=.011*gaussian(x,y,.008,-.136,.075,.035);
    z+=front*(eyeSocket+cheek+bridge+tip+chin);
    return [x,y,z];
  }
  function headPatch(rows,segments,paramFn){
    const vertices=[],indices=[];
    for(let i=0;i<=rows;i++) for(let j=0;j<=segments;j++){
      const v=i/rows,u=j/segments;
      vertices.push(...paramFn(v,u));
    }
    for(let i=0;i<rows;i++) for(let j=0;j<segments;j++){
      const a=i*(segments+1)+j,b=a+segments+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }
  const portrait=add(headPatch(56,72,(v,u)=>surface(Math.PI*v,Math.PI*2*u)),skin,'one-piece-sculpted-head');
  portrait.position.copy(headCenter);
  portrait.rotation.y=.095;

  const hairCap=add(headPatch(24,72,(v,u)=>{
    const theta=Math.PI*2*u;
    const front=Math.max(0,Math.cos(theta));
    const hairline = -.055 + front*(.160 + .006*Math.sin(theta*2));
    const phiEnd=Math.acos(THREE.MathUtils.clamp(hairline/H,-.95,.95));
    return surface(phiEnd*v,theta,.004);
  }),hair,'sculpted-hair-cap');
  hairCap.position.copy(headCenter);
  hairCap.rotation.y=.095;

  // The figure is constructed in metres with the soles at ground level.
  // A full-height 1.99m studio figure gives a clear human scale in every preset.
  scene.add(figure);
  return { figure, head:portrait, jacket };
}
