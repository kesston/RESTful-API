const { join } = require('path');
const fs = require('fs');


//load the library
const preconditions = require("express-preconditions");


const cors = require('cors');
const range = require('express-range')
const compression = require('compression')

const { Validator, ValidationError } = require('express-json-validator-middleware')
const OpenAPIValidator = require('express-openapi-validator').OpenApiValidator;

const schemaValidator = new Validator({ allErrors: true, verbose: true });

const express = require('express')



const data = require('./zips')
const CitiesDB = require('./zipsdb')

//Load application keys
const db = CitiesDB(data);

const app = express();

// disable express
app.set("etag", false)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

// TODO 1/2 Load schemas
new OpenAPIValidator({
    apiSpec: join(__dirname, "schema", "zips.yaml")
}).install(app)
    .then(() => {

        // Start of workshop
        // TODO 2/2 Copy your routes from workshop02 here
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

        const options = {
            stateAsync: (req) => {
                const state = req.params.state
                const limit = parseInt(req.req.limit) || 10;
                const offset = parseInt(req.query.offset) || 0;
                return Promise.resolve({
                    etag: '"${state}_${offset}_${limit}"'
                })
            }
        }

        // TODO GET /api/state/:state
        app.get("/api/states/:state",
            preconditions(options),
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
                resp.set("etag")
                resp.json(result)
            }
        )
        // End of workshop 
        // proceed with the rest of our map
        app.use('schema', express.static(join(__dirname, "schema")));

        app.use((error, req, resp, next) => {

            if (error instanceof ValidationError) {
                console.error('Schema validation error: ', error)
                return resp.status(400).type('application/json').json({ error: error });
            }

            else if (error.status) {
                console.error('OpenAPI specification error: ', error)
                return resp.status(400).type('application/json').json({ error: error });
            }

            console.error('Error: ', error);
            resp.status(400).type('application/json').json({ error: error });

        });

        app.listen(3000, ()=> {
            console.info("Application started on port 3000")
        })
    }
)
.catch(error => {
    console.error("error: ", error)
})
