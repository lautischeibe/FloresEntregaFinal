const socket = io(); // Conexión con el servidor


const formNewProduct = document.getElementById("formNewProduct");

formNewProduct.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formNewProduct);
    const productData = {};

    formData.forEach((value, key) => {
        productData[key] = value;
    });

    // Enviar el producto al servidor
    socket.emit("newProduct", productData);
})

socket.on("productAdded", (newProduct) => {
    
})