let compression = require('compression');

const express = require('express'),
	  path    = require('path'),
	  fs      = require('fs'),
	  app 	  = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

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

					let showcode = null;

					if("showcode" in req.query) {
						let data_showcode = req.query.showcode;
						if(data_showcode != "") {
							if(!isNaN(data_showcode)) {
								try {
									if(data[data_showcode].display == true) {
										showcode = data_showcode;
									}
								} catch {
									showcode = null;
								}
							}
						}
					}

					if("search" in req.query) {
						let search = req.query.search;
						if(search != "") {
							let newData = [];
							found = 0;
							for(i in data) {
								if(data[i].title.toLowerCase().includes(search.toLowerCase())) {
									if(data[i].display == true) {
										newData.push(data[i]);
										found += 1;
									}
								}
							}
							return res.render(`pages/cheatcodes`, {data: newData, game_info: game_info, total_count: total_count, search: search,found: found, showcode: showcode});
						}
					}

					return res.render(`pages/cheatcodes`, {data: data, game_info: game_info, total_count: total_count, search: null,found: null, showcode: showcode});
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

app.get(["/api/cheatinfo", "/api/cheatsinfo"], (req, res) => {
	let gid = req.query.gid;
	let cid = req.query.cid;
	if(gid == "" || isNaN(gid)) {return res.json({"Status": "Error", "info": "Please check that you have entered a valid GID (Game ID!"});}
	if(cid == "" || isNaN(cid)) {return res.json({"Status": "Error", "info": "Please check that you have entered a valid CID (Cheat ID)!"});}
	fs.readdir('./views/pages/cheats', (err, count) => {
		if(gid < count.length) {
			json = JSON.parse(fs.readFileSync(`./views/pages/cheats/${gid}/codes.json`));
			if(!json[cid]) {return res.json({"Status": "Error", "info": "Unknown cheat code"});}
			return res.json(json[cid]);
		} else {return res.json({"Status": "Error", "info": "Unknown games"});}
	});
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server is running...`);
});