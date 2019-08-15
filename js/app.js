const API_ROOT = `https://${location.hostname}/api`;

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

	}

}

let elements;
const cache = {}

// View

function slugify (slug) {

	return slug.replace(/ /g, "_").replace(/\//g, "%2f").toLowerCase();

}

function deslugify (slug) {

	return decodeURIComponent(slug.replace(/_/g, " ").replace(/%2f/g, "/"));

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

	return location.hash.replace("#", "") ? location.hash.replace("#", "") : "/";

}

// All together now

function currentRouteData () {

	// Checks if currentRoute is equal to any routes
	// Also checks if a route ends with * and that the route it is compared too matches the beginning of the route (eg. /post/* and /post/potatoes_are_tasty)
	for (const route of Object.keys(routes)) if (route === currentRoute() || (route.endsWith("*") && currentRoute().startsWith(route.slice(0, route.length - 1)))) return routes[route];

}

async function load () {

	if (currentRouteData()) {

		document.body.innerHTML = await render(currentRouteData().view);
		
		for (const script of document.body.querySelectorAll("script")) {

			const s = document.createElement("script");

			s.src = script.src;

			script.parentElement.appendChild(s);
			script.remove();

		}

	} else {

		location.hash = "#/";
		console.log("Invalid page.");

	}

}

async function main () {

	elements = (await (await fetch(`${API_ROOT}/elements`)).json());

	load();

	document.addEventListener("click", event => {

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
