const CACHE='routine-v2';
const ASSETS=['./', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(a=>c.add(a)))));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){e.respondWith(caches.match('./').then(r=>r||fetch(e.request)));return;}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list)if('focus' in c)return c.focus();
    if(clients.openWindow)return clients.openWindow('./');
  }));
});

// Wired up for future Supabase push messages
self.addEventListener('push',e=>{
  if(!e.data)return;
  const d=e.data.json();
  e.waitUntil(self.registration.showNotification(d.title||'RouTine',{
    body:d.body||'',icon:'./icon-192.png',badge:'./icon-192.png',
    tag:d.tag||'routine',vibrate:[200,100,200]
  }));
});
