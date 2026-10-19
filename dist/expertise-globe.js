/* Decorative geographic motion. Local flag assets and approximate country anchors; no WebGL context. */
(() => {
  'use strict';
  const host = document.querySelector('[data-globe]');
  if (!host) return;
  const canvas = host.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const toggle = host.querySelector('.globe-toggle');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Simplified land silhouettes match the static SVG; these are not coverage markers.
  const continents = [[[-17,35],[0,37],[12,33],[32,31],[43,12],[51,10],[43,-12],[35,-20],[28,-34],[18,-35],[11,-17],[8,4],[-9,5],[-17,15]],[[-10,36],[-10,44],[-1,51],[8,55],[10,70],[27,71],[35,60],[55,69],[95,76],[150,65],[177,60],[157,50],[141,45],[130,33],[120,23],[110,19],[107,6],[100,2],[94,21],[80,8],[70,24],[54,26],[42,12],[34,30],[26,40],[12,46],[8,37]],[[-166,65],[-140,71],[-120,72],[-100,80],[-63,65],[-53,50],[-66,44],[-80,25],[-98,17],[-115,30],[-130,50]],[[-80,10],[-61,10],[-35,-6],[-44,-23],[-57,-39],[-68,-55],[-76,-32],[-82,-5]],[[112,-22],[116,-13],[132,-11],[142,-10],[153,-28],[145,-39],[127,-34],[113,-34]],[[-53,60],[-42,60],[-20,75],[-42,83],[-58,78]],[[46,-13],[51,-17],[48,-26],[44,-24]],[[130,32],[141,45],[145,44],[140,34]]];
  const inside = (x, y, polygon) => {
    let hit = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [a,b] = polygon[i], [c,d] = polygon[j];
      if ((b > y) !== (d > y) && x < (c-a)*(y-b)/(d-b)+a) hit = !hit;
    }
    return hit;
  };
  const rad = Math.PI / 180, tilt = 18 * rad;
  const points = [];
  for (let lat = -58; lat <= 80; lat += 3) {
    for (let lon = -180; lon < 180; lon += 3) {
      if (continents.some(p => inside(lon, lat, p))) points.push([lon, lat]);
    }
  }
  let elapsed = 0, last = 0, frame = 0, visible = false, paused = false;
  const project = (lon, lat, rotation) => {
    const lo = (lon - rotation)*rad, la = lat*rad;
    const c = Math.cos(la), z = Math.sin(tilt)*Math.sin(la)+Math.cos(tilt)*c*Math.cos(lo);
    return [360+270*c*Math.sin(lo),360-270*(Math.cos(tilt)*Math.sin(la)-Math.sin(tilt)*c*Math.cos(lo)),z];
  };

  // Client's 27 flags. Anchors represent countries, not individual shops.
  const countries = [
    ['cn','中国','China',104,35], ['us','美国','United States',-100,39],
    ['de','德国','Germany',10,51], ['fr','法国','France',2,46],
    ['au','澳大利亚','Australia',134,-25], ['ca','加拿大','Canada',-106,57],
    ['ru','俄罗斯','Russia',100,61], ['sg','新加坡','Singapore',103.8,1.35],
    ['kr','韩国','South Korea',128,36], ['gt','危地马拉','Guatemala',-90.3,15.5],
    ['es','西班牙','Spain',-4,40], ['nz','新西兰','New Zealand',174,-41],
    ['in','印度','India',79,22], ['vn','越南','Vietnam',106,17],
    ['ae','阿联酋','United Arab Emirates',54,24], ['ph','菲律宾','Philippines',122,12],
    ['ge','格鲁吉亚','Georgia',43.5,42], ['mn','蒙古','Mongolia',104,46],
    ['pe','秘鲁','Peru',-75,-10], ['ng','尼日利亚','Nigeria',8,9],
    ['sa','沙特阿拉伯','Saudi Arabia',45,24], ['mm','缅甸','Myanmar',96,21],
    ['my','马来西亚','Malaysia',102,4], ['la','老挝','Laos',103,18],
    ['kh','柬埔寨','Cambodia',105,12.5], ['kp','朝鲜','North Korea',127,40],
    ['id','印度尼西亚','Indonesia',118,-3]
  ];
  const assetBase = new URL('assets/flags/', document.currentScript.src);
  const layer = document.createElement('div');
  layer.className = 'globe-countries'; layer.setAttribute('aria-hidden','true');
  host.append(layer);
  const accessible = document.createElement('p');
  accessible.className = 'sr-only'; host.append(accessible);
  const markers = countries.map(([code,zh,en,lon,lat], index) => {
    const el = document.createElement('div'); el.className = 'globe-country';
    const flag = document.createElement('img');
    flag.src = new URL(code+'.svg',assetBase).href; flag.alt = ''; flag.width = 24; flag.height = 24;
    const name = document.createElement('span'); el.append(flag,name); layer.append(el);
    return {code,zh,en,lon,lat,el,name,index,shown:-Infinity,width:0,height:0};
  });
  let selected = [], cycleStart = -Infinity, layoutWidth = 0;
  function measureMarkers() {
    const zh = document.documentElement.lang.startsWith('zh');
    for (const m of markers) {
      m.name.textContent = zh ? m.zh : m.en;
      m.width = m.el.offsetWidth; m.height = m.el.offsetHeight;
    }
    accessible.textContent = (zh ? '全球布局：' : 'Global presence: ') + markers.map(m => zh ? m.zh : m.en).join(' · ');
    cycleStart = -Infinity;
  }
  function bubbles(rotation) {
    const width = host.clientWidth, scale = width/720;
    const compact = width < 460, limit = compact ? 3 : 4;
    const projectMarker = m => {
      const [x,y,z] = project(m.lon,m.lat,rotation);
      return {x:x*scale,y:y*scale,z};
    };
    const overlaps = (a,b) => a.x < b.x+b.w+10 && a.x+a.w+10 > b.x && a.y < b.y+b.h+12 && a.y+a.h+12 > b.y;
    if (elapsed-cycleStart >= 7 || cycleStart === -Infinity || layoutWidth !== width) {
      selected = []; cycleStart = elapsed; layoutWidth = width;
      const boxes = [];
      // Least recently shown first gives dense regions their turn without flicker.
      const candidates = markers.map(m=>({m,p:projectMarker(m)})).filter(v=>v.p.z>.3)
        .sort((a,b)=>a.m.shown-b.m.shown || b.p.z-a.p.z || a.m.index-b.m.index);
      for (const {m,p} of candidates) {
        if (selected.length >= limit) break;
        const w=m.width, h=m.height;
        const offsets = [[-w/2,-h-19],[-w-16,-h-14],[16,-h-14],[-w/2,24],[-w/2,-h-68]];
        for (const [dx,dy] of offsets) {
          const box={x:p.x+dx,y:p.y+dy,w,h};
          if (box.x<8 || box.x+w>width-8 || box.y<20 || box.y+h>width-44 || boxes.some(b=>overlaps(box,b))) continue;
          selected.push({m,dx,dy}); boxes.push(box); m.shown=elapsed; break;
        }
      }
    }
    for (const m of markers) m.el.style.opacity='0';
    const boxes=[];
    for (const {m,dx,dy} of selected) {
      const p=projectMarker(m), box={x:p.x+dx,y:p.y+dy,w:m.width,h:m.height};
      if (p.z<=.1 || box.x<3 || box.x+box.w>width-3 || boxes.some(b=>overlaps(box,b))) continue;
      boxes.push(box);
      const age=elapsed-cycleStart;
      const fade = reduced.matches ? 1 : Math.min(1,(age+.06)/.5,(7-age)/.5);
      const opacity=Math.max(0,Math.min(1,(p.z-.1)/.2))*fade;
      m.el.style.transform=`translate3d(${box.x.toFixed(2)}px,${box.y.toFixed(2)}px,0)`;
      m.el.style.opacity=String(opacity);
      // Connector terminates at the pill edge; anchor uses the same projection as land.
      const endX=Math.max(box.x+12,Math.min(box.x+box.w-12,p.x));
      const endY=dy<0 ? box.y+box.h : box.y;
      m.el.style.setProperty('--tail-x',`${endX-box.x}px`);
      m.el.classList.toggle('globe-country-below',dy>0);
      ctx.save(); ctx.globalAlpha=opacity;
      ctx.strokeStyle='rgba(158,130,80,.65)'; ctx.lineWidth=.85/scale;
      ctx.beginPath(); ctx.moveTo(p.x/scale,p.y/scale); ctx.lineTo(endX/scale,endY/scale); ctx.stroke();
      ctx.fillStyle='rgba(174,144,91,.18)'; ctx.beginPath();ctx.arc(p.x/scale,p.y/scale,8/scale,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ac9061';ctx.strokeStyle='#fffdf7';ctx.lineWidth=1.3/scale;
      ctx.beginPath();ctx.arc(p.x/scale,p.y/scale,3.5/scale,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    }
  }

  function orbit(angle, phase, rear, secondary = false) {
    ctx.save(); ctx.translate(360,360); ctx.rotate(angle);
    // sin(phase) is the orbit's depth: negative behind, positive in front.
    // Render the far half before the opaque sphere, and the near half after it.
    ctx.strokeStyle = secondary ? 'rgba(175,147,99,.13)' : 'rgba(175,147,99,.48)';
    ctx.lineWidth = .8; ctx.beginPath();
    ctx.ellipse(0,0,337,108,0,rear ? Math.PI : 0,rear ? 2*Math.PI : Math.PI);
    ctx.stroke();
    if (!secondary && (Math.sin(phase) < 0) === rear) {
      const x = 337*Math.cos(phase), y = 108*Math.sin(phase);
      const glow = ctx.createRadialGradient(x,y,0,x,y,18);
      glow.addColorStop(0,'rgba(177,144,81,.4)'); glow.addColorStop(1,'rgba(177,144,81,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ac9061'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(175,147,99,.3)'; ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,720,720);
    const halo = ctx.createRadialGradient(360,360,220,360,360,350);
    halo.addColorStop(0,'rgba(201,181,140,.15)'); halo.addColorStop(1,'rgba(201,181,140,0)');
    ctx.fillStyle = halo; ctx.fillRect(0,0,720,720);
    orbit(30*rad,0,true,true);
    orbit(-28*rad,elapsed*.24-1.1,true);
    const surface = ctx.createRadialGradient(275,235,25,390,390,320);
    surface.addColorStop(0,'#fffcf5'); surface.addColorStop(.65,'#ece6da'); surface.addColorStop(1,'#d5cfbf');
    ctx.fillStyle = surface; ctx.strokeStyle = 'rgba(188,169,133,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(360,360,270,0,Math.PI*2); ctx.fill(); ctx.stroke();
    const rotation = 48 + elapsed * 3.2;
    // Front hemisphere grid is projected again each frame, not spun as a flat picture.
    const gridLine = coords => {
      let pen = false; ctx.beginPath();
      for (const [lo,la] of coords) {
        const [x,y,z] = project(lo,la,rotation);
        if (z <= 0) { pen = false; continue; }
        if (!pen) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        pen = true;
      }
      ctx.stroke();
    };
    ctx.strokeStyle = 'rgba(158,140,104,.15)'; ctx.lineWidth = .7;
    for (let lat=-60;lat<=60;lat+=30) {
      const line=[]; for(let lon=-180;lon<=180;lon+=4) line.push([lon,lat]); gridLine(line);
    }
    for (let lon=-180;lon<180;lon+=30) {
      const line=[]; for(let lat=-90;lat<=90;lat+=4) line.push([lon,lat]); gridLine(line);
    }
    for (const [lon,lat] of points) {
      const [x,y,z] = project(lon,lat,rotation);
      if (z <= .01) continue;
      ctx.fillStyle = `rgba(156,136,99,${(.35+z*.4)*Math.min(1,z/.12)})`;
      ctx.beginPath(); ctx.arc(x,y,1.25+z*.6,0,Math.PI*2); ctx.fill();
    }
    orbit(30*rad,0,false,true);
    orbit(-28*rad,elapsed*.24-1.1,false);
    bubbles(rotation);
  }
  const canAnimate = () => visible && !document.hidden && !paused && !reduced.matches;
  function tick(now) {
    frame = 0;
    if (!canAnimate()) { last = 0; return; }
    if (!last || now-last >= 1000/30) {
      if (last) elapsed += Math.min((now-last)/1000,.08);
      last = now; draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    toggle.hidden = reduced.matches;
    if (canAnimate()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const pixels = Math.round(Math.max(1,host.clientWidth)*Math.min(devicePixelRatio || 1,2));
    if (canvas.width !== pixels) { canvas.width=pixels; canvas.height=pixels; }
    ctx.setTransform(pixels/720,0,0,pixels/720,0,0); measureMarkers(); draw();
  }
  measureMarkers();
  new MutationObserver(() => { measureMarkers(); draw(); }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  resize(); host.classList.add('globe-ready');
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries => { visible=entries[0].isIntersecting; sync(); },{threshold:0}).observe(host);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',() => { draw(); sync(); });
  toggle.addEventListener('click',() => {
    paused=!paused; toggle.setAttribute('aria-pressed',String(paused));
    toggle.setAttribute('aria-label',paused?'播放地球动画 / Play globe animation':'暂停地球动画 / Pause globe animation');
    sync();
  });
  sync();
})();
