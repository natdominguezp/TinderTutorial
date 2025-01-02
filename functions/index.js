/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");

const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();


exports.get = functions.https.onRequest(async(request, response) => {
   //functions.logger.info("Hello logs!", {structuredData: true});
   

   const result = await firestore.collection('users').add({name:'Jesse'})
   response.send(result);
});

exports.post = functions.https.onRequest((request, response) => {
   //functions.logger.info("Hello logs!", {structuredData: true});
    response.send("Hello I am a POST!");
 });