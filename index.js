const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const Book = require('./models/Book');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


// Middleware for authentication
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Token manquant' });
    console.log(token)
    const token2 = token.replace('Bearer ', '');
    jwt.verify(token2, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = decoded;
        next();
    });
};


/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */
app.post('/api/books', authenticate, async (req, res) => {
    try {
        const book = await Book.create(req.body);
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: 'Error creating book' });
    }
});

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Retrieve the list of books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */

app.get('/api/books', authenticate, async (req, res) => {
    const books = await Book.findAll();
    res.json(books);
});


/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Retrieve book details
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
app.get('/api/books/:id', authenticate, async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update book details
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
app.put('/api/books/:id', authenticate, async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    Object.assign(book, req.body);
    await book.save();
    res.json(book);
});


/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book successfully deleted
 *       404:
 *         description: Book not found
 */
app.delete('/api/books/:id', authenticate, async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    await book.destroy();
    res.json({ message: 'Book successfully deleted' });
});



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connect a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT Token
 */

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});



sequelize.sync().then(() => {
    app.listen(3000, () => console.log('Server started on http://localhost:3000'));
});


const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Book Management API',
            version: '1.0.0',
            description: 'API to manage a collection of books',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Book: {
                    type: 'object',
                    required: ['title', 'author', 'publishedDate', 'numberOfPages'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique book ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Title of the book',
                        },
                        author: {
                            type: 'string',
                            description: 'Author of the book',
                        },
                        publishedDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Book publication date',
                        },
                        numberOfPages: {
                            type: 'integer',
                            description: 'Number of pages',
                        },
                    },
                    example: {
                        title: 'The Great Gatsby',
                        author: 'F. Scott Fitzgerald',
                        publishedDate: '1925-04-10',
                        numberOfPages: 180,
                    },
                },
                User: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            description: "Username",
                        },
                        password: {
                            type: 'string',
                            description: 'PAssword',
                        },
                    },
                }, 
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./index.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
