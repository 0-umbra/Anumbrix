/* ANUMBRIX Cinematic 3D background — performance edition */
(function(){
  'use strict';
  var video=document.getElementById('ab3dBackground');
  if(!video) return;

  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ video.removeAttribute('autoplay'); return; }

  var coarse=window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
  var narrow=window.innerWidth <= 900;
  var cores=navigator.hardwareConcurrency || 4;
  var saveData=navigator.connection && navigator.connection.saveData;
  var lowPower=coarse || narrow || cores <= 4 || saveData;
  var src=lowPower ? video.dataset.mobileSrc : video.dataset.desktopSrc;
  if(!src) return;

  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.src=src;
  video.load();

  function play(){
    var p=video.play();
    if(p && p.catch) p.catch(function(){});
  }
  video.addEventListener('canplay',play,{once:true});
  document.addEventListener('visibilitychange',function(){
    if(document.hidden) video.pause();
    else if(document.visibilityState==='visible') play();
  });

  /* No pointer-driven video repositioning: changing object-position every frame
     causes extra compositing work on phones and low-power GPUs. */
})();
