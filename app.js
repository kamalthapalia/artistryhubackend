const express = require('express')
const userRouter = require('./src/routers/userRouter')
const artworkRouter = require('./src/routers/ArtworkRouter')
const imageRouter = require('./src/routers/imageRouter')
const categoriesRouter = require('./src/routers/CategoryRouter')
const orderRouter = require('./src/routers/orderRouter')
const orderItemRouter = require('./src/routers/orderItemsRouter')
const reviewRouter = require('./src/routers/reviewRouter')

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
app.use('/orderitems', orderItemRouter)
app.use('/reviews', reviewRouter)