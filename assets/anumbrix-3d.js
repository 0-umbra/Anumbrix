/* ANUMBRIX cinematic 3D background controller */
(function(){
  'use strict';
  var video=document.getElementById('ab3dBackground');
  if(!video) return;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  function play(){var p=video.play(); if(p&&p.catch)p.catch(function(){});}
  video.addEventListener('canplay',play,{once:true});
  document.addEventListener('visibilitychange',function(){
    if(document.hidden) video.pause(); else play();
  });
  // Small parallax response on desktop/tablet; no expensive transforms on mobile.
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;
  if(!reduce&&!touch){
    var raf=0,x=50,y=50;
    window.addEventListener('pointermove',function(e){
      x=50+(e.clientX/window.innerWidth-.5)*2.2;
      y=50+(e.clientY/window.innerHeight-.5)*2.2;
      if(raf)return;
      raf=requestAnimationFrame(function(){
        video.style.objectPosition=x+'% '+y+'%';
        raf=0;
      });
    },{passive:true});
  }
})();
