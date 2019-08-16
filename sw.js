// Service Worker
//
// This file allows `privatesuitemag.com` to be viewed offline until a better connection is available
//

const CACHE_NAME = "privatesuite-cache-v1";
var urlsToCache = [

	"/",
	"/manifest.json",
	"/css/app.css",
	"/js/app.js",
	
	"/img/favicon.png",
	"/img/logo_wordmark_blk.svg",
	"/img/social/discord.svg",
	"/img/social/twitter.svg",
	"/img/social/youtube.svg",
	
	"/views/about.ejs",
	"/views/contact.ejs",
	"/views/index.ejs",
	"/views/issue.ejs",
	"/views/issues.ejs",
	"/views/post.ejs",
	"/views/privacy.ejs",
	"/views/section.ejs",
	"/views/sections.ejs",
	"/views/thanks.ejs",
	"/views/include/comments.ejs",
	"/views/include/footer.ejs",
	"/views/include/menu.ejs"

]

self.addEventListener("install", event => {

	event.waitUntil(caches.open(CACHE_NAME).then(cache => {
	
		console.log("Opened cache");
    	return cache.addAll(urlsToCache);
	
	}));

});

self.addEventListener("fetch", event => {

	event.respondWith(caches.match(event.request).then(response => {

		if (!navigator.onLine && response) {
		
			return response;
		
		}
		
		return fetch(event.request);
	
	}));

});
