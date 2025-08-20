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
    const productList = document.getElementById("product-list");

        card.innerHTML = `
        <h3>${newProduct.title}</h3>
        <p>${newProduct.productId}</p>
        <p>${newProduct.description}</p>
        <><strong>Precio:</strong> $${newProduct.price}</  p>
        <p><strong>Categoría:</strong> ${product.category}</p>
    `;
})