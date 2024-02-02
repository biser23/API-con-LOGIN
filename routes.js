const express = require('express');
const session = require('express-session');
const router = express.Router();
const axios = require('axios');
const { generateToken, verifyToken } = require('./middlewares');
const users = require('./users');

const urlBase = 'https://rickandmortyapi.com/api/character/';

router.use(session({
  secret: 'tu_secreto_aqui',
  resave: false,
  saveUninitialized: true,
}));

router.get('/', (req, res) => {
  if (req.session.token) {
    res.send(`
      <h1>BIENVENIDO</h1>
      <a href="/search">Búsqueda personajes</a>
      <form action="/logout" method="post">
        <button type="submit">LogOut</button>
      </form>
    `);
  } else {
    res.send(`
      <form action="/login" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username">

        <label for="password">Password:</label>
        <input type="password" id="password" name="password">

        <button type="submit">Entrar</button>
      </form>
      <a href="/search">Búsqueda</a>
    `);
  }
});

router.get('/search', verifyToken, (req, res) => {
  const userId = req.user;
  const user = users.find((user) => user.id === userId);
  if (user) {
    res.send(`
      <h1>Bienvenido ${user.name} a la página de Rick & Morty</h1>
      <p>UserName: ${user.username}</p>
      <p>UserId: ${user.id}</p>
      <a href="/">HOME</a>
      <form action="/characters" method="get">
        <label for="characterName">Introduce el nombre del personaje de Rick&Morty</label>
        <input type="text" id="characterName" name="name" placeholder="Albert Einstein"/>
        <button type="submit">Búsqueda</button>
      </form>
      <form action="/logout" method="post">
        <button type="submit">LogOut</button>
      </form>
    `);
  } else {
    res.status(401).json({ mensaje: 'Usuario no encontrado' });
  }
});

router.get('/characters', async (req, res) => {
  const { name } = req.query;

  try {
    const response = await axios.get(`${urlBase}?name=${name}`);
    const characters = response.data.results;

    const searchResultsHtml = characters.map((character) => `
      <div>
        <p>Nombre: ${character.name}</p>
        <p>Especie: ${character.species}</p>
        <img src="${character.image}" alt="${character.name}">
      </div>
    `).join('');

    res.send(searchResultsHtml);
  } catch (err) {
    res.status(500).json({ mensaje: 'El servidor se ha estropeado correctamente' });
  }
});

router.get('/characters/:name', async (req, res) => {
  const name = req.params.name;
  const urlCharacter = `${urlBase}?name=${name}`;
  try {
    const response = await axios.get(urlCharacter);
    const { name, status, species, gender, origin: { name: originName }, image } = response.data;
    res.json({ name, status, species, gender, originName, image });
  } catch (error) {
    res.status(500).json({ mensaje: 'El servidor se ha estropeado correctamente' });
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username && user.password === password);

  if (user) {
    const token = generateToken(user);
    req.session.token = token;
    res.redirect('/search');
  } else {
    res.status(401).json({ mensaje: 'Usuario o contraseña incorrectas' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;



/*const express = require('express')
const router = express.Router()
const { generateToken, verifyToken } = require('./middlewares')
const users = require('./users')
const urlBase = 'https://rickandmortyapi.com/api/character/'
const axios = require('axios');

router.get('/', (req, res) => {
  if(req.session.token) {
    res.send(`
    <h1>BIENVENIDO</h1>
    <a href="/search">Busqueda personajes</a>
    <form action="/logout" method="post">
      <button type="submit">LogOut</button> 
    </form>
    `)
  } else {
    res.send(`
    <form action="/login" method="post">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username">

    <label for="password">Password:</label>
    <input type="password" id="password" name="password">
    
    <button type="submit">Entrar</button> 
    </form>
    <a href="/search">Search</a>
  `)
  }
})

router.get('/search', verifyToken, (req, res) => {
  const userId = req.user
  const user = users.find(user => user.id === userId)
  if(user) {
    res.send(`
    <h1>Bienvenido ${user.name} a la pagina de Rick & Morty</h1>
    <p>UserName: ${user.username}</p>
    <p>UserId: ${user.id}</p>
    <a href="/">HOME</a>
     <form action="/characters/:name" method="get">
      <label for="characterName">Introduce el nombre del personaje de Rick&Morty</label>
      <input type="text" id="characterName" name="searchInput" placeholder="Albert Einstein"/>
      <button type="submit">Búsqueda</button> 
    </form>
    <form action="/logout" method="post">
      <button type="submit">LogOut</button> 
    </form>
  `)
  } else {
    res.status(401).json({mensaje: "usuario no encontrado"})
  }  
})

router.post('/characters/:search', verifyToken, async (req, res) => {
  const searchTerm = req.body.searchInput;

  try {
    const response = await axios.get(`${urlBase}?name=${searchTerm}`);
    const characters = response.data.results;

    const searchResultsHtml = characters.map(character => `
      <div>
        <p>Nombre: ${character.name}</p>
        <p>Specie: ${character.species}</p>
        <img src="${character.image}" alt="${character.name}">
      </div>
    `).join('');

    res.send(searchResultsHtml);
  } catch (err) {
    res.status(500).json({ mensaje: 'el servidor se ha estropeado cocretamente' });
  }
});


router.get('/characters', async (req, res)=>{
  try{
    const response =await axios.get(urlBase)
    const characters =response.data.results

    res.json(characters)

} catch(err) {
    res.status(500).json({mensaje: 'el servidor se ha estropeado cocretamente'})
}
})

router.get('/characters/:name', async (req, res) => {
  //const characterName = decodeURIComponent(req.params.name)
  //const url = `https://rickandmortyapi.com/api/character/?name=${characterName}`
  const name = req.params.name
  const urlCharacter = `${urlBase}?name=${name}`
  try{
      const response = await axios.get(urlCharacter)
      const {name, status, species, gender, origin: {name: originName}, image} = response.data; //{name:originName} cambia el nombre a name del origin para que no coincida con name
      res.json({name, status, species, gender, originName, image})

  } catch (ERROR){
      res.status(500).json({mensaje: 'el servidor se ha estropeado cocretamente'})
  }    
})
router.post('/login', (req, res) => {
  const {username, password} = req.body
  const user = users.find(user => user.username === username && user.password === password)

  if(user) {
    const token = generateToken(user)
    req.session.token = token
    res.redirect('/search')
  } else {
    res.status(401).json({mensaje: "usuario o contraseña incorrectas"})
  }
})

router.post('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router*/
