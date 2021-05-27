const express = require('express')
const { render } = require('timeago.js')
const router = express.Router()

const pool = require('../database')
const { isLoggedIn } = require('../lib/auth_sesion')

router.get('/', isLoggedIn, async (req, res) => {
    const {id} = req.app.locals.user
    console.log(id)
    const cursos = await pool.query('SELECT * FROM curso WHERE id_docente = ?', [id])

    pool.query('')
    res.render('curso/list', {cursos})
})

router.get('/course/:id', isLoggedIn, async(req, res) => {
    const {id} = req.params

    const estudiantes = await pool.query('SELECT identificacion,fullname, email FROM matricula INNER JOIN estudiante ON identificacion = id_estudiante  INNER JOIN curso ON id_curso = idcurso WHERE idcurso = ?', [id])
    console.log(estudiantes)
    res.redirect('/reunion/'+ id + '')
})

router.get('/add/', isLoggedIn, (req, res) => {
    const {id} = req.app.locals.user
    res.render('curso/add', {id})
})

router.post('/add/', isLoggedIn, async (req, res) => {
    const {id_curso, nombre_curso, id_docente} = req.body
    const dataCurso = {
        id_curso,
        nombre_curso,
        id_docente
    }
    console.log(dataCurso)
    await pool.query('INSERT INTO curso set ?', [dataCurso])
    req.flash('success', 'Curso ' + nombre_curso +' creado satisfactoriamente')
    res.redirect('/reunion/' + id_curso +'')
})

module.exports = router