import * as config from "../config.js";

const styles = `
background-color: #eee;
padding: 20px;
border-radius: 20px;

`;

export const emailTemplate = (email, content, replyTo, subject) => {
  return {
    Source: config.EMAIL_FROM,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<html>
                   <div style="${styles}">
                       <h1>Welcome to Realist App</h1>
                        ${content}
                       <p>&copy; ${new Date().getFullYear()} Realist App </p>
                    </div> 
                    </html>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  };
};
