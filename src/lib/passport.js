const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const pool = require('../database')
const helpers = require('../lib/helpers')

passport.use('local.signin', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pass',
    passReqToCallback: true
}, async(req, id, pass, done) => {
    console.log(req.body)
    console.log(id)
    console.log(pass)
    const resultado = await pool.query('SELECT * FROM docente WHERE id = ?', [id])
    console.log(resultado)
    if(resultado.length > 0){
        const user = resultado[0]
        const validPassword = await helpers.matchPassword(pass, user.pass)
        if(validPassword){
            done(null, user, req.flash('success','Bienvenido(a) ' + user.nombre))
        }else{
            done(null, false, req.flash('mensaje', 'Documento de identidad o contraseña incorrectos'))
        }
    }else{
        return done(null, false, req.flash('mensaje', 'Usuario ingresaro no existe en nuestra base de datos'))
    }
}))

passport.use('local.signup', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, id, pass, done) => {
    const {nombre, email, profesion} = req.body
    const newDocente = {
        id,
        nombre,
        email,
        profesion,
        pass
    }

    newDocente.pass = await helpers.encryptPassword(pass)

    const result = await pool.query('INSERT INTO docente SET ?', [newDocente])
    
    return done(null, newDocente)
}))

passport.serializeUser((usuario, done) => {
    done(null, usuario.id)
})

passport.deserializeUser( async (id, done) => {
    const filas = await pool.query('SELECT * FROM docente WHERE id = ?', [id])
    done(null, filas[0])
})