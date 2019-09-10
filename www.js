auto(["/", "/index.html", "/css/(.*)", "/img/(.*)", "/js/(.*)", "/less/(.*)", "/views/(.*)"]);

get("/about", (req, res) => {

	res.file("index.html");

});

