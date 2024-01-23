const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config();
// const { ObjectId } = require('mongodb');

app.use(express.json());
app.use(cors());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.user}:${process.env.password}@cluster0.skhrrsn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const newCollection = client.db('academy').collection('super')
        const userCollection = client.db('houseHonter').collection('userInfo')

        // server checking
        app.get('/latest', async (req, res) => {
            try {
                const newinfo = await newCollection.find().toArray()
                res.send(newinfo)
            } catch (error) {
                console.log(error);
            }
        })

        // post user info in the database.
        app.post('/register', async (req, res) => {
            const { name, role, phoneNum, email, password } = req.body;

            try {
                // Check if the email is already registered
                const existingUser = await userCollection.findOne({ email });

                if (existingUser) {
                    // If the email is already used, send a response indicating the conflict
                    res.status(409).json({ error: 'Email already in use' });
                } else {
                    // Insert the user information into the userInfo collection
                    const result = await userCollection.insertOne({
                        name,
                        role,
                        phoneNum,
                        email,
                        password,
                    });
                    res.status(201).json({ message: 'Register successfully' });
                }
            } catch (error) {
                console.error('Error during registration:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Login function 
        app.post('/user-login', async (req, res) => {
            const { email, password } = req.body;
            try {
                // Check if the user exists in the userInfo collection
                const user = await userCollection.findOne({ email, password });

                if (user) {
                    // User is found, send a success response
                    res.status(200).json({ message: 'Login successful' });
                } else {
                    // User not found, send an error response
                    res.status(401).json({ error: 'email and password not match' });
                }
            } catch (error) {
                console.error('Error during login:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // get userinfo by email
        app.get('/current-userinfo', async (req, res) => {
            try {
                const userEmail = req.query.email
                console.log(userEmail);
                if (!userEmail) {
                    // If email is not provided in query parameters, return a bad request response
                    return res.status(400).json({ error: 'Email parameter is missing' });
                }
                // Query the userinfo collection for data with the specified email
                const userInfo = await userCollection.find({ email: userEmail }).toArray();
                res.status(200).json(userInfo);

            } catch (error) {
                console.log(error);
                res.status(500).json({ error: 'Internal Server Error' })
            }
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Bismillah-want to devloy.')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})