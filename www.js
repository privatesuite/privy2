auto(["/", "/index.html", "/css/(.*)", "/img/(.*)", "/js/(.*)", "/less/(.*)", "/views/(.*)"]);

get("/about", (req, res) => {

	res.writeHead(200, {});

	res.file("index.html");

});

