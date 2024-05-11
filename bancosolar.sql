CREATE DATABASE bancosolar;
CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nombre VARCHAR(50),
balance FLOAT CHECK (balance >= 0));

CREATE TABLE transferencias (id SERIAL PRIMARY KEY, emisor INT, receptor
INT, monto FLOAT, fecha TIMESTAMP, FOREIGN KEY (emisor) REFERENCES
usuarios(id), FOREIGN KEY (receptor) REFERENCES usuarios(id));

// para poder eliminar usuarios que ya hayan realizado transferencias,debo confugurar
// una restriccion para la fk con la opción ON DELETE CASCADE asi que modifico la instruccion
// para crear la tabla transferencias

CREATE TABLE transferencias (
    id SERIAL PRIMARY KEY,
    emisor INT,
    receptor INT,
    monto FLOAT,
    fecha TIMESTAMP,
    FOREIGN KEY (emisor) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receptor) REFERENCES usuarios(id) ON DELETE CASCADE
);

// si se necesita realizar el cambio con la tabla creada, se puede modificar en las siguientes instrucciones

Primero se elimina las restricciones de fk existentes

ALTER TABLE transferencias DROP CONSTRAINT transferencias_emisor_fkey;
ALTER TABLE transferencias DROP CONSTRAINT transferencias_receptor_fkey;

Luego se agregan las restricciones con on delete cascade

ALTER TABLE transferencias 
  ADD CONSTRAINT transferencias_emisor_fkey 
  FOREIGN KEY (emisor) 
  REFERENCES usuarios(id) 
  ON DELETE CASCADE;

ALTER TABLE transferencias 
  ADD CONSTRAINT transferencias_receptor_fkey 
  FOREIGN KEY (receptor) 
  REFERENCES usuarios(id) 
  ON DELETE CASCADE;

