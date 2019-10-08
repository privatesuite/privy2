const API_ROOT = `https://${location.hostname}/api`;
const PODCAST_EPISODES = "https://shows.pippa.io/api/shows/5d9c8ccb34dfd91e4010ff4f/episodes?results=10000";

const routes = {

	"/": {

		view: "index.ejs"

	},

	"/about": {

		view: "about.ejs"

	},

	"/contact": {

		view: "contact.ejs"

	},

	"/thanks": {

		view: "thanks.ejs"

	},

	"/privacy": {

		view: "privacy.ejs"

	},

	"/podcast": {

		view: "podcast.ejs"

	},

	"/podcast/*": {

		view: "podcast_listen.ejs"

	},

	"/post/*": {

		view: "post.ejs"

	},

	"/issue/*": {

		view: "issue.ejs"

	},

	"/section/*": {

		view: "section.ejs"

	},

	"/issues": {

		view: "issues.ejs"

	},

	"/sections": {

		view: "sections.ejs"

	},

	"/404": {

		view: "404.ejs"

	}

}

let elements;
const cache = {};
let podcastCache = [];

// View

function slugify (slug) {

	return slug.replace(/ /g, "_").replace(/\//g, "%2f")/*.replace(/\?/g, "%3f")*/.toLowerCase();

}

function deslugify (slug) {

	return decodeURIComponent(slug.replace(/_/g, " ").replace(/%2f/g, "/"))/*.replace(/%3f/g, "?")*/;

}

const PAGE_TEMPLATE = "hzay9p5isjp";
const POST_TEMPLATE = "yblghp0xq2";
const PROFILE_TEMPLATE = "p3ebkzveeof";

async function render (view, data) {

	data = {

		...data,
		render,

		currentRoute,
		API_ROOT,

		slugify,
		
		default_image: "https://icon2.kisspng.com/20180411/ksq/kisspng-vaporwave-statue-aesthetics-seapunk-art-statue-of-liberty-5acdd5c454c0c2.4795892315234390443472.jpg",

		async podcastEpisodes () {

			if (podcastCache.length === 0) podcastCache = (await (await fetch(PODCAST_EPISODES)).json()).results;
			
			return podcastCache;
			
		},

		async podcastEpisode (id) {

			const episodes = await this.podcastEpisodes();

			return episodes.find(_ => _.audio.filename.replace(".mp3", "").split("/")[1] === id);
			
		},

		trim (text, max) {

			if (text.length > max) {
		
				return text.slice(0, max - 3) + "...";
				
			} else return text;
		
		},		

		capitalize (text) {

			return text[0].toUpperCase() + text.slice(1);

		},

		escapeHTML (string) {
			
			let pre = document.createElement("pre");
			let text = document.createTextNode(string);
			pre.appendChild(text);
			return pre.innerHTML;
		
		},

		removeHTMLTags (string) {
			
			return string.replace(/<\/?[^>]+(>|$)/g, "");

		},

		async comments (element) {
		
			return elements.filter(_ => _.template.indexOf("comment") !== -1 && _.fields.element === element);

		},

		async allProfiles () {

			return elements.filter(_ => _.template === PROFILE_TEMPLATE).map(_ => _.fields);

		},

		async profile (title) {

			return (elements.find(_ => _.template === PROFILE_TEMPLATE && _.fields.title === title) || {fields: {}}).fields;

		},

		async allPosts () {

			return elements.filter(_ => _.template === POST_TEMPLATE);

		},

		async postsFromSection (section) {

			return (await this.allPosts()).filter(_ => _.fields.category.split(",").map(_ => _.trim())[0] === section).map(_ => {

				_.fields._parent = _;
				return _.fields;

			});

		},

		async fetchElement (title) {

			var element = elements.find(_ => _.fields.title.toLowerCase() === title);

			element.fields._parent = element;

			return element.fields;

		},

		async fetchPost (slug) {

			var element = elements.find(_ => _.fields.title.toLowerCase() === deslugify(slug));

			element.fields._parent = element;

			return element.fields;

		},

		file (path) {

			return `${API_ROOT}/file/${path}`;

		},

		async issues () {

			return elements.filter(_ => _.template === PAGE_TEMPLATE && _.fields.title.indexOf("Issue") !== -1).map(_ => {

				_.fields._parent = _;
				return _.fields;

			});

		},

		async issue (num) {

			return (await this.issues()).find(_ => _.title.startsWith(`Issue ${num}`));

		},

		async sections (num) {

			return new Set((await this.allPosts()).filter(_ => !!_.fields.category).map(_ => _.fields.category.split(",")[0]));

		}

	}

	var view_data = cache[view] || await (await fetch(`/views/${view}`)).text();

	cache[view] = view_data;

	return ejs.render(view_data, data, {

		async: true

	});

}

// Router

function currentRoute () {

	if (location.pathname.replace("/", "")) return location.pathname + ((!location.search && location.href.indexOf("?") !== -1) ? "?" : location.search);
	else return location.hash.replace("#", "") ? (location.hash.replace("#", "").endsWith("/") && location.hash.replace("#", "").length > 3 ? location.hash.replace("#", "").slice(0, -1) : location.hash.replace("#", "")) : "/";

}

// All together now

function currentRouteData () {

	// Checks if currentRoute is equal to any routes
	// Also checks if a route ends with * and that the route it is compared too matches the beginning of the route (eg. /post/* and /post/potatoes_are_tasty)
	for (const route of Object.keys(routes)) if (route === currentRoute() || (route.endsWith("*") && currentRoute().startsWith(route.slice(0, route.length - 1)))) return routes[route];

}

async function load () {

	console.log(`On ${currentRoute()}`);

	if (currentRouteData()) {

		try {

			document.title = "Private Suite Magazine";
			document.body.innerHTML = await render(currentRouteData().view);

		} catch (e) {

			document.body.innerHTML = await render("404.ejs");
			throw e;

		}

	} else {

		// location.hash = "#/404";

		document.body.innerHTML = await render("404.ejs");

		console.log("Invalid page.");

	}

	for (const script of document.body.querySelectorAll("script")) {

		const s = document.createElement("script");

		s.src = script.src;
		s.innerHTML = script.innerHTML;

		script.parentElement.appendChild(s);
		script.remove();

	}

}

async function main () {

	// if (!localStorage.getItem("elements")) {
		
	// 	console.log("Loading from API...");

	// 	elements = (await (await fetch(`${API_ROOT}/elements`)).json());
	// 	localStorage.setItem("elements", LZString.compress(JSON.stringify(elements)));

	// } else {

	// 	console.log("Loading from cache...");

	// 	elements = JSON.parse(LZString.decompress(localStorage.getItem("elements")));

	// 	fetch(`${API_ROOT}/elements`).then(async res => {

	// 		console.log("Updating cache...");

	// 		elements = await res.json();
	// 		localStorage.setItem("elements", LZString.compress(JSON.stringify(elements)));

	// 	});

	// }

	elements = (await (await fetch(`${API_ROOT}/elements`)).json());

	// setTimeout(load, 10);
	load();

	window.onpopstate = load;

	document.addEventListener("click", event => {

		if (!event.target) return;

		const a = event.target.href ? event.target : event.target.closest("a[href]");

		if (a && a.href && (a.href.startsWith("/") || a.href.indexOf(location.origin) !== -1)) {

			history.pushState(null, null, a.href);
			load();

			event.preventDefault();
			return false;

		}

		if (event.target.parentElement && event.target.parentElement.classList.contains("dots")) {

			const index = [...event.target.parentElement.children].indexOf(event.target);

			event.target.parentElement.querySelector(".selected").classList.remove("selected");
			event.target.classList.add("selected");

			event.target.parentElement.parentElement.querySelector(".current_slide").classList.remove("current_slide");
			event.target.parentElement.parentElement.children[index].classList.add("current_slide");

		}

	});

	window.addEventListener("hashchange", load);

}

main();
