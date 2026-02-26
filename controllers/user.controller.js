export const test = (req, res) => {
    res.json({ message: '¡API funcionando correctamente!' });
};

// Asegúrate de que esta función EXISTA y se llame igual
export const getUser = (req, res) => {
    // Tu lógica aquí
    res.json({ message: "Obteniendo usuario..." });
};