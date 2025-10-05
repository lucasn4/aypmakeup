import { useState } from "react";

export default function TarjetaEditor({ tarjeta, onClose, onUpdated }) {
  const [nombre, setNombre] = useState(tarjeta.nombre);
  const [categoria, setCategoria] = useState(tarjeta.categoria);
  const [precio, setPrecio] = useState(tarjeta.precio);
  const [stock, setStock] = useState(tarjeta.stock);
  const [imagenes, setImagenes] = useState(tarjeta.imagenes || []);
  const [newFiles, setNewFiles] = useState([]);

  const handleRemoveImagen = (index) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("categoria", categoria);
    formData.append("precio", precio);
    formData.append("stock", stock);
    formData.append("imagenesExistentes", JSON.stringify(imagenes));

    newFiles.forEach((file) => formData.append("imagenes", file));

    await fetch(`http://192.168.1.4:5000/api/tarjetas/${tarjeta.idtarjeta}`, {
      method: "PUT",
      credentials: "include", // 👈 importante para enviar cookies
      headers: {
        "Content-Type": "application/json"
      },
      body: formData,
    });

    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-4">Editar Tarjeta</h2>

        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />

        <div className="mb-3">
          <h3 className="font-semibold">Imágenes</h3>
          {imagenes.map((img, i) => (
            <div key={i} className="flex items-center gap-2 mt-1">
              <img src={img} className="w-16 h-16 object-cover rounded" />
              <button
                className="text-red-500"
                onClick={() => handleRemoveImagen(i)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => setNewFiles([...e.target.files])}
          className="mb-3"
        />

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-400 rounded" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-green-500 text-white rounded"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
