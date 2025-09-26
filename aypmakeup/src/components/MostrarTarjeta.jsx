export default function MostrarTarjeta({ tarjeta, user, onEdit, onDelete }) {
  return (
    <div className="border rounded-xl p-4 shadow-md bg-white">
      <h2 className="text-lg font-bold">{tarjeta.nombre}</h2>

      {tarjeta.imagenes?.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={tarjeta.nombre}
          className="w-full h-40 object-cover rounded-md my-2"
        />
      ))}

      <p className="text-gray-600">{tarjeta.categoria}</p>
      <p className="text-green-700 font-semibold">${tarjeta.precio}</p>
      <p className="text-sm text-gray-500">Stock: {tarjeta.stock}</p>

      <div className="flex gap-2 mt-2">
        <button className="px-3 py-1 bg-blue-500 text-white rounded">
          🛒 Agregar
        </button>

        {user?.role === "admin" && (
          <>
            <button
              className="px-3 py-1 bg-yellow-500 text-white rounded"
              onClick={() => onEdit(tarjeta)}
            >
              ✏️ Editar
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={() => onDelete(tarjeta.idtarjeta)}
            >
              🗑️ Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
