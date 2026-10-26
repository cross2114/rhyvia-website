(() => {
  'use strict';
  const header=document.querySelector('#header'),menu=document.querySelector('#mobile-nav'),toggle=document.querySelector('#menu-toggle');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const config=window.RHYVIA_CONFIG||{};
  const shared={skip:'Skip to content',navHome:'Home',navChairs:'Our products',navTech:'Our technology',navStory:'Our expertise',book:'Book an experience',wellnessEyebrow:'DYNAMIC WELLNESS',wellnessTitle:'Gentle motion.<em> Comfort in your rhythm.</em>',precisionTitle:'Precision in motion',precisionBody:'Smooth, continuous horizontal motion.<br>A gentle rhythm to settle into.',comfortTitle:'Comfort, made personal',comfortBody:'Choose your mode and your time.<br>Unwind in a way that feels like you.',homeTitle:'Designed for home',homeBody:'Warm materials. Considered lines.<br>Comfort that belongs in your everyday space.',ctaTitle:'Find your rhythm of comfort.',ctaBody:'Experience RHYVIA horizontal motion for yourself.<br>Explore three modes and discover your way to unwind.',footerTag:'Comfort has a rhythm.',backTop:'Back to top',footerLine:'RHYTHM · COMFORT · EVERY DAY'};
  document.querySelectorAll('[data-i18n]').forEach(el=>{if(shared[el.dataset.i18n])el.dataset.en=shared[el.dataset.i18n];});
  document.querySelectorAll('[data-en]').forEach(el=>el.dataset.zh=el.innerHTML);
  document.querySelectorAll('[data-alt-en]').forEach(el=>el.dataset.altZh=el.alt);
  let lang=window.RHYVIA_LANGUAGE.initial(),lastRequest=null,activeChannel=null;
  const copy=(zh,en)=>lang==='en'?en:zh;
  function translate(next,remember=false){
    lang=next;
    document.documentElement.lang=lang==='en'?'en':'zh-CN';
    document.querySelectorAll('[data-en]').forEach(el=>el.innerHTML=el.dataset[lang==='en'?'en':'zh']);
    document.querySelectorAll('[data-alt-en]').forEach(el=>el.alt=el.dataset[lang==='en'?'altEn':'altZh']);
    document.querySelectorAll('img[data-src-en]').forEach(el=>{
      const src=el.dataset[lang==='en'?'srcEn':'srcZh'];
      if(el.getAttribute('src')!==src)el.src=src;
    });
    document.title=document.body.dataset[lang==='en'?'titleEn':'titleZh'];
    document.querySelector('meta[name=description]').content=copy(document.title+'。探索 RHYVIA 水平律动座椅，让舒适融入日常。',document.title+'. Discover gentle horizontal motion and considered comfort for everyday life.');
    document.querySelectorAll('.language').forEach(el=>{el.textContent=el.classList.contains('footer-language')?copy('ENGLISH ↗','简体中文 ↗'):copy('EN','中文');el.setAttribute('aria-label',copy('Switch to English','切换为中文'));});
    document.querySelectorAll('.wordmark').forEach(el=>el.setAttribute('aria-label',copy('RHYVIA 首页','RHYVIA home')));
    document.querySelector('.desktop-nav').setAttribute('aria-label',copy('主导航','Main navigation'));
    menu.setAttribute('aria-label',copy('移动导航','Mobile navigation'));
    toggle.setAttribute('aria-label',copy('切换导航','Toggle navigation'));
    document.querySelectorAll('.gallery-thumbs').forEach(el=>el.setAttribute('aria-label',copy('产品图片','Product images')));
    document.querySelectorAll('.mode-tabs').forEach(el=>el.setAttribute('aria-label',copy('律动模式','Motion modes')));
    if(remember)window.RHYVIA_LANGUAGE.remember(lang);
    refreshContacts();
    if(dialog?.open)renderDialog();
  }
  function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');header.classList.remove('menu-visible');}
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);header.classList.toggle('menu-visible',open);});
  menu.querySelectorAll('a').forEach(el=>el.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});
  document.querySelectorAll('.language').forEach(el=>el.addEventListener('click',()=>translate(lang==='en'?'zh':'en',true)));
  const reveals=[...document.querySelectorAll('.reveal')];
  let observer;
  if('IntersectionObserver'in window&&!motion.matches){
    document.documentElement.classList.add('motion-ready');
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.06,rootMargin:'0px 0px -15px 0px'});
    reveals.forEach(el=>observer.observe(el));
  }
  motion.addEventListener('change',()=>{if(motion.matches){observer?.disconnect();reveals.forEach(el=>el.classList.add('is-visible'));}});
  let scheduled=false;
  function scroll(){scheduled=false;header.classList.toggle('is-scrolled',scrollY>70);}
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scroll);}},{passive:true});
  window.addEventListener('resize',()=>{if(innerWidth>760)closeMenu();scroll();},{passive:true});

  document.querySelectorAll('[data-gallery]').forEach(gallery=>{
    const photo=gallery.querySelector('.gallery-photo'),buttons=[...gallery.querySelectorAll('[data-image]')],count=gallery.querySelector('.gallery-count');
    let token=0;
    buttons.forEach((button,i)=>{
      button.addEventListener('click',()=>{
        const request=++token,preview=new Image();
        preview.onload=()=>{
          if(request!==token)return;
          photo.src=preview.src;photo.width=preview.naturalWidth;photo.height=preview.naturalHeight;
          photo.dataset.altZh=button.dataset.imageAltZh;photo.dataset.altEn=button.dataset.imageAltEn;
          photo.alt=copy(photo.dataset.altZh,photo.dataset.altEn);
          buttons.forEach((el,j)=>el.setAttribute('aria-pressed',String(j===i)));
          count.textContent=String(i+1).padStart(2,'0')+' / '+String(buttons.length).padStart(2,'0');
        };
        preview.src=button.dataset.image;
      });
      button.addEventListener('keydown',event=>{let n;if(event.key==='ArrowRight')n=(i+1)%buttons.length;if(event.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;if(event.key==='Home')n=0;if(event.key==='End')n=buttons.length-1;if(n!==undefined){event.preventDefault();buttons[n].click();buttons[n].focus();}});
    });
  });

  const dialog=document.querySelector('#contact-dialog');
  dialog?.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  function openDialog(){dialog.showModal();document.body.classList.add('dialog-open');}
  const summary=document.querySelector('#request-summary');
  const status=document.querySelector('#copy-status');
  const message=document.querySelector('#contact-message');
  const send=document.querySelector('#send-request');
  const copyButton=document.querySelector('#copy-request');
  const qr=document.querySelector('#wechat-qr');
  function refreshContacts(){
    ['whatsapp','email','wechat'].forEach(channel=>{
      const el=document.querySelector(`[data-contact-status="${channel}"]`);if(!el)return;
      const value=channel==='whatsapp'?config.whatsapp:channel==='email'?config.email:config.wechatId;
      if(value)el.textContent=value;
      else if(channel==='wechat'&&config.wechatQr){el.replaceChildren();const image=document.createElement('img');image.src=config.wechatQr;image.alt='WeChat QR';el.append(image);}
    });
  }
  function requestText(){
    if(!lastRequest)return '';
    return [copy('RHYVIA 体验预约意向','RHYVIA experience request'),copy('称呼：','Name: ')+lastRequest.name,copy('邮箱：','Email: ')+lastRequest.email,copy('产品：','Product: ')+(lastRequest.chair==='BED'?copy('RHYVIA 律动床（特别订购）','RHYVIA rhythm bed (special order)'):lastRequest.chair==='SOFA'?copy('RHYVIA 律动沙发（特别订购）','RHYVIA rhythmic sofa (special order)'):lastRequest.chair?'RHYVIA '+lastRequest.chair:copy('希望现场了解','Please help me choose')),copy('偏好日期：','Preferred date: ')+lastRequest.date,copy('偏好地点：','Preferred location: ')+lastRequest.location,lastRequest.notes?copy('备注：','Notes: ')+lastRequest.notes:'',copy('以上为预约意向，具体时间与地点请团队确认。','This is a request. Please confirm the time and location with the team.')].filter(Boolean).join('\n');
  }
  function renderDialog(){
    if(!dialog)return;
    status.textContent='';send.hidden=true;send.removeAttribute('href');qr.hidden=true;summary.hidden=!lastRequest;copyButton.hidden=!lastRequest;
    summary.value=requestText();
    let available=false;
    if(activeChannel==='whatsapp'&&config.whatsapp){send.href='https://wa.me/'+config.whatsapp.replace(/\D/g,'')+'?text='+encodeURIComponent(requestText()||copy('你好，我想预约 RHYVIA 座椅体验。','Hello, I would like to arrange a RHYVIA chair experience.'));available=true;}
    if(activeChannel==='email'&&config.email){send.href='mailto:'+config.email+'?subject='+encodeURIComponent('RHYVIA experience')+'&body='+encodeURIComponent(requestText());available=true;}
    if(activeChannel==='wechat'&&(config.wechatId||config.wechatQr)){
      if(config.wechatQr){const code=document.createElement('img');code.src=config.wechatQr;code.alt='RHYVIA WeChat QR code';qr.replaceChildren(code);qr.hidden=false;}
      message.textContent=copy('微信联系：','Find us on WeChat: ')+(config.wechatId||copy('扫描二维码联系团队。','Scan the code to contact the team.'));return;
    }
    send.hidden=!available;
    if(available)message.textContent=copy('点击下方按钮，前往对应应用联系团队。预约需由团队确认。','Continue to the relevant app to contact the team. Your booking is subject to confirmation.');
    else if(lastRequest)message.textContent=copy('预约信息已整理好，尚未发送。你可以复制保存，待联系方式开放后联系团队。','Your request is ready and has not been sent. Copy it for now, then contact the team once contact details are available.');
    else message.textContent=copy('该联系方式尚未公布。你可以先在下方填写座椅、日期和地点，整理一份预约信息。','Contact details for this channel are not available yet. You can prepare your preferred chair, date and location using the form below.');
  }
  document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{activeChannel=button.dataset.contact;renderDialog();openDialog();}));
  document.querySelectorAll('.contact-dialog .dialog-close,#dialog-done').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog?.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  const form=document.querySelector('#booking-form');
  if(form){
    const now=new Date(),date=form.elements.date;
    date.min=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    const chair=new URLSearchParams(location.search).get('chair');
    if(['ONE','TWO','THREE','BED','SOFA'].includes(chair))form.elements.chair.value=chair;
    form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;lastRequest=Object.fromEntries(new FormData(form));activeChannel=config.email?'email':config.whatsapp?'whatsapp':null;renderDialog();openDialog();});
    copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary.value);status.textContent=copy('已复制预约信息，尚未发送。','Request copied. Nothing has been sent.');}catch{summary.focus();summary.select();status.textContent=copy('请使用系统复制快捷键保存已选中的信息。','Use your system copy shortcut to copy the selected request.');}});
  }
  translate(lang);scroll();
})();
