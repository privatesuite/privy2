auto(["/", "/index.html", "/sw.js", "/manifest.json", "/css/(.*)", "/img/(.*)", "/js/(.*)", "/less/(.*)", "/views/(.*)"]);

get("/(about|contact|thanks|privacy|issues|sections)", (req, res) => {

	res.file("index.html");

});

get("/(post|issue|section)/(.*)", (req, res) => {

	res.file("index.html");

});

get("/(.*)", (req, res) => {

	res.file("index.html");

});
