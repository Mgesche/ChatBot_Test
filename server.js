var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var MESSAGES_COLLECTION = "messages";
var PLATS_COLLECTION = "plats";
var PLATS_COLLECTION = "plats";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/plats"
 *    GET: recupere tout les plats
 */
app.get("/plats", function(req, res) {
  db.collection(PLATS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Echec pour recuperer les plats.");
    } else {
      res.status(200).json(docs);
    }
  });
});

/*  "/plats_Random"
 *    GET: Renvois un plat au hasard
 */
app.get("/plats_Random", function(req, res) {
  db.collection(PLATS_COLLECTION).find({}).aggregate({$sample:{size: 1}}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Echec pour recuperer les plats.");
    } else {
      res.status(200).json(docs);
    }
  });
});

/*  "/plats_7Days"
 *    GET: Renvois les plats non mangés lors des 7 derniers jours
 */
app.get("/plats_7Days", function(req, res) {

  /* Calcul des 7 derniers jours */
  var date = new Date();
  var dateInt;
  date.setDate(date.getDate() - 7);
  dateInt = date.getFullYear()*10000+date.getMonth()*100+date.getDate();

  db.collection(PLATS_COLLECTION).find({"Repas.Jour":{$lt:dateInt}}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Echec pour recuperer les plats.");
    } else {
      res.status(200).json(docs);
    }
  });
});

/*  "/contactBot"
 *    POST : Stocke la question du chatbot
 */
app.post("/contactBot", function(req, res) {

  console.log("Appel contactBot");

  /* Sauvegarde de la query */
  var newMessage = req.body;
  console.log(newMessage);

  /*
  db.collection(MESSAGES_COLLECTION).insertOne(newMessage, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new message.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
  */

  /* Reponse */
  var intentName = newMessage.result.metadata.intentName;
  console.log(intentName);
  var reponse;

  switch (intentName) {
    case "Qu'est ce qu'on mange ?":
      var date = newMessage.result.parameters.date;
      reponse = QuEstCeQuOnMange(date);
      break; 
    default: 
      reponse = "Je n'ai pas compris ce que vous demandiez";
  };

  console.log(reponse);

  res.send(
    {"messages": [
      {
        "speech": reponse,
        "type": 0
      }
    ]}
  );

});

/* https://mysterious-journey-93631.herokuapp.com/plats_7Days */

/* ***** */
/* Plats */
/* ***** */
function Plat_GetOne() {
  var plat = db.collection(PLATS_COLLECTION).findOne();
  return plat;
}


/* ******* */
/* Intents */
/* ******* */

/* Qu'est ce qu'on mange ? */
function QuEstCeQuOnMange(date) {
  var reponse;
  //reponse = "Je propose de ne pas manger le "+date;
  reponse = Plat_GetOne();
  return reponse;
}