const range = require('express-range')
const compression = require('compression')
const cors = require("cors") 

const express = require('express')

const data = require('./zips')
const CitiesDB = require('./zipsdb')

//Load application keys
const db = CitiesDB(data);

const app = express();

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

// Mandatory workshop
// TODO GET /api/states
app.get("/api/states",
	(req, resp) => { // handler 
		const result = db.findAllStates()
		// status code
		resp.status(200)
		// set Content-Type
		resp.type("application/json")
		resp.set("X-generated-on", (new Date()).toLocaleDateString())
		resp.json(result)
	}
)

// TODO GET /api/state/:state
app.get("/api/states/:state",
	(req, resp) => {
		const state = req.params.state
		const limit = parselnt(req.query.limit) || 10;
		const offset = parseInt(req.query.offset) || 0;
		const result = db.findCitiesByState(state,
			{ offset, limit })
		resp.status(200);
		resp.type("application/json")
		resp.json(result)
	}
)

// TODO DELETE /api/city/:name

// TODO GET /api/city/:cityId


// TODO POST /api/city
app.post(
	"/api/city",
	(req, resp) => {
		const body = req.body;
		if (db.validateForm(body)) {
			resp.status(400)
			resp.type("application/json")
			resp.json({ "message": "imcomplete form" })
			return
		}
		db.insertCity(body)
		resp.status(201)
		resp.type("application/json")
		resp.json({ message: "created" })
	}
)

// Optional workshop
// TODO HEAD /api/state/:state
// IMPORTANT: HEAD must be place before GET for the
// same resource. Otherwise the GET handler will be invoked


// TODO GET /state/:state/count
app.get("api/state/:state/count",
	(req, resp) => {
		const state = req.params.state
		const count = db.countCitiesInState(state)
		const result = {
			state: state,
			numOfCities: count,
			timestamp: (new Date()).toLocaleDateString()
		}
		resp.status(200);
		resp.type("appliccation/json")
		resp.json(result)
	}
)

// TODO GET /api/city/:name
app.get("/api/city/:name",
	(req, resp) => {
		const state = req.params.state
		const result = db.findCitiesByName
		resp.status(200);
		resp.type("application/json")
		resp.json(result)
	}
)

// End of workshop

const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;
app.listen(PORT, () => {
	console.info(`Application started on port ${PORT} at ${new Date()}`);
});
