// Init des objets necessaires
var restify = require('restify'); 
var builder = require('botbuilder'); 

// Parametrage du serveur Restify
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

// Creation du chat bot
var connector = new builder.ChatConnector
({ appId: 'YourAppId', appPassword: 'YourAppPassword' }); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Creation des dialogues du bot
bot.dialog('/', function (session) {
    session.send("Hello World");
});