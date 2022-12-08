const { response } = require('express');
const { Curso } = require('../models');


const obtenerCursos = async(req, res = response ) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, cursos ] = await Promise.all([
        Curso.countDocuments(query),
        Curso.find(query)
            .populate('usuario', 'nombre')
            .populate('categoria', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        total,
        cursos
    });
}

const obtenerCurso = async(req, res = response ) => {

    const { id } = req.params;
    const curso = await Curso.findById( id )
                            .populate('usuario', 'nombre')
                            .populate('categoria', 'nombre');

    res.json( curso );

}

const crearCurso = async(req, res = response ) => {

    const { estado, usuario, ...body } = req.body;

    const cursoDB = await Curso.findOne({ nombre: body.nombre });

    if ( cursoDB ) {
        return res.status(400).json({
            msg: `El curso ${ cursoDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const curso = new Curso( data );

    // Guardar DB
    await curso.save();

    res.status(201).json(curso);

}

const actualizarCurso = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    if( data.nombre ) {
        data.nombre  = data.nombre.toUpperCase();
    }

    data.usuario = req.usuario._id;

    const curso = await Curso.findByIdAndUpdate(id, data, { new: true });

    res.json( curso );

}

const borrarCurso = async(req, res = response ) => {

    const { id } = req.params;
    const cursoBorrado = await Curso.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json( cursoBorrado );
}




module.exports = {
    crearCurso,
    obtenerCursos,
    obtenerCurso,
    actualizarCurso,
    borrarCurso
}