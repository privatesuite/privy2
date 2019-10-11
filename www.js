auto(["/", "/index.html", "/sw.js", "/manifest.json", "/css/(.*)", "/img/(.*)", "/js/(.*)", "/less/(.*)", "/views/(.*)"]);

get("/(about|contact|thanks|privacy|issues|sections|podcast)", (req, res) => {

	res.file("index.html");

});

get("/(post|issue|section|podcast)/(.*)", (req, res) => {

	res.file("index.html");

});

get("/(.*)", (req, res) => {

	res.status(404);
	res.file("index.html");

});
