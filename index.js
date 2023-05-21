const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

require('dotenv').config()
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dkm5by0.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const kidsDollCollection = client.db('kidsDoll').collection('allToys');
    const addedToyCollection = client.db('kidsDoll').collection('addToy');

    app.get('/allToys', async(req, res) => {
        const query = {};
        const sort = { length: -1 };
        const limit = 20;
        const cursor = kidsDollCollection.find(query).sort(sort).limit(limit);
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/allToys/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await kidsDollCollection.findOne(query);
        res.send(result);
    });

    app.get('/addToy', async(req, res) => {
      const sortOrder = req.query.sortOrder || 'ascending';
      const cursor = addedToyCollection.find(); 
      const toys = await cursor.toArray();
      const sortedToys = toys.sort((a, b) => {
        if (sortOrder === 'descending') {
          return b.price - a.price; // Sort in descending order
        } else {
          return a.price - b.price; // Sort in ascending order (default)
        }
      });

      res.send(sortedToys);
    });

    app.get('/addToy/:id', async(req, res) => {
      const _id = req.params.id;
      const query = { _id: new ObjectId(_id) }
      const result = await addedToyCollection.findOne(query);
      res.send(result)
      console.log(result);
    });

    app.post('/addToy', async(req, res) => {
      const addToy = req.body;
      console.log(addToy);
      const result = await addedToyCollection.insertOne(addToy);
      res.send(result)
    })

    app.put('/addToy/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedToy = req.body;

      const toy = {
          $set: {
              name: updatedToy.name, 
              quantity: updatedToy.quantity, 
              supplier: updatedToy.supplier, 
              taste: updatedToy.taste, 
              category: updatedToy.category, 
              details: updatedToy.details, 
              photo: updatedToy.photo
          }
      }

      const result = await addedToyCollection.updateOne(filter, toy, options);
      res.send(result);
  })

    app.delete('/addToy/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addedToyCollection.deleteOne(query);
      res.send(result)
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
    res.send('Twinkle Kids Doll store is Running')
})

app.listen(port, () => {
    console.log(`Twinkle Kids Doll store is Running on port: ${port}`);
})