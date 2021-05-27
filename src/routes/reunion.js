const express = require('express')
const { render } = require('timeago.js')
const { route } = require('.')
const router = express.Router()

const pool = require('../database')
const { isLoggedIn } = require('../lib/auth_sesion')

router.get('/estudiante', (req, res) => {
    res.render('estudiante/acceso')
})

router.post('/acceso', async (req, res) => {
    const {identificacion, pass} = req.body
    console.log(req.body)
    console.log(identificacion + " + " + pass)
    const result = await pool.query('SELECT * FROM estudiante WHERE identificacion = ? AND pass = ?', [identificacion, pass])
    if(result.length > 0 ){
        const cursos = await pool.query('SELECT id_matricula, id_estudiante, id_curso, nombre_curso FROM matricula INNER JOIN estudiante ON identificacion = id_estudiante INNER JOIN curso ON id_curso = idcurso WHERE identificacion = ?', [identificacion])
        res.render('estudiante/cursos', {cursos})
    }else{
        req.flash('delete', 'Documento de identidad o contraseña incorrectos')
        res.redirect('/reunion/estudiante')
    }
})

router.get('/all/:idcurso', async (req, res) => {
    const { idcurso } = req.params
    const badge = 'badge bg-dark text-white'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE curso = ?', [idcurso])
    res.render('estudiante/reuniones', {reuniones, idcurso, badge})
})

router.get('/cancelada-e/:idcurso', async (req, res) => {
    const { idcurso } = req.params
    const badge = 'badge bg-danger text-white'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE estado = "Cancelada" AND curso = ?', [idcurso])
    res.render('estudiante/reuniones', {reuniones, idcurso, badge})
})

router.get('/pendientes-e/:idcurso', async (req, res) => {
    const { idcurso } = req.params
    const badge = 'badge bg-warning text-dark'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE estado = "Pendiente" AND curso = ?', [idcurso])
    res.render('estudiante/reuniones', {reuniones, idcurso, badge})
})

router.get('/finalizada-e/:idcurso', async (req, res) => {
    const { idcurso } = req.params
    const badge = 'badge bg-success text-white'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE estado = "Finalizada" AND curso = ?', [idcurso])
    res.render('estudiante/reuniones', {reuniones, idcurso, badge})
})

router.get('/curso-estudiante/:idcurso', async (req, res) => {
    const { idcurso } = req.params
    const badge = 'badge bg-dark text-white'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE curso = ?', [idcurso])
    res.render('estudiante/reuniones', {reuniones, idcurso, badge})
})


router.get('/add/:idcurso', isLoggedIn, async (req, res) => {
    const { id } = req.app.locals.user
    const { idcurso } = req.params
    const allCourse = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [idcurso])

    res.render('reunion/add', {curso: allCourse[0]})
})

router.post('/add', isLoggedIn, async (req, res) => {
    const {nombre_reunion, descripcion, fecha, hora, link, estado, curso} = req.body
    const nuevaReunion = {
        nombre_reunion, 
        descripcion,
        fecha, 
        hora, 
        link, 
        estado,
        curso
    }
    await pool.query('INSERT INTO reunion set ?', [nuevaReunion])   
    req.flash('success', 'Reunión creada correctamente.');

    res.redirect('/reunion/' + curso + '')
})

router.get('/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params
    const badge = 'badge bg-dark text-white'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE curso = ? ORDER BY fecha ASC', [id])
    res.render('reunion/lista', {reuniones, id,badge})
})

router.get('/edit/:idreunion', isLoggedIn, async (req, res) => {
    const { id } = req.app.locals.user
    const { idreunion, idcurso } = req.params
    const cursosDocente = await pool.query('SELECT * FROM curso WHERE id_docente = ?', [id])
    const dataReunion = await pool.query('SELECT * FROM reunion WHERE id_reunion = ?', [idreunion])

    var fecha = dataReunion[0].fecha

    var dia = fecha.getDate()
    var mes = fecha.getMonth() +1

    if(mes >= 1 && mes <= 9){
        mes = "0" + mes
    }
    if(dia >= 1 && dia <=9){
        dia = "0" + dia
    }  

    fechaFormat = fecha.getFullYear() + "-" + mes + "-" + dia
    res.render('reunion/edit', {reunion: dataReunion[0], fechaFormat,cursosDocente})
})

router.post('/edit/:idreunion', isLoggedIn, async (req, res) => {
    const {idreunion} = req.params
    const {nombre_reunion, descripcion, fecha, hora, link, estado, curso} = req.body
    const updateReunion = {
        nombre_reunion, 
        descripcion,
        fecha, 
        hora, 
        link, 
        estado,
        curso
    }

    await pool.query('UPDATE reunion SET ? WHERE id_reunion = ?', [updateReunion, idreunion])
    req.flash('update', 'Reunión actualizada correctamente.');
    res.redirect('/reunion/' + curso + '')
})

router.get('/delete/:idreunion/:curso', isLoggedIn, async (req, res) => {
    const { idreunion, curso } = req.params
    await pool.query('DELETE FROM reunion WHERE id_reunion = ?', [idreunion])
    req.flash('delete', 'Reunión eliminada satisfactoriamente.');

    res.redirect('/reunion/' + curso + '')
})

router.get('/students/:curso', isLoggedIn, async (req, res) => {
    const {curso} = req.params
    const students = await pool.query('SELECT identificacion,fullname, email FROM matricula INNER JOIN estudiante ON identificacion = id_estudiante  INNER JOIN curso ON id_curso = idcurso WHERE idcurso = ?', [curso])
    res.render('curso/listStudents', {students, curso})
})

router.get('/pendientes/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params
    const badge = 'badge bg-warning text-dark'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE estado = "Pendiente" AND curso = ?', [id])
    res.render('reunion/lista', {reuniones, id, badge})
})

router.get('/cancelada/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params
    const badge = 'badge bg-danger'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE estado = "Cancelada" AND curso = ?', [id])
    console.log(reuniones)
    res.render('reunion/lista', {reuniones, id, badge})
})

router.get('/finalizada/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params
    const badge = 'badge bg-success'
    const reuniones = await pool.query('SELECT * FROM reunion WHERE estado = "Finalizada" AND curso = ?', [id])
    res.render('reunion/lista', {reuniones, id, badge})
})



module.exports = router