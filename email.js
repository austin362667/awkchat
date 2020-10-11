const { text } = require("body-parser");
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function send(to, subject, text) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    // secure: false, // true for 465, false for other ports
        auth: {
          user: 'austincapital.com@gmail.com',//credentials.gmail.user
          pass: 'Hh034634599',//credentials.gmail.pass
        },
      });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"尬聊小站 👻" <austincapital.com@gmail.com>', // sender address
    // to: "bar@example.com, baz@example.com", // list of receivers
    to: to,
    subject: subject, // Subject line
    text: text, // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// main().catch(console.error);


// module.exports = function() {// credentials
//   var mailTransport = nodemailer.createTransport('SMTP', {
//     service: 'Gmail',
//     auth: {
//       user: 'austincapital.com@gmail.com',//credentials.gmail.user
//       pass: 'Ww082362667',//credentials.gmail.pass
//     },
//   });
//   var from = '"尬聊小站" <austincapital.com@gmail.com>';
//   var errorRecipient = 'austincapital.com@gmail.com';
//   return {
//     send: function(to, subj, body) {
//       mailTransport.sendMail(
//         {
//           from: '尬聊小站 <austincapital.com@gmail.com>',
//           to: to,
//           subject: 'Hi :) ' + subj,
//           html: '<h1>Hello</h1><p>Nice to meet you.</p>' + body,
//         },
//         function(err) {
//           if (err) {
//             console.log('Unable to send email: ' + err);
//           }
//         },
//       );
//     },
//     emailError: function(message, filename, exception) {
//       var body =
//         '<h1>Chatting Booth Site Error</h1>' + 'message:<br><pre>' + message + '</pre><br>';
//       if (exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
//       if (filename) body += 'filename:<br><pre>' + filename + '</pre><br>';
//       mailTransport.sendMail(
//         {
//           from: from,
//           to: errorRecipient,
//           subject: 'Chatting Booth Site Error',
//           html: body,
//           generateTextFromHtml: true,
//         },
//         function(err) {
//           if (err) {
//             console.log('Unable to send email: ' + err);
//           }
//         },
//       );
//     },
//   };
// };

module.exports = { send }