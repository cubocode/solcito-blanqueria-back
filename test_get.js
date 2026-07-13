async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/proveedores');
    console.log('STATUS:', res.status);
    const data = await res.json();
    console.log('DATA:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
