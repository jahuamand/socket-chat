const { io } = require('../server');

const {Usuarios} = require('../classes/usuarios');

const {crearMensaje} = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data,callback) => {

       // console.log(data);

        if (!data.nombre || !data.sala){
            return callback({
                error:true,
                mensaje:'El nombre/sala es necesario'
            })
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador',`${ data.nombre } se unió`));

        return callback(usuarios.getPersonasPorSala(data.sala));
        //console.log(usuario);

    } );

    client.on('crearMensaje',(data,callback) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje( persona.nombre,data.mensaje );
        client.broadcast.to(persona.sala).emit('crearMensaje',mensaje);
        
        callback( mensaje );

    });

    client.on('disconnect',() => {

       let personaBorrada = usuarios.borrarPersona( client.id );

        // client.broadcast.emit('crearMensaje', {
        //     usuario:'Administrador',
        //     mensaje:`${ personaBorrada.nombre } abandonó el chat`
        // });

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador',`${ personaBorrada.nombre } salió`));

        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));


    });
    
    //Mensajes privados
    client.on('mensajePrivado',data => {
        //HuvgMXyOojpqly10AAAF
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(persona.nombre,data.mensaje));

        //Consola: socket.emit('mensajePrivado',{mensaje:'Hola a Juan', para:'eKV2_Fa-UVlc__3dAAAF'});

    });

}); 