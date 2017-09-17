// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    let reportTask = {taskType: 'calculateReportForUser',
        userId: 22,
        questionaireId: 33};

    admin.database().ref('/reportTask').push(reportTask).then(snapshot => {
      // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
      res.redirect(303, snapshot.ref);
    });
  });

  exports.aggregate = functions.database.ref('/reportTask/{pushId}')
  .onWrite(event => {
    // Only edit data when it is first created.
    if (event.data.previous.exists()) {
      return;
    }
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      return;
    }
    // Grab the current value of what was written to the Realtime Database.
    const reportTask = event.data.val();
    console.log('reportTask', event.params.pushId, reportTask);

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    return;

  });

  exports.setPositionOnQuestionAssign = functions.database.ref('/questionaire/questions/{questionaireId}/{questionId}')
  .onWrite(event => {
    // Only edit data when it is first created.
    if (event.data.previous.exists()) {
      return;
    }
    // Exit when the data is deleted.
    if (!event.data.exists()) {
      return;
    }
//    const question = event.data.val();
//    console.log('question', event.params.questionaireId, event.params.questionId, question);

    console.log('firing for', event.data.val()), event.data.key;

    const parentRef = event.data.ref.parent;
    admin.database().ref('questionaire/questions/' + parentRef.key)
      .orderByChild('position').limitToLast(1)
//      .once('value').then(snapshot => {
      .once("value", function(snap) {
  
        let lastItem = snap.val()[Object.keys(snap.val())[0]];
        console.log('snapshot', snap.val(), lastItem);

        let question = {
          position : lastItem.position + 1
        };
        return event.data.ref.update(question);
      });
  });

  exports.registerNewUser = functions.auth.user().onCreate(event => {
    const user = event.data; // The Firebase user.
    admin.database().ref('/users/' + user.uid).set(user);
  });
