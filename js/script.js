let carrito = [];
let productoEditando = null;

function actualizarCantidad() {
    document.querySelectorAll("#cantidad").forEach(function(elemento) {
        elemento.textContent = carrito.length;
    });
}

function agregar() {
    let topping1 = document.getElementById("topping1").value;
    let topping2 = document.getElementById("topping2").value;
    let extra = document.getElementById("extra").value;

    let precio = 1200;

    if (extra != "Ninguno") {
        precio = 1400;
    }

    let producto = {
        nombre: "Chicha venezolana",
        toppings: topping1 + ", " + topping2,
        extra: extra,
        precio: precio
    };

    carrito.push(producto);
    actualizarCantidad();

    let caja = document.getElementById("carrito");
    if (caja && caja.classList.contains("mostrar")) {
        renderizarCarrito();
    }

    alert("Chicha agregada al carrito");
}

function mostrarCarrito() {
    let caja = document.getElementById("carrito");
    if (!caja) return;

    caja.classList.toggle("mostrar");
    renderizarCarrito();
}

function opcionesTopping(seleccionado) {
    let toppings = ["Ninguno", "Oreo", "M&M", "Chispas de chocolate"];
    return toppings.map(function(topping) {
        let estado = topping === seleccionado ? " selected" : "";
        return "<option" + estado + ">" + topping + "</option>";
    }).join("");
}

function renderizarCarrito() {
    let caja = document.getElementById("carrito");
    if (!caja) return;
    let texto = "<h2>Carrito</h2>";

    if (carrito.length == 0) {
        texto += "<p>El carrito está vacío.</p>";
    } else {
        let total = 0;

        for (let i = 0; i < carrito.length; i++) {
            let producto = carrito[i];
            texto += "<div class='cart-item'><strong>" + producto.nombre + "</strong>";

            if (productoEditando === i) {
                let toppings = producto.toppings.split(", ");
                texto +=
                    "<label for='editar-topping1-" + i + "'>Topping 1</label>" +
                    "<select id='editar-topping1-" + i + "'>" + opcionesTopping(toppings[0]) + "</select>" +
                    "<label for='editar-topping2-" + i + "'>Topping 2</label>" +
                    "<select id='editar-topping2-" + i + "'>" + opcionesTopping(toppings[1]) + "</select>" +
                    "<label for='editar-extra-" + i + "'>Extra</label>" +
                    "<select id='editar-extra-" + i + "'>" + opcionesTopping(producto.extra) + "</select>" +
                    "<div class='cart-actions'>" +
                    "<button class='boton' onclick='guardarEdicion(" + i + ")'>Guardar</button>" +
                    "<button class='boton' onclick='cancelarEdicion()'>Cancelar</button></div>";
            } else {
                texto +=
                    "<p>Toppings: " + producto.toppings +
                    "<br>Extra: " + producto.extra +
                    "<br>Precio: $" + producto.precio.toLocaleString("es-CL") + "</p>" +
                    "<div class='cart-actions'>" +
                    "<button class='boton' onclick='editarProducto(" + i + ")'>Editar</button>" +
                    "<button class='boton' onclick='eliminarProducto(" + i + ")'>Eliminar</button></div>";
            }

            texto += "</div>";

            total += producto.precio;
        }

        texto +=
            "<hr><h3>Total: $" +
            total.toLocaleString("es-CL") +
            "</h3>";

        texto +=
            "<button class='boton' onclick='comprar()'>Comprar</button>";
    }

    caja.innerHTML = texto;
}

function editarProducto(indice) {
    productoEditando = indice;
    renderizarCarrito();
}

function cancelarEdicion() {
    productoEditando = null;
    renderizarCarrito();
}

function guardarEdicion(indice) {
    let topping1 = document.getElementById("editar-topping1-" + indice).value;
    let topping2 = document.getElementById("editar-topping2-" + indice).value;
    let extra = document.getElementById("editar-extra-" + indice).value;

    carrito[indice].toppings = topping1 + ", " + topping2;
    carrito[indice].extra = extra;
    carrito[indice].precio = extra === "Ninguno" ? 1200 : 1400;
    productoEditando = null;
    renderizarCarrito();
}

function eliminarProducto(indice) {
    carrito.splice(indice, 1);
    productoEditando = null;
    actualizarCantidad();
    renderizarCarrito();
}

function comprar() {
    alert("¡Pedido realizado correctamente!");

    carrito = [];
    productoEditando = null;

    actualizarCantidad();

    document.querySelectorAll("#carrito").forEach(function(elemento) {
        elemento.classList.remove("mostrar");
        elemento.innerHTML = "";
    });
}

function enviar(evento) {
    evento.preventDefault();

    let nombre = document.getElementById("nombre").value;

    alert("Gracias " + nombre + ", recibimos tu mensaje.");
}

function obtenerCuentas() {
    let cuentas = JSON.parse(localStorage.getItem("chichacookUsers") || "[]");
    if (!Array.isArray(cuentas)) cuentas = [];

    let cuentaAnterior = JSON.parse(localStorage.getItem("chichacookUser") || "null");
    if (cuentaAnterior && !cuentas.some(function(cuenta) {
        return cuenta.username.toLowerCase() === cuentaAnterior.username.toLowerCase();
    })) {
        cuentas.push(cuentaAnterior);
        localStorage.setItem("chichacookUsers", JSON.stringify(cuentas));
    }

    return cuentas;
}

function actualizarNavegacionSesion() {
    let usuario = sessionStorage.getItem("chichacookSession");
    if (!usuario) return;

    document.querySelectorAll(".account-nav").forEach(function(navegacion) {
        navegacion.replaceChildren();

        let saludo = document.createElement("span");
        saludo.className = "session-user";
        saludo.textContent = "Hola, " + usuario;

        let botonCerrar = document.createElement("button");
        botonCerrar.className = "logout-button";
        botonCerrar.type = "button";
        botonCerrar.textContent = "Cerrar sesión";
        botonCerrar.addEventListener("click", cerrarSesion);

        navegacion.append(saludo, botonCerrar);
    });
}

function cerrarSesion() {
    sessionStorage.removeItem("chichacookSession");
    window.location.href = "index.html";
}

document.querySelector(".register-form")?.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let email = document.getElementById("email").value.trim().toLowerCase();
    let username = document.getElementById("register-username").value.trim();
    let password = document.getElementById("register-password").value;
    let displayName = document.getElementById("display-name").value.trim();
    let cuentas = obtenerCuentas();

    if (cuentas.some(function(cuenta) {
        return cuenta.email === email || cuenta.username.toLowerCase() === username.toLowerCase();
    })) {
        alert("Ese correo o usuario ya está registrado.");
        return;
    }

    cuentas.push({ email, username, password, displayName });
    localStorage.setItem("chichacookUsers", JSON.stringify(cuentas));
    alert("Cuenta creada. Ya puedes iniciar sesión.");
    window.location.href = "login.html";
});

document.querySelector(".login-form")?.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let identificador = document.getElementById("username").value.trim().toLowerCase();
    let password = document.getElementById("password").value;
    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(usuario) {
        return (identificador === usuario.email || identificador === usuario.username.toLowerCase()) && password === usuario.password;
    });

    if (!cuenta) {
        alert("Usuario, correo o contraseña incorrectos. Revisa tus datos o regístrate.");
        return;
    }

    sessionStorage.setItem("chichacookSession", cuenta.username);
    alert("¡Bienvenido/a, " + cuenta.displayName + "!");
    window.location.href = "index.html";
});

actualizarNavegacionSesion();