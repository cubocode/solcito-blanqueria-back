async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/proveedores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: 'Proveedor Testeo',
        telefono: '123456',
        email: 'test@test.com',
        direccion: 'Calle Falsa 123',
        notas: 'Notas de testeo'
      })
    });
    console.log('STATUS:', res.status);
    const data = await res.json();
    console.log('RESPONSE:', data);
  } catch (err) {
    console.error(err);
  }
}
test();
