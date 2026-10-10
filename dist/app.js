'use strict';
const header=document.querySelector('#header'),mobileNav=document.querySelector('#mobile-nav'),menuButton=document.querySelector('#menu-toggle');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const zh=Object.fromEntries([...document.querySelectorAll('[data-i18n]')].map(el=>[el.dataset.i18n,el.innerHTML]));
Object.assign(zh,{modeTitle1:'慢慢卸下一天，<br>进入舒缓的节奏。',modeBody1:'以柔和、连贯的律动，陪伴晚间放松。<br>在安静的片刻里，让身心慢慢松弛。',modeTitle2:'运动之后，<br>给自己片刻放松。',modeBody2:'从活跃的节奏，回到舒适的承托。<br>以轻柔律动，陪你享受运动后的休憩。',benefit10:'舒缓的节奏',benefit11:'宁静的舒适',benefit12:'晚间放松时光',benefit20:'轻松的律动',benefit21:'自在的承托',benefit22:'运动后的休憩',heroAlt:'RHYVIA ONE 与脚踏置于温暖的湖畔客厅',chairAlt:'RHYVIA ONE 水平律动座椅与脚踏',modeAlt:'RHYVIA TWO 在温暖日光中的居家场景',restAlt:'女性躺在 RHYVIA TWO 上安静休憩'});
const en={skip:'Skip to content',navHome:'Home',navChairs:'Our chairs',navTech:'Our technology',navStory:'Our expertise',book:'Book an experience',heroEyebrow:'COMFORT COMES NATURALLY',heroTitle:'Find your rhythm.<br>Settle into comfort.',heroDesc:'Gentle motion. Considered support.<br>A little space to unwind, every day.',exploreChairs:'Explore our chairs',exploreTech:'Explore our technology',scroll:'SCROLL TO SLOW DOWN',heroCaption:'Comfort, at home',heroIndex:'RHYTHM · RENEWAL · COMFORT',wellnessEyebrow:'DYNAMIC WELLNESS',wellnessTitle:'Gentle motion.<em> Comfort in your rhythm.</em>',precisionTitle:'Precision in motion',precisionBody:'Smooth, continuous horizontal motion.<br>A gentle rhythm to settle into.',comfortTitle:'Comfort, made personal',comfortBody:'Choose your mode and your time.<br>Unwind in a way that feels like you.',homeTitle:'Designed for home',homeBody:'Warm materials. Considered lines.<br>Comfort that belongs in your everyday space.',chairTitle:'Horizontal motion.<br>Everyday comfort.',chairBody:'From quiet evenings to easy everyday moments.<br>The RHYVIA horizontal-motion wellness chair<br>brings comfort into the life you live.',exploreChair:'Explore this chair',personalEyebrow:'PERSONALISED WELLNESS MODES',personalTitle:'Your rhythm.<br>Your choice.',personalBody:'Choose your mode. Set your time.<br>Make every moment of rest your own.',modeName0:'Digestion mode',modeName1:'Sleep mode',modeName2:'Exercise mode',modeShort0:'A gentle rhythm<br>for after a meal.',modeShort1:'A softer pace<br>to end the day.',modeShort2:'A little ease<br>after movement.',voiceTitle:'AI voice control',voiceBody:'Simple words. Effortless control.',timerTitle:'Time control',timerBody:'Set aside as much time as you like.',personalNote:'Wellness, simply part of your day.',modeTitle0:'After a meal,<br>find a gentler rhythm.',modeBody0:'Settle into smooth, continuous motion.<br>A little more comfort in your after-meal downtime.',modeTitle1:'Let the day settle.<br>Ease into your evening.',modeBody1:'Soft, continuous motion accompanies your evening pause.<br>A quiet moment to let your body and mind unwind.',modeTitle2:'After movement,<br>make room for rest.',modeBody2:'Move from an active pace to comfortable support.<br>Enjoy gentle motion as you take a little time to rest.',benefit00:'Gentle motion',benefit01:'Considered support',benefit02:'After-meal ease',benefit10:'A softer rhythm',benefit11:'Quiet comfort',benefit12:'Evening relaxation',benefit20:'Easy movement',benefit21:'Comfortable support',benefit22:'Post-activity rest',ctaTitle:'Find your rhythm of comfort.',ctaBody:'Experience RHYVIA horizontal motion for yourself.<br>Explore three modes and discover your way to unwind.',footerTag:'Comfort has a rhythm.',backTop:'Back to top',footerLine:'RHYTHM · COMFORT · EVERY DAY',previewEyebrow:'RHYVIA · PAGE PREVIEW',previewBody:'You are previewing the homepage. This content will be available on its own page as the rest of the website is developed.',previewBack:'Continue exploring the homepage',heroAlt:'RHYVIA ONE and its footrest in a warm lakeside living room',chairAlt:'RHYVIA ONE horizontal-motion chair and footrest',modeAlt:'RHYVIA TWO in a warm sunlit living space',restAlt:'A woman resting comfortably in RHYVIA TWO'};
let lang=window.RHYVIA_LANGUAGE.initial(),modeIndex=0,pageKey='chairs';
const t=key=>(lang==='en'?en:zh)[key]||zh[key]||'';
const pageNames={chairs:'navChairs',technology:'navTech',story:'navStory',experience:'book'};
function renderMode(){document.querySelector('#mode-title').innerHTML=t('modeTitle'+modeIndex);document.querySelector('#mode-body').innerHTML=t('modeBody'+modeIndex);document.querySelector('#mode-benefits').replaceChildren(...[0,1,2].map(i=>{const li=document.createElement('li');li.textContent=t('benefit'+modeIndex+i);return li;}));}
function setLanguage(next,remember=false){lang=next;document.documentElement.lang=lang==='en'?'en':'zh-CN';document.querySelectorAll('[data-i18n]').forEach(el=>el.innerHTML=t(el.dataset.i18n));document.querySelectorAll('[data-alt]').forEach(el=>el.alt=t(el.dataset.alt));document.querySelector('#language').textContent=lang==='en'?'中文':'EN';document.querySelector('.footer-language').textContent=lang==='en'?'简体中文 ↗':'ENGLISH ↗';document.querySelectorAll('.language').forEach(el=>el.setAttribute('aria-label',lang==='en'?'切换为中文':'Switch to English'));document.querySelectorAll('.wordmark').forEach(el=>el.setAttribute('aria-label',lang==='en'?'RHYVIA home':'RHYVIA 首页'));menuButton.setAttribute('aria-label',lang==='en'?'Toggle navigation':'切换导航');document.querySelector('.desktop-nav').setAttribute('aria-label',lang==='en'?'Main navigation':'主导航');mobileNav.setAttribute('aria-label',lang==='en'?'Mobile navigation':'移动导航');document.querySelector('.mode-tabs').setAttribute('aria-label',lang==='en'?'Motion modes':'律动模式');document.querySelector('.dialog-close').setAttribute('aria-label',lang==='en'?'Close':'关闭');document.querySelector('#preview-title').textContent=t(pageNames[pageKey]);document.title=lang==='en'?'RHYVIA — Find your rhythm. Settle into comfort.':'RHYVIA — 让身心，回到自己的节奏';document.querySelector('meta[name=description]').content=lang==='en'?'Discover RHYVIA horizontal-motion wellness chairs. Precision motion, personal comfort and three modes designed for everyday life.':'探索 RHYVIA 水平律动养生椅：精准律动、个性化舒适体验与三种日常模式，让放松融入居家生活。';renderMode();if(remember)window.RHYVIA_LANGUAGE.remember(lang);}
document.querySelectorAll('.language').forEach(el=>el.addEventListener('click',()=>setLanguage(lang==='zh'?'en':'zh',true)));
function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');header.classList.remove('menu-visible');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';mobileNav.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);header.classList.toggle('menu-visible',open);});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});window.addEventListener('resize',()=>{if(innerWidth>760)closeMenu();},{passive:true});
const previewDialog=document.querySelector('#page-preview');
// The four interior pages are now real routes; links use native navigation.
document.querySelectorAll('#preview-close,.dialog-close').forEach(b=>b.addEventListener('click',()=>previewDialog.close()));previewDialog.addEventListener('click',e=>{if(e.target!==previewDialog)return;const box=previewDialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)previewDialog.close();});
const modeButtons=[...document.querySelectorAll('[data-mode]')];
function setMode(index){modeIndex=index;modeButtons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});const panel=document.querySelector('#mode-panel');panel.setAttribute('aria-labelledby','mode-tab-'+index);renderMode();panel.classList.remove('fade-content');void panel.offsetWidth;panel.classList.add('fade-content');}
modeButtons.forEach((b,i)=>{b.addEventListener('click',()=>setMode(i));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%3;if(e.key==='ArrowLeft')next=(i+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();setMode(next);modeButtons[next].focus();}});});
document.querySelectorAll('[data-jump-mode]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.jumpMode);setMode(i);document.querySelector('#modes').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth'});modeButtons[i].focus({preventScroll:true});}));
if('IntersectionObserver'in window&&!reducedMotion.matches){document.documentElement.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
// Measure stationary section bounds; animate only the oversized image layers.
const layers=[...document.querySelectorAll('.parallax')].map(el=>({el,current:0,initialized:false}));
let parallaxFrame=0,lastFrameTime=0;
function scheduleParallax(){
  if(!parallaxFrame&&!document.hidden)parallaxFrame=requestAnimationFrame(updateParallax);
}
function updateParallax(now){
  parallaxFrame=0;
  const enabled=!reducedMotion.matches&&innerWidth>760;
  const dt=lastFrameTime?Math.min(now-lastFrameTime,48):1000/60;
  const ease=1-Math.exp(-dt/90);
  // Batch layout reads before any style changes, including the header state.
  const measurements=enabled?layers.map(({el})=>{
    const rect=el.parentElement.getBoundingClientRect();
    const limit=Math.max(0,Math.min(42,(el.offsetHeight-rect.height)/2-2));
    const distance=(innerHeight-rect.height)/2-rect.top;
    const target=Math.max(-limit,Math.min(limit,distance*Number(el.dataset.depth)));
    return {target,limit,visible:rect.bottom>0&&rect.top<innerHeight};
  }):[];
  header.classList.toggle('is-scrolled',scrollY>70);
  let settling=false;
  layers.forEach((layer,i)=>{
    if(!enabled){layer.el.style.transform='';layer.initialized=false;return;}
    const {target,limit,visible}=measurements[i];
    if(!layer.initialized||!visible)layer.current=target;
    else layer.current+=(target-layer.current)*ease;
    layer.current=Math.max(-limit,Math.min(limit,layer.current));
    if(Math.abs(target-layer.current)<0.03)layer.current=target;
    else settling=true;
    layer.initialized=true;
    layer.el.style.transform=`translate3d(0,${layer.current.toFixed(3)}px,0)`;
  });
  lastFrameTime=settling?now:0;
  if(settling)scheduleParallax();
}
window.addEventListener('scroll',scheduleParallax,{passive:true});
window.addEventListener('resize',scheduleParallax,{passive:true});
reducedMotion.addEventListener('change',scheduleParallax);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(parallaxFrame);parallaxFrame=0;lastFrameTime=0;}
  else scheduleParallax();
});
if('ResizeObserver'in window){
  const sectionResize=new ResizeObserver(scheduleParallax);
  layers.forEach(({el})=>sectionResize.observe(el.parentElement));
}
setLanguage(lang);scheduleParallax();
