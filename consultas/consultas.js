const {pool} = require("../config/db.js");

// importo archivo para manejo de errores
const {errores} = require("../error/Errores.js");


//nombre de la tabla; se agrega tabla vacía y tabla no existente para manejar errores
const tabla1 = "usuarios";
const tabla2 = "transferencias"
//const tabla1 = "nouser";//tabla vacía
//const tabla2 = "notrans";//tabla vacia
//const tabla1 = "ninguna1";//tabla no existente
//const tabla2 = "ninguna2";//tabla no existente



//agregar Usuario

const agregaUsuario = async (nombre, balance) => {
  try {
    //Convierto nombres de usuarios en minusculas y quito espacios antes y al final del nombre;
    //para realizar validación y restringir duplicidad de usuarios
    const usuariomin = nombre.trim().toLowerCase();
   
    //verifico si el usuario ya existe en la tabla
    const existeUsuario = await pool.query({
      text: `SELECT * FROM ${tabla1} WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))`,
      values: [usuariomin],
    });
      if (existeUsuario.rowCount > 0) {
      return `El Usuario ${nombre} ya existe en la Base de Datos, favor revise los datos o ingrese un Usuario nuevo`;
     }
    //si no existe, agrego el usuario
    const result = await pool.query({
      text: `INSERT INTO ${tabla1} (nombre, balance) VALUES ($1, $2) RETURNING *`,
      values: [nombre, balance]
    });
    const usuarioAgregado = result.rows[0];
    console.log(`Usuario ${usuarioAgregado.nombre} con $ ${usuarioAgregado.balance} agregado con éxito`);
    console.log("Usuario Agregado: ", usuarioAgregado);
    console.log(usuarioAgregado);
    res.json(`El Usuario ${usuarioAgregado.nombre} con $ ${usuarioAgregado.balance} fue agregado correctamente al registro.`);// Devuelve los datos del usuario agregado
  return; 
  } catch (error) { //manejo de errores
    console.log(`Error al agregar al usuario ${nombre}`);
    const EE = errores(error.code, error.status, error.message);
    console.log(
      "Status ",
      EE.status,
      " |Error Cod. ",
      EE.code,
      "|",
      EE.message
    );
    return EE;
  }
};



//--------------------------------------------------------------

//lista todas Usuarios con sus balances

const listaUsuarios = async () => {
  try {
    const res = await pool.query({
      // consulta para listar todos los usuarios y sus balances
           text: `SELECT * FROM ${tabla1}`,
    });
    // bloque if para validar si la tabla está vacía
    if (res.rowCount === 0) {
      console.log(
        `No existen Usuarios en el registro; favor agregar y repetir la consulta.`
      );
      return `No existen Usuarios en el registro; favor agregar y repetir la consulta.`;
    } else {
      console.log(`Usuarios existentes en el registro`, res.rows);
      // Devuelve los resultados de la consulta 
      return res.rows;
    }
  } catch (error) {
    const EE = errores(error.code, error.status, error.message);
    console.log(
      "Status ",
      EE.status,
      " |Error Cod. ",
      EE.code,
      "|",
      EE.message
    );
    return EE;
  }
};


//----------------------------------------------------

//editar la informcion de un usuario por id

// const editaUser = async (id, nombre, balance) => {
//   try {
//     //verifico si el usuario ya existe en la tabla
//     const existeUser = await pool.query({
//       text: `SELECT * FROM ${tabla1} WHERE id = $1`,
//       values: [id],
//     });
//     console.log(existeUser);
//     if (existeUser.rowCount == 0) {
//       return `El Usuario ID ${id} no existe en la base de datos, seleccione uno existente para editar.`;
//     } else {
//       //si existe, modifico La info del usuario
//       const result = await pool.query({
//         text: `UPDATE ${tabla1} SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *;`,
//         values: [id, nombre, balance],
//       });
//       const usuarioEditado = result.rows[0];
//       console.log(`Usuario ${usuarioEditado.nombre} con $ ${usuarioEditado.balance} actualizado con éxito.`);
//       console.log("Canción Editada: ", result.rows[0]);
//       console.log(result.rows[0]);
//       return (`El Usuario ${usuarioEditado.nombre} con $ ${usuarioEditado.balance} fue editado correctamente.`);
//     } // Devuelve los datos del usuario editada
//   } catch (error) {
//     console.log("Error al editar el usuario");
//     const EE = errores(error.code, error.status, error.message);
//     console.log(
//       "Status ",
//       EE.status,
//       " |Error Cod. ",
//       EE.code,
//       "|",
//       EE.message
//     );
//     return EE;
//   }
// };
const editaUser = async (id, nombre, balance) => {
  try {
    // Verifica si el usuario ya existe en la tabla
    const existeUser = await pool.query({
      text: `SELECT * FROM ${tabla1} WHERE id = $1`,
      values: [id],
    });

    console.log(existeUser);

    if (existeUser.rowCount == 0) {
      return { msg:`El Usuario ID ${id} no existe en la base de datos, seleccione uno existente para editar.`};
    } else {
      // Si existe, modifica la información del usuario
      const result = await pool.query({
        text: `UPDATE ${tabla1} SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *;`,
        values: [id, nombre, balance],
      });

      const usuarioEditado = result.rows[0];
      console.log(`Usuario ${usuarioEditado.nombre} con $ ${usuarioEditado.balance} actualizado con éxito.`);
      console.log("Usuario Editado: ", result.rows[0]); 
      console.log(usuarioEditado); 
      return {msg : `El Usuario ${usuarioEditado.nombre} con $ ${usuarioEditado.balance} fue editado correctamente.`}; 
    }
  } catch (error) {
    console.log("Error al editar el usuario:", error); 
    const EE = errores(error.code, error.status, error.message);
    console.log(
      "Status ",
      EE.status,
      " |Error Cod. ",
      EE.code,
      "|",
      EE.message
    );
    return EE;
  }
};

//---------------------------

// consulta transferencia

const transferencia = async (emisor, receptor, monto) => {
  let IdEmisor,IdReceptor; // Declaro variables para id de tabla transferencias
  try {
    const {rows} = await pool.query({ //obtengo los  Id del emisor y receptor
      text: `SELECT id FROM ${tabla1} WHERE nombre = $1 OR nombre = $2`,
      values: [emisor, receptor],
    });
    //console.log(emisor,receptor);
    //console.log(rows.length);
    if (rows.length === 2) {
      IdEmisor = rows[0].id;
      IdReceptor = rows[1].id;
    }else if(rows.length === 1) {
      IdEmisor = IdReceptor = rows[0].id;
      //throw new Error("El receptor y el emisor son la misma persona.");
      return { msg: "El receptor y el emisor son la misma persona." };
    } else {
      throw new Error("El nombre del emisor o receptor no existe");
    }

    await pool.query("BEGIN"); // Inicia la transacción

    // Descuento el monto del balance del emisor
    await pool.query({
      text: `UPDATE ${tabla1} SET balance = balance - $1 WHERE nombre = $2`,
      values: [monto, emisor]
    });

    // Agrego el monto al balance del receptor
    await pool.query({
      text: `UPDATE ${tabla1} SET balance = balance + $1 WHERE nombre = $2`,
      values: [monto, receptor],
    });

    // Registra la transferencia en la tabla de transferencias
    await pool.query({
      text: `INSERT INTO ${tabla2} (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, current_timestamp)`,
      values: [IdEmisor, IdReceptor, monto]
    });

    await pool.query("COMMIT"); // Confirma la transacción
    return { msg: "Transferencia realizada con éxito." };
  } catch (error) {
    await pool.query("ROLLBACK"); // Revierte la transacción en caso de error
    console.error("Error al realizar la transferencia:", error);
    const EE = errores(error.code, error.status, error.message);
    console.log(
      "Status ",
      EE.status,
      " |Error Cod. ",
      EE.code,
      "|",
      EE.message
    );
    return { msg: "Status: "+ EE.status +" "+ "Cod: "+EE.code +"  "+EE.message }; 
  }
};

//---------------------------

// lista de transferencias

const listaTransfer = async () => {
  try {
    const res = await pool.query({ //realizo un inner join para mostrar los nombres del receptor y el emisor en la consulta
      text: `
        SELECT t.fecha, emisor.nombre AS emisor, receptor.nombre AS receptor, t.monto
        FROM ${tabla2} t JOIN ${tabla1} emisor ON t.emisor = emisor.id 
        JOIN ${tabla1} receptor ON t.receptor = receptor.id;`,
    });

    if (res.rowCount === 0) {
      console.log(
        `No existen Transferencias en el registro; favor realizar y repetir la consulta.`
      );
      return `No existen Transferencias en el registro; favor realizar y repetir la consulta.`;
    } else {
      console.log(`Transferencias existentes en el registro`, res.rows);
      return res.rows;
    }
  } catch (error) {
    const EE = errores(error.code, error.status, error.message);
    console.log(
      "Status ",
      EE.status,
      " |Error Cod. ",
      EE.code,
      "|",
      EE.message
    );
    return EE;
  }
};

//eliminar Usuario

// async function eliminar(id) {
//   const result = await pool.query(
//     "DELETE FROM usuarios WHERE id = $1 RETURNING *",
//     [id]
//   );
//   return result.rows[0]; //devuelve el registro eliminado
// }

const borraUsuario = async (id) => {
  try {
    //verifico si la canción ya existe en la tabla
    const existeUsuario = await pool.query({
      text: `SELECT * FROM ${tabla1} WHERE id = $1`,
      values: [id],
    });
    console.log(existeUsuario);
    if (existeUsuario.rowCount === 0) {
      return `El Usuario no existe en el listado, favor revisar o eliminar mediante tabla de usuarios.`;
    }else{
    
    //si existe, elimino el registro
      const result = await pool.query({
      text: `DELETE FROM ${tabla1} WHERE id = $1 RETURNING *;`,
      values: [id]
    });
    const usuario = result.rows[0];
    console.log(`Usuario ${usuario.nombre} eliminado con éxito`);
    console.log("Usuario Eliminado: ",usuario);
    console.log(result.rows[0]);
    return `Usuario ${usuario.nombre} eliminado con éxito fue eliminado correctamente.`}; // Devuelve los datos del usuario eliminado
  } catch (error) {
    console.log("Error al eliminar el usuario");
    const EE = errores(error.code, error.status, error.message);
    console.log(
      "Status ",
      EE.status,
      " |Error Cod. ",
      EE.code,
      "|",
      EE.message
    );
    return EE;
  }
};

module.exports = {agregaUsuario, listaUsuarios, editaUser, transferencia, listaTransfer, borraUsuario};

console.log('Archivo de consultas cargado con éxito 👌');



