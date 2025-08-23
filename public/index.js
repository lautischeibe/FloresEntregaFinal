const socket = io(); // Conexión con el servidor

const formNewProduct = document.getElementById("formNewProduct");
const productList = document.getElementById("product-list");

formNewProduct.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formNewProduct);
    const productData = {};

    formData.forEach((value, key) => {
        productData[key] = value;
    });

    socket.emit("newProduct", productData);
    formNewProduct.reset(); // Limpia el formulario después de enviar
});

socket.on("productAdded", (newProduct) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
    <h3>${newProduct.title}</h3>
    <p><strong>ID:</strong> ${newProduct._id}</p>
    <p>${newProduct.description}</p>
    <p><strong>Precio:</strong> $${newProduct.price}</p>
    <p><strong>Categoría:</strong> ${newProduct.category}</p>
`;

    productList.appendChild(card);
});