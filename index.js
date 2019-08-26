//
// invoke an async iffe 
(async ([
  url,
  app,
  cheerio,
  axios,
]) => {
  try { // * main code

    const PORT = 3000
    const URL = `http://www.classic-motorcycle-build.com`

    // init with the homepage
    const page = await axios.get(URL)
    const $ = await cheerio.load(page.data)
    const nav = $('nav a')
    let routes = {}

    // register home and use it to init all routes

    // register routes for main nav -- this works because we are in an async iffe :)
    for (let i = 0; i < nav.length; i++) {
      const path = url.parse(nav[i].attribs.href).pathname
      const page = await axios.get(`${URL}${path}`)
      const data = await cheerio.load(page.data)

      // set new links in main nav for both home and all other paths
      $(nav[i]).attr('href', path)
      for (let j = 0; j < data('nav a').length; j++) {
        const subnavPath = url.parse(data('nav a')[j].attribs.href).pathname
        data(data('nav a')[j]).attr( 'href', subnavPath)
      }

      routes[path.match(/([^\/]+)(?=\.\w+$)/)[0]] = data.html()

      // add routes for paths
      app.get(path, (req, res) => res.send( data.html() ))
    }

    console.log(Object.keys(routes))

    // init the index and listen on 3000 for development
    app.get('/', (req, res) => res.send( page['index'] ))
    app.listen(PORT, () => console.log( `check it on http://localhost:${PORT}` ))

  } catch (error) { // catch any errors
    console.error( error )
  }
})([
  require(`url`),
  require(`express`)(),
  require(`cheerio`),
  require(`axios`),
])
