const express = require('express')
const morgan = require('morgan')
const handlebars = require('express-handlebars')
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')
const passport = require('passport')

const { database } = require('./keys')

const app = express()
require('./lib/passport')

// Configuraciones
app.set('port', process.env.PORT || 4000)
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', handlebars({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs')

// Middlewares
app.use(session({
    secret: 'reunionesSession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}))
app.use(flash())
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(passport.initialize())
app.use(passport.session())


// Variables globales
app.use((req, res, next) => {
    app.locals.success = req.flash('success')
    app.locals.delete = req.flash('delete')
    app.locals.update = req.flash('update')
    app.locals.update = req.flash('mensaje')
    app.locals.user = req.user
    next()
})

// Rutas
app.use(require('./routes/index'))
app.use(require('./routes/auth'))
app.use('/reunion', require('./routes/reunion'))
app.use('/curso', require('./routes/cursos'))

// Public
app.use(express.static(path.join(__dirname, 'public')))

app.listen(app.get('port'), () =>{
    console.log('Server on port: ' + app.get('port'))
})
