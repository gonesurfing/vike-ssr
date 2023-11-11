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
// see: https://vite-plugin-ssr.com/importBuild.cjs
require("./dist/server/importBuild.cjs");
const {renderPage} = require("vike/server");

// Vike middleware.

exports.ssr = onRequest(async (request, response) => {
  const pageContextInit = {
    urlOriginal: request.originalUrl,
  };
  const pageContext = await renderPage(pageContextInit);

  if (!pageContext.httpResponse) {
    logger.info(pageContext.httpResponse, request.originalUrl);
    response.send(null);
  } else {
    const {body, statusCode, headers, earlyHints} = pageContext.httpResponse;
    if (response.writeEarlyHints) {
      response.writeEarlyHints({link: earlyHints.map((e) => e.earlyHintLink)});
    }
    headers.forEach(([name, value]) => response.setHeader(name, value));
    response.status(statusCode);
    response.send(body);
  }
});