import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04091f);
scene.fog = new THREE.Fog(0x04091f, 24, 95);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 7.8, 13.5);
camera.lookAt(0, 0, -5);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

scene.add(new THREE.HemisphereLight(0x8bbcff, 0x08051f, 2.0));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2); keyLight.position.set(3,10,5); scene.add(keyLight);
const pinkLight = new THREE.PointLight(0xff1bce, 22, 35); pinkLight.position.set(-5,4,-8); scene.add(pinkLight);
const cyanLight = new THREE.PointLight(0x00cfff, 22, 35); cyanLight.position.set(5,4,-14); scene.add(cyanLight);

const mat = (color, emissive=0x000000, intensity=0) => new THREE.MeshStandardMaterial({color,emissive,emissiveIntensity:intensity,metalness:.45,roughness:.35});
const roadMat=mat(0x090f27), laneMat=mat(0x00cfff,0x00aaff,2), pinkMat=mat(0xff28d7,0xff00b7,2.5);
const road = new THREE.Mesh(new THREE.PlaneGeometry(13,130), roadMat); road.rotation.x=-Math.PI/2; road.position.set(0,-.05,-35); scene.add(road);
for(let x of [-6.4,6.4]){const edge=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,130),laneMat);edge.position.set(x,.02,-35);scene.add(edge)}
const laneMarkers=[];
for(let z=-95;z<15;z+=6){for(let x of [-2,2]){const m=new THREE.Mesh(new THREE.BoxGeometry(.07,.035,2.5),laneMat);m.position.set(x,.01,z);scene.add(m);laneMarkers.push(m)}}
const buildings=[];
for(let side of [-1,1]) for(let i=0;i<20;i++){
  const h=3+Math.random()*12,w=1.2+Math.random()*2.5,d=2+Math.random()*4;
  const b=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat([0x111a49,0x17133d,0x0b2850][i%3]));body.position.y=h/2;b.add(body);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(w*.82,.055,d+.03),i%2?pinkMat:laneMat);
  strip.position.set(0,h*(.35+Math.random()*.4),0);b.add(strip);
  for(let yy=1;yy<h-1;yy+=1.4){const win=new THREE.Mesh(new THREE.BoxGeometry(w*.55,.12,.04),mat(i%2?0x00baff:0xff42d4,i%2?0x007dff:0xff00a8,1.2));win.position.set(0,yy,d/2+.025);b.add(win)}
  b.position.set(side*(8+Math.random()*5),0,-100+i*6+Math.random()*3);scene.add(b);buildings.push({obj:b,side});
}
function makeCar(color=0x00bfff){
 const g=new THREE.Group(), bodyMat=mat(color,color,.35), dark=mat(0x080b18), glow=mat(0xff174e,0xff003c,3);
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.45,.48,2.65),bodyMat);body.position.y=.65;g.add(body);
 const hood=new THREE.Mesh(new THREE.BoxGeometry(1.22,.22,.85),bodyMat);hood.position.set(0,.92,-.55);g.add(hood);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.02,.48,1.08),dark);cabin.position.set(0,1.04,.25);g.add(cabin);
 const front=new THREE.Mesh(new THREE.BoxGeometry(1.05,.12,.08),laneMat);front.position.set(0,.73,-1.34);g.add(front);
 const rear=new THREE.Mesh(new THREE.BoxGeometry(1.1,.13,.08),glow);rear.position.set(0,.73,1.34);g.add(rear);
 for(const x of [-.77,.77])for(const z of [-.8,.85]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.16,12),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.35,z);g.add(wheel)}
 return g;
}
const player=makeCar(0x115bff);player.position.set(0,0,5);scene.add(player);
const obstacleCars=[], coinMeshes=[];
const coinMat=mat(0xffd83d,0xffa600,2.1);
function spawnObstacle(){
 const lane=[-4,0,4][Math.floor(Math.random()*3)], car=makeCar([0xff234d,0xff7a00,0x7c39ff][Math.floor(Math.random()*3)]);
 car.scale.setScalar(.82);car.position.set(lane,0,-75);scene.add(car);obstacleCars.push(car);
}
function spawnCoin(){
 const c=new THREE.Mesh(new THREE.TorusGeometry(.34,.11,8,16),coinMat);c.position.set([-4,0,4][Math.floor(Math.random()*3)],1,-75);c.rotation.x=Math.PI/2;scene.add(c);coinMeshes.push(c);
}
let state='home', score=0, coins=0, best=Number(localStorage.getItem('neonRushBest')||0), speed=23, lane=1, spawnTimer=0, coinTimer=0, last=0, boost=0;
const laneX=[-4,0,4];
function updateHud(){ $('score').textContent=Math.floor(score);$('coins').textContent=coins; }
function toast(msg){$('toast').textContent=msg;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),1800)}
function setScreen(id){for(const el of ['home-screen','pause-screen','over-screen'])$(el).classList.toggle('hidden',el!==id)}
function startGame(){score=0;coins=0;speed=23;lane=1;player.position.x=0;spawnTimer=.7;coinTimer=1.1;boost=0;for(const o of obstacleCars)scene.remove(o);obstacleCars.length=0;for(const c of coinMeshes)scene.remove(c);coinMeshes.length=0;state='playing';setScreen('');updateHud()}
function gameOver(){state='over';best=Math.max(best,Math.floor(score));localStorage.setItem('neonRushBest',best);$('final-score').textContent=Math.floor(score);$('best-score').textContent=best;$('ad-status').textContent='Watch an ad to try for a bonus. Ads require your Adsgram block ID.';setScreen('over-screen')}
function move(dir){if(state!=='playing')return;lane=Math.max(0,Math.min(2,lane+dir));}
$('play-btn').onclick=startGame;$('retry-btn').onclick=startGame;$('pause-btn').onclick=()=>{if(state==='playing'){state='paused';setScreen('pause-screen')}};$('resume-btn').onclick=()=>{state='playing';setScreen('')};
$('home-btn').onclick=$('over-home-btn').onclick=()=>{state='home';setScreen('home-screen')};
$('left-btn').onclick=()=>move(-1);$('right-btn').onclick=()=>move(1);$('jump-btn').onclick=()=>{if(state==='playing'){boost=1.3;toast('BOOST!')}};
$('how-btn').onclick=()=>toast('Tap ‹ / › to change lanes. Collect gold rings. Avoid traffic!');
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')move(-1);if(e.key==='ArrowRight'||e.key==='d')move(1);if(e.key===' '&&state==='playing')boost=1.3;if(e.key==='Escape'&&state==='playing'){$('pause-btn').click()}});
let touchStartX=null;canvas.addEventListener('touchstart',e=>{touchStartX=e.touches[0].clientX},{passive:true});canvas.addEventListener('touchend',e=>{if(touchStartX===null)return;const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>35)move(dx>0?1:-1);touchStartX=null},{passive:true});

// Adsgram: replace the placeholder with the numeric blockId from your publisher dashboard.
$('ad-btn').onclick=async()=>{
 const status=$('ad-status');
 if(!window.Adsgram){status.textContent='Adsgram SDK did not load. Check internet and reload.';return}
 const blockId='YOUR_ADSGRAM_BLOCK_ID';
 if(blockId==='YOUR_ADSGRAM_BLOCK_ID'){status.textContent='Setup needed: replace YOUR_ADSGRAM_BLOCK_ID in src/main.js with your real block ID.';return}
 try{
   const controller=window.Adsgram.init({blockId});
   const result=await controller.show();
   if(result?.done){coins+=200;updateHud();status.textContent='Ad completed! +200 bonus coins.'}
   else status.textContent='Ad was not completed; no bonus given.';
 }catch(err){status.textContent='No ad available right now. Please try again later.';console.warn(err)}
};

const tg=window.Telegram?.WebApp;
if(tg){tg.ready();tg.expand();try{tg.setHeaderColor('#05091f');tg.setBackgroundColor('#05091f')}catch{}}
function animate(t){
 requestAnimationFrame(animate);const dt=Math.min((t-last)/1000||0,.04);last=t;
 if(state==='playing'){
  speed=Math.min(38,speed+dt*.18);score+=dt*(boost>0?speed*1.8:speed)*.7;boost=Math.max(0,boost-dt);
  player.position.x+=(laneX[lane]-player.position.x)*Math.min(1,dt*10);
  player.position.y=Math.sin(t*.008)*.025;
  for(const m of laneMarkers){m.position.z+=speed*dt;if(m.position.z>15)m.position.z=-95}
  for(const b of buildings){b.obj.position.z+=speed*dt*.82;if(b.obj.position.z>18)b.obj.position.z=-100-Math.random()*10}
  spawnTimer-=dt;if(spawnTimer<=0){spawnObstacle();spawnTimer=Math.max(.48,1.15-(speed-23)*.025)+Math.random()*.35}
  coinTimer-=dt;if(coinTimer<=0){spawnCoin();coinTimer=1.05+Math.random()*.9}
  for(let i=obstacleCars.length-1;i>=0;i--){const o=obstacleCars[i];o.position.z+=speed*dt;if(o.position.z>13){scene.remove(o);obstacleCars.splice(i,1);continue}
    if(Math.abs(o.position.z-player.position.z)<1.65&&Math.abs(o.position.x-player.position.x)<1.35){gameOver();break}}
  for(let i=coinMeshes.length-1;i>=0;i--){const c=coinMeshes[i];c.position.z+=speed*dt;c.rotation.z+=dt*2.8;if(c.position.z>12){scene.remove(c);coinMeshes.splice(i,1);continue}
    if(Math.abs(c.position.z-player.position.z)<1.5&&Math.abs(c.position.x-player.position.x)<1.4){coins+=10;scene.remove(c);coinMeshes.splice(i,1);toast('+10 COINS')}}
  updateHud();
 }
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))});
