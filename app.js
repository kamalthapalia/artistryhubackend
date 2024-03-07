/*
const express = require('express')
const userRouter = require('./src/routers/userRouter')
const artworkRouter = require('./src/routers/ArtworkRouter')
const imageRouter = require('./src/routers/imageRouter')
const categoriesRouter = require('./src/routers/CategoryRouter')
const orderRouter = require('./src/routers/orderRouter')
const orderItemRouter = require('./src/routers/orderItemsRouter');





const app = express();
app.use(express.json())
const cors = require('cors');
app.use(cors);

app.use(express.urlencoded({extended: true}))
app.listen(3000, () => {
    console.log("Server is running")
})
app.get("/", (req, res) => {
    res.send("Welcome to Art Gallery")
})

//routes
app.use('/users', userRouter)
app.use('/image', imageRouter)
app.use('/artworks', artworkRouter)
app.use('/categories', categoriesRouter)
app.use('/orders', orderRouter)
app.use('/orderitems', orderItemRouter);

*/
/*
const express = require('express');
const https = require('https');
const fs = require('fs');
const userRouter = require('./src/routers/userRouter');
const artworkRouter = require('./src/routers/ArtworkRouter');
const imageRouter = require('./src/routers/imageRouter');
const categoriesRouter = require('./src/routers/CategoryRouter');
const orderRouter = require('./src/routers/orderRouter');
const orderItemRouter = require('./src/routers/orderItemsRouter');


const app = express();
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', ' https://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });



// HTTPS Configuration
const httpsOptions = {
    key: fs.readFileSync('C:/Users/DELL/Desktop/SRIJANA_FULLSTACK_MINOR_PROJECT/srijanaFGH/artistryhubackend/server.key'),
    cert: fs.readFileSync('C:/Users/DELL/Desktop/SRIJANA_FULLSTACK_MINOR_PROJECT/srijanaFGH/artistryhubackend/server.cert'),
  };
  
// Create HTTPS server
const server = https.createServer(httpsOptions, app);

// Start the server
server.listen(3000, () => {
  console.log('Server is running on HTTPS');
});

// Routes
app.use('/users', userRouter);
app.use('/image', imageRouter);
app.use('/artworks', artworkRouter);
app.use('/categories', categoriesRouter);
app.use('/orders', orderRouter);
app.use('/orderitems', orderItemRouter);
*/
 //https wala


 const express = require('express');
 const cors = require('cors');
 const https = require('https');
 const fs = require('fs');
  
  
 
 const userRouter = require('./src/routers/userRouter')
 const artworkRouter = require('./src/routers/ArtworkRouter')
 const imageRouter = require('./src/routers/imageRouter')
 const categoriesRouter = require('./src/routers/CategoryRouter')
 const orderRouter = require('./src/routers/orderRouter')
 const orderItemRouter = require('./src/routers/orderItemsRouter')
 const reviewRouter = require('./src/routers/reviewRouter')
 
 const app = express();
 app.use(cors());

 
 // Read SSL certificate and private key
 const options = {
   key: fs.readFileSync('C:/Users/DELL/Desktop/SRIJANA_FULLSTACK_MINOR_PROJECT/srijanaFGH/artistryhubackend/server.key'),
 
   cert: fs.readFileSync('C:/Users/DELL/Desktop/SRIJANA_FULLSTACK_MINOR_PROJECT/srijanaFGH/artistryhubackend/server.cert')
 };
 
 // Set up middleware
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 
 
 //routes
 app.use('/users', userRouter)
 app.use('/image', imageRouter)
 app.use('/artworks', artworkRouter)
 app.use('/categories', categoriesRouter)
 app.use('/orders', orderRouter)
 app.use('/orderitems', orderItemRouter)
 app.use('/reviews', reviewRouter)
 
 // Create HTTPS server instance
 const server = https.createServer(options, app);
 
 // Start HTTPS server
 server.listen(3000, () => {
     console.log("Server is running on https://localhost:3000");
 });