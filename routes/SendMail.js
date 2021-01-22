require("custom-env").env();

const nodemailer = require("nodemailer"),
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  }),
  EmailTemplate = require("email-templates"),
  path = require("path"),
  Promise = require("bluebird");

function loadTemplate(templateName, contexts) {
  let template = new EmailTemplate();
  return Promise.all(
    contexts.map(context => {
      return new Promise((resolve, reject) => {
        template
          .render(path.join(__dirname, "templates", templateName), {
            data: { name: context.name, key: "23456788" }
          })
          .then(data => {
            resolve({
              email: data,
              context
            });
          })
          .catch(err => {
            reject(err);
          });
      });
    })
  );
}

module.exports = {
  sendEmail(user) {
    loadTemplate("emailValification", user)
      .then(results => {
        return Promise.all(
          results.map(result => {
            transporter.sendMail({
              to: result.context.email,
              from: "Chawanangwa Farms :)",
              subject: "Activation Key",
              html: result.email,
              text: result.email
            });
          })
        );
      })
      .then(() => {
        console.log("Email sent!");
      }).catch(err=>{
        console.log(err);
        
      })
  }
};
