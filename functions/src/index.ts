import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const cors = require('cors')({ origin: true });
const dialogflow = require('dialogflow');
const client = new dialogflow.v2.SessionsClient({
    // optional auth parameters.
});


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
