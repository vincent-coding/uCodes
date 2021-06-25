const express = require('express'),
	  path    = require('path'),
	  fs      = require('fs'),
	  app 	  = express(),
	  port	  = 80;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
	res.render(`pages/homepage`);
});

app.get("/cheats", (req, res) => {
	let id = req.query.id;
	fs.readdir('./views/pages/cheats/', (err, count) => {
		if(id != "") {
			if(isNaN(id) == false) {
				if(id < count.length) {
					let game_info = JSON.parse(fs.readFileSync(`./views/pages/cheats/${id}/info.json`));
					let data = JSON.parse(fs.readFileSync(`./views/pages/cheats/${id}/codes.json`));
					let total_count = 0;
					for(i in data) {
						if(data[i].display == true) {
							total_count += 1;
						}
					}
					return res.render(`pages/cheatcodes`, {data: data, game_info: game_info, total_count: total_count});
				}
			}
		}
		let data = [];
		for(f in count) {
			let json_data = JSON.parse(fs.readFileSync(`./views/pages/cheats/${f}/info.json`));
			data.push(json_data);
		}
		res.render('pages/cheats', {data});
	});
});

app.get("/api", (req, res) => {
	res.render("pages/api")
});

app.get(["/api/list", "/api/game", "/api/games"], (req, res) => {
	fs.readdir('./views/pages/cheats/', (err, count) => {
		let data = [];
		for(f in count) {
			let json_data = JSON.parse(fs.readFileSync(`./views/pages/cheats/${f}/info.json`));
			data.push({
				"id": json_data['id'],
				"name": json_data['name']
			});
		}
		res.json(data);
	});
});

app.get("/api/info", (req, res) => {
	let id = req.query.id;
	fs.readdir('./views/pages/cheats/', (err, count) => {
		if(isNaN(id) == false && id != "") {
			if(id < count.length) {
				return res.json(JSON.parse(fs.readFileSync(`./views/pages/cheats/${id}/info.json`)));
			}
		}
		res.json({"Status": "Error", "info": "Please check that you have entered a valid identifier!"});
	});
});

app.get(["/api/cheat", "/api/cheats"], (req, res) => {
	let id = req.query.id;
	fs.readdir('./views/pages/cheats/', (err, count) => {
		if(isNaN(id) == false && id != "") {
			if(id < count.length) {
				return res.json(JSON.parse(fs.readFileSync(`./views/pages/cheats/${id}/codes.json`)));
			}
		}
		res.json({"Status": "Error", "info": "Please check that you have entered a valid identifier!"});
	});
});


app.listen(port, () => {
	console.log(`Started on port ${port}!`);
});
