/* Lightweight privacy shield: stub common trackers to no-op so app code won’t error if network is blocked. */
(function(){
  try {
    var noop = function(){return undefined;};
    var noopp = function(){ return Promise.resolve(); };

    // Google Analytics / gtag / dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ try { window.dataLayer.push(arguments); } catch(_) {} };
    window.ga = function(){ /* ga() no-op */ };
    window.ga.getAll = function(){ return []; };

    // Google Tag Manager
    window.google_tag_manager = window.google_tag_manager || {};

    // Facebook Pixel
    var fbq = function(){ /* pixel no-op */ };
    fbq.callMethod = fbq;
    fbq.push = function(){};
    fbq.loaded = true; fbq.version = '0.0.0'; fbq.queue = [];
    window.fbq = fbq;

    // Segment
    var analytics = window.analytics || [];
    var stubbed = [
      'track','page','identify','group','ready','alias','debug','timeout','reset','screen','once','off','on','user','traits','enabled','initialize'
    ];
    stubbed.forEach(function(method){ analytics[method] = noopp; });
    analytics.load = noop; analytics.page = noopp; analytics.track = noopp;
    window.analytics = analytics;

    // Mixpanel
    window.mixpanel = window.mixpanel || {
      init: noop, track: noop, identify: noop, people: { set: noop, set_once: noop }, register: noop, unregister: noop
    };

    // Hotjar
    window.hj = window.hj || function(){ (window.hj.q = window.hj.q || []).push(arguments); };
    window._hjSettings = window._hjSettings || { hjid: null, hjsv: null };

    // Microsoft Clarity
    window.clarity = window.clarity || noop;

    // Plausible
    window.plausible = window.plausible || noop;

    // Umami
    window.umami = window.umami || noop;

    // Matomo
    window._paq = window._paq || []; // keep as array, but won’t send anywhere

    // Heap
    window.heap = window.heap || { track: noop, identify: noop, addUserProperties: noop };

    // Amplitude
    window.amplitude = window.amplitude || {
      getInstance: function(){ return { init: noop, logEvent: noop, setUserId: noop, identify: noop }; }
    };

    // Cloudflare Analytics placeholder
    window.__cfBeacon = window.__cfBeacon || {};
  } catch (e) {
    // swallow any issues to avoid breaking page
  }
})();
