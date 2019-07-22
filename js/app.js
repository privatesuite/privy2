const API_ROOT = `https://${location.hostname}/api`;

const routes = {

	"/": {

		view: "index.ejs"

	},

	"/about": {

		view: "about.ejs"

	},

	"/privacy": {

		view: "privacy.ejs"

	},

	"/post/*": {

		view: "post.ejs"

	}

}

const cache = {}

// View

function slugify (slug) {

	return slug.replace(/ /g, "_").toLowerCase();

}

function deslugify (slug) {

	return decodeURIComponent(slug.replace(/_/g, " "));

}

// Comments

// const comments = {

// 	sendComment (data) {

// 		fetch("https://localhost/api/comments/add", {

// 			method: "post",

// 			headers: {

// 				"Content-Type": "application/json"

// 			},

// 			body: JSON.stringify(data)

// 		});

// 	}

// } 

async function render (view, data) {

	data = {

		...data,
		render,

		currentRoute,
		API_ROOT,
		
		capitalize (text) {

			return text[0].toUpperCase() + text.slice(1);

		},

		escapeHTML (string) {
			
			let pre = document.createElement("pre");
			let text = document.createTextNode(string);
			pre.appendChild(text);
			return pre.innerHTML;
		
		},

		async comments (element) {
		
			return (await (await fetch(`${API_ROOT}/elements`)).json()).filter(_ => _.template.indexOf("comment") !== -1 && _.fields.element === element);

		},

		async profile (title) {

			return ((await (await fetch(`${API_ROOT}/elements`)).json()).find(_ => _.template === "p3ebkzveeof" && _.fields.title === title) || {fields: {}}).fields;

		},

		async fetchElement (title) {

			var json = await (await fetch(`${API_ROOT}/elements`)).json();
			var element = json.find(_ => _.fields.title.toLowerCase() === title);

			element.fields._parent = element;

			return element.fields;

		},

		async fetchPost (slug) {

			var json = await (await fetch(`${API_ROOT}/elements`)).json();
			var element = json.find(_ => _.fields.title.toLowerCase() === deslugify(slug));

			element.fields._parent = element;

			return element.fields;

		},

		file (path) {

			return `${API_ROOT}/file/${path}`;

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

	} else {

		location.hash = "#/";

	}

}

function main () {

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
