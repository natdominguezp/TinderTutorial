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

exports.post = functions.https.onRequest(async(request, response) => {
   //functions.logger.info("Hello logs!", {structuredData: true});
   const body = request.body
   const type = body.type
   
   
   if (type == 'personILike'){
      const myId = body.myId
      const idOfPersonILike = body.idOfPersonILike
      await firestore.collection('users').doc(idOfPersonILike).collection("theyLikeMe").doc(myId).set(
         {
            uId: myId,
            docReference: firestore.collection('users').doc(myId)

         },{ merge: true})
         response.send("Succesfull")
   }

   if (type == 'iDontLikeYou'){
      const myId = body.myId
      const idOfPersonIDontLike = body.idOfPersonIDontLike
      await firestore.collection('users').doc(myId).collection("theyLikeMe").doc(idOfPersonIDontLike).delete()
      response.send ("Successfully Deleted")
   }

   if (type == 'weLikeEachOther'){
      const myId = body.myId
      const idOfPersonILike = body.idOfPersonILike

      //I prepare the 2 objects

      //Other Person's Object
      const otherPersonObject = {
         uId: idOfPersonILike,
         docReference: firestore.collection('users').doc(idOfPersonILike)
      }

      //My Object
      const myObject = {
         uId: myId,
         docReference: firestore.collection('users').doc(myId)
      }

      // 2 Inserts in "weLikeEachOther" subcollection
      await firestore.collection('users').doc(idOfPersonILike).collection("weLikeEachOther").doc(myId).set( myObject,{ merge: true})
      await firestore.collection('users').doc(myId).collection("weLikeEachOther").doc(idOfPersonILike).set( otherPersonObject,{ merge: true})

      //Delete the document from my subcollection of "theyLikeME"
      await firestore.collection('users').doc(myId).collection("theyLikeMe").doc(idOfPersonILike).delete()

      //Create chat document in the chat collection
      const idOfDocument = generateChatId(myId,idOfPersonILike)

      await firestore.collection('chats').doc(idOfDocument).set({
         idsConcatenated: idOfDocument,
         arrayOfPeopleInConversation: [myId,idOfPersonILike]
      },{merge:true})

      response.send("We like each other successfully done")
   }

   if (type=='breackMatch'){
      //get the data passed through the API call 
      const myId = body.myId
      const idOfPersonIDontLike = body.idOfPersonIDontLike

      //Delete all the chat
      const idOfConversation = generateChatId(myId,idOfPersonIDontLike)
      const listMessageDocuments = await firestore.collection('chats').doc(idOfConversation).collection('messages').listDocuments()
      listMessageDocuments.forEach((eadhDoc)=>{
         eadhDoc.delete()
      })

      //Delete the chat document 
      await firestore.collection('chats').doc(idOfConversation).delete()

      //Delete the user from the "weLikeEachOther" subcollection in both places, in mine, and in the other person's subcollection
      const path1= `users/${myId}/weLikeEachOther/${idOfPersonIDontLike}`
      const path2= `users/${idOfPersonIDontLike}/weLikeEachOther/${myId}`

      //Perform the delete operations
      await firestore.doc(path1).delete()
      await firestore.doc(path2).delete()

      response.send('Deletion successfull')
   }

    response.send("Hello I am a POST!");
 });

 const generateChatId = (id1,id2) =>{
   const array = [id1,id2]
   array.sort()
   return `${array[0]}-${array[1]}`
 }