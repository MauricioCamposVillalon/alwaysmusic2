const { Pool } = require('pg');

const config = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'amusic',
    password: 'admin',
    port: 5432,
    max: 20, // maximo de conecciones 20 personas
    idleTimeoutMillis: 5000, // tiempo maximio de inactividad 5 segundos
    connnectionTimeoutMillis: 2000 // 2 segundos de tiempo de espera

};

const argumentos = process.argv.slice(2);
let comando = argumentos[0].toLowerCase(); 
let nombre, rut, curso, nivel;


const nuevo = (nombre, rut, curso, nivel) => {
    console.log(nombre, rut, curso, nivel);
    const pool = new Pool(config);
    pool.connect(async (error_conexion, client, release) => {
        if (error_conexion) {
            console.log("Ha ocurrido un error al conectarse a la DDBB.", error_conexion.message)
            release();
        } else {
            try {
                const consultaSQL = {
                    name: "insertar-usuario-node",
                    rowMode: "array",
                    text: "INSERT INTO alumno (nombre,rut,curso,nivel) VALUES ($1,$2,$3,$4) RETURNING *;",
                    values: [nombre, rut, curso, nivel],
                }
                const res = await client.query(consultaSQL);
                console.log(res.rows);
                release();

            } catch (error) {
                release();
                errores(error.code);
            }
        }
        pool.end();
    })
}

const consulta = () => {
    const pool = new Pool(config);
    pool.connect(async (error_conexion, client, release) => {
        if (error_conexion) {
            console.log("Ha ocurrido un error al conectarse a la DDBB.", error_conexion.message)
            release();
        } else {
            try {
                const consultaSQL = {
                    name: "consulta-rut",
                    rowMode: "array",
                    text: "SELECT * FROM alumno",
                }
                const res = await client.query(consultaSQL);
                console.log(res.rows);
                release();
            } catch (error) {
                release();
                errores(error.code);
            }
        }
        pool.end();
    })
}

const buscar_rut = (rut) => {
    const pool = new Pool(config);
    pool.connect(async (error_conexion, client, release) => {
        if (error_conexion) {
            console.log("Ha ocurrido un error al conectarse a la DDBB.", error_conexion.message)
            release();
        } else {
            try {
                const consultaSQL = {
                    name: "busca-alumno-rut",
                    rowMode: "array",
                    text: "SELECT nombre, rut, curso, nivel FROM alumno WHERE rut=$1;",
                    values: [rut],
                }
                const res = await client.query(consultaSQL);
                if(res.rows==""){
                    console.log(`No se encontro ningun dato que contenga el valor: ${rut}`);
                }else{
                    console.log(res.rows)
                }
                release();
            } catch (error) {
                release();
                errores(error.code);
            }
        }
        pool.end();
    })
}

const eliminar = (rut) => {
    const pool = new Pool(config);
    pool.connect(async (error_conexion, client, release) => {
        if (error_conexion) {
            console.log("Ha ocurrido un error al conectarse a la DDBB.", error_conexion.message)
            release();
        } else {
            try {
                const consultaSQL = {
                    name: "elimina-alumno-rut",
                    rowMode: "array",
                    text: "DELETE FROM alumno WHERE rut=$1 RETURNING *",
                    values: [rut],
                }
                const res = await client.query(consultaSQL);
                if(res.rows==""){
                    console.log(`No se encontro ningun dato que contenga el valor: ${rut}`);
                }else{
                    console.log("Se elimino registro :",res.rows)
                }
                release();
            } catch (error) {
                release();
                errores(error.code);
            }
        }
        pool.end();
    })

}




const actualizar = (nombre, rut, curso, nivel) => {
    const pool = new Pool(config);
    pool.connect(async (error_conexion, client, release) => {
        if (error_conexion) {
            console.log("Ha ocurrido un error al conectarse a la DDBB.", error_conexion.message)
            release();
        } else {
            try {
                const consultaSQL = {
                    name: "actualizar-dato-alumno",
                    rowMode: "array",
                    text: "UPDATE alumno SET nombre =$1,curso=$3, nivel=$4 WHERE id =( SELECT id FROM alumno where  rut=$2) RETURNING *",
                    values: [nombre,rut,curso,nivel],
                }
                const res = await client.query(consultaSQL);
                if(res.rows==""){
                    console.log(`No se encontro ningun dato que contenga el valor: ${rut}`);
                }else{
                    console.log(res.rows)
                }
                release();
            } catch (error) {
                release();
                errores(error.code);
            }
        }
        pool.end();
    })
}





switch (comando) {
    case 'nuevo':
        nombre = argumentos[1];
        rut = argumentos[2];
        curso = argumentos[3];
        nivel = argumentos[4];
        nuevo(nombre, rut, curso, nivel);
        break;
    case 'consulta':
        consulta();
        break;
    case 'editar':
        nombre = argumentos[1];
        rut = argumentos[2];
        curso = argumentos[3];
        nivel = argumentos[4];
        actualizar(nombre, rut, curso, nivel)
        break;
    case 'rut':
        rut = argumentos[1];
        buscar_rut(rut)
        break;
    case 'eliminar':
        rut = argumentos[1];
        eliminar(rut)
        break;
    default:
        console.log("Se ha ingresado una opcion invalida");
        break;
}


function errores(err){
    if(err =="23505"){
        console.log("Error de restricción de integridad");
        console.log("  violación en valor único en la BDD al ingresar un valor");
    }else if( err=="42601"){
        console.log("Error de sintaxis");
    }else if (err="42830"){
        console.log("Error Llave foranea invalida");
    }else if (err="42602"){
        console.log("Error Nombre Invalido");
    }else if (err="42P01"){
        console.log("Error Tabla no definida");
    }else if (err="42501"){
        console.log("Error Privilegios insuficientes");
    }else{
        console.log("Error no catalogado");
        console.log(`anote el error ${err} y comuniquese con soporte`);
    }
}

