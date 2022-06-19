/*
Example game library management API with request parsing and validation with Joi.
*/

import express from "express";
import bodyParser from "body-parser"; // Requires installing separately (convention from older versions of express)
import Joi from "joi";

const app = express();

// Set up body parser
const jsonParser = bodyParser.json();
// Or, we can set up JSON middleware to handle JSON request bodies without a parser (newer, neater).
app.use(express.json());

app.get("/", (req, res) => {
  /*
    Health check endpoint.
    */
  res.send("Hello World!");
});

// app.post("/echo", jsonParser, (req, res) => { // how to use the jsonParser
app.post("/api/echo", (req, res) => {
  // what you can access from the request
  res.json([
    req.params, // req.params will be undefined unless you add specific expected params in the route with : (example below)
    req.query, // But we can get arbitrary request params (?key=value) from here
    req.body, // Will be undefined unless we set up JSON middleware or use jsonParser
  ]);
});

// route params allow us to pull params from the request url
app.get("/api/games/:title/:publisher", (req, res) => {
  res.send(req.params);
});

const games: Array<object> = [
  {
    id: 1,
    title: "Super Mario World",
  },
  {
    id: 2,
    title: "Zelda: Ocarina of Time",
  },
  {
    id: 3,
    title: "Grand Theft Auto V",
  },
];

// Sending something from within the API
app.get("/api/games", (req, res) => {
  // Set custom status code with response
  res.status(201).send(games);
});

// Example error response
app.get("/api/dosomethingwrong", (req, res) => {
  // Set custom status code with response
  res.status(400).send("Not allowed.");
});

// Joi request schema
const gameSchema: Joi.Schema = Joi.object({
  id: Joi.number().min(0).required(),
  title: Joi.string()
    // .alphanum() // only alphanumeric characters (Does not allow whitespace)
    .regex(/^\w+(?:\s+\w+)*$/) // Alphanum with whitespaces.
    .min(3)
    .max(30)
    .required(),
});

// add a game
app.post("/api/games", (req, res) => {
  const game: Object = {
    id: games.length + 1,
    title: req.body.title,
  };
  // Validate request body
  const { error, value } = gameSchema.validate(game);
  if (error) {
    res.status(400).send(error.details[0].message);
  } else {
    console.log(value); // value is the validated game object
    games.push(game);
    res.send(game);
  }
  // Of course you could validate params etc. in the same way, all at once, against your schema.
});

function cheatCode(userInput: string | Number): string {
  // Just demonstrating typing with ts

  if (typeof userInput === "string") {
    if (userInput === "GiveMeSomething") {
      const reward: Number = Math.random() * 10000;
      return `Cheat code correct. You won ${reward} dollars!`;
    } else {
      return `Cheat code ${userInput} not recognized.`;
    }
  } else if (typeof userInput === "number") {
    return `You entered ${userInput}, so you win ${userInput} dollars!`;
  } else{
    return "Invalid cheat code.";
  }
}

const cheatCodeSchema: Joi.Schema = Joi.object({
  cheatCode: Joi
    .string()
    .alphanum()
    .required()
    .min(3)
    .max(20)
});

app.post("/api/cheat", (req, res) => {
  const userInput: string | Number = req.body.cheatCode;
  // const { error, value } = cheatCodeSchema.validate(userInput); // For some reason can't get this to work yet.
  // if(error){
  //   res.status(400).send(error.details[0].message);
  // } else {
  //   //console.log(value); // value is the validated cheat code
  //   const result = cheatCode(userInput);
  //   res.send(result);
  // }
  const result = cheatCode(userInput);
  res.send(result);
});

// Start
const port = process.env.port || 3000; // Set port with env variable PORT
app.listen(port, () => console.log("Example app listening on port 3000!"));
