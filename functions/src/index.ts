import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const cors = require('cors')({ origin: true });
const dialogflow = require('dialogflow');
const { WebhookClient, Card } = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'ws://chatbot-1-13fa1.firebaseio.com/',
});
const client = new dialogflow.v2.SessionsClient({
    // optional auth parameters.
});

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

export const dialogflowGateway = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });

    cors(request, response, async () => {
        const { queryInput, sessionId } = request.body;

        const formattedSession = client.sessionPath('chatbot-1-13fa1', sessionId);
        const parameters = {
            session: formattedSession,
            queryInput: queryInput,
        };

        client.detectIntent(parameters)
            .then((result: any[]) => {
                const resultado = result[0];
                response.status(200).send(resultado);
            })
            .catch((err: any) => {
                console.error(err);
            });
    })

});

export const dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request: request, response: response });

    const db = admin.firestore();
    const email = request.body.queryResult.parameters['email'];

    const getPersona = () => {
        const personaRead = db.collection('personas').where('email', '==', email).get();

        return personaRead.then((snapshot: any) => {
            agent.add('La información que he encontrado es la siguiente: ');

            snapshot.forEach((doc: any) => {
                const data = doc.data();
                agent.add(new Card({
                    title: data.nombre + " " + data.apellido,
                    imageUrl: data.imageUrl,
                    text: data.email + '\n' + data.fechaNacimiento,
                    // buttonText: 'This is a button',
                    // buttonUrl: 'https://assistant.google.com/'
                }))
            });

        }).catch((err: any) => {
            console.log('Error al obtener el documento', err);
        });
    };

    const intentMap = new Map();
    intentMap.set('GetInfo.Persona', getPersona);
    agent.handleRequest(intentMap);

});

