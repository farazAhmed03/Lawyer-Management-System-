// const session = require('express-session');
// const MongoStore = require('connect-mongo'); // Sessions ko MongoDB mein store karo

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'fallback-secret-key',
//   resave: false,
//   saveUninitialized: false, // GDPR compliance ke liye false rakho
//   cookie: { 
//     secure: process.env.NODE_ENV === 'production', // HTTPS in production
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   },
//   store: MongoStore.create({ mongoUrl: 'mongodb://localhost/sessions' }) // DB storage
// }));



// // Example 
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
  
//   // Check credentials (database se verify karo)
//   if (username === "admin" && password === "password123") {
//     req.session.user = username; // Session mein user store karo
//     res.send("Login successful! Session started.");
//   } else {
//     res.send("Invalid credentials!");
//   }
// });

// app.get('/profile', (req, res) => {
//   if (req.session.user) { // Agar user logged in hai
//     res.send(`Welcome, ${req.session.user}!`);
//   } else {
//     res.status(401).send("Please login first!");
//   }
// });


// app.get('/logout', (req, res) => {
//   req.session.destroy(); // Session delete karo
//   res.send("Logged out successfully!");
// });




// // Rate Limit 
// const rateLimit = require('express-rate-limit');

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,                   // Max 5 attempts
//   message: "Too many attempts, try again later!"
// });

// app.post('/login', limiter, (req, res) => {
//   // Login logic here
// });





// // Theme and Language Preference Code example 
// // Save Preferences
// app.post('/save-preferences', (req, res) => {
//   const { theme, language } = req.body;
//   const username = req.session.user; // From session
  
//   // Update in DB
//   // db.users.updateOne({ username }, { $set: { preferences: { theme, language } } });
  
//   res.send("Preferences saved!");
// });

// // Get Preferences
// app.get('/preferences', (req, res) => {
//   const username = req.session.user;
  
//   // Fetch from DB
//   // const user = await db.users.findOne({ username });
//   const preferences = { theme: "dark", language: "en" }; // Example
  
//   res.json(preferences);
// });



// // Tracking User behaviour (Analytics) 
// app.use((req, res, next) => {
//   const user = req.session.user || "guest";
//   const action = req.method + " " + req.url;
//   const timestamp = new Date().toISOString();
  
//   // Log to DB (e.g., MongoDB analytics collection)
//   // db.analytics.insertOne({ user, action, timestamp });
  
//   console.log(`${timestamp} - ${user} performed ${action}`);
//   next();
// });



// // utils/validation.js
// const validator = require('validator');

// // Email Validation
// const validateEmail = (email) => {
//   return validator.isEmail(email, {
//     require_tld: true,       // .com/.net required
//     allow_utf8_local: false, // Non-English emails block
//     blacklisted_chars: "'\"\\" // Dangerous characters block
//   });
// };


// // Password Validation (using password-validator)
// const passwordValidator = require('password-validator');
// const passwordSchema = new passwordValidator()
//   .is().min(8)
//   .has().uppercase()
//   .has().lowercase()
//   .has().digits(1)
//   .has().symbols(1);

// const validatePassword = (password) => {
//   return passwordSchema.validate(password);
// };





// // Google Like Validation 
// function isGmailLikeEmail(email) {
//   // Basic structure check
//   if (!/^[a-z0-9.+-]+@[a-z0-9-]+\.[a-z]{2,}$/i.test(email)) {
//     return false;
//   }

//   // Extra Google-style rules
//   const [localPart, domain] = email.split('@');
  
//   // 1. Local part (before @) checks
//   if (localPart.length > 64) return false;  // Max 64 chars
//   if (/\.\./.test(localPart)) return false; // No consecutive dots
  
//   // 2. Domain checks
//   if (domain.length > 253) return false;    // Max 253 chars
//   if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*$/i.test(domain)) {
//     return false; // Invalid domain format
//   }

//   return true;
// }





// // Cache Busting
// app.use((req, res, next) => {
//     res.set('Cache-Control', 'no-store');
//     res.set('Pragma', 'no-cache');
//     res.set('Expires', '0');
//     next();
// });
