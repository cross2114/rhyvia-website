'use strict';
const header = document.querySelector('#header');
const languageButton = document.querySelector('#language');
const menuButton = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const zh = Object.fromEntries([...document.querySelectorAll('[data-i18n]')].map(el => [el.dataset.i18n, el.innerHTML]));
Object.assign(zh, {
  storyCaption1:'身体舒展，心也松弛',storyCaption2:'让舒适，融入日常',
  modeNative1:'睡眠模式',modeTitle1:'卸下一天，安享此刻。',modeBody1:'关掉忙碌的节奏，留一盏柔和的灯。让舒缓的律动，陪你度过睡前的安静时光。',
  modeNative2:'运动模式',modeTitle2:'动过之后，慢慢放松。',modeBody2:'从运动的节奏，回到休息的节奏。舒展身体，在舒适的承托中，享受片刻停留。',
  heroAlt:'RHYVIA ONE 与脚踏置于温暖的湖畔客厅',storyAlt:'RHYVIA TWO 在柔和日光中的居家场景',
  oneAlt:'RHYVIA ONE 座椅与独立脚踏',twoAlt:'RHYVIA TWO 后仰座椅',threeAlt:'RHYVIA THREE 全身支撑躺椅',
  modeAlt:'RHYVIA TWO 靠椅与午后的光影',restAlt:'女性躺在 RHYVIA TWO 上安静休憩',experienceAlt:'光影与轻纱环绕中的 RHYVIA 躺椅体验'
});
const en = {
 skip:'Skip to content',navRhythm:'The rhythm',navChairs:'The collection',navModes:'Your moments',book:'Book an experience',
 heroEyebrow:'COMFORT COMES NATURALLY',heroTitle:'Find your rhythm.<br>Settle into comfort.',heroDesc:'Gentle motion. Considered support.<br>A little space to unwind, every day.',discover:'Discover RHYVIA',scroll:'SCROLL TO SLOW DOWN',heroCaption:'Comfort, at home',
 philosophyEyebrow:'THE ART OF SLOWING DOWN',philosophyTitle:'Less effort.<br>More ease.',philosophyDesc:'A place to settle. A moment to slow down.<br>RHYVIA brings smooth horizontal motion into your chair, creating a gentle, continuous experience of whole-body relaxation.',storyKicker:'COMFORT, CONSIDERED',
 storyTitle0:'A gentler kind of motion',storyBody0:'Rather than kneading individual areas, smooth horizontal motion gently moves your body as a whole. Simply settle in and find your rhythm.',storyNote0:'SMOOTH · CONTINUOUS · UNHURRIED',
 storyTitle1:'Support that feels right',storyBody1:'From sitting upright to stretching out, each chair offers a different way to rest. Find a comfortable position and make a little time for yourself.',storyNote1:'SETTLE · STRETCH · UNWIND',
 storyTitle2:'At home in your life',storyBody2:'Warm tones. Quiet lines. Comfort doesn’t need a room of its own. In a living-room corner or after a good read, relaxation finds its place.',storyNote2:'AT HOME · EVERY DAY · YOUR WAY',
 storyCaption0:'A gentler rhythm',storyCaption1:'Room to stretch. Space to unwind.',storyCaption2:'Comfort belongs here',findChair:'Find your chair',stripLeft:'Space for your body.',stripRight:'Time for yourself.',
 collectionEyebrow:'THE COLLECTION',collectionTitle:'Three ways to find your ease.',collectionDesc:'Different designs. The same thoughtful comfort.<br>Find the one that feels like you.',oneTag:'SIT AT EASE',twoTag:'LEAN INTO COMFORT',threeTag:'STRETCH OUT',oneShort:'A refined chair and separate footrest. Everyday comfort, beautifully simple.',twoShort:'A generous recline and enveloping support. A softer end to a busy day.',threeShort:'Room to stretch with full-body support. Stay a little longer.',details:'Explore the chair',
 modesEyebrow:'YOUR DAILY RHYTHM',modesTitle:'A rhythm for<br>every moment.',modesDesc:'Three motion modes, chosen by you.<br>Make comfort part of your daily routine.',modeLabel0:'After a meal',modeLabel1:'Evening ease',modeLabel2:'After movement',modeNative0:'DIGESTION MODE',modeNative1:'SLEEP MODE',modeNative2:'EXERCISE MODE',modeTitle0:'A little pause after a meal.',modeBody0:'Set the busy day aside and settle in. Gentle motion brings an unhurried rhythm to your after-meal downtime.',modeTitle1:'Let the day settle.',modeBody1:'Turn down the pace and leave a soft light on. A gentle rhythm accompanies the quiet moments before bed.',modeTitle2:'From movement to stillness.',modeBody2:'Ease out of your active routine. Stretch out, feel supported and enjoy a well-earned moment of rest.',voice:'Voice control, effortlessly',timer:'Time, on your terms',
 restEyebrow:'A MOMENT, JUST FOR YOU',restTitle:'Nowhere else to be.',restDesc:'Let your body move gently. Let your mind wander.',restCaption:'Make room for a little ease.',
 experienceEyebrow:'FEEL IT FOR YOURSELF',experienceTitle:'Your rhythm.<br>Feel it for yourself.',experienceDesc:'Some things are better felt than described.<br>Take a seat and discover your kind of comfort.',bookPersonal:'Book your experience',experienceNote:'Get to know RHYVIA, one quiet moment at a time.',footerTag:'Comfort has a rhythm.',backTop:'Back to top',footerLine:'RHYTHM · COMFORT · EVERY DAY',
 bookingTitle:'We look forward to meeting you.',bookingBody:'Booking contact details will be available soon. In the meantime, explore the three chairs and find the comfort you would like to experience.',browseChairs:'Explore the collection',
 heroAlt:'RHYVIA ONE and its footrest in a warm lakeside living room',storyAlt:'RHYVIA TWO in a softly sunlit living space',oneAlt:'RHYVIA ONE chair with a separate footrest',twoAlt:'RHYVIA TWO reclining chair',threeAlt:'RHYVIA THREE full-body lounge chair',modeAlt:'RHYVIA TWO in soft afternoon light',restAlt:'A woman resting comfortably in RHYVIA TWO',experienceAlt:'A RHYVIA lounge chair surrounded by soft light and flowing fabric'
};
const products = [
 {name:'RHYVIA ONE',image:'assets/hero.webp',zh:{subtitle:'小巧精致，日常舒适之选。',body:'直立坐姿搭配独立脚踏，让轻柔的水平律动融入客厅、卧室或阅读角。为日常休憩，留一处舒适位置。',features:['精巧座椅与独立脚踏','舒适直立坐姿','平稳的水平律动']},en:{subtitle:'Refined comfort for every day.',body:'An upright seat and separate footrest bring gentle horizontal motion to your living room, bedroom or reading corner. A considered place for everyday rest.',features:['Refined chair with a separate footrest','Comfortable upright seating','Smooth horizontal motion']}},
 {name:'RHYVIA TWO',image:'assets/two.webp',zh:{subtitle:'深度后仰，温柔承托。',body:'舒展的后仰姿态与柔软包裹感，回应一天结束后的放松需要。让轻柔律动陪你慢下来，静享属于自己的片刻。',features:['舒适的后仰姿态','全身承托设计','柔和连贯的律动体验']},en:{subtitle:'Lean back. Let go.',body:'A generous recline and a soft, enveloping feel offer a welcoming place at the end of the day. Let gentle motion slow the pace as you enjoy a moment to yourself.',features:['Comfortable reclining position','Whole-body support','Gentle, continuous motion']}},
 {name:'RHYVIA THREE',image:'assets/three.webp',zh:{subtitle:'全身舒展，宽敞自在。',body:'加长躺椅形态与全身支撑，为从容休憩留出更多空间。简洁流畅的轮廓，让舒适自然融入现代家居。',features:['加长型全身支撑','一体式扶手','便捷的侧边控制面板']},en:{subtitle:'Room to stretch. Time to rest.',body:'An extended lounge form with full-body support gives you more space to unwind. A clean, flowing silhouette makes comfort feel at home in a modern interior.',features:['Extended full-body support','Integrated armrests','Accessible side controls']}}
];
let lang = 'zh';
let storyIndex = 0;
let modeIndex = 0;
let productIndex = 0;
let storyTimer;
try { lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : (localStorage.getItem('rhyvia-language') === 'en' ? 'en' : 'zh'); } catch {}
function t(key) { return (lang === 'en' ? en : zh)[key] || zh[key] || ''; }
function renderProduct() {
 const product=products[productIndex],copy=product[lang];
 document.querySelector('#dialog-image').src=product.image;
 document.querySelector('#dialog-image').alt=product.name;
 document.querySelector('#product-dialog-title').textContent=product.name;
 document.querySelector('#product-dialog-subtitle').textContent=copy.subtitle;
 document.querySelector('#product-dialog-body').textContent=copy.body;
 document.querySelector('#product-dialog-features').replaceChildren(...copy.features.map(text=>{const item=document.createElement('li');item.textContent=text;return item;}));
}
function renderDynamic() {
 document.querySelector('#story-caption').textContent=t('storyCaption'+storyIndex);
 for(const [selector,key] of [['#mode-native','modeNative'],['#mode-title','modeTitle'],['#mode-body','modeBody']]) document.querySelector(selector).textContent=t(key+modeIndex);
 const images=['storyAlt','restAlt','threeAlt'];
 document.querySelector('#story-image').alt=t(images[storyIndex]);
 renderProduct();
}
function setLanguage(next) {
 lang=next;
 document.documentElement.lang=lang==='en'?'en':'zh-CN';
 document.querySelectorAll('[data-i18n]').forEach(el=>{el.innerHTML=t(el.dataset.i18n);});
 document.querySelectorAll('[data-alt]').forEach(el=>{el.alt=t(el.dataset.alt);});
 languageButton.textContent=lang==='en'?'中文':'EN';
 document.querySelector('.footer-language').textContent=lang==='en'?'简体中文 ↗':'ENGLISH ↗';
 document.querySelectorAll('.language').forEach(el=>el.setAttribute('aria-label',lang==='en'?'切换为中文':'Switch to English'));
 document.querySelectorAll('[data-close]').forEach(el=>el.setAttribute('aria-label',lang==='en'?'Close':'关闭'));
 document.querySelectorAll('[data-product]').forEach(el=>{if(el.classList.contains('product-image'))el.setAttribute('aria-label',(lang==='en'?'Explore ':'了解 ')+products[Number(el.dataset.product)].name);});
 document.querySelectorAll('.wordmark').forEach(el=>el.setAttribute('aria-label',lang==='en'?'RHYVIA home':'RHYVIA 首页'));
 document.querySelector('.desktop-nav').setAttribute('aria-label',lang==='en'?'Main navigation':'主导航');
 mobileNav.setAttribute('aria-label',lang==='en'?'Mobile navigation':'移动导航');
 document.querySelector('.mode-tabs').setAttribute('aria-label',lang==='en'?'Motion modes':'律动模式');
 menuButton.setAttribute('aria-label',lang==='en'?'Toggle navigation':'切换导航');
 document.title=lang==='en'?'RHYVIA — Find your rhythm. Settle into comfort.':'RHYVIA — 让身心，回到自己的节奏';
 document.querySelector('meta[name=description]').content=lang==='en'?'Gentle horizontal motion and considered support. Discover RHYVIA chairs and find your rhythm at home.':'RHYVIA 将轻柔的水平律动与舒适承托融入家居设计，为日常留一段放松时光。';
 renderDynamic();
 try{localStorage.setItem('rhyvia-language',lang);}catch{}
}
document.querySelectorAll('.language').forEach(el=>el.addEventListener('click',()=>setLanguage(lang==='zh'?'en':'zh')));
function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');header.classList.remove('menu-visible');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';mobileNav.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);header.classList.toggle('menu-visible',open);});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});
window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMenu();},{passive:true});
document.querySelectorAll('.story-trigger').forEach(button=>button.addEventListener('click',()=>{
 const next=Number(button.dataset.story);if(next===storyIndex)return;storyIndex=next;
 document.querySelectorAll('.story-trigger').forEach((trigger,i)=>{const active=i===storyIndex;trigger.setAttribute('aria-expanded',String(active));trigger.closest('.story-item').classList.toggle('is-active',active);document.getElementById(trigger.getAttribute('aria-controls')).hidden=!active;});
 const image=document.querySelector('#story-image');
 clearTimeout(storyTimer);image.style.opacity=reducedMotion.matches?'1':'.3';
 storyTimer=setTimeout(()=>{image.src=['assets/rhythm.webp','assets/rest.webp','assets/three.webp'][storyIndex];image.style.opacity='1';renderDynamic();},reducedMotion.matches?0:160);
}));
const modeButtons=[...document.querySelectorAll('[data-mode]')];
function setMode(index){modeIndex=index;modeButtons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});const panel=document.querySelector('#mode-panel');panel.setAttribute('aria-labelledby','mode-tab-'+index);renderDynamic();panel.classList.remove('fade-content');void panel.offsetWidth;panel.classList.add('fade-content');}
modeButtons.forEach((button,i)=>{button.addEventListener('click',()=>setMode(i));button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%3;if(e.key==='ArrowLeft')next=(i+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();setMode(next);modeButtons[next].focus();}});});
const productDialog=document.querySelector('#product-dialog'),bookingDialog=document.querySelector('#booking-dialog');
document.querySelectorAll('[data-product]').forEach(button=>button.addEventListener('click',()=>{productIndex=Number(button.dataset.product);renderProduct();productDialog.showModal();}));
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}));
document.querySelector('#book-open').addEventListener('click',()=>bookingDialog.showModal());
document.querySelector('#dialog-book').addEventListener('click',()=>{productDialog.close();bookingDialog.showModal();});
document.querySelector('#booking-collection').addEventListener('click',()=>bookingDialog.close());
// Reveals are progressive enhancement; content stays readable if JavaScript is unavailable.
if('IntersectionObserver' in window&&!reducedMotion.matches){document.documentElement.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
const parallaxElements=[...document.querySelectorAll('.parallax')];
let scheduled=false;
function onScroll(){scheduled=false;header.classList.toggle('is-scrolled',window.scrollY>70);if(reducedMotion.matches||window.innerWidth<=760){parallaxElements.forEach(el=>el.style.transform='');return;}parallaxElements.forEach(el=>{const rect=el.parentElement.getBoundingClientRect();if(rect.bottom>0&&rect.top<window.innerHeight){const shift=-rect.top*Number(el.dataset.depth);el.style.transform=`translate3d(0,${Math.max(-70,Math.min(70,shift))}px,0)`;}});}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(onScroll);}},{passive:true});
window.addEventListener('resize',onScroll,{passive:true});reducedMotion.addEventListener('change',onScroll);
setLanguage(lang);onScroll();
