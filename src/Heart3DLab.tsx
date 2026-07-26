import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EcgViewer } from "./EcgViewer";
import type { Lesson } from "./types";

type Props={mode:Lesson["visual"]};

const modeCopy:Partial<Record<Lesson["visual"],{title:string;detail:string}>>={
  normal:{title:"Condução sinusal",detail:"O estímulo nasce no nó sinusal, percorre os átrios, sofre atraso no nó AV e alcança os ventrículos pelo sistema His–Purkinje."},
  rbbb:{title:"Ativação direita tardia",detail:"O ventrículo esquerdo é ativado antes; a força terminal dirige-se para a direita e anteriormente."},
  lbbb:{title:"Ativação esquerda tardia",detail:"O impulso alcança o ventrículo esquerdo por vias alternativas, prolongando e modificando a ativação ventricular."},
  lafb:{title:"Desvio da ativação frontal",detail:"O fascículo preservado conduz primeiro; a ativação tardia muda a resultante no plano frontal."},
  av1:{title:"Atraso atrioventricular",detail:"Todos os impulsos chegam aos ventrículos, mas a passagem atrioventricular demora mais."},
  mobitz1:{title:"Condução AV progressiva",detail:"O atraso aumenta progressivamente até um impulso atrial não alcançar os ventrículos."},
  mobitz2:{title:"Falha súbita de condução",detail:"Alguns impulsos atriais deixam de atravessar o sistema His–Purkinje sem alongamento progressivo prévio."},
  avcomplete:{title:"Dissociação atrioventricular",detail:"Átrios e ventrículos são ativados por marcapassos independentes."},
  paced:{title:"Estimulação artificial",detail:"A espícula inicia uma frente de ativação fora da sequência fisiológica normal."},
  pvc:{title:"Foco ventricular prematuro",detail:"A ativação começa no miocárdio ventricular e se espalha lentamente, célula a célula."},
  flutter:{title:"Circuito atrial organizado",detail:"Uma macroreentrada mantém atividade atrial rápida; o nó AV filtra parte dos impulsos."},
  af:{title:"Ativação atrial desorganizada",detail:"Múltiplas frentes atriais competem, sem uma onda P organizada e com resposta ventricular irregular."},
  svt:{title:"Circuito supraventricular rápido",detail:"Uma ativação rápida acima dos ventrículos utiliza o sistema de condução, mantendo QRS geralmente estreito."},
  vt:{title:"Ativação ventricular rápida",detail:"A sequência nasce nos ventrículos, produzindo complexos largos e ativação mecânica potencialmente ineficaz."},
  pvt:{title:"Ativação ventricular rápida",detail:"A sequência nasce nos ventrículos, produzindo complexos largos e ativação mecânica potencialmente ineficaz."},
  vf:{title:"Caos elétrico ventricular",detail:"Frentes desorganizadas impedem uma contração ventricular coordenada."},
  asystole:{title:"Ausência de ativação detectável",detail:"Não há frente elétrica ventricular organizada representada no traçado."},
  pea:{title:"Eletricidade sem pulso efetivo",detail:"Pode existir atividade elétrica organizada sem contração capaz de gerar circulação."},
};

function chamber(material:THREE.Material,scale:[number,number,number],position:[number,number,number],rotation=0){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),material);
  mesh.scale.set(...scale);mesh.position.set(...position);mesh.rotation.z=rotation;return mesh;
}

export function Heart3DLab({mode}:Props){
  const mount=useRef<HTMLDivElement>(null);
  const [paused,setPaused]=useState(false);
  const [speed,setSpeed]=useState(1);
  const [transparent,setTransparent]=useState(true);
  const state=useRef({paused:false,speed:1,transparent:true});
  state.current={paused,speed,transparent};
  const copy=modeCopy[mode]||modeCopy.normal!;

  useEffect(()=>{
    if(!mount.current)return;
    const host=mount.current;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(38,1,.1,100);
    camera.position.set(0,1.1,8);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;controls.minDistance=4.5;controls.maxDistance=11;
    controls.autoRotate=true;controls.autoRotateSpeed=.45;

    scene.add(new THREE.HemisphereLight(0xb8fff0,0x102129,2.1));
    const key=new THREE.DirectionalLight(0xffd2c8,4);key.position.set(4,5,5);scene.add(key);
    const rim=new THREE.PointLight(0x58d6b5,30,12);rim.position.set(-4,1,3);scene.add(rim);

    const heart=new THREE.Group();heart.rotation.x=-.08;scene.add(heart);
    const rightMat=new THREE.MeshPhysicalMaterial({color:0x348aa0,roughness:.38,transmission:.08,transparent:true,opacity:.78});
    const leftMat=new THREE.MeshPhysicalMaterial({color:0xd94e62,roughness:.35,transmission:.06,transparent:true,opacity:.82});
    const septumMat=new THREE.MeshPhysicalMaterial({color:0xf4b0a9,roughness:.5,transparent:true,opacity:.42});
    const parts=[
      chamber(rightMat,[1.05,1.34,.72],[-.62,-.25,.12],-.24),
      chamber(leftMat,[1.12,1.52,.84],[.65,-.35,0],.25),
      chamber(rightMat,[.72,.66,.62],[-.72,1.02,.08],-.15),
      chamber(leftMat,[.72,.63,.65],[.65,1.04,-.02],.18),
      chamber(septumMat,[.28,1.46,.62],[.03,-.24,.12],0),
    ];
    parts.forEach(part=>heart.add(part));
    const apex=new THREE.Mesh(new THREE.ConeGeometry(.72,1.55,32),leftMat);
    apex.position.set(.34,-1.83,0);apex.rotation.z=-.08;heart.add(apex);parts.push(apex);

    const vesselMat=new THREE.MeshPhysicalMaterial({color:0xccd9d7,metalness:.08,roughness:.32,transparent:true,opacity:.7});
    const aorta=new THREE.Mesh(new THREE.TorusGeometry(.66,.18,16,38,Math.PI*1.45),vesselMat);
    aorta.position.set(.34,1.65,-.08);aorta.rotation.set(Math.PI/2,.25,-.35);heart.add(aorta);parts.push(aorta);
    const pulmonary=new THREE.Mesh(new THREE.CylinderGeometry(.19,.24,1.45,24),rightMat);
    pulmonary.position.set(-.42,1.72,.16);pulmonary.rotation.z=-.2;heart.add(pulmonary);parts.push(pulmonary);

    const paths=[
      new THREE.CatmullRomCurve3([new THREE.Vector3(-.93,1.27,.72),new THREE.Vector3(-.6,.8,.78),new THREE.Vector3(-.12,.43,.8)]),
      new THREE.CatmullRomCurve3([new THREE.Vector3(-.12,.43,.8),new THREE.Vector3(.02,.05,.82),new THREE.Vector3(.03,-.65,.78),new THREE.Vector3(-.48,-1.28,.64)]),
      new THREE.CatmullRomCurve3([new THREE.Vector3(.03,-.25,.8),new THREE.Vector3(.34,-.78,.78),new THREE.Vector3(.72,-1.42,.57)]),
    ];
    const pathMat=new THREE.MeshBasicMaterial({color:0xffdf72,transparent:true,opacity:.8});
    paths.forEach(path=>heart.add(new THREE.Mesh(new THREE.TubeGeometry(path,48,.035,8,false),pathMat)));
    const impulse=new THREE.Mesh(new THREE.SphereGeometry(.11,18,14),new THREE.MeshBasicMaterial({color:0xffffff}));
    const halo=new THREE.PointLight(0xffdd75,4,2);impulse.add(halo);heart.add(impulse);
    const nodeMat=new THREE.MeshBasicMaterial({color:0xffdd75});
    [new THREE.Vector3(-.93,1.27,.72),new THREE.Vector3(-.12,.43,.8)].forEach(point=>{const node=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),nodeMat);node.position.copy(point);heart.add(node)});

    const planeMat=new THREE.MeshBasicMaterial({color:0x58d6b5,transparent:true,opacity:.07,side:THREE.DoubleSide});
    const frontal=new THREE.Mesh(new THREE.PlaneGeometry(5,5),planeMat);frontal.position.z=-.8;heart.add(frontal);
    const horizontal=new THREE.Mesh(new THREE.PlaneGeometry(5,5),planeMat);horizontal.rotation.x=Math.PI/2;horizontal.position.y=-.15;heart.add(horizontal);

    const clock=new THREE.Clock();let cycle=0;let raf=0;
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    const animate=()=>{
      raf=requestAnimationFrame(animate);
      const delta=Math.min(clock.getDelta(),.05);
      if(!state.current.paused)cycle=(cycle+delta*state.current.speed*(mode==="svt"||mode==="flutter"||mode==="vt"||mode==="pvt"?1.8:1))%3;
      const phase=cycle/3;
      const pathIndex=phase<.32?0:phase<.66?1:2;
      let local=pathIndex===0?phase/.32:pathIndex===1?(phase-.32)/.34:(phase-.66)/.34;
      if(mode==="av1")local=pathIndex===0?local:Math.max(0,(local-.25)/.75);
      if(mode==="rbbb"&&pathIndex===1)local*=.72;
      if(mode==="lbbb"&&pathIndex===2)local*=.62;
      if(mode==="asystole"){impulse.visible=false}else{impulse.visible=true;impulse.position.copy(paths[pathIndex].getPoint(Math.min(1,Math.max(0,local))))}
      if(mode==="vf"||mode==="af"){impulse.position.x+=Math.sin(cycle*31)*.35;impulse.position.y+=Math.cos(cycle*23)*.28}
      parts.forEach((part,index)=>{const material=part.material as THREE.MeshPhysicalMaterial;material.opacity=state.current.transparent?(index===4?.28:.7):1});
      controls.autoRotate=!state.current.paused;controls.update();renderer.render(scene,camera);
    };animate();
    return()=>{cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.dispose();host.replaceChildren()};
  },[mode]);

  return <section className="heart3d-lab">
    <div className="heart3d-copy"><div><p className="eyebrow">LABORATÓRIO 3D · ESQUEMA EDUCACIONAL</p><h3>{copy.title}</h3><p>{copy.detail}</p></div><div className="heart3d-controls">
      <button onClick={()=>setPaused(value=>!value)}>{paused?"▶ Continuar":"Ⅱ Pausar"}</button>
      <label>Velocidade <input aria-label="Velocidade da condução" type="range" min=".45" max="2" step=".05" value={speed} onChange={event=>setSpeed(+event.target.value)}/></label>
      <button className={transparent?"active":""} onClick={()=>setTransparent(value=>!value)}>Câmaras transparentes</button>
    </div></div>
    <div className="heart3d-stage" ref={mount} role="img" aria-label={`Modelo tridimensional interativo: ${copy.title}`}><div className="space-axis"><span>SUPERIOR</span><span>DIREITA ↔ ESQUERDA</span><span>INFERIOR</span></div><div className="drag-help">arraste para girar · use a roda ou pinça para aproximar</div></div>
    <div className="heart3d-sync"><div><small>TRAÇADO SINCRONIZADO AO PADRÃO</small><EcgViewer trace={mode}/></div><ol><li><b>1</b>Nó sinusal e átrios</li><li><b>2</b>Nó AV e feixe de His</li><li><b>3</b>Purkinje e ventrículos</li></ol></div>
    <p className="model-note">Representação espacial simplificada: mostra sequência e direção, não substitui atlas anatômico nem simulação eletrofisiológica quantitativa.</p>
  </section>;
}
