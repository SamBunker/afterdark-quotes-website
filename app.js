const express = require('express');
const { engine } = require('express-handlebars');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
const bodyParser = require('body-parser');
const { getAllQuotes, getQuotesLimited, deleteQuote, getQuote, addOrUpdateQuote, getRandomQuote, addOrUpdateQuoteRating, getLimboQuotes, deleteLimboQuote, addOrUpdateLimboQuote, getLimboQuote, getQuoteRating, fetchQuoteRating, updateQuoteRating, validateAuthToken, markTokenAsUsed } = require('./dynamo');
const fs = require('fs');
const path = require('path');
const User = require('./models/user');
app.use(express.static('public')); // Serve static files from "public" directory
const session = require('express-session');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
require('dotenv').config();

// Winston logger setup
const winston = require('winston');
const expressWinston = require('express-winston');
const logger = require('./logger');

const port = process.env.PORT || 3001;

// Set up Handlebars as the template engine
app.engine('handlebars', engine({
  helpers: {
      json: (context) => {
          return JSON.stringify(context);
      }
  }
}));
app.set('view engine', 'handlebars');

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));

// Express-Winston HTTP request logging middleware
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.json()
  ),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Middleware to add isAdmin to all views
app.use((req, res, next) => {
  res.locals.isAdmin = req.session.user?.accessLevel === 'admin';
  next();
});

function requireAuth(req, res, next) {
  try {
      if (!req.session.user || typeof req.session.user !== 'object' || !req.session.user.userId) {
          throw new Error('Invalid user session!');
      }
      next();
  } catch (error) {
      logger.error(error.message);
      res.status(401).redirect('/unauthorized');
  }
}

function isAdmin(req, res, next) {
  try {
      if (!req.session.user || typeof req.session.user !== 'object' || !req.session.user.userId) {
          throw new Error('Invalid user session!');
      }
      if (req.session.user.accessLevel !== 'admin') {
          throw new Error('Insufficient permissions - admin access required');
      }
      next();
  } catch (error) {
      logger.error(error.message);
      res.status(403).render('error', {
        message: 'Access Denied',
        details: 'You do not have permission to access this page. Admin access is required.'
      });
  }
}

app.get('/unauthorized', (req, res) => {
  logger.info('DEV_MODE environment variable:', process.env.DEV_MODE);
  logger.info('PASSWORD environment variable:', process.env.PASSWORD ? '[SET]' : '[NOT SET]');
  logger.info('DEV_USER_ID environment variable:', process.env.DEV_USER_ID ? '[SET]' : '[NOT SET]');
  res.render('unauthorized', {
    devMode: process.env.DEV_MODE === 'true',
    error: req.query.error === 'invalid'
  });
});

// Dev mode password login
app.post('/dev-login', (req, res) => {
  if (process.env.DEV_MODE !== 'true') {
    return res.status(403).send('Dev mode is not enabled');
  }

  const { password } = req.body;

  if (password === process.env.PASSWORD) {
    req.session.user = {
      userId: process.env.DEV_USER_ID,
      nickname: 'Dev User',
      accessLevel: 'admin'
    };
    logger.info(`Dev mode login successful for user ID: ${process.env.DEV_USER_ID}`);
    res.redirect('/');
  } else {
    logger.warn('Dev mode login failed: incorrect password');
    res.redirect('/unauthorized?error=invalid');
  }
});

// Token-based authentication route
app.get('/auth/:token', async (req, res) => {
  const token = req.params.token;

  try {
    // Validate the token
    const validation = await validateAuthToken(token);

    if (!validation.valid) {
      logger.info(`Authentication failed: ${validation.reason}`);
      return res.status(401).render('error', {
        message: 'Authentication Failed',
        details: `Invalid or expired link. ${validation.reason}. Please try generating a new link from Discord.`
      });
    }

    // Get user information from the token data (includes Discord username and display name)
    const tokenData = validation.data;

    // Mark token as used
    await markTokenAsUsed(token);

    // Create session using info from token
    req.session.user = {
      userId: tokenData.discord_id,
      nickname: tokenData.display_name || tokenData.username,
      accessLevel: tokenData.access_level || 'member' // Default to member if not specified
    };

    logger.info(`Token authentication successful for: ${tokenData.display_name || tokenData.username} (ID: ${tokenData.discord_id}, Access: ${tokenData.access_level || 'member'})`);

    // Redirect to rate page
    res.redirect('/');

  } catch (error) {
    logger.error('Error in token authentication:', error);
    res.status(500).render('error', {
      message: 'Authentication Error',
      details: 'An error occurred during authentication. Please try again or contact support.'
    });
  }
});

app.get('/rate', requireAuth, async (req, res) => {
  const username = req.session.user.nickname;

  const quote = await getRandomQuote();
  res.render('rate', { username, quote });
})

app.get('/leaderboard', requireAuth, async (req, res) => {
  try {
    const quotes = await getAllQuotes(); // Fetch all quotes from DynamoDB
    res.render('leaderboard', { quotes }); // Pass quotes to the template
  } catch (error) {
    logger.error('Error fetching quotes:', error);
    res.status(500).send('Error retrieving quotes');
  }
})

app.get('/limbo', isAdmin, async (req, res) => {
  const messages = await getLimboQuotes();
  logger.info('Limbo messages:', { count: messages.length });
  res.render('limbo', { messages });
})

app.get('/quote/:message_id', requireAuth, async (req, res) => {
  try {
      const messageId = req.params.message_id; // Get the message_id from the URL
      logger.info(`Fetching quote data for messageId: ${messageId}`);

      const quoteData = await getQuote(Number(messageId)); // Use Number for main quotes table
      const ratingsCount = await getQuoteRating(Number(messageId)); // Use Number for ratings table

      logger.debug('Quote data:', quoteData);
      logger.debug('Ratings data:', ratingsCount);

      res.render('quote', {
          quote: quoteData,
          ratings: ratingsCount
      }); // Pass the quote and ratings to the template
  } catch (error) {
      logger.error("Error fetching quote:", error);
      res.status(500).send("Error retrieving quote.");
  }
});

// SYNC FOR A JSON ARRAY INTO DYNAMODB
// SYNC FOR A JSON ARRAY INTO DYNAMODB
// app.use(bodyParser.urlencoded({ extended: false }));

// // Define the path to the JSON file
// const JSON_FILE = path.join(__dirname, 'users.json');

// function getMessages() {
//   const data = fs.readFileSync(JSON_FILE, 'utf8');
//   return JSON.parse(data);
// }

// // Function to log each message to DynamoDB
// async function logMessagesToDynamoDB(messages) {
//   for (const message of messages) {
//     const item = {
//       discord_id: Number(message.id), // Convert ID to string if needed
//       nickname: message.nickname
//     };

//     try {
//       await logThisJson(item);
//       console.log(`Successfully uploaded: ${JSON.stringify(item)}`);
//     } catch (error) {
//       console.error(`Error uploading ${JSON.stringify(item)}:`, error);
//     }
//   }
// }


// Route to log messages to DynamoDB
// app.get('/sync', async (req, res) => {
//   try {
//     const messages = getMessages(); // Read messages from the JSON file
//     await logMessagesToDynamoDB(messages); // Upload to DynamoDB
//     res.send('Messages synced to DynamoDB!');
//   } catch (error) {
//     res.status(500).send(`Error: ${error.message}`);
//   }
// });
// SYNC FOR A JSON ARRAY INTO DYNAMODB
// SYNC FOR A JSON ARRAY INTO DYNAMODB



// Route to handle button clicks (Yes or No)
app.post('/quote/:id', requireAuth, async (req, res) => {
  // const messages = getLimboQuotes();
  const messageId = req.params.id;
  logger.debug("Without BigInt" + messageId);
  logger.debug("With BigInt" + BigInt(messageId));
  logger.debug("With Number" + Number(messageId));
  let rating;
  let sessionUserID;
  let sessionUsername;
  
  if (req.body.rating) {
    rating = BigInt(req.body.rating);
  }
  // Needs changed to user id
  if (req.session.user) {
    sessionUserID = BigInt(req.session.user.userId);// needs to be an ID
    sessionUsername = req.session.user.nickname;
  }

  if (req.body.action === 'yes') {
    var item_json = await getLimboQuote(BigInt(messageId));
    // console.log(item_json['Item']);
    try {
        // Check if item_json exists and has 'Item'
        if (!item_json || !item_json.Item) {
            logger.error("Error: Quote not found in limbo for messageId:", messageId);
            return res.status(404).json({ error: "Quote not found" });
        }

        // Add or update the quote
        await addOrUpdateQuote(item_json.Item);
        await deleteLimboQuote(BigInt(messageId));  // Delete after adding or updating
        logger.info('Quote approved and moved from limbo:', messageId);
        res.redirect('/limbo');
        return;
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: 'Something went wrong. (yes)' });
    }
  } else if (req.body.action === 'no') {
      try {
          // Delete the quote if the action is 'no'
          await deleteLimboQuote(BigInt(messageId));
          logger.info('Quote rejected and deleted from limbo:', messageId);
          res.redirect('/limbo');
          return;
      } catch (error) {
          logger.error(error);
          res.status(500).json({ error: 'Something went wrong (no)' });
      }

    // Handling Quote Rating and Updates
  } if (req.body.action !== 'yes' && req.body.action !== 'no') {
      if (rating && sessionUsername && messageId) {
          logger.info("Fetching quote rating for message ID:", messageId);
          const quoteResults = await fetchQuoteRating(BigInt(messageId));
          logger.debug("Quote Results:", quoteResults);


          if (!quoteResults || !quoteResults.ratings || !Array.isArray(quoteResults.ratings) || quoteResults.ratings.length === 0) {
              logger.info("Ratings Do Not Exist in Database");

              const newRating = {
                  message_id: BigInt(messageId),
                  ratings: [
                      {
                          sessionUserID: sessionUserID.toString(), // Store as string to prevent precision loss
                          rating: Number(rating)
                      }
                  ]
              };

              await addOrUpdateQuoteRating(newRating);
              logger.info("Added new rating");
              res.redirect('/rate');

          } else {
              logger.info("Ratings Exist in Database");
              logger.debug("Existing Ratings:", quoteResults);

              // Extract existing ratings from correct structure
              let updatedRatings = Array.isArray(quoteResults.ratings) ? quoteResults.ratings : [];

              logger.debug("updatedRatings array:", JSON.stringify(updatedRatings, null, 2));
              logger.debug("Looking for sessionUserID:", sessionUserID.toString());

              // Check if user already rated
              const userIndex = updatedRatings.findIndex(entry => entry.sessionUserID.toString() === sessionUserID.toString());

              if (userIndex !== -1) {
                  // User exists, remove old rating and add new one
                  updatedRatings.splice(userIndex, 1); // Remove the old entry
                  updatedRatings.push({                // Add new entry at the end
                      sessionUserID: sessionUserID.toString(), // Store as string to prevent precision loss
                      rating: Number(rating)
                  });
                  logger.info(`Replaced ${sessionUserID}'s rating with ${rating}`);
              } else {
                  // User does not exist, add a new rating
                  updatedRatings.push({
                      sessionUserID: sessionUserID.toString(), // Store as string to prevent precision loss
                      rating: Number(rating)
                  });
                  logger.info(`Added new rating for ${sessionUserID}`);
              }

              // Update the database
              await updateQuoteRating(messageId, updatedRatings);
              logger.info("Updated rating in database");
              res.redirect('/rate');
          }
      }
    }
});
    

app.get('/logout', (req, res) => {
  const userId = req.session.user?.userId;
  const nickname = req.session.user?.nickname;

  // Destroy the entire session
  req.session.destroy((err) => {
    if (err) {
      logger.error('Error destroying session:', err);
    }
  });

  logger.info(`User logged out: ${nickname} (ID: ${userId})`);
  res.redirect('/unauthorized');
});


// Route to display messages
app.get('/', (req, res) => {
  if (!req.session.user || !req.session.user.userId) {
    return res.redirect('/unauthorized');
  }
  res.render('home');
});

// Start the Express server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
