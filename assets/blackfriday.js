/* Black Friday 2026 — akcijske cene veljajo samo 23.–29. 11. 2026 (Europe/Ljubljana) */
(function(){
  var FROM="2026-11-23", TO="2026-11-29";
  var DICT={
    sl:{brow:"Korekcija + barvanje obrvi", note:"Akcija 23.–29. 11."},
    en:{brow:"Brow shaping + tinting", note:"Offer 23–29 Nov"},
    ru:{brow:"Коррекция + окрашивание бровей", note:"Акция 23–29.11"},
    uk:{brow:"Корекція + фарбування брів", note:"Акція 23–29.11"}
  };
  function noteText(l){ return (DICT[l]||DICT.sl).note; }
  function isoToday(){
    try{ return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Ljubljana",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()); }
    catch(e){ return ""; }
  }
  function lang(){
    var l=(document.documentElement.lang||"sl").slice(0,2);
    return DICT[l]?l:"sl";
  }
  var today=isoToday();
  var active=!!today && today>=FROM && today<=TO;
  window.BF_ACTIVE=active;
  window.BF_RANGE={from:FROM,to:TO};

  function note(){
    var n=document.createElement("span");
    n.className="bf-note"; n.textContent=noteText(lang());
    return n;
  }

  function badge(){
    var b=document.createElement("span");
    b.className="bf-badge"; b.textContent="Black Friday";
    return b;
  }

  function apply(){
    if(!active) return;
    document.querySelectorAll("[data-bf-price]").forEach(function(el){
      var oldP=el.getAttribute("data-bf-old"), newP=el.getAttribute("data-bf-new");
      if(!newP) return;
      el.innerHTML="";
      if(oldP){ var s=document.createElement("s"); s.className="bf-old"; s.textContent=oldP; el.appendChild(s); }
      var b=document.createElement("b"); b.className="bf-new"; b.textContent=newP; el.appendChild(b);
    });
    document.querySelectorAll("[data-bf-title]").forEach(function(el){
      if(!el.hasAttribute("data-bf-i18n")) el.setAttribute("data-bf-i18n", el.getAttribute("data-i18n")||"");
      el.removeAttribute("data-i18n");
      var v=DICT[lang()][el.getAttribute("data-bf-title")];
      if(v) el.textContent=v;
    });
    document.querySelectorAll("[data-bf-card]").forEach(function(card){
      var box=card.querySelector(".bpricebox")||card;
      if(!card.querySelector(".bf-badge")) box.insertBefore(badge(), box.firstChild);
      var old=card.querySelector(".bf-note");
      if(old) old.parentNode.removeChild(old);
      var pr=card.querySelector(".bcard-p");
      if(pr && pr.parentNode) pr.parentNode.insertBefore(note(), pr.nextSibling);
      else box.appendChild(note());
    });
  }

  window.BF_BADGE=badge;
  window.BF_NOTE=noteText;
  window.BF_APPLY=apply;
  if(active){
    apply();
    document.addEventListener("click", function(e){
      var t=e.target.closest?e.target.closest(".lang button,.lang a"):null;
      if(t) setTimeout(apply,0);
    });
  }
})();
