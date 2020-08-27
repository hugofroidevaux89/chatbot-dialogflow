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
    const queryResult = request.body.queryResult;

    const getPersona = () => {
        const personaRead = db.collection('personas').where('email', '==', queryResult.parameters['email']).get();

        return personaRead.then((snapshot: any) => {
            agent.add('La información que he encontrado es la siguiente: ');

            snapshot.forEach((doc: any) => {
                const data = doc.data();
                agent.add(new Card({
                    title: data.displayName,
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

    const createPersona = () => {

        const data = {
            displayName: queryResult.parameters['displayName'],
            fechaNacimiento: queryResult.parameters['fechaNacimiento'],
            email: queryResult.parameters['email'],
            imageUrl: queryResult.parameters['imageUrl'] ?? '',
            debePrimeraEntrega: queryResult.parameters['debePrimeraEntrega'] ?? true,
        }

        console.log('data: ', data);

        const personaCreate = db.collection('personas').doc(queryResult.parameters['email']).set(data);

        return personaCreate.then((snapshot: any) => {
            agent.add(data.displayName + ' está ahora en la lista de deudores.');
        }).catch((err: any) => {
            console.log('Error al crear el documento', err);
        });
    };

    const cumpleProximo = () => {
        const personaRead = db.collection('personas').orderBy('fechaNacimiento', 'desc').get();

        return personaRead.then((snapshot: any) => {            
            const listaPersonas: { 
                displayName: any; 
                fechaNacimiento: any; 
                email: any; 
                imageUrl: any; 
                debePrimeraEntrega: any; 
                fechaCumple: any 
            }[] = []; 
            
            const fechaActual = new Date();
            
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                
                const fechaNacimiento = new Date(data.fechaNacimiento);
                
                if(fechaNacimiento.getMonth() < fechaActual.getMonth()) {
                    fechaNacimiento.setFullYear(fechaActual.getFullYear() + 1);
                } else {
                    fechaNacimiento.setFullYear(fechaActual.getFullYear());
                }

                listaPersonas.push({
                    displayName : data.displayName,
                    fechaNacimiento: data.fechaNacimiento,
                    email: data.email,
                    imageUrl: data.imgUrl,
                    debePrimeraEntrega: data.debePrimeraEntrega,
                    fechaCumple: fechaNacimiento
                });               
            });
            
            listaPersonas.sort((a: any, b: any) => { return a.fechaCumple - b.fechaCumple});          

            agent.add('El próximo cumpleaños es: '); 
            
            listaPersonas.some(item => {                
                item.fechaCumple = (item.fechaCumple.getDay() + 1) + '/' + (item.fechaCumple.getMonth() + 1) + '/' + item.fechaCumple.getFullYear();
                item.displayName = item.displayName ?? item.email;
                agent.add(item.fechaCumple + ' - ' +  item.displayName);
                return true;  
            });       

        }).catch((err: any) => {
            console.log('Error al obtener el documento', err);
        });
    };

    const proximosCumples = () => {
        const personaRead = db.collection('personas').orderBy('fechaNacimiento', 'desc').get();

        return personaRead.then((snapshot: any) => {
            
            const listaPersonas: { 
                displayName: any; 
                fechaNacimiento: any; 
                email: any; 
                imageUrl: any; 
                debePrimeraEntrega: any; 
                fechaCumple: any 
            }[] = []; 
            
            const fechaActual = new Date();
            
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                
                const fechaNacimiento = new Date(data.fechaNacimiento);
                
                if(fechaNacimiento.getMonth() < fechaActual.getMonth()) {
                    fechaNacimiento.setFullYear(fechaActual.getFullYear() + 1);
                } else {
                    fechaNacimiento.setFullYear(fechaActual.getFullYear());
                }

                listaPersonas.push({
                    displayName : data.displayName,
                    fechaNacimiento: data.fechaNacimiento,
                    email: data.email,
                    imageUrl: data.imgUrl,
                    debePrimeraEntrega: data.debePrimeraEntrega,
                    fechaCumple: fechaNacimiento
                });               
            });
            
            listaPersonas.sort((a: any, b: any) => { return a.fechaCumple - b.fechaCumple});          

            agent.add('Los próximos cumpleaños son: ');
            
            const listResult: any[] = [];

            if(queryResult.parameters['cantidad']){
                listaPersonas.some((item, index) => {          
                    item.fechaCumple = (item.fechaCumple.getDay() + 1) + '/' + (item.fechaCumple.getMonth() + 1) + '/' + item.fechaCumple.getFullYear();
                    item.displayName = item.displayName ?? item.email;
                    listResult.push(item.fechaCumple + ' - ' +  item.displayName);
                    if (index === queryResult.parameters['cantidad'] - 1){
                        return true;
                    }
                    return false;                    
                });  
            } else {
                listaPersonas.forEach(item => {                
                    item.fechaCumple = (item.fechaCumple.getDay() + 1) + '/' + (item.fechaCumple.getMonth() + 1) + '/' + item.fechaCumple.getFullYear();
                    item.displayName = item.displayName ?? item.email;
                    listResult.push(item.fechaCumple + ' - ' +  item.displayName);
                });   
            }

            if(listResult.length > 0){
                agent.add('Los próximos ' + queryResult.parameters['cantidad'] + ' cumpleaños son: ' + listResult.join('; '));
            } else {
                agent.add('No he registrado cumpleaños aún');
            }
            
        }).catch((err: any) => {
            console.log('Error al obtener el documento', err);
        });
    };

    const intentMap = new Map();
    intentMap.set('GetInfo.Persona', getPersona);
    intentMap.set('Create.Persona.PedidoInfoNecesariaYCreacion', createPersona);
    intentMap.set('GetInfo.CumpleMasProximo', cumpleProximo);
    intentMap.set('GetInfo.ProximosCumples', proximosCumples);
    //intentMap.set('GetInfo.ProximasEntregasFacturas', proximasEntregaFacturas);
    agent.handleRequest(intentMap);

});

export const altaUsuario = functions.https.onRequest((request, response) => {
    const db = admin.firestore();

    const params = request.body.params;

    cors(request, response, async () => {
        const data = {
            displayName: params['displayName'],
            fechaNacimiento: params['fechaNacimiento'],
            email: params['email'],
            imageUrl: params['imageURL'] ?? '',
            debePrimeraEntrega: params['debePrimeraEntrega'] ?? true,
        }

        console.log('data: ', data);

        const personaCreate = db.collection('personas').doc(params['email']).set(data);

        personaCreate.then((snapshot: any) => {
            response.status(200).send('Alta completa');
        }).catch((err: any) => {
            console.log('Error al crear el documento', err);
        });
    })

});

export const existeUsuario = functions.https.onRequest((request, response) => {
    const db = admin.firestore();

    const params = request.body.params;

    cors(request, response, async () => {

        const personaCreate = db.collection('personas').where('email', '==', params['email']).get();

        personaCreate.then((snapshot: any) => {

            if (snapshot) {
                snapshot.forEach((doc: any) => {
                    const data = doc.data();

                    if (data.fechaNacimiento) {
                        response.status(200).send(true);
                    } else {
                        response.status(200).send(false);
                    }
                });
            }

            response.status(200).send(false);

        }).catch((err: any) => {
            console.log('Error al consultar el documento', err);
        });
    })

});

// function getInfoFechasProximas(data: string[]) {
//     const now = new Date();
//     const isoString = {
//         year: '',
//         month: '',
//         day: ''
//     };
//     isoString.year = now.toISOString().substr(0, 4);
//     isoString.month = now.toISOString().slice(5, -17);
//     isoString.day = now.toISOString().slice(8, -14);
//     //console.log(isoString.day);

//     const yearNow = parseInt(isoString.year);
//     const monthNow = parseInt(isoString.month);
//     const dayNow = parseInt(isoString.day);
//     //console.log(yearNow, monthNow, dayNow);
//     const fechasRec: string[] = [];
//     data.sort((a, b) => a.localeCompare(b));

//     data.forEach(function (i) {
//         const datemonth = i.slice(5, -17);
//         const datemonthUser = parseInt(datemonth);
//         const dateDay = i.slice(8, -14);
//         const dateDayUser = parseInt(dateDay);

//         //console.log(yearNow, dateYearUser);

//         if (datemonthUser >= monthNow) {
//             if (dateDayUser >= dayNow) {
//                 const newDate = dateDayUser + "-" + datemonthUser + "-" + yearNow
//                 fechasRec.push(newDate);
//                 fechasRec.sort((a, b) => b.localeCompare(a));
//             }
//         }
//         //console.log(dateYear,datemonth,dateDay);
//     });

//     console.log(fechasRec);
//     return fechasRec
// }

