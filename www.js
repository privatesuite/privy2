auto(["/", "/index.html", "sw.js", "manifest.json", "/css/(.*)", "/img/(.*)", "/js/(.*)", "/less/(.*)", "/views/(.*)"]);

get("/about", (req, res) => {

	res.file("index.html");

});

