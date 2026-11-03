const LIMITE_PUNTOS_CUENTA = 15000;

function cargarCarrito() {
    try {
        let guardado = JSON.parse(sessionStorage.getItem("chichacookCart") || "[]");
        if (!Array.isArray(guardado)) return [];
        let opcionesToppingValidas = ["Ninguno", "Oreo", "M&M", "Chispas de chocolate"];
        return guardado.filter(function(producto) {
            if (!producto || producto.nombre !== "Chicha venezolana" || typeof producto.toppings !== "string") {
                return false;
            }
            let toppings = producto.toppings.split(", ");
            return toppings.length === 2 && toppings.every(function(topping) {
                return opcionesToppingValidas.includes(topping);
            }) && opcionesToppingValidas.includes(producto.extra) &&
                producto.precio === (producto.extra === "Ninguno" ? 1200 : 1400);
        }).map(function(producto) {
            return {
                nombre: producto.nombre,
                toppings: producto.toppings,
                extra: producto.extra,
                precio: producto.precio
            };
        });
    } catch (error) {
        return [];
    }
}

function guardarCarrito() {
    try {
        if (carrito.length) {
            sessionStorage.setItem("chichacookCart", JSON.stringify(carrito));
        } else {
            sessionStorage.removeItem("chichacookCart");
        }
        return true;
    } catch (error) {
        return false;
    }
}

let carrito = cargarCarrito();
let productoEditando = null;
let temporizadorResultadoJuego = null;
let temporizadorConfetiJuego = null;
let ventanaResultadoJuego = null;
let confetiJuego = null;

function limpiarConfetiJuego() {
    window.clearTimeout(temporizadorConfetiJuego);
    temporizadorConfetiJuego = null;
    if (confetiJuego) {
        confetiJuego.remove();
        confetiJuego = null;
    }
}

function mostrarConfetiJuego() {
    limpiarConfetiJuego();
    confetiJuego = document.createElement("div");
    confetiJuego.className = "game-confetti";
    confetiJuego.setAttribute("aria-hidden", "true");

    for (let indice = 0; indice < 42; indice++) {
        let pieza = document.createElement("span");
        pieza.className = "game-confetti-piece";
        pieza.style.left = Math.random() * 100 + "%";
        pieza.style.setProperty("--confetti-drift", (Math.random() * 260 - 130) + "px");
        pieza.style.animationDelay = Math.random() * 280 + "ms";
        pieza.style.animationDuration = 1800 + Math.random() * 800 + "ms";
        confetiJuego.append(pieza);
    }

    document.body.append(confetiJuego);
    temporizadorConfetiJuego = window.setTimeout(limpiarConfetiJuego, 3000);
}

function mostrarResultadoJuego(resultado, cantidad) {
    if (!ventanaResultadoJuego) {
        ventanaResultadoJuego = document.createElement("div");
        ventanaResultadoJuego.className = "game-result-popup";
        ventanaResultadoJuego.setAttribute("role", "status");
        ventanaResultadoJuego.setAttribute("aria-live", "assertive");
        ventanaResultadoJuego.setAttribute("aria-atomic", "true");
        document.body.append(ventanaResultadoJuego);
    }

    let titulo = resultado === "win"
        ? "¡Ganaste!"
        : resultado === "loss"
            ? "¡Has perdido!"
            : "Empate";
    let detalle = resultado === "tie"
        ? "No ganaste ni perdiste puntos."
        : (resultado === "win" ? "+" : "-") +
            cantidad.toLocaleString("es-CL") + " puntos";

    ventanaResultadoJuego.className = "game-result-popup is-" + resultado;
    ventanaResultadoJuego.replaceChildren();
    limpiarConfetiJuego();
    let tituloElemento = document.createElement("strong");
    tituloElemento.textContent = titulo;
    let detalleElemento = document.createElement("span");
    detalleElemento.textContent = detalle;
    ventanaResultadoJuego.append(tituloElemento, detalleElemento);
    if (resultado === "win") mostrarConfetiJuego();

    window.clearTimeout(temporizadorResultadoJuego);
    temporizadorResultadoJuego = window.setTimeout(function() {
        ventanaResultadoJuego.classList.remove("is-visible");
    }, 5000);
    ventanaResultadoJuego.classList.add("is-visible");
}

function actualizarCantidad() {
    document.querySelectorAll("#cantidad").forEach(function(elemento) {
        elemento.textContent = carrito.length;
    });
    document.querySelectorAll("header button[aria-label='Mostrar carrito']").forEach(function(boton) {
        boton.setAttribute("aria-controls", "carrito");
    });
}

let avisoActual = null;

function mostrarAviso(mensaje, tipo, alCerrar) {
    if (avisoActual) avisoActual.remove();

    let fondo = document.createElement("div");
    fondo.className = "aviso-fondo";
    let cuadro = document.createElement("section");
    cuadro.className = "aviso-cuadro" + (tipo ? " is-" + tipo : "");
    cuadro.setAttribute("role", "alertdialog");
    cuadro.setAttribute("aria-modal", "true");
    cuadro.setAttribute("aria-labelledby", "aviso-titulo");

    let titulo = document.createElement("h2");
    titulo.id = "aviso-titulo";
    titulo.textContent = tipo === "error" ? "Revisa esto" : tipo === "success" ? "Listo" : "Aviso";
    let detalle = document.createElement("p");
    detalle.textContent = mensaje;
    let boton = document.createElement("button");
    boton.className = "aviso-boton";
    boton.type = "button";
    boton.textContent = "Entendido";
    cuadro.append(titulo, detalle, boton);
    fondo.append(cuadro);

    let focoAnterior = document.activeElement;
    function cerrarAviso() {
        document.removeEventListener("keydown", cerrarConEscape);
        fondo.remove();
        avisoActual = null;
        if (focoAnterior && focoAnterior.isConnected) focoAnterior.focus();
        if (alCerrar) alCerrar();
    }
    function cerrarConEscape(evento) {
        if (evento.key === "Escape") cerrarAviso();
    }

    boton.addEventListener("click", cerrarAviso);
    fondo.addEventListener("click", function(evento) {
        if (evento.target === fondo) cerrarAviso();
    });
    document.addEventListener("keydown", cerrarConEscape);
    document.body.append(fondo);
    avisoActual = fondo;
    boton.focus();
}

function agregar() {
    let topping1 = document.getElementById("topping1").value;
    let topping2 = document.getElementById("topping2").value;
    let extra = document.getElementById("extra").value;

    if (!obtenerCuentaSesion()) {
        try {
            sessionStorage.setItem("chichacookPendingProduct", JSON.stringify({ topping1, topping2, extra }));
            sessionStorage.setItem("chichacookContinueAfterLogin", "services-add-product");
        } catch (error) {
            sessionStorage.removeItem("chichacookPendingProduct");
            sessionStorage.removeItem("chichacookContinueAfterLogin");
            mostrarAviso("Inicia sesión para agregar una chicha al carrito.", "error");
            return;
        }
        mostrarAviso("Para agregar una chicha al carrito debes iniciar sesión.", "error", function() {
            window.location.href = "login.html";
        });
        return;
    }

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
    if (!guardarCarrito()) {
        carrito.pop();
        mostrarAviso("No se pudo guardar el carrito en esta sesión. Libera espacio del navegador e inténtalo de nuevo.", "error");
        return;
    }
    actualizarCantidad();

    let caja = document.getElementById("carrito");
    if (caja && caja.classList.contains("mostrar")) {
        renderizarCarrito();
    }

    mostrarAviso("Chicha agregada al carrito.", "success");
}

function mostrarCarrito() {
    let caja = document.getElementById("carrito");
    if (!caja) return;

    let abierto = !caja.classList.contains("mostrar");
    caja.classList.toggle("mostrar", abierto);
    let botonCarrito = document.querySelector("header button[aria-label='Mostrar carrito']");
    if (botonCarrito) botonCarrito.setAttribute("aria-expanded", String(abierto));
    caja.setAttribute("role", "dialog");
    caja.setAttribute("aria-modal", "true");
    caja.setAttribute("aria-label", "Carrito de compras");
    caja.setAttribute("tabindex", "-1");
    let fondoCarrito = document.getElementById("carrito-backdrop");
    if (abierto) {
        if (!fondoCarrito) {
            fondoCarrito = document.createElement("button");
            fondoCarrito.id = "carrito-backdrop";
            fondoCarrito.className = "cart-backdrop";
            fondoCarrito.type = "button";
            fondoCarrito.setAttribute("aria-label", "Cerrar carrito");
            fondoCarrito.addEventListener("click", cerrarCarrito);
            document.body.append(fondoCarrito);
        }
        document.body.classList.add("cart-open");
    } else {
        if (fondoCarrito) fondoCarrito.remove();
        document.body.classList.remove("cart-open");
    }
    renderizarCarrito();
    if (abierto) {
        posicionarCarrito();
        let botonCerrar = caja.querySelector(".cart-close");
        if (botonCerrar) botonCerrar.focus();
    }
}

function posicionarCarrito() {
    let caja = document.getElementById("carrito");
    let encabezado = document.querySelector("header");
    let botonCarrito = document.querySelector("header button[aria-label='Mostrar carrito']");
    if (!caja || !encabezado || !botonCarrito) return;
    if (window.matchMedia("(max-width: 700px)").matches) return;

    let rectanguloEncabezado = encabezado.getBoundingClientRect();
    let rectanguloBoton = botonCarrito.getBoundingClientRect();
    let posicionMaxima = Math.max(8, window.innerHeight - 200);
    let arriba = Math.min(Math.max(8, rectanguloEncabezado.bottom + 8), posicionMaxima);
    let anchoContenido = document.documentElement.clientWidth;
    let anchoCarrito = Math.min(380, anchoContenido - 24);
    let derecha = Math.min(
        Math.max(12, anchoContenido - rectanguloBoton.right),
        Math.max(12, anchoContenido - anchoCarrito - 12)
    );
    let alturaMaxima = Math.max(120, window.innerHeight - arriba - 12);

    caja.style.setProperty("--cart-top", arriba + "px");
    caja.style.setProperty("--cart-right", derecha + "px");
    caja.style.setProperty("--cart-max-height", alturaMaxima + "px");
}

window.addEventListener("resize", function() {
    let caja = document.getElementById("carrito");
    if (caja && caja.classList.contains("mostrar")) posicionarCarrito();
});

function cerrarCarrito() {
    let caja = document.getElementById("carrito");
    if (caja) caja.classList.remove("mostrar");
    let fondoCarrito = document.getElementById("carrito-backdrop");
    if (fondoCarrito) fondoCarrito.remove();
    document.body.classList.remove("cart-open");
    let botonCarrito = document.querySelector("header button[aria-label='Mostrar carrito']");
    if (botonCarrito) botonCarrito.setAttribute("aria-expanded", "false");
    if (botonCarrito) botonCarrito.focus();
}

document.addEventListener("keydown", function(evento) {
    let caja = document.getElementById("carrito");
    if (evento.key === "Escape") {
        if (caja && caja.classList.contains("mostrar")) cerrarCarrito();
        let navegacion = document.getElementById("main-nav");
        if (navegacion && navegacion.classList.contains("is-open")) toggleMenu();
        return;
    }
    if (!caja || !caja.classList.contains("mostrar")) return;
    if (evento.key !== "Tab") return;
    let elementosEnfocables = Array.from(caja.querySelectorAll(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])"
    ));
    if (elementosEnfocables.length === 0) {
        evento.preventDefault();
        caja.focus();
        return;
    }
    let primero = elementosEnfocables[0];
    let ultimo = elementosEnfocables[elementosEnfocables.length - 1];
    if (evento.shiftKey && (document.activeElement === primero || !caja.contains(document.activeElement))) {
        evento.preventDefault();
        ultimo.focus();
    } else if (!evento.shiftKey && (document.activeElement === ultimo || !caja.contains(document.activeElement))) {
        evento.preventDefault();
        primero.focus();
    }
});

document.addEventListener("click", function(evento) {
    let encabezado = document.querySelector("header");
    let navegacion = document.getElementById("main-nav");
    if (encabezado && navegacion && navegacion.classList.contains("is-open") &&
        !encabezado.contains(evento.target)) {
        toggleMenu();
    }
});

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
    let texto = "<div class='cart-heading'><h2>Carrito</h2>" +
        "<button class='cart-close' type='button' onclick='cerrarCarrito()' aria-label='Cerrar carrito' title='Cerrar carrito'>&times;</button></div>";

    if (carrito.length == 0) {
        texto += "<p>El carrito está vacío.</p>";
    } else {
        let total = 0;
        let cuentaRecompensa = obtenerCuentaSesion();
        let indiceToppingGratis = cuentaRecompensa && cuentaRecompensa.toppingGratisDisponible
            ? carrito.findIndex(function(producto) { return producto.extra !== "Ninguno"; })
            : -1;
        if (cuentaRecompensa && cuentaRecompensa.toppingGratisDisponible && indiceToppingGratis < 0) {
            texto += "<p>Tienes un topping extra gratis disponible. Elige un extra en una chicha para aplicarlo.</p>";
        }

        for (let i = 0; i < carrito.length; i++) {
            let producto = carrito[i];
            let toppingGratis = i === indiceToppingGratis;
            let precioProducto = producto.precio - (toppingGratis ? 200 : 0);
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
                    "<br>Extra: " + producto.extra + (toppingGratis ? " (gratis por recompensa)" : "") +
                    "<br>Precio: $" + precioProducto.toLocaleString("es-CL") + "</p>" +
                    "<div class='cart-actions'>" +
                    "<button class='boton' onclick='editarProducto(" + i + ")'>Editar</button>" +
                    "<button class='boton' onclick='eliminarProducto(" + i + ")'>Eliminar</button></div>";
            }

            texto += "</div>";

            total += precioProducto;
        }

        texto +=
            "<hr><h3>Total: $" +
            total.toLocaleString("es-CL") +
            "</h3>";

        texto +=
            "<label for='metodo-pago'>Método de pago</label>" +
            "<select id='metodo-pago' aria-label='Método de pago'>" +
            "<option value=''>Selecciona una opción</option>" +
            "<option value='efectivo'>Efectivo</option>" +
            "<option value='tarjeta'>Tarjeta</option>" +
            "</select>" +
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
    if (!carrito[indice]) return;
    let productoAnterior = Object.assign({}, carrito[indice]);
    let topping1 = document.getElementById("editar-topping1-" + indice).value;
    let topping2 = document.getElementById("editar-topping2-" + indice).value;
    let extra = document.getElementById("editar-extra-" + indice).value;

    carrito[indice].toppings = topping1 + ", " + topping2;
    carrito[indice].extra = extra;
    carrito[indice].precio = extra === "Ninguno" ? 1200 : 1400;
    if (!guardarCarrito()) {
        carrito[indice] = productoAnterior;
        mostrarAviso("No se pudo guardar el cambio. Inténtalo de nuevo.", "error");
        return;
    }
    productoEditando = null;
    renderizarCarrito();
}

function eliminarProducto(indice) {
    if (!Number.isInteger(indice) || indice < 0 || indice >= carrito.length) return;
    let productoEliminado = carrito.splice(indice, 1)[0];
    if (!guardarCarrito()) {
        carrito.splice(indice, 0, productoEliminado);
        mostrarAviso("No se pudo actualizar el carrito. Inténtalo de nuevo.", "error");
        return;
    }
    productoEditando = null;
    actualizarCantidad();
    renderizarCarrito();
}

function comprar() {
    if (!obtenerCuentaSesion()) {
        if (!carrito.length) {
            mostrarAviso("Agrega una chicha al carrito antes de comprar.", "error");
            return;
        }
        if (!guardarCarrito()) {
            mostrarAviso("No se pudo guardar tu carrito. Inténtalo de nuevo antes de iniciar sesión.", "error");
            return;
        }
        sessionStorage.setItem("chichacookContinueAfterLogin", "services-cart");
        mostrarAviso("Para completar la compra debes iniciar sesión. Conservamos tu carrito.", "error", function() {
            window.location.href = "login.html";
        });
        return;
    }

    let metodoPago = document.getElementById("metodo-pago");
    if (!metodoPago || !metodoPago.value) {
        mostrarAviso("Selecciona efectivo o tarjeta para continuar con la compra.", "error");
        if (metodoPago) metodoPago.focus();
        return;
    }

    let cuentasCompra = obtenerCuentas();
    let usuarioSesion = sessionStorage.getItem("chichacookSession");
    let cuentaCompra = cuentasCompra.find(function(cuenta) {
        return normalizarIdentificador(cuenta.username) === normalizarIdentificador(usuarioSesion);
    });
    let indiceToppingGratis = cuentaCompra && cuentaCompra.toppingGratisDisponible
        ? carrito.findIndex(function(producto) { return producto.extra !== "Ninguno"; })
        : -1;
    let totalCompra = carrito.reduce(function(total, producto, indice) {
        return total + producto.precio - (indice === indiceToppingGratis ? 200 : 0);
    }, 0);
    let pagoConfirmado = metodoPago.value === "efectivo" ? "efectivo" : "tarjeta";
    let mensajeCompra = "Pedido de demostración completado. No se ha procesado ningún pago. Total: $" +
        totalCompra.toLocaleString("es-CL") + ". Método seleccionado: " + pagoConfirmado + ".";

    let carritoAnterior = carrito;
    carrito = [];
    if (!guardarCarrito()) {
        carrito = carritoAnterior;
        mostrarAviso("No se pudo cerrar el carrito en esta sesión. El pedido de demostración no se procesó.", "error");
        return;
    }
    if (indiceToppingGratis >= 0 && cuentaCompra) {
        cuentaCompra.toppingGratisDisponible = false;
        try {
            guardarCuentas(cuentasCompra);
        } catch (error) {
            cuentaCompra.toppingGratisDisponible = true;
            carrito = carritoAnterior;
            let carritoRestaurado = guardarCarrito();
            mostrarAviso(carritoRestaurado
                ? "No se pudo actualizar tu recompensa. El pedido no se procesó y el carrito se conservó."
                : "No se pudo actualizar tu recompensa ni restaurar el carrito. Revisa el almacenamiento del navegador antes de continuar.",
            "error");
            return;
        }
    }
    productoEditando = null;

    actualizarCantidad();
    cerrarCarrito();
    document.querySelectorAll("#carrito").forEach(function(elemento) {
        elemento.innerHTML = "";
    });
    mostrarAviso(mensajeCompra, "success");
}

function crearCorreoContacto(formulario) {
    let datos = new FormData(formulario);
    let nombre = datos.get("nombre").trim();
    let correo = datos.get("correo").trim();
    let mensaje = datos.get("mensaje").trim();
    let asunto = encodeURIComponent("Mensaje de contacto - " + nombre);
    let cuerpo = encodeURIComponent(
        "Nombre: " + nombre + "\n" +
        "Correo: " + correo + "\n\n" +
        mensaje
    );

    return "mailto:gdeporte72@gmail.com?subject=" + asunto + "&body=" + cuerpo;
}

function enviar(evento) {
    evento.preventDefault();
    window.location.href = crearCorreoContacto(evento.currentTarget);
}

function obtenerCuentas() {
    let cuentas = [];
    let cuentasTemporales = [];
    try {
        let guardadas = JSON.parse(localStorage.getItem("chichacookUsers") || "[]");
        if (Array.isArray(guardadas)) cuentas = guardadas;
    } catch (error) {
    }
    try {
        let temporales = JSON.parse(sessionStorage.getItem("chichacookUsersSession") || "[]");
        if (Array.isArray(temporales)) cuentasTemporales = temporales;
    } catch (error) {
    }

    cuentas = cuentas.filter(function(cuenta) {
        return cuenta && typeof cuenta === "object" && !Array.isArray(cuenta);
    });
    cuentasTemporales.filter(function(cuenta) {
        return cuenta && typeof cuenta === "object" && !Array.isArray(cuenta);
    }).forEach(function(cuentaTemporal) {
        let indice = cuentas.findIndex(function(cuenta) {
            return normalizarIdentificador(cuenta.username) === normalizarIdentificador(cuentaTemporal.username) ||
                (normalizarIdentificador(cuenta.email) &&
                    normalizarIdentificador(cuenta.email) === normalizarIdentificador(cuentaTemporal.email));
        });
        if (indice < 0) cuentas.push(cuentaTemporal);
        else cuentas[indice] = cuentaTemporal;
    });

    let cuentasMigradas = false;
    try {
        let cuentaAnterior = JSON.parse(localStorage.getItem("chichacookUser") || "null");
        if (cuentaAnterior && typeof cuentaAnterior === "object" && normalizarIdentificador(cuentaAnterior.username) &&
            !cuentas.some(function(cuenta) {
                return normalizarIdentificador(cuenta.username) === normalizarIdentificador(cuentaAnterior.username);
            })) {
            cuentas.push(cuentaAnterior);
            cuentasMigradas = true;
        }
    } catch (error) {
    }

    cuentas.forEach(function(cuenta) {
        let puntosActuales = puntosCuenta(cuenta);
        let saldoLimitado = Math.min(puntosActuales, LIMITE_PUNTOS_CUENTA);
        let puntosGanados = Number.isSafeInteger(cuenta.puntosGanados) && cuenta.puntosGanados >= 0
            ? Math.min(cuenta.puntosGanados, LIMITE_PUNTOS_CUENTA)
            : saldoLimitado;
        puntosGanados = Math.max(puntosGanados, saldoLimitado);
        if (cuenta.puntos !== saldoLimitado || cuenta.puntosGanados !== puntosGanados) {
            cuenta.puntos = saldoLimitado;
            cuenta.puntosGanados = puntosGanados;
            cuentasMigradas = true;
        }
    });

    if (cuentasTemporales.length || cuentasMigradas) {
        try {
            localStorage.setItem("chichacookUsers", JSON.stringify(cuentas));
        } catch (error) {
        }
    }
    if (cuentasTemporales.length) sessionStorage.removeItem("chichacookUsersSession");
    try {
        if (localStorage.getItem("chichacookUser")) localStorage.removeItem("chichacookUser");
    } catch (error) {
    }

    return cuentas;
}

function guardarCuentas(cuentas) {
    localStorage.setItem("chichacookUsers", JSON.stringify(cuentas));
}

function normalizarIdentificador(valor) {
    return typeof valor === "string" ? valor.trim().toLowerCase() : "";
}

function obtenerCuentaSesion() {
    let usuarioSesion = sessionStorage.getItem("chichacookSession");
    if (!usuarioSesion) return null;

    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(elemento) {
        return normalizarIdentificador(elemento.username) === normalizarIdentificador(usuarioSesion);
    }) || null;
    if (!cuenta) return null;

    return cuenta;
}

function puntosCuenta(cuenta) {
    return Number.isSafeInteger(cuenta.puntos) && cuenta.puntos >= 0 ? cuenta.puntos : 0;
}

function puntosGanadosCuenta(cuenta) {
    if (Number.isSafeInteger(cuenta.puntosGanados) && cuenta.puntosGanados >= 0) {
        return Math.min(cuenta.puntosGanados, LIMITE_PUNTOS_CUENTA);
    }
    return Math.min(puntosCuenta(cuenta), LIMITE_PUNTOS_CUENTA);
}

function actualizarAvisoLimiteJuegos(cuenta) {
    let aviso = document.getElementById("points-limit-message");
    if (!aviso) return;
    let bloqueado = cuenta && puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA;
    aviso.hidden = !bloqueado;
    if (bloqueado) {
        aviso.textContent = "Has alcanzado el máximo de 15.000 puntos ganados por cuenta. Los juegos están bloqueados; aún puedes canjear tus recompensas.";
    }
}

function notificarCambioPuntos() {
    document.dispatchEvent(new Event("chichacook:points-changed"));
}

function cambiarPuntosSesion(cambio, gananciaNeta) {
    let usuarioSesion = sessionStorage.getItem("chichacookSession");
    if (!usuarioSesion) return null;

    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(elemento) {
        return normalizarIdentificador(elemento.username) === normalizarIdentificador(usuarioSesion);
    });
    if (!cuenta) return null;

    let gananciaContabilizada = Number.isSafeInteger(gananciaNeta)
        ? Math.max(0, gananciaNeta)
        : Math.max(0, cambio);
    let gananciaAcreditada = Math.min(
        gananciaContabilizada,
        Math.max(0, LIMITE_PUNTOS_CUENTA - puntosGanadosCuenta(cuenta))
    );
    let ajusteSinGanancia = cambio - gananciaContabilizada;
    let nuevoSaldo = puntosCuenta(cuenta) + ajusteSinGanancia + gananciaAcreditada;
    if (!Number.isSafeInteger(nuevoSaldo) || nuevoSaldo < 0) return null;
    cuenta.puntos = nuevoSaldo;
    cuenta.puntosGanados = puntosGanadosCuenta(cuenta) + gananciaAcreditada;
    guardarCuentas(cuentas);
    document.querySelectorAll("#blackjack-points, #roulette-points, #penalty-points, #reward-points, #topping-reward-points").forEach(function(elemento) {
        elemento.textContent = cuenta.puntos.toLocaleString("es-CL");
    });
    document.querySelectorAll(".session-points").forEach(function(elemento) {
        elemento.textContent = "Puntos: " + cuenta.puntos.toLocaleString("es-CL");
        elemento.setAttribute("aria-label", cuenta.puntos.toLocaleString("es-CL") + " puntos disponibles");
    });
    actualizarAvisoLimiteJuegos(cuenta);
    notificarCambioPuntos();
    return cuenta.puntos;
}

function actualizarNavegacionSesion() {
    let usuario = sessionStorage.getItem("chichacookSession");
    let cuenta = usuario ? obtenerCuentaSesion() : null;

    document.querySelectorAll(".account-nav").forEach(function(navegacion) {
        if (!cuenta) return;
        navegacion.replaceChildren();

        let saludo = document.createElement("span");
        saludo.className = "session-user";
        saludo.textContent = "Hola, " + (cuenta.displayName || usuario);

        let puntos = document.createElement("span");
        puntos.className = "session-points";
        puntos.textContent = "Puntos: " + (cuenta ? puntosCuenta(cuenta) : 0).toLocaleString("es-CL");
        puntos.setAttribute("aria-label", (cuenta ? puntosCuenta(cuenta) : 0).toLocaleString("es-CL") + " puntos disponibles");

        let botonCerrar = document.createElement("button");
        botonCerrar.className = "logout-button";
        botonCerrar.type = "button";
        botonCerrar.textContent = "Cerrar sesión";
        botonCerrar.addEventListener("click", cerrarSesion);

        navegacion.append(saludo, puntos, botonCerrar);
    });

    let notaInicio = document.getElementById("home-account-note");
    let enlacesCuentaInicio = document.querySelector(".home-account-links");
    let notaServicios = document.querySelector(".services-login-note");
    if (notaInicio) {
        if (cuenta) {
            notaInicio.textContent = "¡Qué bueno verte, " + (cuenta.displayName || usuario) +
                "! Tu progreso y tus puntos están listos para seguir creciendo.";
            notaInicio.classList.add("is-signed-in");
        } else {
            notaInicio.textContent = "Inicia sesión para guardar tu progreso y tus puntos.";
            notaInicio.classList.remove("is-signed-in");
        }
    }
    if (notaServicios) notaServicios.hidden = Boolean(cuenta);
    if (enlacesCuentaInicio) enlacesCuentaInicio.hidden = Boolean(cuenta);
    actualizarAvisoLimiteJuegos(cuenta);
    notificarCambioPuntos();
}

function cerrarSesion() {
    sessionStorage.removeItem("chichacookSession");
    window.location.href = "index.html";
}

function iniciarBlackjack() {
    let mesa = document.querySelector(".blackjack-section");
    if (!mesa) return;

    let palos = [
        { simbolo: "♠", nombre: "picas", rojo: false },
        { simbolo: "♥", nombre: "corazones", rojo: true },
        { simbolo: "♦", nombre: "diamantes", rojo: true },
        { simbolo: "♣", nombre: "tréboles", rojo: false }
    ];
    let valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let mazo = [];
    let manoJugador = [];
    let manoCasa = [];
    let partidaActiva = false;
    let victorias = 0;
    let derrotas = 0;
    let cartasJugador = document.getElementById("player-cards");
    let cartasCasa = document.getElementById("dealer-cards");
    let totalJugador = document.getElementById("player-total");
    let totalCasa = document.getElementById("dealer-total");
    let mensaje = document.getElementById("blackjack-message");
    let botonPedir = document.getElementById("blackjack-hit");
    let botonDoblar = document.getElementById("blackjack-double");
    let botonPlantarse = document.getElementById("blackjack-stand");
    let botonNueva = document.getElementById("blackjack-new");
    let apuestaInput = document.getElementById("blackjack-bet");
    let puntosJugador = document.getElementById("blackjack-points");
    let apuestaActual = 0;
    let apuestaLiquidada = false;
    let turnoDoblado = false;
    let repartiendo = false;
    let numeroPartida = 0;
    let faseJuego = "idle";
    let indiceReparto = 0;
    let usuarioPartida = sessionStorage.getItem("chichacookSession");
    let clavePartida = usuarioPartida
        ? "chichacookBlackjack:" + normalizarIdentificador(usuarioPartida)
        : null;

    function guardarPartidaBlackjack() {
        if (!clavePartida) return false;
        try {
            if (apuestaActual <= 0 || apuestaLiquidada) {
                sessionStorage.removeItem(clavePartida);
                return true;
            }
            sessionStorage.setItem(clavePartida, JSON.stringify({
                mazo,
                manoJugador,
                manoCasa,
                apuestaActual,
                victorias,
                derrotas,
                faseJuego,
                indiceReparto,
                turnoDoblado
            }));
            return true;
        } catch (error) {
            return false;
        }
    }

    function leerPartidaBlackjack() {
        if (!clavePartida) return null;
        try {
            let partida = JSON.parse(sessionStorage.getItem(clavePartida) || "null");
            let cartaValida = function(carta) {
                return carta && valores.includes(carta.valor) && carta.palo &&
                    palos.some(function(palo) {
                        return palo.simbolo === carta.palo.simbolo && palo.nombre === carta.palo.nombre &&
                            palo.rojo === carta.palo.rojo;
                    });
            };
            if (!partida || !Array.isArray(partida.mazo) || !partida.mazo.every(cartaValida) ||
                !Array.isArray(partida.manoJugador) || !partida.manoJugador.every(cartaValida) ||
                !Array.isArray(partida.manoCasa) || !partida.manoCasa.every(cartaValida) ||
                !Number.isSafeInteger(partida.apuestaActual) || partida.apuestaActual <= 0 ||
                !Number.isSafeInteger(partida.victorias) || !Number.isSafeInteger(partida.derrotas) ||
                !["initial-deal", "player", "dealer"].includes(partida.faseJuego) ||
                (typeof partida.turnoDoblado !== "undefined" && typeof partida.turnoDoblado !== "boolean") ||
                !Number.isInteger(partida.indiceReparto) || partida.indiceReparto < 0 || partida.indiceReparto > 4) {
                sessionStorage.removeItem(clavePartida);
                return null;
            }
            return partida;
        } catch (error) {
            try {
                sessionStorage.removeItem(clavePartida);
            } catch (errorAlmacenamiento) {
            }
            return null;
        }
    }

    function borrarPartidaBlackjack() {
        if (!clavePartida) return;
        try {
            sessionStorage.removeItem(clavePartida);
        } catch (error) {
        }
    }

    function barajarMazo() {
        mazo = [];
        palos.forEach(function(palo) {
            valores.forEach(function(valor) {
                mazo.push({ valor: valor, palo: palo });
            });
        });

        for (let indice = mazo.length - 1; indice > 0; indice--) {
            let aleatorio = Math.floor(Math.random() * (indice + 1));
            [mazo[indice], mazo[aleatorio]] = [mazo[aleatorio], mazo[indice]];
        }
    }

    function tomarCarta() {
        return mazo.pop();
    }

    function esperar(ms) {
        return new Promise(function(resolve) {
            window.setTimeout(resolve, ms);
        });
    }

    function calcularPuntos(mano) {
        let puntos = 0;
        let ases = 0;
        mano.forEach(function(carta) {
            if (carta.valor === "A") {
                puntos += 11;
                ases++;
            } else if (["J", "Q", "K"].includes(carta.valor)) {
                puntos += 10;
            } else {
                puntos += Number(carta.valor);
            }
        });

        while (puntos > 21 && ases > 0) {
            puntos -= 10;
            ases--;
        }
        return puntos;
    }

    function crearCarta(carta, oculta, animar) {
        let elementoCarta = document.createElement("div");
        elementoCarta.className = "playing-card" + (animar ? " is-dealing" : "");
        if (oculta) {
            elementoCarta.classList.add("is-hidden");
            elementoCarta.setAttribute("aria-label", "Carta oculta");
            elementoCarta.textContent = "★";
        } else {
            if (carta.palo.rojo) elementoCarta.classList.add("is-red");
            elementoCarta.setAttribute("aria-label", carta.valor + " de " + carta.palo.nombre);

            let esquina = document.createElement("span");
            esquina.className = "card-corner";
            esquina.textContent = carta.valor;
            let palo = document.createElement("span");
            palo.className = "card-suit";
            palo.setAttribute("aria-hidden", "true");
            palo.textContent = carta.palo.simbolo;
            elementoCarta.append(esquina, palo);
        }
        return elementoCarta;
    }

    function agregarCarta(elemento, carta, oculta) {
        elemento.append(crearCarta(carta, oculta, true));
    }

    function mostrarMano(elemento, mano, ocultarSegunda) {
        while (elemento.children.length < mano.length) {
            let indice = elemento.children.length;
            agregarCarta(elemento, mano[indice], ocultarSegunda && indice === 1);
        }

        if (!ocultarSegunda) {
            let cartaOculta = elemento.querySelector(".is-hidden");
            if (cartaOculta) {
                let cartaRevelada = crearCarta(mano[1], false, false);
                cartaRevelada.classList.add("is-revealing");
                cartaOculta.replaceWith(cartaRevelada);
            }
        }
    }

    function actualizarMesa(revelarCasa) {
        mostrarMano(cartasJugador, manoJugador, false);
        mostrarMano(cartasCasa, manoCasa, !revelarCasa);
        totalJugador.textContent = "Puntos: " + calcularPuntos(manoJugador);
        totalCasa.textContent = "Puntos: " + (revelarCasa
            ? calcularPuntos(manoCasa)
            : calcularPuntos(manoCasa.slice(0, 1)) + " + ?");
        let cuenta = obtenerCuentaSesion();
        let juegosBloqueados = cuenta && puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA;
        actualizarAvisoLimiteJuegos(cuenta);
        botonPedir.disabled = !partidaActiva;
        botonPlantarse.disabled = !partidaActiva;
        botonDoblar.disabled = !partidaActiva || juegosBloqueados || repartiendo || turnoDoblado || manoJugador.length !== 2 ||
            !cuenta || puntosCuenta(cuenta) < apuestaActual;
        botonNueva.disabled = !cuenta || partidaActiva || repartiendo || juegosBloqueados;
        apuestaInput.disabled = !cuenta || partidaActiva || repartiendo || juegosBloqueados;
        puntosJugador.textContent = cuenta
            ? puntosCuenta(cuenta).toLocaleString("es-CL")
            : "Inicia sesión";
        document.getElementById("blackjack-wins").textContent = victorias;
        document.getElementById("blackjack-losses").textContent = derrotas;
        guardarPartidaBlackjack();
    }

    function obtenerRepartoInicial() {
        return [
            { mano: manoJugador, tablero: cartasJugador, oculta: false },
            { mano: manoCasa, tablero: cartasCasa, oculta: false },
            { mano: manoJugador, tablero: cartasJugador, oculta: false },
            { mano: manoCasa, tablero: cartasCasa, oculta: true }
        ];
    }

    function finalizarRepartoInicial() {
        repartiendo = false;
        partidaActiva = true;
        faseJuego = "player";
        let blackjackJugador = calcularPuntos(manoJugador) === 21;
        let blackjackCasa = calcularPuntos(manoCasa) === 21;
        if (blackjackJugador || blackjackCasa) {
            partidaActiva = false;
            actualizarMesa(true);
            if (blackjackJugador && blackjackCasa) {
                liquidarApuesta("tie");
                mostrarResultadoJuego("tie", 0);
                mostrarMensaje("¡Blackjack para ambos! Empate; se devuelve tu apuesta.", "tie");
            } else if (blackjackJugador) {
                victorias++;
                let gananciaAcreditada = liquidarApuesta("win");
                mostrarResultadoJuego("win", gananciaAcreditada);
                mostrarMensaje("¡Blackjack! Ganaste. Ganancia acreditada: " +
                    gananciaAcreditada.toLocaleString("es-CL") + " puntos.", "win");
            } else {
                derrotas++;
                liquidarApuesta("loss");
                mostrarResultadoJuego("loss", apuestaActual);
                mostrarMensaje("La casa tiene blackjack. Pierdes " +
                    apuestaActual.toLocaleString("es-CL") + " puntos.", "loss");
            }
        } else {
            mostrarMensaje("Tu turno: pide una carta o plántate.", "");
        }
        actualizarMesa(!partidaActiva);
    }

    async function repartirManoInicial(partida, desdeIndice) {
        let reparto = obtenerRepartoInicial();
        for (let indice = desdeIndice; indice < reparto.length; indice++) {
            await esperar(360);
            if (partida !== numeroPartida) return;
            let turno = reparto[indice];
            let carta = tomarCarta();
            turno.mano.push(carta);
            indiceReparto = indice + 1;
            agregarCarta(turno.tablero, carta, turno.oculta);
            actualizarMesa(false);
        }
        finalizarRepartoInicial();
    }

    function restaurarPartidaBlackjack() {
        let partidaGuardada = leerPartidaBlackjack();
        if (!partidaGuardada) return false;

        mazo = partidaGuardada.mazo;
        manoJugador = partidaGuardada.manoJugador;
        manoCasa = partidaGuardada.manoCasa;
        apuestaActual = partidaGuardada.apuestaActual;
        apuestaLiquidada = false;
        turnoDoblado = partidaGuardada.turnoDoblado === true;
        victorias = partidaGuardada.victorias;
        derrotas = partidaGuardada.derrotas;
        faseJuego = partidaGuardada.faseJuego;
        indiceReparto = partidaGuardada.indiceReparto;
        numeroPartida++;
        partidaActiva = false;
        repartiendo = false;
        apuestaInput.value = String(apuestaActual);
        cartasJugador.replaceChildren();
        cartasCasa.replaceChildren();
        actualizarMesa(faseJuego === "dealer");

        if (faseJuego === "initial-deal") {
            let reparto = obtenerRepartoInicial();
            while (indiceReparto < reparto.length) {
                let turno = reparto[indiceReparto];
                turno.mano.push(tomarCarta());
                indiceReparto++;
            }
            finalizarRepartoInicial();
        } else if (faseJuego === "dealer") {
            partidaActiva = true;
            terminarMano();
        } else {
            partidaActiva = true;
            if (turnoDoblado || calcularPuntos(manoJugador) >= 21) {
                terminarMano();
            } else {
                mostrarMensaje("Partida recuperada. Tu turno: pide una carta o plántate.", "");
                actualizarMesa(false);
            }
        }
        return true;
    }

    function liquidarApuesta(resultado) {
        if (apuestaLiquidada) return 0;
        apuestaLiquidada = true;

        let devolucion = resultado === "win" ? apuestaActual * 2 : resultado === "tie" ? apuestaActual : 0;
        let gananciaNeta = resultado === "win" ? apuestaActual : 0;
        let cuentaAntes = obtenerCuentaSesion();
        let gananciaAcreditada = cuentaAntes
            ? Math.min(gananciaNeta, LIMITE_PUNTOS_CUENTA - puntosGanadosCuenta(cuentaAntes))
            : 0;
        let saldoActual = devolucion > 0
            ? cambiarPuntosSesion(devolucion, gananciaNeta)
            : null;
        borrarPartidaBlackjack();
        return saldoActual === null ? 0 : gananciaAcreditada;
    }

    function mostrarMensaje(texto, resultado) {
        mensaje.classList.remove("is-win", "is-loss", "is-tie", "message-pop");
        mensaje.textContent = texto;
        if (resultado) mensaje.classList.add("is-" + resultado);
        void mensaje.offsetWidth;
        mensaje.classList.add("message-pop");
    }

    async function terminarMano() {
        if (!partidaActiva || repartiendo) return;
        partidaActiva = false;
        repartiendo = true;
        faseJuego = "dealer";
        actualizarMesa(true);
        mostrarMensaje("La casa revela su carta...", "");
        await esperar(450);

        let puntosJugador = calcularPuntos(manoJugador);
        let puntosCasa = calcularPuntos(manoCasa);
        if (puntosJugador <= 21) {
            while (puntosCasa < 17) {
                mostrarMensaje("La casa pide una carta...", "");
                await esperar(350);
                let carta = tomarCarta();
                manoCasa.push(carta);
                mostrarMano(cartasCasa, manoCasa, false);
                puntosCasa = calcularPuntos(manoCasa);
                actualizarMesa(true);
                await esperar(400);
            }
        }

        repartiendo = false;
        if (puntosJugador > 21) {
            derrotas++;
            liquidarApuesta("loss");
            mostrarResultadoJuego("loss", apuestaActual);
            mostrarMensaje("¡Te pasaste de 21! Gana la casa. Perdiste " +
                apuestaActual.toLocaleString("es-CL") + " puntos.", "loss");
        } else if (puntosCasa > 21 || puntosJugador > puntosCasa) {
            victorias++;
            let gananciaAcreditada = liquidarApuesta("win");
            mostrarResultadoJuego("win", gananciaAcreditada);
            mostrarMensaje((puntosCasa > 21
                ? "¡La casa se pasó de 21! ¡Ganaste!"
                : "¡Ganaste con " + puntosJugador + " puntos!") +
                " Ganancia acreditada: " + gananciaAcreditada.toLocaleString("es-CL") + " puntos.", "win");
        } else if (puntosJugador < puntosCasa) {
            derrotas++;
            liquidarApuesta("loss");
            mostrarResultadoJuego("loss", apuestaActual);
            mostrarMensaje("La casa tiene " + puntosCasa + ". Pierdes " +
                apuestaActual.toLocaleString("es-CL") + " puntos.", "loss");
        } else {
            liquidarApuesta("tie");
            mostrarResultadoJuego("tie", 0);
            mostrarMensaje("Empate con " + puntosJugador + " puntos. Se devuelve tu apuesta de " +
                apuestaActual.toLocaleString("es-CL") + ".", "tie");
        }
        actualizarMesa(true);
    }

    async function nuevaPartida() {
        if (repartiendo) return;
        let cuenta = obtenerCuentaSesion();
        if (!cuenta) {
            actualizarMesa(false);
            mostrarMensaje("Inicia sesión para recibir tus puntos y jugar con apuestas.", "tie");
            return;
        }
        if (puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA) {
            actualizarMesa(false);
            mostrarMensaje("Alcanzaste el máximo de 15.000 puntos ganados. Los juegos están bloqueados; aún puedes canjear recompensas.", "tie");
            return;
        }
        let cantidadApuesta = Number(apuestaInput.value);
        if (!Number.isSafeInteger(cantidadApuesta) || cantidadApuesta <= 0) {
            mostrarMensaje("Escribe una apuesta válida en puntos (mínimo 1).", "loss");
            apuestaInput.focus();
            return;
        }
        if (cantidadApuesta > Number.MAX_SAFE_INTEGER - puntosCuenta(cuenta)) {
            mostrarMensaje("La apuesta es demasiado alta para el saldo máximo permitido.", "loss");
            apuestaInput.focus();
            return;
        }
        if (cantidadApuesta > puntosCuenta(cuenta)) {
            mostrarMensaje("No tienes suficientes puntos para esa apuesta. Tu saldo es " +
                puntosCuenta(cuenta).toLocaleString("es-CL") + ".", "loss");
            apuestaInput.focus();
            return;
        }
        let nuevoSaldo = cambiarPuntosSesion(-cantidadApuesta);
        if (nuevoSaldo === null) {
            mostrarMensaje("No se pudo registrar la apuesta. Vuelve a iniciar sesión.", "loss");
            return;
        }

        let partida = ++numeroPartida;
        apuestaActual = cantidadApuesta;
        apuestaLiquidada = false;
        turnoDoblado = false;
        repartiendo = true;
        partidaActiva = false;
        faseJuego = "initial-deal";
        indiceReparto = 0;
        barajarMazo();
        manoJugador = [];
        manoCasa = [];
        cartasJugador.replaceChildren();
        cartasCasa.replaceChildren();
        actualizarMesa(false);
        if (!guardarPartidaBlackjack()) {
            cambiarPuntosSesion(cantidadApuesta, 0);
            apuestaLiquidada = true;
            repartiendo = false;
            faseJuego = "idle";
            borrarPartidaBlackjack();
            actualizarMesa(false);
            mostrarMensaje("No se pudo guardar la partida. Se devolvió tu apuesta; inténtalo de nuevo.", "loss");
            return;
        }
        mostrarMensaje("Apuesta de " + apuestaActual.toLocaleString("es-CL") +
            " puntos realizada. Barajando y repartiendo...", "");

        await repartirManoInicial(partida, 0);
    }

    botonPedir.addEventListener("click", function() {
        let cuenta = obtenerCuentaSesion();
        if (!partidaActiva || repartiendo || turnoDoblado || !cuenta) return;
        repartiendo = true;
        partidaActiva = false;
        let carta = tomarCarta();
        manoJugador.push(carta);
        faseJuego = "player";
        actualizarMesa(false);
        mostrarMensaje("¡Carta repartida! " + carta.valor + carta.palo.simbolo + " para ti.", "");

        window.setTimeout(function() {
            repartiendo = false;
            partidaActiva = true;
            actualizarMesa(false);
            let puntos = calcularPuntos(manoJugador);
            if (puntos >= 21) {
                if (puntos === 21) mostrarMensaje("¡21 puntos! Ahora juega la casa.", "");
                terminarMano();
            } else {
                mostrarMensaje("Tienes " + puntos + " puntos. ¿Pides otra o te plantas?", "");
            }
        }, 500);
    });

    botonDoblar.addEventListener("click", function() {
        if (!partidaActiva || repartiendo || turnoDoblado || manoJugador.length !== 2) return;
        let cuenta = obtenerCuentaSesion();
        if (cuenta && puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA) return;
        if (!cuenta || puntosCuenta(cuenta) < apuestaActual) {
            mostrarMensaje("No tienes saldo suficiente para doblar la apuesta.", "loss");
            actualizarMesa(false);
            return;
        }
        if (apuestaActual > Math.floor((Number.MAX_SAFE_INTEGER - puntosCuenta(cuenta)) / 2)) {
            mostrarMensaje("La apuesta doblada supera el límite de puntos permitido.", "loss");
            return;
        }
        if (cambiarPuntosSesion(-apuestaActual) === null) {
            mostrarMensaje("No se pudo doblar la apuesta. Vuelve a iniciar sesión.", "loss");
            actualizarMesa(false);
            return;
        }

        apuestaActual *= 2;
        turnoDoblado = true;
        repartiendo = true;
        partidaActiva = false;
        let carta = tomarCarta();
        manoJugador.push(carta);
        faseJuego = "player";
        actualizarMesa(false);
        mostrarMensaje("Apuesta doblada. Recibes " + carta.valor + carta.palo.simbolo +
            " y tu turno termina.", "");

        window.setTimeout(function() {
            repartiendo = false;
            partidaActiva = true;
            terminarMano();
        }, 500);
    });

    botonPlantarse.addEventListener("click", function() {
        if (partidaActiva && !repartiendo) terminarMano();
    });

    botonNueva.addEventListener("click", nuevaPartida);
    document.addEventListener("chichacook:points-changed", function() {
        actualizarMesa(!partidaActiva);
    });
    if (!restaurarPartidaBlackjack()) {
        actualizarMesa(false);
        mostrarMensaje(obtenerCuentaSesion()
            ? "Elige tu apuesta y pulsa «Nueva partida» para repartir."
            : "Inicia sesión para jugar blackjack con puntos virtuales.", "");
    }
}

function iniciarRuleta() {
    let tablero = document.getElementById("roulette-board");
    if (!tablero) return;

    let numerosRojos = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    let ordenRuleta = ["0", "28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1", "00", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"];
    let opciones = Array.from(document.querySelectorAll(".roulette-bet-choice"));
    let fichasRapidas = Array.from(document.querySelectorAll(".roulette-chip-choice"));
    let apuestaInput = document.getElementById("roulette-bet");
    let botonAgregarApuesta = document.getElementById("roulette-add-bet");
    let botonDeshacerApuesta = document.getElementById("roulette-undo-bet");
    let botonApuestaMaxima = document.getElementById("roulette-max-bet");
    let botonLimpiarApuestas = document.getElementById("roulette-clear-bets");
    let rueda = document.getElementById("roulette-wheel");
    let aroRuleta = document.getElementById("roulette-wheel-ring");
    let pistaPelota = rueda.querySelector(".roulette-ball-track");
    let resultadoElemento = document.getElementById("roulette-result");
    let mensaje = document.getElementById("roulette-message");
    let cuentaAtras = document.getElementById("roulette-countdown");
    let seleccion = document.getElementById("roulette-selection");
    let listaApuestas = document.getElementById("roulette-pending-list");
    let contadorApuestas = document.getElementById("roulette-bet-count");
    let totalApuestaTexto = document.getElementById("roulette-total-bet");
    let listaHistorial = document.getElementById("roulette-history-list");
    let contadorHistorial = document.getElementById("roulette-history-count");
    let listaHistorialUsuario = document.getElementById("roulette-user-history-list");
    let contadorHistorialUsuario = document.getElementById("roulette-user-history-count");
    let botonesCasilla = [];
    let etiquetasRueda = [];
    let apuestasPendientes = [];
    let tipoApuesta = "number";
    let numeroElegido = "0";
    let importeRapido = null;
    let girando = false;
    let temporizadorApuesta = null;
    let finCuentaAtras = 0;
    let anguloActualRueda = 0;
    let audioContext = null;
    let sonidoActivo = false;
    let usuarioApuestas = sessionStorage.getItem("chichacookSession");
    let claveApuestasPendientes = usuarioApuestas
        ? "chichacookRouletteBets:" + normalizarIdentificador(usuarioApuestas)
        : null;
    let claveGiroRuleta = usuarioApuestas
        ? "chichacookRouletteRound:" + normalizarIdentificador(usuarioApuestas)
        : null;
    let claveHistorialRuleta = "chichacookRouletteHistory";
    let claveHistorialPersonal = usuarioApuestas
        ? "chichacookRouletteUserHistory:" + normalizarIdentificador(usuarioApuestas)
        : null;

    function colorNumero(numero) {
        if (numero === "0" || numero === "00") return "green";
        return numerosRojos.has(Number(numero)) ? "red" : "black";
    }

    function leerHistorialRuleta(clave) {
        if (!clave) return [];
        try {
            let historial = JSON.parse(localStorage.getItem(clave) || "[]");
            if (!Array.isArray(historial)) return [];
            return historial.filter(function(resultado) {
                return resultado && ordenRuleta.includes(String(resultado.numero)) &&
                    Number.isSafeInteger(resultado.fecha) && resultado.fecha > 0;
            }).slice(0, 12);
        } catch (error) {
            return [];
        }
    }

    function actualizarHistorialRuleta(clave, lista, contador, esPersonal) {
        let historial = leerHistorialRuleta(clave);
        lista.replaceChildren();
        contador.textContent = !clave
            ? "Inicia sesión"
            : historial.length + (historial.length === 1 ? " resultado" : " resultados");

        if (!clave || historial.length === 0) {
            let vacio = document.createElement("li");
            vacio.className = "roulette-history-empty";
            vacio.textContent = !clave
                ? "Inicia sesión para ver tu historial."
                : "Aún no hay resultados.";
            lista.append(vacio);
            return;
        }

        historial.forEach(function(resultado) {
            let numero = String(resultado.numero);
            let color = colorNumero(numero);
            let fecha = new Date(resultado.fecha);
            let elemento = document.createElement("li");
            let numeroElemento = document.createElement("strong");
            let detalle = document.createElement("span");
            let colorElemento = document.createElement("span");
            let horaElemento = document.createElement("time");
            let resumenApuesta = document.createElement("span");
            elemento.className = "roulette-history-entry is-" + color;
            numeroElemento.className = "roulette-history-number";
            numeroElemento.textContent = numero;
            detalle.className = "roulette-history-details";
            colorElemento.textContent = color === "red" ? "Rojo" : color === "black" ? "Negro" : "Verde";
            horaElemento.dateTime = fecha.toISOString();
            horaElemento.textContent = new Intl.DateTimeFormat("es-CL", {
                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
            }).format(fecha);
            detalle.append(colorElemento, horaElemento);
            if (esPersonal && Number.isSafeInteger(resultado.apostado) && Number.isSafeInteger(resultado.neto)) {
                resumenApuesta.className = "roulette-history-bet" +
                    (resultado.neto > 0 ? " is-win" : resultado.neto < 0 ? " is-loss" : " is-tie");
                resumenApuesta.textContent = "Apostaste " + resultado.apostado.toLocaleString("es-CL") +
                    " · " + (resultado.neto > 0 ? "+" : "") + resultado.neto.toLocaleString("es-CL") + " pts";
                detalle.append(resumenApuesta);
            }
            elemento.append(numeroElemento, detalle);
            lista.append(elemento);
        });
    }

    function guardarResultadoHistorial(clave, resultado) {
        let historial = leerHistorialRuleta(clave);
        historial.unshift(resultado);
        try {
            localStorage.setItem(clave, JSON.stringify(historial.slice(0, 12)));
        } catch (error) {
        }
    }

    function registrarResultadoRuleta(numero, cantidadApuesta, premio) {
        let fecha = Date.now();
        guardarResultadoHistorial(claveHistorialRuleta, { numero: String(numero), fecha: fecha });
        if (claveHistorialPersonal) {
            guardarResultadoHistorial(claveHistorialPersonal, {
                numero: String(numero),
                fecha: fecha,
                apostado: cantidadApuesta,
                neto: premio - cantidadApuesta
            });
        }
        actualizarHistorialRuleta(claveHistorialRuleta, listaHistorial, contadorHistorial, false);
        actualizarHistorialRuleta(claveHistorialPersonal, listaHistorialUsuario, contadorHistorialUsuario, true);
    }

    function numeroIncluido(numero, tipo, numeroApostado) {
        let valor = numero === "00" ? 0 : Number(numero);
        if (tipo === "number") return numero === numeroApostado;
        if (tipo === "red" || tipo === "black") return colorNumero(numero) === tipo;
        if (valor === 0) return false;
        if (tipo === "even") return valor % 2 === 0;
        if (tipo === "odd") return valor % 2 === 1;
        if (tipo === "low") return valor <= 18;
        if (tipo === "high") return valor >= 19;
        if (tipo.indexOf("dozen-") === 0) {
            let docena = Number(tipo.slice(-1));
            return valor >= (docena - 1) * 12 + 1 && valor <= docena * 12;
        }
        if (tipo.indexOf("column-") === 0) {
            return valor % 3 === Number(tipo.slice(-1)) % 3;
        }
        return false;
    }

    function multiplicadorApuesta(tipo) {
        if (tipo === "number") return 36;
        if (tipo.indexOf("dozen-") === 0 || tipo.indexOf("column-") === 0) return 3;
        return 2;
    }

    function agregarApuesta(importe) {
        let cuenta = obtenerCuentaSesion();
        if (!cuenta) {
            mostrarMensaje("Inicia sesión para preparar apuestas.", "loss");
            return false;
        }
        if (puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA) {
            mostrarMensaje("Alcanzaste el máximo de 15.000 puntos ganados. Los juegos están bloqueados; aún puedes canjear recompensas.", "loss");
            return false;
        }

        let total = totalApostado();
        if (!Number.isSafeInteger(importe) || importe <= 0 || !Number.isSafeInteger(total + importe)) {
            mostrarMensaje("Ingresa un importe válido para esta apuesta.", "loss");
            return false;
        }
        if (total + importe > puntosCuenta(cuenta)) {
            mostrarMensaje("El total supera tu saldo disponible.", "loss");
            return false;
        }

        apuestasPendientes.push({ tipo: tipoApuesta, numero: numeroElegido, importe: importe });
        actualizarApuestas();
        mostrarMensaje("Apuesta añadida: " +
            descripcionApuesta(apuestasPendientes[apuestasPendientes.length - 1]) + ".", "");
        iniciarCuentaAtras();
        return true;
    }

    function desactivarApuestaRapida() {
        importeRapido = null;
        fichasRapidas.forEach(function(ficha) {
            ficha.setAttribute("aria-pressed", "false");
        });
    }

    function crearCasilla(numero, claseColor, columna, fila, filasOcupadas) {
        let boton = document.createElement("button");
        boton.type = "button";
        boton.className = "roulette-number is-" + claseColor;
        boton.textContent = numero;
        boton.dataset.number = numero;
        boton.setAttribute("aria-label", numero === "00" ? "Doble cero, verde" : "Número " + numero + ", " + claseColor);
        boton.style.gridColumn = String(columna);
        boton.style.gridRow = fila + (filasOcupadas > 1 ? " / span " + filasOcupadas : "");
        boton.addEventListener("click", function() {
            numeroElegido = boton.dataset.number;
            tipoApuesta = "number";
            actualizarSeleccion();
            if (importeRapido !== null) agregarApuesta(importeRapido);
        });
        tablero.append(boton);
        botonesCasilla.push(boton);
    }

    function actualizarSeleccion() {
        opciones.forEach(function(opcion) {
            let activa = opcion.dataset.betType === tipoApuesta;
            opcion.classList.toggle("is-selected", activa);
            opcion.setAttribute("aria-pressed", String(activa));
        });
        botonesCasilla.forEach(function(boton) {
            boton.classList.toggle("is-selected", numeroIncluido(boton.dataset.number, tipoApuesta, numeroElegido));
        });

        if (tipoApuesta === "number") {
            seleccion.textContent = "Apuesta al número " + numeroElegido + " (paga 35 a 1).";
        } else if (tipoApuesta.indexOf("dozen-") === 0) {
            seleccion.textContent = "Apuesta a la docena " + tipoApuesta.slice(-1) + " (paga 2 a 1).";
        } else if (tipoApuesta.indexOf("column-") === 0) {
            seleccion.textContent = "Apuesta a la columna " + tipoApuesta.slice(-1) + " (paga 2 a 1).";
        } else {
            let descripciones = {
                red: "el rojo", black: "el negro", even: "los pares", odd: "los impares",
                low: "1 al 18", high: "19 al 36"
            };
            seleccion.textContent = "Apuesta a " + descripciones[tipoApuesta] + " (paga 1 a 1).";
        }
    }

    function mostrarMensaje(texto, resultado) {
        mensaje.classList.remove("is-win", "is-loss");
        mensaje.classList.add("is-" + resultado);
        mensaje.textContent = texto;
    }

    function actualizarSaldo() {
        let cuenta = obtenerCuentaSesion();
        let saldo = cuenta ? puntosCuenta(cuenta) : 0;
        document.getElementById("roulette-points").textContent = cuenta
            ? saldo.toLocaleString("es-CL")
            : "Inicia sesión";
        apuestaInput.max = String(saldo);
    }

    function anguloFijoRueda(numero) {
        let indice = ordenRuleta.indexOf(String(numero));
        let gradosPorCasilla = 360 / ordenRuleta.length;
        let anguloCentro = indice * gradosPorCasilla + gradosPorCasilla / 2;
        return 360 * 8 - anguloCentro;
    }

    function obtenerAnguloTransformacion(elemento, respaldo) {
        let transformacion = window.getComputedStyle(elemento).transform;
        if (!transformacion || transformacion === "none") return respaldo;
        let matriz = new window.DOMMatrixReadOnly(transformacion);
        return Math.atan2(matriz.b, matriz.a) * 180 / Math.PI;
    }

    function obtenerAnguloRueda() {
        return obtenerAnguloTransformacion(aroRuleta, anguloActualRueda);
    }

    function colocarRueda(numero) {
        anguloActualRueda = anguloFijoRueda(numero);
        aroRuleta.classList.remove("is-idle");
        aroRuleta.style.transition = "none";
        aroRuleta.style.transform = "rotate(" + anguloActualRueda + "deg)";
        void aroRuleta.offsetWidth;
        aroRuleta.style.removeProperty("transition");
    }

    function finalizarGiroRuleta(giro, recuperado) {
        let numero = String(giro.numero);
        let indiceResultado = ordenRuleta.indexOf(numero);
        if (indiceResultado < 0) return;
        let apuestasDelGiro = giro.apuestas;
        let cantidadApuesta = giro.cantidadApuesta;
        let color = colorNumero(numero);
        let apuestasGanadoras = apuestasDelGiro.filter(function(apuesta) {
            return numeroIncluido(numero, apuesta.tipo, apuesta.numero);
        });
        let premio = apuestasGanadoras.reduce(function(total, apuesta) {
            return total + apuesta.importe * multiplicadorApuesta(apuesta.tipo);
        }, 0);
        let importeGanador = apuestasGanadoras.reduce(function(total, apuesta) {
            return total + apuesta.importe;
        }, 0);
        resultadoElemento.textContent = numero;
        registrarResultadoRuleta(numero, cantidadApuesta, premio);
        colocarRueda(numero);
        pistaPelota.classList.remove("is-spinning");
        pistaPelota.classList.add("is-revealed", "is-landed");
        pistaPelota.style.transform = "rotate(0deg)";
        rueda.setAttribute("aria-label", "Ruleta americana: salió " + numero + " " + color);

        if (premio > 0) {
            let gananciaNeta = premio - cantidadApuesta;
            let gananciaContabilizable = Math.max(0, gananciaNeta);
            let cuentaAntes = obtenerCuentaSesion();
            let gananciaAcreditada = cuentaAntes
                ? Math.min(gananciaContabilizable, LIMITE_PUNTOS_CUENTA - puntosGanadosCuenta(cuentaAntes))
                : 0;
            let saldo = cambiarPuntosSesion(premio, gananciaContabilizable);
            if (saldo === null) {
                mostrarResultadoJuego("loss", cantidadApuesta);
                mostrarMensaje("Salió " + numero + " " + color + ". No se pudo abonar el premio.", "loss");
            } else {
                let resultadoNeto = gananciaNeta > 0
                    ? "win"
                    : gananciaNeta < 0
                        ? "loss"
                        : "tie";
                if (gananciaNeta > 0) {
                    mostrarResultadoJuego("win", gananciaNeta);
                } else if (gananciaNeta < 0) {
                    mostrarResultadoJuego("loss", Math.abs(gananciaNeta));
                } else {
                    mostrarResultadoJuego("tie", 0);
                }
                mostrarMensaje((recuperado ? "Giro recuperado. " : "") + "Salió " + numero + " " + color +
                    ": premio total " + premio.toLocaleString("es-CL") +
                    " puntos (incluye " + importeGanador.toLocaleString("es-CL") +
                    " de apuestas devueltas; ganancia neta " + gananciaNeta.toLocaleString("es-CL") +
                    ", acreditada al límite " + gananciaAcreditada.toLocaleString("es-CL") + ").", "win");
                mensaje.classList.remove("is-win", "is-loss");
                if (resultadoNeto !== "tie") mensaje.classList.add("is-" + resultadoNeto);
            }
        } else {
            mostrarResultadoJuego("loss", cantidadApuesta);
            mostrarMensaje((recuperado ? "Giro recuperado. " : "") + "Salió " + numero + " " + color +
                ". No hubo premio; perdiste " + cantidadApuesta.toLocaleString("es-CL") + " puntos.", "loss");
        }

        apuestasPendientes = [];
        guardarApuestasPendientes();
        borrarGiroRuleta();
        girando = false;
        cambiarEstadoControles(false);
        actualizarApuestas();
        actualizarSaldo();
        cancelarCuentaAtras();
    }

    function totalApostado() {
        return apuestasPendientes.reduce(function(total, apuesta) {
            return total + apuesta.importe;
        }, 0);
    }

    function guardarApuestasPendientes() {
        if (!claveApuestasPendientes) return;
        try {
            if (apuestasPendientes.length) {
                sessionStorage.setItem(claveApuestasPendientes, JSON.stringify(apuestasPendientes));
            } else {
                sessionStorage.removeItem(claveApuestasPendientes);
            }
        } catch (error) {
        }
    }

    function borrarApuestasPendientesGuardadas() {
        if (!claveApuestasPendientes) return true;
        try {
            sessionStorage.removeItem(claveApuestasPendientes);
            return sessionStorage.getItem(claveApuestasPendientes) === null;
        } catch (error) {
            return false;
        }
    }

    function guardarGiroRuleta(giro) {
        if (!claveGiroRuleta) return false;
        try {
            sessionStorage.setItem(claveGiroRuleta, JSON.stringify(giro));
            return true;
        } catch (error) {
            return false;
        }
    }

    function leerGiroRuleta() {
        if (!claveGiroRuleta) return null;
        try {
            let giro = JSON.parse(sessionStorage.getItem(claveGiroRuleta) || "null");
            let tiposApuestaValidos = [
                "red", "black", "even", "odd", "low", "high",
                "dozen-1", "dozen-2", "dozen-3", "column-1", "column-2", "column-3"
            ];
            if (!giro || !ordenRuleta.includes(String(giro.numero)) || !Array.isArray(giro.apuestas) ||
                !giro.apuestas.length || giro.apuestas.some(function(apuesta) {
                    return !apuesta || !Number.isSafeInteger(apuesta.importe) || apuesta.importe <= 0 ||
                        (apuesta.tipo === "number"
                            ? !ordenRuleta.includes(String(apuesta.numero))
                            : !tiposApuestaValidos.includes(apuesta.tipo));
                })) {
                sessionStorage.removeItem(claveGiroRuleta);
                return null;
            }
            let cantidadApuesta = giro.apuestas.reduce(function(total, apuesta) {
                return total + apuesta.importe;
            }, 0);
            let premioMaximo = giro.apuestas.reduce(function(total, apuesta) {
                return total + apuesta.importe * multiplicadorApuesta(apuesta.tipo);
            }, 0);
            if (!Number.isSafeInteger(cantidadApuesta) || !Number.isSafeInteger(premioMaximo)) {
                sessionStorage.removeItem(claveGiroRuleta);
                return null;
            }
            return {
                numero: String(giro.numero),
                apuestas: giro.apuestas.map(function(apuesta) {
                    return {
                        tipo: apuesta.tipo,
                        numero: apuesta.tipo === "number" ? String(apuesta.numero) : "0",
                        importe: apuesta.importe
                    };
                }),
                cantidadApuesta
            };
        } catch (error) {
            try {
                sessionStorage.removeItem(claveGiroRuleta);
            } catch (errorAlmacenamiento) {
            }
            return null;
        }
    }

    function borrarGiroRuleta() {
        if (!claveGiroRuleta) return;
        try {
            sessionStorage.removeItem(claveGiroRuleta);
        } catch (error) {
        }
    }

    function restaurarApuestasPendientes() {
        if (!claveApuestasPendientes) return;
        try {
            let guardadas = JSON.parse(sessionStorage.getItem(claveApuestasPendientes) || "[]");
            if (!Array.isArray(guardadas)) throw new Error("Formato de apuestas no válido");

            let tiposApuestaValidos = [
                "red", "black", "even", "odd", "low", "high",
                "dozen-1", "dozen-2", "dozen-3", "column-1", "column-2", "column-3"
            ];
            apuestasPendientes = guardadas.filter(function(apuesta) {
                if (!apuesta || typeof apuesta !== "object" ||
                    !Number.isSafeInteger(apuesta.importe) || apuesta.importe <= 0) return false;
                if (apuesta.tipo === "number") return ordenRuleta.includes(String(apuesta.numero));
                return tiposApuestaValidos.includes(apuesta.tipo);
            }).map(function(apuesta) {
                return {
                    tipo: apuesta.tipo,
                    numero: apuesta.tipo === "number" ? String(apuesta.numero) : "0",
                    importe: apuesta.importe
                };
            });

            let cuenta = obtenerCuentaSesion();
            let total = totalApostado();
            if (!cuenta || puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA ||
                !Number.isSafeInteger(total) || total > puntosCuenta(cuenta)) {
                apuestasPendientes = [];
            }
            guardarApuestasPendientes();
        } catch (error) {
            apuestasPendientes = [];
            try {
                sessionStorage.removeItem(claveApuestasPendientes);
            } catch (errorAlmacenamiento) {
            }
        }
    }

    function descripcionApuesta(apuesta) {
        if (apuesta.tipo === "number") return "Número " + apuesta.numero;
        if (apuesta.tipo.indexOf("dozen-") === 0) return "Docena " + apuesta.tipo.slice(-1);
        if (apuesta.tipo.indexOf("column-") === 0) return "Columna " + apuesta.tipo.slice(-1);
        let descripciones = {
            red: "Rojo", black: "Negro", even: "Par", odd: "Impar",
            low: "1-18", high: "19-36"
        };
        return descripciones[apuesta.tipo];
    }

    function actualizarApuestas() {
        guardarApuestasPendientes();
        listaApuestas.replaceChildren();
        let apuestasPorPosicion = new Map();
        document.querySelectorAll(".roulette-number, .roulette-bet-choice").forEach(function(boton) {
            boton.classList.remove("is-on-bet");
            boton.querySelectorAll(".roulette-chip").forEach(function(ficha) {
                ficha.remove();
            });
        });

        apuestasPendientes.forEach(function(apuesta) {
            let elemento = document.createElement("li");
            let nombre = document.createElement("span");
            let importe = document.createElement("strong");
            nombre.textContent = descripcionApuesta(apuesta);
            importe.textContent = apuesta.importe.toLocaleString("es-CL") + " pts";
            elemento.append(nombre, importe);
            listaApuestas.append(elemento);

            let boton = apuesta.tipo === "number"
                ? botonesCasilla.find(function(casilla) { return casilla.dataset.number === apuesta.numero; })
                : opciones.find(function(opcion) { return opcion.dataset.betType === apuesta.tipo; });
            if (boton) apuestasPorPosicion.set(boton, (apuestasPorPosicion.get(boton) || 0) + 1);
        });

        if (apuestasPendientes.length === 0) {
            let vacio = document.createElement("li");
            vacio.className = "is-empty";
            vacio.textContent = "Sin apuestas todavía.";
            listaApuestas.append(vacio);
        }
        listaApuestas.scrollTop = listaApuestas.scrollHeight;

        apuestasPorPosicion.forEach(function(cantidad, boton) {
            boton.classList.add("is-on-bet");
            let ficha = document.createElement("span");
            ficha.className = "roulette-chip";
            ficha.setAttribute("aria-hidden", "true");
            ficha.textContent = String(cantidad);
            boton.append(ficha);
        });

        let total = totalApostado();
        let cuenta = obtenerCuentaSesion();
        let juegosBloqueados = cuenta && puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA;
        let restante = cuenta ? Math.max(0, puntosCuenta(cuenta) - total) : 0;
        contadorApuestas.textContent = "Apuestas preparadas: " + apuestasPendientes.length;
        totalApuestaTexto.textContent = "Total apostado: " + total.toLocaleString("es-CL") +
            " puntos · Saldo restante: " + restante.toLocaleString("es-CL");
        botonLimpiarApuestas.disabled = girando || apuestasPendientes.length === 0;
        botonAgregarApuesta.disabled = girando || !cuenta || juegosBloqueados;
        botonDeshacerApuesta.disabled = girando || apuestasPendientes.length === 0;
        botonApuestaMaxima.disabled = girando || !cuenta || juegosBloqueados || restante === 0;
        fichasRapidas.forEach(function(ficha) {
            ficha.disabled = girando || !cuenta || juegosBloqueados;
        });
        apuestaInput.disabled = girando || !cuenta || juegosBloqueados;
        opciones.forEach(function(opcion) {
            opcion.disabled = girando || !cuenta || juegosBloqueados;
        });
        botonesCasilla.forEach(function(boton) {
            boton.disabled = girando || !cuenta || juegosBloqueados;
        });
        apuestaInput.max = String(restante);
        if (apuestasPendientes.length === 0 && temporizadorApuesta !== null) {
            cancelarCuentaAtras();
        }
    }

    function cambiarEstadoControles(bloqueado) {
        let cuenta = obtenerCuentaSesion();
        let deshabilitado = bloqueado || !cuenta ||
            puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA;
        apuestaInput.disabled = deshabilitado;
        botonAgregarApuesta.disabled = deshabilitado;
        botonDeshacerApuesta.disabled = bloqueado || apuestasPendientes.length === 0;
        botonApuestaMaxima.disabled = deshabilitado || (cuenta &&
            puntosCuenta(cuenta) <= totalApostado());
        botonLimpiarApuestas.disabled = bloqueado || apuestasPendientes.length === 0;
        fichasRapidas.forEach(function(ficha) {
            ficha.disabled = deshabilitado;
        });
        opciones.forEach(function(opcion) {
            opcion.disabled = deshabilitado;
        });
        botonesCasilla.forEach(function(boton) {
            boton.disabled = deshabilitado;
        });
        if (!bloqueado) actualizarApuestas();
    }

    createRouletteBoard();
    crearRueda();
    actualizarHistorialRuleta(claveHistorialRuleta, listaHistorial, contadorHistorial, false);
    actualizarHistorialRuleta(claveHistorialPersonal, listaHistorialUsuario, contadorHistorialUsuario, true);
    window.addEventListener("storage", function(evento) {
        if (evento.key === claveHistorialRuleta) {
            actualizarHistorialRuleta(claveHistorialRuleta, listaHistorial, contadorHistorial, false);
        }
        if (claveHistorialPersonal && evento.key === claveHistorialPersonal) {
            actualizarHistorialRuleta(claveHistorialPersonal, listaHistorialUsuario, contadorHistorialUsuario, true);
        }
    });
    aroRuleta.style.setProperty("--wheel-idle-start", anguloActualRueda + "deg");
    aroRuleta.style.setProperty("--wheel-idle-counter-start", -anguloActualRueda + "deg");
    aroRuleta.classList.add("is-idle");
    ajustarRadioRueda();
    window.addEventListener("resize", ajustarRadioRueda);
    if (!obtenerCuentaSesion()) {
        mostrarMensaje("Inicia sesión para jugar a la ruleta con puntos virtuales.", "");
    }
    document.addEventListener("chichacook:points-changed", function() {
        actualizarSaldo();
        actualizarApuestas();
    });

    function ajustarRadioRueda() {
        let radio = rueda.clientWidth / 2 - 33;
        aroRuleta.style.setProperty("--wheel-radius", radio + "px");
    }

    function createRouletteBoard() {
        crearCasilla("0", "green", 1, 1, 2);
        crearCasilla("00", "green", 1, 3, 1);
        for (let numero = 1; numero <= 36; numero++) {
            let fila = 3 - ((numero - 1) % 3);
            let columna = Math.floor((numero - 1) / 3) + 2;
            crearCasilla(String(numero), colorNumero(String(numero)), columna, fila, 1);
        }

        let posicionesApuesta = {
            "column-3": [14, 1], "column-2": [14, 2], "column-1": [14, 3],
            "dozen-1": [2, 4, 4], "dozen-2": [6, 4, 4], "dozen-3": [10, 4, 4],
            low: [2, 5, 2], even: [4, 5, 2], red: [6, 5, 2],
            black: [8, 5, 2], odd: [10, 5, 2], high: [12, 5, 2]
        };
        opciones.forEach(function(opcion) {
            let posicion = posicionesApuesta[opcion.dataset.betType];
            if (!posicion) return;
            opcion.style.gridColumn = String(posicion[0]) + (posicion[2] ? " / span " + posicion[2] : "");
            opcion.style.gridRow = String(posicion[1]);
        });
    }

    function crearRueda() {
        let gradosPorCasilla = 360 / ordenRuleta.length;
        let sectores = [];
        ordenRuleta.forEach(function(numero, indice) {
            let inicio = indice * gradosPorCasilla;
            let fin = (indice + 1) * gradosPorCasilla;
            let color = colorNumero(numero);
            let colorSector = color === "red" ? "#c51f35" : color === "green" ? "#16844f" : "#202020";
            let finSector = fin - 1.5;
            sectores.push(colorSector + " " + inicio + "deg " + finSector + "deg");
            sectores.push("#f2c94c " + finSector + "deg " + fin + "deg");

            let etiqueta = document.createElement("span");
            let textoEtiqueta = document.createElement("span");
            let angulo = inicio + gradosPorCasilla / 2;
            etiqueta.className = "roulette-wheel-number is-" + color;
            textoEtiqueta.className = "roulette-wheel-number-label";
            textoEtiqueta.textContent = numero;
            textoEtiqueta.style.transform = "rotate(0deg)";
            etiqueta.style.transform = "translate(-50%, -50%) rotate(" + angulo + "deg) translateY(calc(0px - var(--wheel-radius))) rotate(" + -angulo + "deg)";
            etiqueta.append(textoEtiqueta);
            aroRuleta.append(etiqueta);
            etiquetasRueda.push(textoEtiqueta);
        });
        aroRuleta.style.background = "conic-gradient(" + sectores.join(", ") + ")";
    }

    function actualizarCuentaAtras() {
        let segundos = Math.max(0, Math.ceil((finCuentaAtras - Date.now()) / 1000));
        cuentaAtras.textContent = "Quedan " + segundos + " s para girar la ruleta.";
        if (segundos === 0) {
            window.clearInterval(temporizadorApuesta);
            temporizadorApuesta = null;
            girarRuleta();
        }
    }

    function iniciarCuentaAtras() {
        if (temporizadorApuesta !== null || girando || apuestasPendientes.length === 0) return;
        aroRuleta.style.setProperty("--wheel-idle-start", anguloActualRueda + "deg");
        aroRuleta.style.setProperty("--wheel-idle-counter-start", -anguloActualRueda + "deg");
        aroRuleta.classList.add("is-idle");
        pistaPelota.classList.remove("is-revealed", "is-spinning", "is-landed");
        resultadoElemento.textContent = "?";
        finCuentaAtras = Date.now() + 20000;
        actualizarCuentaAtras();
        temporizadorApuesta = window.setInterval(actualizarCuentaAtras, 1000);
    }

    function cancelarCuentaAtras() {
        if (temporizadorApuesta !== null) {
            window.clearInterval(temporizadorApuesta);
            temporizadorApuesta = null;
        }
        cuentaAtras.textContent = "Añade una apuesta para iniciar el conteo de 20 segundos.";
    }

    opciones.forEach(function(opcion) {
        opcion.addEventListener("click", function() {
            tipoApuesta = opcion.dataset.betType;
            actualizarSeleccion();
            if (importeRapido !== null) agregarApuesta(importeRapido);
        });
    });

    fichasRapidas.forEach(function(ficha) {
        ficha.addEventListener("click", function() {
            importeRapido = Number(ficha.dataset.amount);
            apuestaInput.value = String(importeRapido);
            fichasRapidas.forEach(function(otraFicha) {
                otraFicha.setAttribute("aria-pressed", String(otraFicha === ficha));
            });
            mostrarMensaje("Importe rápido seleccionado: " +
                importeRapido.toLocaleString("es-CL") + " puntos. Toca una casilla para apostar.", "");
        });
    });

    botonApuestaMaxima.addEventListener("click", function() {
        let cuenta = obtenerCuentaSesion();
        if (!cuenta) {
            mostrarMensaje("Inicia sesión para apostar tus puntos en la ruleta.", "loss");
            return;
        }
        if (puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA) {
            mostrarMensaje("Alcanzaste el máximo de 15.000 puntos ganados. Los juegos están bloqueados; aún puedes canjear recompensas.", "loss");
            return;
        }
        desactivarApuestaRapida();
        apuestaInput.value = String(Math.max(0, puntosCuenta(cuenta) - totalApostado()));
        apuestaInput.focus();
    });

    apuestaInput.addEventListener("input", desactivarApuestaRapida);

    botonAgregarApuesta.addEventListener("click", function() {
        agregarApuesta(Number(apuestaInput.value));
    });

    botonLimpiarApuestas.addEventListener("click", function() {
        apuestasPendientes = [];
        actualizarApuestas();
        mostrarMensaje("Se vaciaron las apuestas preparadas.", "");
        cancelarCuentaAtras();
    });

    botonDeshacerApuesta.addEventListener("click", function() {
        if (girando || apuestasPendientes.length === 0) return;
        let apuestaQuitada = apuestasPendientes.pop();
        actualizarApuestas();
        mostrarMensaje("Se quitó la apuesta a " + descripcionApuesta(apuestaQuitada) + ".", "");
    });

    function reproducirSonidoGiro(duracion) {
        let ConstructorAudio = window.AudioContext || window.webkitAudioContext;
        if (!ConstructorAudio) return;
        try {
            audioContext = audioContext || new ConstructorAudio();
            if (audioContext.state === "suspended") audioContext.resume();
        } catch (error) {
            return;
        }

        sonidoActivo = true;
        let inicio = Date.now();
        function emitirTick() {
            if (!sonidoActivo) return;
            let ahora = audioContext.currentTime;
            let oscilador = audioContext.createOscillator();
            let volumen = audioContext.createGain();
            oscilador.type = "square";
            oscilador.frequency.setValueAtTime(880, ahora);
            volumen.gain.setValueAtTime(0.045, ahora);
            volumen.gain.exponentialRampToValueAtTime(0.001, ahora + 0.035);
            oscilador.connect(volumen);
            volumen.connect(audioContext.destination);
            oscilador.start(ahora);
            oscilador.stop(ahora + 0.04);

            let transcurrido = Date.now() - inicio;
            if (transcurrido < duracion) window.setTimeout(emitirTick, 45 + transcurrido / 24);
            else sonidoActivo = false;
        }
        emitirTick();
    }

    function girarRuleta() {
        if (girando) return;
        let cuenta = obtenerCuentaSesion();
        if (!cuenta) {
            mostrarMensaje("Inicia sesión para apostar tus puntos en la ruleta.", "loss");
            apuestasPendientes = [];
            actualizarApuestas();
            actualizarSaldo();
            cancelarCuentaAtras();
            return;
        }
        if (puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA) {
            mostrarMensaje("Alcanzaste el máximo de 15.000 puntos ganados. Los juegos están bloqueados; aún puedes canjear recompensas.", "loss");
            apuestasPendientes = [];
            actualizarApuestas();
            cancelarCuentaAtras();
            return;
        }

        if (apuestasPendientes.length === 0) {
            cancelarCuentaAtras();
            return;
        }
        let apuestasDelGiro = apuestasPendientes.slice();
        let cantidadApuesta = totalApostado();
        if (cantidadApuesta > puntosCuenta(cuenta)) {
            mostrarMensaje("Saldo insuficiente. Tienes " +
                puntosCuenta(cuenta).toLocaleString("es-CL") + " puntos.", "loss");
            apuestasPendientes = [];
            actualizarApuestas();
            actualizarSaldo();
            cancelarCuentaAtras();
            return;
        }
        let premioMaximo = 0;
        let premioNoValido = apuestasDelGiro.some(function(apuesta) {
            let multiplicador = multiplicadorApuesta(apuesta.tipo);
            if (apuesta.importe > Math.floor(Number.MAX_SAFE_INTEGER / multiplicador)) return true;
            premioMaximo += apuesta.importe * multiplicador;
            return !Number.isSafeInteger(premioMaximo);
        });
        if (premioNoValido || premioMaximo > Number.MAX_SAFE_INTEGER - puntosCuenta(cuenta) + cantidadApuesta) {
            mostrarMensaje("El premio potencial supera el límite de puntos permitido.", "loss");
            apuestasPendientes = [];
            actualizarApuestas();
            cancelarCuentaAtras();
            return;
        }
        let gradosPorCasilla = 360 / ordenRuleta.length;
        let resultado = Math.floor(Math.random() * ordenRuleta.length);
        let anguloCentroResultado = resultado * gradosPorCasilla + gradosPorCasilla / 2;
        let anguloInicioRueda = obtenerAnguloRueda();
        let angulosInicioEtiquetas = etiquetasRueda.map(function(etiqueta) {
            return obtenerAnguloTransformacion(etiqueta, 0);
        });
        let anguloInicioPelota = Math.floor(Math.random() * 360);
        let vueltasRueda = 5 + Math.floor(Math.random() * 3);
        let vueltasBola = 3 + Math.floor(Math.random() * 3);
        let duracionGiroPelota = 12000 + Math.floor(Math.random() * 3000);
        let faseActual = ((anguloInicioRueda % 360) + 360) % 360;
        let distanciaHastaResultado = ((360 - anguloCentroResultado - faseActual) % 360 + 360) % 360;
        let anguloFinalRueda = anguloInicioRueda + vueltasRueda * 360 + distanciaHastaResultado;
        let anguloFinalPelota = vueltasBola * 360;
        let giroGuardado = {
            numero: ordenRuleta[resultado],
            apuestas: apuestasDelGiro,
            cantidadApuesta
        };
        if (!guardarGiroRuleta(giroGuardado)) {
            mostrarMensaje("No se pudo guardar el giro. La apuesta sigue preparada y no se descontó saldo.", "loss");
            return;
        }
        if (!borrarApuestasPendientesGuardadas()) {
            borrarGiroRuleta();
            mostrarMensaje("No se pudo asegurar el giro. La apuesta sigue preparada y no se descontó saldo.", "loss");
            return;
        }
        if (cambiarPuntosSesion(-cantidadApuesta) === null) {
            mostrarMensaje("No se pudo registrar la apuesta. Vuelve a iniciar sesión.", "loss");
            borrarGiroRuleta();
            guardarApuestasPendientes();
            actualizarApuestas();
            actualizarSaldo();
            cancelarCuentaAtras();
            return;
        }

        girando = true;
        cambiarEstadoControles(true);
        resultadoElemento.textContent = "?";
        pistaPelota.classList.remove("is-revealed", "is-spinning", "is-landed");
        pistaPelota.style.setProperty("--ball-start-angle", anguloInicioPelota + "deg");
        pistaPelota.style.setProperty("--ball-end-angle", anguloFinalPelota + "deg");
        pistaPelota.style.setProperty("--ball-duration", duracionGiroPelota + "ms");
        pistaPelota.style.transform = "rotate(" + anguloInicioPelota + "deg)";
        anguloActualRueda = anguloInicioRueda;
        aroRuleta.style.transition = "none";
        aroRuleta.style.transform = "rotate(" + anguloInicioRueda + "deg)";
        etiquetasRueda.forEach(function(etiqueta, indice) {
            etiqueta.style.transition = "none";
            etiqueta.style.transform = "rotate(" + angulosInicioEtiquetas[indice] + "deg)";
        });
        aroRuleta.classList.remove("is-idle");
        void aroRuleta.offsetWidth;
        aroRuleta.style.removeProperty("transition");
        etiquetasRueda.forEach(function(etiqueta) {
            etiqueta.style.removeProperty("transition");
        });
        aroRuleta.style.setProperty("--wheel-duration", duracionGiroPelota + "ms");
        void rueda.offsetWidth;
        anguloActualRueda = anguloFinalRueda;
        aroRuleta.style.transform = "rotate(" + anguloFinalRueda + "deg)";
        etiquetasRueda.forEach(function(etiqueta, indice) {
            etiqueta.style.transform = "rotate(" +
                (angulosInicioEtiquetas[indice] - (anguloFinalRueda - anguloInicioRueda)) + "deg)";
        });
        pistaPelota.classList.add("is-revealed", "is-spinning");
        reproducirSonidoGiro(duracionGiroPelota);
        mensaje.classList.remove("is-win", "is-loss");
        mensaje.textContent = "La pelota está girando para revelar el resultado.";
        cuentaAtras.textContent = "Apuestas cerradas. La bola está girando...";

        window.setTimeout(function() {
            sonidoActivo = false;
            finalizarGiroRuleta(giroGuardado, false);
        }, duracionGiroPelota + 150);
    }

    actualizarSeleccion();
    actualizarSaldo();
    let giroRecuperado = leerGiroRuleta();
    if (giroRecuperado) {
        apuestasPendientes = [];
        finalizarGiroRuleta(giroRecuperado, true);
    } else {
        restaurarApuestasPendientes();
        actualizarApuestas();
        if (apuestasPendientes.length) {
            mostrarMensaje("Se restauraron tus apuestas preparadas.", "");
            iniciarCuentaAtras();
        }
    }
}

document.querySelector(".register-form")?.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let email = document.getElementById("email").value.trim().toLowerCase();
    let username = document.getElementById("register-username").value.trim();
    let password = document.getElementById("register-password").value;
    let displayName = document.getElementById("display-name").value.trim();
    let cuentas = obtenerCuentas();

    if (cuentas.some(function(cuenta) {
        return normalizarIdentificador(cuenta.email) === email ||
            normalizarIdentificador(cuenta.username) === normalizarIdentificador(username);
    })) {
        mostrarAviso("Ese correo o usuario ya está registrado.", "error");
        return;
    }

    cuentas.push({
        email,
        username,
        password,
        displayName,
        puntos: 0,
        puntosGanados: 0,
        bonoInicioSesionOtorgado: false
    });
    guardarCuentas(cuentas);
    mostrarAviso("Cuenta creada. Ya puedes iniciar sesión.", "success", function() {
        window.location.href = "login.html";
    });
});

document.querySelectorAll(".password-toggle").forEach(function(boton) {
    boton.addEventListener("click", function() {
        let campo = document.getElementById(boton.getAttribute("aria-controls"));
        if (!campo) return;

        let mostrar = campo.type === "password";
        campo.type = mostrar ? "text" : "password";
        boton.textContent = mostrar ? "Ocultar" : "Mostrar";
        boton.setAttribute("aria-pressed", String(mostrar));
    });
});

document.querySelector(".login-form")?.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let identificador = document.getElementById("username").value.trim().toLowerCase();
    let password = document.getElementById("password").value;
    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(usuario) {
        let correo = normalizarIdentificador(usuario.email);
        let username = normalizarIdentificador(usuario.username);
        return (identificador === correo || identificador === username) &&
            typeof usuario.password === "string" && password === usuario.password;
    });

    if (!cuenta) {
        mostrarAviso("Usuario, correo o contraseña incorrectos. Revisa tus datos o regístrate.", "error");
        return;
    }

    let saldo = puntosCuenta(cuenta);
    let bonoAplicado = cuenta.bonoInicioSesionOtorgado !== true;
    let bonoBienvenida = 3000;
    let bonoAcreditado = 0;
    if (bonoAplicado) {
        bonoAcreditado = Math.min(
            bonoBienvenida,
            LIMITE_PUNTOS_CUENTA - puntosGanadosCuenta(cuenta)
        );
        if (saldo > Number.MAX_SAFE_INTEGER - bonoAcreditado) {
            mostrarAviso("No se pudo aplicar el bono de bienvenida porque el saldo superaría el límite permitido.", "error");
            return;
        }
        cuenta.puntos = saldo + bonoAcreditado;
        cuenta.puntosGanados = puntosGanadosCuenta(cuenta) + bonoAcreditado;
        cuenta.bonoInicioSesionOtorgado = true;
        guardarCuentas(cuentas);
        saldo = cuenta.puntos;
    }

    sessionStorage.setItem("chichacookSession", cuenta.username);
    let mensajeInicioSesion = bonoAplicado
        ? "¡Bienvenido/a, " + cuenta.displayName +
            (bonoAcreditado > 0
                ? "! Recibiste " + bonoAcreditado.toLocaleString("es-CL") + " puntos de tu bono único de bienvenida."
                : "! Ya alcanzaste el máximo de puntos ganados por cuenta; no se pudo acreditar el bono de bienvenida.") +
            " Tu saldo es de " +
            saldo.toLocaleString("es-CL") + " puntos."
        : "¡Bienvenido/a, " + cuenta.displayName + "! Tu saldo es de " +
            saldo.toLocaleString("es-CL") + " puntos.";
    let continuarCompra = sessionStorage.getItem("chichacookContinueAfterLogin");
    let destinoInicioSesion = "index.html";
    if (continuarCompra === "services-cart") {
        sessionStorage.removeItem("chichacookContinueAfterLogin");
        destinoInicioSesion = "servicios.html?abrirCarrito=1";
    } else if (continuarCompra === "services-add-product") {
        sessionStorage.removeItem("chichacookContinueAfterLogin");
        destinoInicioSesion = "servicios.html?abrirCarrito=1&agregarPendiente=1";
    }
    mostrarAviso(mensajeInicioSesion, "success", function() {
        window.location.href = destinoInicioSesion;
    });
});

let recoveryDialog = document.getElementById("password-recovery-dialog");
let recoveryForm = document.getElementById("password-recovery-form");

document.getElementById("open-password-recovery")?.addEventListener("click", function() {
    document.getElementById("recovery-message").textContent = "";
    recoveryDialog.showModal();
});

document.getElementById("close-password-recovery")?.addEventListener("click", function() {
    recoveryDialog.close();
});

recoveryForm?.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let email = document.getElementById("recovery-email").value.trim().toLowerCase();
    let password = document.getElementById("recovery-password").value;
    let passwordConfirm = document.getElementById("recovery-password-confirm").value;
    let mensaje = document.getElementById("recovery-message");

    if (password !== passwordConfirm) {
        mensaje.textContent = "Las contraseñas no coinciden.";
        return;
    }

    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(usuario) {
        return usuario.email && usuario.email.toLowerCase() === email;
    });

    if (!cuenta) {
        mensaje.textContent = "No encontramos una cuenta con ese correo.";
        return;
    }

    cuenta.password = password;
    guardarCuentas(cuentas);
    recoveryForm.reset();
    mensaje.textContent = "Contraseña actualizada. Ya puedes iniciar sesión.";
});

document.getElementById("redeem-reward")?.addEventListener("click", function(evento) {
    let boton = evento.currentTarget;
    let mensaje = document.getElementById("redeem-message");
    let usuarioSesion = sessionStorage.getItem("chichacookSession");
    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(usuario) {
        return normalizarIdentificador(usuario.username) === normalizarIdentificador(usuarioSesion);
    });
    if (!cuenta) {
        mensaje.textContent = "Inicia sesión para consultar tus puntos y canjear la recompensa.";
        mensaje.classList.add("is-redeem-error");
        return;
    }
    if (cuenta.recompensaChichaCanjeada) {
        mensaje.textContent = "Ya canjeaste esta recompensa. Solo se permite un canje por cuenta.";
        mensaje.classList.remove("is-redeem-error");
        boton.disabled = true;
        boton.textContent = "Ya canjeada";
        return;
    }
    if (puntosCuenta(cuenta) < 15000) {
        mensaje.textContent = "Necesitas 15.000 puntos para canjear la chicha. Tu saldo es " +
            puntosCuenta(cuenta).toLocaleString("es-CL") + " puntos.";
        mensaje.classList.add("is-redeem-error");
        return;
    }
    cuenta.puntos = puntosCuenta(cuenta) - 15000;
    cuenta.recompensaChichaCanjeada = true;
    guardarCuentas(cuentas);

    mensaje.classList.remove("is-redeem-error");
    boton.disabled = true;
    boton.textContent = "Ya canjeada";
    mensaje.textContent = "¡Canje realizado! Disfruta tu chicha. Esta recompensa ya quedó registrada en tu cuenta.";
    let estadoRecompensa = document.getElementById("reward-status");
    if (estadoRecompensa) {
        estadoRecompensa.textContent = "Recompensa canjeada";
        estadoRecompensa.classList.add("is-redeemed");
    }
    actualizarNavegacionSesion();
    let puntosRecompensaActuales = document.getElementById("reward-points");
    if (puntosRecompensaActuales) {
        puntosRecompensaActuales.textContent = cuenta.puntos.toLocaleString("es-CL");
    }
});

document.getElementById("redeem-topping-reward")?.addEventListener("click", function(evento) {
    let boton = evento.currentTarget;
    let mensaje = document.getElementById("topping-redeem-message");
    let estado = document.getElementById("topping-reward-status");
    let usuarioSesion = sessionStorage.getItem("chichacookSession");
    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(usuario) {
        return normalizarIdentificador(usuario.username) === normalizarIdentificador(usuarioSesion);
    });

    if (!cuenta) {
        mensaje.textContent = "Inicia sesión para canjear esta recompensa.";
        mensaje.classList.add("is-redeem-error");
        return;
    }
    if (cuenta.recompensaToppingCanjeada) {
        boton.disabled = true;
        boton.textContent = "Ya canjeada";
        mensaje.textContent = "Esta recompensa solo se puede canjear una vez por cuenta.";
        mensaje.classList.remove("is-redeem-error");
        return;
    }
    if (puntosCuenta(cuenta) < 10000) {
        mensaje.textContent = "Necesitas 10.000 puntos. Tu saldo es " +
            puntosCuenta(cuenta).toLocaleString("es-CL") + " puntos.";
        mensaje.classList.add("is-redeem-error");
        return;
    }

    cuenta.puntos = puntosCuenta(cuenta) - 10000;
    cuenta.recompensaToppingCanjeada = true;
    cuenta.toppingGratisDisponible = true;
    guardarCuentas(cuentas);
    boton.disabled = true;
    boton.textContent = "Ya canjeada";
    mensaje.classList.remove("is-redeem-error");
    mensaje.textContent = "Canje realizado. El topping extra gratis estará disponible en tu próxima compra con extra.";
    if (estado) estado.textContent = "Canjeada: topping extra disponible";
    document.querySelectorAll("#reward-points, #topping-reward-points").forEach(function(elemento) {
        elemento.textContent = cuenta.puntos.toLocaleString("es-CL");
    });
    actualizarNavegacionSesion();
});

function toggleMenu() {
    let boton = document.querySelector(".menu-toggle");
    let navegacion = document.getElementById("main-nav");
    if (!boton || !navegacion) return;
    let abierto = navegacion.classList.toggle("is-open");
    boton.setAttribute("aria-expanded", String(abierto));
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    let caja = document.getElementById("carrito");
    if (caja && caja.classList.contains("mostrar")) posicionarCarrito();
}

function iniciarJuegoPenales() {
    let panel = document.querySelector(".penalty-section");
    if (!panel) return;

    let reiniciar = document.getElementById("penalty-reset");
    let botonAccion = document.getElementById("penalty-action");
    let avance = document.getElementById("penalty-progress");
    let faseTexto = document.getElementById("penalty-phase");
    let saldo = document.getElementById("penalty-points");
    let marcadorGoles = document.getElementById("penalty-goals");
    let marcadorAtajadas = document.getElementById("penalty-saves");
    let marcadorTiro = document.getElementById("penalty-round");
    let indicadoresGoles = Array.from(document.querySelectorAll("#penalty-kick-indicators li"));
    let indicadoresAtajadas = Array.from(document.querySelectorAll("#penalty-save-indicators li"));
    let potenciaTrack = document.getElementById("penalty-power-track");
    let potenciaRelleno = document.getElementById("penalty-power-fill");
    let potenciaTexto = document.getElementById("penalty-power-label");
    let controlPotencia = panel.querySelector(".penalty-power");
    let apuestaInput = document.getElementById("penalty-bet");
    let apuestaFeedback = document.getElementById("penalty-bet-feedback");
    let selectorArquero = document.getElementById("penalty-keeper-select");
    let selectorPateador = document.getElementById("penalty-shooter-select");
    let controlesDireccion = Array.from(panel.querySelectorAll(".penalty-direction"));
    let cancha = panel.querySelector(".penalty-pitch");
    let arco = panel.querySelector(".penalty-goal");
    let arquero = panel.querySelector(".penalty-keeper");
    let pateador = panel.querySelector(".penalty-shooter");
    let pelota = panel.querySelector(".penalty-ball");
    let puntoElegido = { x: 50, y: 48 };
    let tirosRealizados = 0;
    let goles = 0;
    let atajadas = 0;
    let fase = "kick";
    let tandaTerminada = false;
    let tandaIniciada = false;
    let resolviendoTiro = false;
    let temporizadorAccionAutomatica = null;
    let segundosAccionAutomatica = 0;
    let potencia = 0;
    let intervaloPotencia = null;
    let cargandoPotencia = false;
    let botonPuntero = null;
    let ignorarClickSiguiente = false;
    arquero.dataset.keeper = selectorArquero.value;
    pateador.dataset.player = selectorPateador.value;

    function limitar(valor, minimo, maximo) {
        return Math.max(minimo, Math.min(maximo, valor));
    }

    function colocarObjetivo(x, y) {
        puntoElegido = {
            x: limitar(x, 6, 94),
            y: limitar(y, 8, 86)
        };
        let marcador = panel.querySelector(".penalty-aim-marker");
        marcador.style.left = puntoElegido.x + "%";
        marcador.style.top = puntoElegido.y + "%";
        controlesDireccion.forEach(function(control) {
            let direccion = control.dataset.direction;
            let seleccionado = direccion === "left" ? puntoElegido.x < 38
                : direccion === "right" ? puntoElegido.x > 62
                    : puntoElegido.x >= 38 && puntoElegido.x <= 62;
            control.setAttribute("aria-pressed", String(seleccionado));
        });
        actualizarSeleccion();
    }

    function describirPunto(punto) {
        let horizontal = punto.x < 36 ? "a la izquierda" : punto.x > 64 ? "a la derecha" : "al centro";
        let vertical = punto.y < 34 ? "arriba" : punto.y > 66 ? "abajo" : "a media altura";
        return horizontal + " y " + vertical;
    }

    function colocarArquero(punto, lanzandose) {
        let alturaArco = Math.max(1, arco.clientHeight);
        let alturaArquero = arquero.offsetHeight;
        let mitadArquero = alturaArquero / 2;
        let alturaDeseada = lanzandose
            ? alturaArco * .78
            : punto.y / 100 * alturaArco;
        let centroVertical = limitar(
            alturaDeseada,
            mitadArquero,
            Math.max(mitadArquero, alturaArco - mitadArquero)
        );
        arquero.style.left = limitar(punto.x, 15, 85) + "%";
        arquero.style.top = centroVertical / alturaArco * 100 + "%";
        arquero.style.setProperty("--keeper-dive-angle", punto.x < 42 ? "-90deg" : "90deg");
        arquero.classList.toggle("is-diving", Boolean(lanzandose));
    }

    function colocarBalonEnArco(punto) {
        let rectArco = arco.getBoundingClientRect();
        let rectCancha = cancha.getBoundingClientRect();
        let x = rectArco.left - rectCancha.left + rectArco.width * punto.x / 100;
        let y = rectArco.top - rectCancha.top + rectArco.height * punto.y / 100;
        pelota.style.left = (x / rectCancha.width * 100) + "%";
        pelota.style.top = (y / rectCancha.height * 100) + "%";
    }

    function actualizarPuntoDesdeEvento(evento) {
        let rect = arco.getBoundingClientRect();
        colocarObjetivo(
            (evento.clientX - rect.left) / rect.width * 100,
            (evento.clientY - rect.top) / rect.height * 100
        );
    }

    function cuentaActual() {
        return obtenerCuentaSesion();
    }

    function actualizarPotencia(valor) {
        potencia = Math.max(0, Math.min(100, valor));
        potenciaRelleno.style.width = potencia + "%";
        potenciaTexto.textContent = Math.round(potencia) + "%";
        potenciaTrack.setAttribute("aria-valuenow", String(Math.round(potencia)));
        potenciaRelleno.classList.toggle("is-strong", potencia >= 75);
    }

    colocarObjetivo(50, 48);
    colocarArquero({ x: 50, y: 48 }, false);
    pelota.style.left = "50%";
    pelota.style.top = "94%";

    function detenerCargaPotencia() {
        if (intervaloPotencia !== null) {
            window.clearInterval(intervaloPotencia);
            intervaloPotencia = null;
        }
        cargandoPotencia = false;
        botonAccion.classList.remove("is-charging");
        if (botonPuntero !== null && botonAccion.hasPointerCapture(botonPuntero)) {
            botonAccion.releasePointerCapture(botonPuntero);
        }
        botonPuntero = null;
    }

    function marcarIndicador(indicadores, indice, acierto, etiqueta) {
        let indicador = indicadores[indice];
        if (!indicador) return;
        indicador.classList.remove("is-success", "is-failure");
        indicador.classList.add(acierto ? "is-success" : "is-failure");
        indicador.textContent = acierto ? "✓" : "×";
        indicador.setAttribute("aria-label", etiqueta + " " + (indice + 1) +
            (acierto ? ": exitoso" : ": fallido"));
    }

    function leerApuesta(cuenta) {
        if (!apuestaInput.value.trim()) {
            apuestaFeedback.textContent = "Escribe un número o 0 para jugar sin apostar.";
            return null;
        }
        let importe = Number(apuestaInput.value);
        if (!cuenta) {
            apuestaFeedback.textContent = "Inicia sesión para apostar puntos virtuales.";
            return null;
        }
        if (!Number.isSafeInteger(importe) || importe < 0) {
            apuestaFeedback.textContent = "Ingresa una cantidad entera de puntos o 0 para jugar sin apostar.";
            return null;
        }
        if (importe > puntosCuenta(cuenta)) {
            apuestaFeedback.textContent = "Tu apuesta supera el saldo disponible.";
            return null;
        }
        apuestaFeedback.textContent = importe === 0
            ? "Jugarás este tiro sin apuesta."
            : "Si aciertas, ganas " + importe.toLocaleString("es-CL") +
                " puntos netos; si fallas, pierdes la apuesta.";
        return importe;
    }

    function liquidarApuesta(cuenta, importe, acierto) {
        let puntosGanadosAntes = puntosGanadosCuenta(cuenta);
        let bonoPosible = acierto
            ? Math.min(100, Math.max(0, LIMITE_PUNTOS_CUENTA - puntosGanadosAntes - importe))
            : 0;
        let cambio = acierto ? importe + bonoPosible : -importe;
        let gananciaNeta = acierto ? importe + bonoPosible : 0;
        let saldoNuevo;
        try {
            saldoNuevo = cambiarPuntosSesion(cambio, gananciaNeta);
        } catch (error) {
            console.error("No se pudo guardar el resultado de la apuesta de penales.", error);
            return { error: true, apuesta: 0, bono: 0 };
        }
        if (saldoNuevo === null) return { error: true, apuesta: 0, bono: 0 };

        let cuentaActualizada = cuentaActual();
        let gananciaAcreditada = cuentaActualizada
            ? Math.max(0, puntosGanadosCuenta(cuentaActualizada) - puntosGanadosAntes)
            : 0;
        return {
            error: false,
            apuesta: Math.min(acierto ? importe : 0, gananciaAcreditada),
            bono: Math.max(0, gananciaAcreditada - Math.min(acierto ? importe : 0, gananciaAcreditada))
        };
    }

    function actualizarMarcador() {
        marcadorGoles.textContent = String(goles);
        marcadorAtajadas.textContent = String(atajadas);
        marcadorTiro.textContent = tandaTerminada
            ? "Tanda terminada"
            : "Penal " + (tirosRealizados + 1) + " de 3";
    }

    function actualizarSeleccion() {
        let seleccion = fase === "kick"
            ? "Apunta " + describirPunto(puntoElegido) + "."
            : "Te lanzarás " + describirPunto(puntoElegido) + ".";
        let instruccionArco = window.matchMedia("(hover: none), (pointer: coarse)").matches
            ? " Toca otro lugar del arco para cambiarlo."
            : " Usa los controles de flecha para cambiarlo.";
        arco.setAttribute("aria-label", seleccion + instruccionArco);
    }

    function limpiarAnimacion() {
        cancha.classList.remove("is-goal", "is-saved", "is-missed", "is-blocked");
        cancha.dataset.phase = fase;
        cancha.classList.remove("is-kicking");
        pateador.classList.remove("is-shooting");
        actualizarPotencia(0);
    }

    function cancelarAccionAutomatica() {
        if (temporizadorAccionAutomatica !== null) {
            window.clearInterval(temporizadorAccionAutomatica);
            temporizadorAccionAutomatica = null;
        }
        segundosAccionAutomatica = 0;
    }

    function programarAccionAutomatica() {
        cancelarAccionAutomatica();
        segundosAccionAutomatica = 3;
        avance.textContent = "El tiro se resolverá en 3 segundos. Puedes cambiar la dirección para reiniciar el conteo.";
        temporizadorAccionAutomatica = window.setInterval(function() {
            segundosAccionAutomatica--;
            if (segundosAccionAutomatica > 0) {
                avance.textContent = "El tiro se resolverá en " + segundosAccionAutomatica +
                    " segundos. Puedes cambiar la dirección para reiniciar el conteo.";
                actualizarEstado();
                return;
            }
            cancelarAccionAutomatica();
            let cuenta = cuentaActual();
            let importe = cuenta ? leerApuesta(cuenta) : null;
            if (cuenta && importe !== null) {
                finalizarAccion(puntoElegido, fase === "kick" ? Math.max(potencia, 65) : 0, importe);
            } else {
                actualizarEstado();
            }
        }, 1000);
        actualizarEstado();
    }

    function actualizarEstado() {
        let cuenta = cuentaActual();
        let limiteAlcanzado = cuenta && puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA;
        let bloqueoPorLimite = Boolean(limiteAlcanzado && (!tandaIniciada || tandaTerminada));
        let continuarSinApuesta = Boolean(limiteAlcanzado && tandaIniciada && !tandaTerminada);
        if (continuarSinApuesta && Number(apuestaInput.value) > 0) apuestaInput.value = "0";
        let importeApuesta = leerApuesta(cuenta);
        if (continuarSinApuesta) {
            apuestaFeedback.textContent = "Llegaste al límite de puntos; termina esta tanda sin nuevas apuestas.";
        }
        cancha.dataset.phase = fase;
        if (saldo) saldo.textContent = cuenta
            ? puntosCuenta(cuenta).toLocaleString("es-CL")
            : "Inicia sesión";
        arco.setAttribute("aria-disabled", String(!cuenta || bloqueoPorLimite ||
            tandaTerminada || resolviendoTiro || cargandoPotencia));
        arco.tabIndex = cuenta && !bloqueoPorLimite && !tandaTerminada &&
            !resolviendoTiro && !cargandoPotencia ? 0 : -1;
        apuestaInput.max = cuenta ? String(puntosCuenta(cuenta)) : "0";
        apuestaInput.disabled = !cuenta || bloqueoPorLimite || continuarSinApuesta ||
            tandaTerminada || resolviendoTiro || cargandoPotencia;
        selectorArquero.disabled = resolviendoTiro || cargandoPotencia;
        selectorPateador.disabled = resolviendoTiro || cargandoPotencia;
        controlesDireccion.forEach(function(control) {
            control.disabled = !cuenta || bloqueoPorLimite || tandaTerminada ||
                resolviendoTiro || cargandoPotencia;
        });
        reiniciar.disabled = !cuenta || !tandaTerminada || Boolean(limiteAlcanzado);
        botonAccion.disabled = !cuenta || bloqueoPorLimite || tandaTerminada || resolviendoTiro ||
            importeApuesta === null || temporizadorAccionAutomatica !== null;
        let textoAccion = temporizadorAccionAutomatica !== null
            ? "Tiro en " + segundosAccionAutomatica + " s"
            : !cuenta
            ? "Inicia sesión"
            : bloqueoPorLimite
                ? "Límite alcanzado"
                : tandaTerminada
                    ? "Tanda completa"
                    : fase === "kick"
                        ? (cargandoPotencia ? "Suelta para patear" : "Mantén para cargar potencia")
                        : "Atajar en el punto elegido";
        botonAccion.textContent = textoAccion;
        botonAccion.setAttribute("aria-label", temporizadorAccionAutomatica !== null
            ? "Tiro automático en " + segundosAccionAutomatica + " segundos"
            : !cuenta
            ? "Inicia sesión para comenzar una tanda de penales"
            : bloqueoPorLimite
                ? "Alcanzaste el límite de puntos para jugar"
                : tandaTerminada
                    ? "La tanda de penales está completa"
                    : fase === "kick"
                        ? "Mantén presionado y suelta para patear con la potencia elegida"
                        : "Lanzarte al punto elegido para intentar atajar");
        controlPotencia.hidden = fase !== "kick";
        actualizarPotencia(temporizadorAccionAutomatica !== null && fase === "kick" ? 65 : 0);
        let puedeTocarArco = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        faseTexto.textContent = tandaTerminada
            ? "Tanda completa: revisa tus tres tiros y tus tres atajadas."
            : temporizadorAccionAutomatica !== null
                ? "Prepárate: el " + (fase === "kick" ? "penal" : "tiro del rival") +
                    " se realizará en " + segundosAccionAutomatica + " segundos."
            : fase === "kick"
                ? (puedeTocarArco ? "Elige dónde patear tocando una flecha o el arco; el penal se resuelve automáticamente en 3 segundos."
                    : "Elige izquierda, centro o derecha; el penal se resuelve automáticamente en 3 segundos.")
                : (puedeTocarArco ? "Elige dónde atajar tocando una flecha o el arco; el rival tira en 3 segundos."
                    : "Elige izquierda, centro o derecha; el rival tira automáticamente en 3 segundos.");
        actualizarSeleccion();
        actualizarMarcador();
        actualizarAvisoLimiteJuegos(cuenta);
    }

    document.addEventListener("chichacook:points-changed", actualizarEstado);

    function finalizarAccion(puntoSeleccionado, potenciaTiro, importeApuesta) {
        let cuenta = cuentaActual();
        if (!cuenta) {
            avance.textContent = "Inicia sesión para guardar tus puntos y jugar.";
            actualizarEstado();
            return;
        }
        if (puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA &&
            (!tandaIniciada || tandaTerminada)) {
            avance.textContent = "Llegaste al máximo de 15.000 puntos ganados por cuenta.";
            actualizarEstado();
            return;
        }
        if (tandaTerminada || resolviendoTiro || tirosRealizados >= 3) return;
        if (importeApuesta === undefined) importeApuesta = leerApuesta(cuenta);
        if (!Number.isSafeInteger(importeApuesta) || importeApuesta < 0 ||
            importeApuesta > puntosCuenta(cuenta) || importeApuesta !== Number(apuestaInput.value)) {
            actualizarEstado();
            return;
        }

        resolviendoTiro = true;
        tandaIniciada = true;
        limpiarAnimacion();
        if (fase === "kick") {
            pateador.classList.add("is-shooting");
            cancha.classList.add("is-kicking");
            let puntoArquero = {
                x: 16 + Math.random() * 68,
                y: 18 + Math.random() * 42
            };
            colocarArquero(puntoArquero, true);
            colocarBalonEnArco(puntoSeleccionado);
            let distancia = Math.hypot(
                (puntoSeleccionado.x - puntoArquero.x) * arco.clientWidth / 100,
                (puntoSeleccionado.y - puntoArquero.y) * arco.clientHeight / 100
            );
            let alcanceArquero = 78 - potenciaTiro * .31;
            let arqueroAtajo = distancia <= alcanceArquero;
            if (!arqueroAtajo) {
                cancha.classList.add("is-goal");
                goles++;
                marcarIndicador(indicadoresGoles, tirosRealizados, true, "Penal");
                let resultadoApuesta = liquidarApuesta(cuenta, importeApuesta, true);
                avance.textContent = "¡Gol! Apuntaste " + describirPunto(puntoSeleccionado) +
                    " con " + Math.round(potenciaTiro) + "% de potencia." +
                    textoResultadoApuesta(resultadoApuesta, importeApuesta, true);
            } else {
                cancha.classList.add("is-saved");
                marcarIndicador(indicadoresGoles, tirosRealizados, false, "Penal");
                let resultadoApuesta = liquidarApuesta(cuenta, importeApuesta, false);
                avance.textContent = "El arquero atajó tu tiro " + describirPunto(puntoSeleccionado) + "." +
                    textoResultadoApuesta(resultadoApuesta, importeApuesta, false) +
                    " Prueba otro punto o más potencia.";
            }
            fase = "defend";
        } else {
            let puntoRival = {
                x: 12 + Math.random() * 76,
                y: 12 + Math.random() * 72
            };
            colocarArquero(puntoSeleccionado, true);
            colocarBalonEnArco(puntoRival);
            let distancia = Math.hypot(
                (puntoSeleccionado.x - puntoRival.x) * arco.clientWidth / 100,
                (puntoSeleccionado.y - puntoRival.y) * arco.clientHeight / 100
            );
            if (distancia <= 78) {
                cancha.classList.add("is-blocked");
                atajadas++;
                marcarIndicador(indicadoresAtajadas, tirosRealizados, true, "Atajada");
                let resultadoApuesta = liquidarApuesta(cuenta, importeApuesta, true);
                avance.textContent = "¡Atajada! Te lanzaste " + describirPunto(puntoSeleccionado) + "." +
                    textoResultadoApuesta(resultadoApuesta, importeApuesta, true);
            } else {
                cancha.classList.add("is-missed");
                marcarIndicador(indicadoresAtajadas, tirosRealizados, false, "Atajada");
                let resultadoApuesta = liquidarApuesta(cuenta, importeApuesta, false);
                avance.textContent = "El rival pateó " + describirPunto(puntoRival) +
                    " y no lograste atajarlo." +
                    textoResultadoApuesta(resultadoApuesta, importeApuesta, false) + " ¡A por el siguiente!";
            }
            tirosRealizados++;
            fase = "kick";
        }

        if (tirosRealizados === 3 && fase === "kick") {
            tandaTerminada = true;
            faseTexto.textContent = "Tanda completa";
            avance.textContent += " Final: " + goles + " goles y " + atajadas + " atajadas.";
            let cuentaFinal = cuentaActual();
            if (cuentaFinal && puntosGanadosCuenta(cuentaFinal) >= LIMITE_PUNTOS_CUENTA) {
                avance.textContent += " Alcanzaste el máximo de puntos ganados.";
            }
        }
        actualizarEstado();
        window.setTimeout(function() {
            resolviendoTiro = false;
            pateador.classList.remove("is-shooting");
            cancha.classList.remove("is-kicking");
            actualizarEstado();
        }, 650);
    }

    function textoResultadoApuesta(resultado, importe, acierto) {
        if (resultado.error) {
            return " No se pudo guardar el resultado de los puntos; revisa el almacenamiento.";
        }
        if (importe === 0) {
            if (!acierto) return " Jugaste sin apostar; no se descontaron puntos.";
            return resultado.bono
                ? " Jugaste sin apostar y ganaste " + resultado.bono.toLocaleString("es-CL") + " puntos de juego."
                : " Acertaste sin apostar, pero ya alcanzaste el límite de puntos ganados.";
        }
        if (!acierto) return " Perdiste la apuesta de " + importe.toLocaleString("es-CL") + " puntos.";

        let mensaje = " Apuesta acertada: +" + resultado.apuesta.toLocaleString("es-CL") +
            " puntos netos (cobro equivalente a 2× la apuesta, incluida su devolución).";
        if (resultado.bono > 0) {
            mensaje += " Bonificación del juego: +" + resultado.bono.toLocaleString("es-CL") + " puntos.";
        }
        if (resultado.apuesta < importe || resultado.bono < 100) {
            mensaje += " El total acreditado se ajustó al límite de 15.000 puntos ganados.";
        }
        return mensaje;
    }

    function iniciarCargaPotencia(evento) {
        if (fase !== "kick" || botonAccion.disabled || cargandoPotencia) return;
        if (leerApuesta(cuentaActual()) === null) {
            actualizarEstado();
            return;
        }
        if (evento && evento.type === "pointerdown") {
            evento.preventDefault();
            botonPuntero = evento.pointerId;
            botonAccion.setPointerCapture(evento.pointerId);
        }
        cargandoPotencia = true;
        botonAccion.classList.add("is-charging");
        actualizarEstado();
        intervaloPotencia = window.setInterval(function() {
            actualizarPotencia(Math.min(100, potencia + 3));
        }, 70);
    }

    function soltarCargaPotencia(evento) {
        if (!cargandoPotencia || (evento && botonPuntero !== null && evento.pointerId !== botonPuntero)) return;
        if (evento) evento.preventDefault();
        let potenciaFinal = Math.max(15, potencia);
        detenerCargaPotencia();
        ignorarClickSiguiente = true;
        window.setTimeout(function() {
            ignorarClickSiguiente = false;
        }, 0);
        finalizarAccion(puntoElegido, potenciaFinal, Number(apuestaInput.value));
    }

    function cancelarCargaPotencia() {
        if (!cargandoPotencia) return;
        detenerCargaPotencia();
        actualizarPotencia(0);
        actualizarEstado();
    }

    arco.addEventListener("click", function(evento) {
        if (evento.detail === 0 || !cuentaActual() || resolviendoTiro ||
            cargandoPotencia || tandaTerminada) return;
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        actualizarPuntoDesdeEvento(evento);
        if (fase === "defend") colocarArquero(puntoElegido, false);
        actualizarEstado();
        avance.textContent = fase === "kick"
            ? "Apuntaste " + describirPunto(puntoElegido) + ". Mantén el botón para cargar y soltar para patear."
            : "Te lanzarás " + describirPunto(puntoElegido) + ". Pulsa Atajar para confirmar.";
        programarAccionAutomatica();
    });

    arco.addEventListener("keydown", function(evento) {
        if (!cuentaActual() || resolviendoTiro || cargandoPotencia || tandaTerminada) return;
        if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
            evento.preventDefault();
            elegirDireccion(evento.key === "ArrowLeft" ? "left" : "right");
            return;
        }
        let movimientosVerticales = { ArrowUp: -5, ArrowDown: 5 };
        if (Object.prototype.hasOwnProperty.call(movimientosVerticales, evento.key)) {
            evento.preventDefault();
            colocarObjetivo(puntoElegido.x, puntoElegido.y + movimientosVerticales[evento.key]);
            if (fase === "defend") colocarArquero(puntoElegido, false);
            return;
        }
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            actualizarSeleccion();
        }
    });

    selectorArquero.addEventListener("change", function(evento) {
        arquero.dataset.keeper = evento.currentTarget.value;
    });

    selectorPateador.addEventListener("change", function(evento) {
        let jugador = evento.currentTarget.value;
        let dorsales = {
            mbappe: { nombre: "MBAPPÉ", numero: "10" },
            lamine: { nombre: "LAMINE", numero: "10" },
            ronaldo: { nombre: "RONALDO", numero: "7" },
            messi: { nombre: "MESSI", numero: "10" }
        };
        let dorsal = dorsales[jugador];
        if (!dorsal) {
            throw new Error("No se encontró el diseño del jugador seleccionado.");
        }
        pateador.dataset.player = jugador;
        pateador.querySelector(".shooter-name").textContent = dorsal.nombre;
        pateador.querySelector(".shooter-number").textContent = dorsal.numero;
    });

    function elegirDireccion(direccion) {
        let posiciones = { left: 24, center: 50, right: 76 };
        colocarObjetivo(posiciones[direccion], 48);
        if (fase === "defend") colocarArquero(puntoElegido, false);
        avance.textContent = fase === "kick"
            ? "Apuntaste al " + (direccion === "center" ? "centro" : direccion === "left" ? "lado izquierdo" : "lado derecho") +
                ". Mantén el botón para cargar y soltar para patear."
            : "Te lanzarás al " + (direccion === "center" ? "centro" : direccion === "left" ? "lado izquierdo" : "lado derecho") + ".";
        programarAccionAutomatica();
    }

    controlesDireccion.forEach(function(control) {
        control.addEventListener("click", function() {
            if (control.disabled) return;
            elegirDireccion(control.dataset.direction);
        });
    });

    botonAccion.addEventListener("pointerdown", iniciarCargaPotencia);
    botonAccion.addEventListener("pointerup", soltarCargaPotencia);
    botonAccion.addEventListener("pointercancel", function(evento) {
        if (botonPuntero === null || evento.pointerId === botonPuntero) cancelarCargaPotencia();
    });
    botonAccion.addEventListener("lostpointercapture", cancelarCargaPotencia);
    window.addEventListener("blur", cancelarCargaPotencia);
    botonAccion.addEventListener("keydown", function(evento) {
        if (fase !== "kick" || ![" ", "Enter"].includes(evento.key) || evento.repeat) return;
        evento.preventDefault();
        iniciarCargaPotencia();
    });
    botonAccion.addEventListener("keyup", function(evento) {
        if (fase !== "kick" || ![" ", "Enter"].includes(evento.key)) return;
        evento.preventDefault();
        soltarCargaPotencia();
    });
    botonAccion.addEventListener("click", function(evento) {
        if (ignorarClickSiguiente) {
            ignorarClickSiguiente = false;
            evento.preventDefault();
            return;
        }
        if (fase === "defend") {
            evento.preventDefault();
            finalizarAccion(puntoElegido, 0, Number(apuestaInput.value));
        }
    });

    apuestaInput.addEventListener("input", actualizarEstado);

    reiniciar.addEventListener("click", function() {
        let cuenta = cuentaActual();
        if (!cuenta || puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA || !tandaTerminada || resolviendoTiro) return;
        indicadoresGoles.concat(indicadoresAtajadas).forEach(function(indicador, indice) {
            indicador.classList.remove("is-success", "is-failure");
            let numeroTiro = indice % 3 + 1;
            indicador.textContent = String(numeroTiro);
            indicador.setAttribute("aria-label", (indice < 3 ? "Penal " : "Atajada ") +
                numeroTiro + " pendiente");
        });
        tirosRealizados = 0;
        goles = 0;
        atajadas = 0;
        fase = "kick";
        tandaTerminada = false;
        tandaIniciada = false;
        detenerCargaPotencia();
        limpiarAnimacion();
        colocarObjetivo(50, 48);
        colocarArquero({ x: 50, y: 48 }, false);
        pelota.style.left = "50%";
        pelota.style.top = "94%";
        avance.textContent = "Empieza la tanda: cada ronda incluye un penal y una atajada.";
        actualizarEstado();
    });

    let cuenta = cuentaActual();
    avance.textContent = !cuenta
        ? "Inicia sesión para comenzar una tanda."
        : puntosGanadosCuenta(cuenta) >= LIMITE_PUNTOS_CUENTA
            ? "Alcanzaste el límite de puntos; los juegos están bloqueados."
            : "Cada ronda tiene un tiro y una atajada. Usa las flechas para elegir dirección.";
    actualizarEstado();
}

function iniciarChatChichaCook() {
    if (document.getElementById("chichacook-chat")) return;

    let lanzador = document.createElement("button");
    lanzador.className = "chat-launcher";
    lanzador.type = "button";
    lanzador.setAttribute("aria-expanded", "false");
    lanzador.setAttribute("aria-controls", "chichacook-chat");
    lanzador.setAttribute("aria-label", "Abrir chat de ChichaCook");
    lanzador.innerHTML = "<span class=\"chat-launcher-icon\" aria-hidden=\"true\">✦</span><span>Bot ChichaCook</span>";

    let chat = document.createElement("section");
    chat.id = "chichacook-chat";
    chat.className = "chat-panel";
    chat.setAttribute("role", "region");
    chat.setAttribute("aria-label", "Chat de ayuda ChichaCook");
    chat.hidden = true;
    chat.innerHTML =
        "<div class=\"chat-heading\"><div class=\"chat-agent-avatar\" aria-hidden=\"true\">✦</div>" +
        "<div class=\"chat-agent-title\"><p>CHICHACOOK · ASISTENTE LOCAL</p><h2 id=\"chat-title\">¿En qué te ayudo?</h2></div>" +
        "<button type=\"button\" class=\"chat-close\" aria-label=\"Cerrar chat\">&times;</button></div>" +
        "<div class=\"chat-toolbar\"><span>Información de las páginas del sitio</span>" +
        "<button type=\"button\" class=\"chat-clear\" aria-label=\"Borrar el historial de este chat\">Borrar historial</button></div>" +
        "<div class=\"chat-messages\" role=\"log\" aria-live=\"polite\" aria-relevant=\"additions\"></div>" +
        "<p id=\"chat-status\" class=\"chat-status\" role=\"status\" aria-live=\"polite\"></p>" +
        "<form class=\"chat-form\"><label for=\"chat-input\">Escribe tu pregunta</label>" +
        "<div><input id=\"chat-input\" name=\"message\" maxlength=\"240\" autocomplete=\"off\" placeholder=\"Ej.: ¿Cuánto cuesta la chicha?\" required>" +
        "<button type=\"submit\">Enviar</button></div></form>" +
        "<p class=\"chat-disclaimer\">Bot local basado en datos del sitio. No envía tus mensajes a una IA externa.</p>";
    document.body.append(lanzador, chat);

    let formulario = chat.querySelector(".chat-form");
    let campo = document.getElementById("chat-input");
    let mensajes = chat.querySelector(".chat-messages");
    let estadoChat = document.getElementById("chat-status");
    let botonBorrar = chat.querySelector(".chat-clear");
    let cuenta = obtenerCuentaSesion();
    let claveHistorial = cuenta
        ? "chichacookChatHistory:" + normalizarIdentificador(cuenta.username)
        : null;
    let historial = [];
    let historialLegible = true;
    let historialInicial = [
        {
            role: "bot",
            text: "¡Hola! Soy el bot de ChichaCook. Puedo orientarte sobre el menú, pedidos, juegos, puntos, recompensas y contacto."
        }
    ];
    let conocimiento = [
        {
            claves: ["precio", "precios", "cuesta", "cuanto vale", "vale", "costo", "costar", "valor", "1.200", "1200", "oreo", "m&m", "chispas", "topping", "toppings", "galleta", "chicha", "menu", "venden", "productos", "producto", "ofrecen", "ofrece"],
            respuesta: "La chicha venezolana cuesta $1.200 e incluye una galleta y dos toppings. Puedes elegir Oreo, M&M o chispas de chocolate. Un topping extra cuesta $200. Revisa Servicios para armar tu pedido."
        },
        {
            claves: ["pedido", "pedir", "comprar", "carrito", "agregar", "como funciona", "orden"],
            respuesta: "Para pedir, entra a Servicios, elige hasta dos toppings, selecciona si quieres un extra y agrégalo al carrito. La página indica que el pedido se revisa desde el carrito."
        },
        {
            claves: ["pago", "pagar", "efectivo", "tarjeta"],
            respuesta: "El sitio presenta un flujo de compra de demostración. No procesa pagos reales; revisa las opciones visibles en el carrito antes de continuar."
        },
        {
            claves: ["premio", "premios", "recompensa", "recompensas", "canjear", "canje"],
            respuesta: "En Videojuego puedes canjear una chicha gratis por 15.000 puntos o un topping extra gratis por 10.000 puntos. Cada recompensa se puede canjear una vez por cuenta."
        },
        {
            claves: ["puntos", "punto", "limite", "límite", "15.000", "15000", "bono", "3000"],
            respuesta: "Al iniciar sesión por primera vez se entrega un bono único de bienvenida de hasta 3.000 puntos. El máximo acumulado de puntos ganados es 15.000 por cuenta; al alcanzarlo se bloquean los juegos, pero puedes canjear recompensas."
        },
        {
            claves: ["juego", "juegos", "blackjack", "ruleta", "penales", "apuesta", "apostar"],
            respuesta: "La página Videojuego tiene blackjack, ruleta y una tanda de penales. Las apuestas del sitio usan puntos virtuales, no dinero real. Los juegos se bloquean al llegar a 15.000 puntos ganados por cuenta."
        },
        {
            claves: ["como jugar penales", "como jugar a los penales", "como juego penales", "como se juega penales", "como se juegan los penales", "como se juega la tanda de penales", "tanda de penales", "patear", "atajar", "penal"],
            respuesta: "En la tanda de penales elige izquierda, centro o derecha; después de cada elección tienes 3 segundos para cambiar la dirección antes de que el tiro se resuelva automáticamente contra la máquina. Puedes apostar puntos virtuales en cada tiro o jugar sin apuesta."
        },
        {
            claves: ["como jugar blackjack", "como jugar al blackjack", "como juego blackjack", "como juego al blackjack", "como se juega blackjack", "como se juega al blackjack", "como se juega el blackjack", "reglas de blackjack", "blackjack", "21", "pedir carta", "plantarse", "doblar apuesta"],
            respuesta: "En blackjack defines una apuesta y luego puedes pedir carta, doblar la apuesta o plantarte. El objetivo es acercarte a 21 sin pasarte. Se juega con puntos virtuales."
        },
        {
            claves: ["como jugar ruleta", "como jugar a la ruleta", "como juego ruleta", "como juego la ruleta", "como se juega ruleta", "como se juega la ruleta", "reglas de ruleta", "ruleta", "ruleta americana", "girar", "casilla"],
            respuesta: "En la ruleta americana, elige un número o una apuesta externa y añade los puntos. La página inicia una cuenta de 20 segundos antes de mostrar el resultado. Se juega con puntos virtuales."
        },
        {
            claves: ["cuenta", "registro", "registrarse", "iniciar sesion", "iniciar sesión", "contraseña", "progreso"],
            respuesta: "Puedes crear una cuenta desde Registrarse o entrar desde Iniciar sesión. El progreso se guarda en el navegador de este dispositivo; no se sincroniza automáticamente con otros dispositivos."
        },
        {
            claves: ["contacto", "correo", "email", "whatsapp", "telefono", "teléfono", "instagram", "tiktok", "redes", "sociales", "direccion", "dirección", "ubicacion", "ubicación", "tienda", "local"],
            respuesta: "Contacto: gdeporte72@gmail.com, WhatsApp +56 9 5234 6726, Instagram, TikTok y X @chichacook. La página Contacto indica Av. Alameda Libertador Bernardo O'Higgins 3250, Estación Central, Región Metropolitana, Chile."
        },
        {
            claves: ["equipo", "nosotros", "personas", "ceo", "quienes"],
            respuesta: "En Nosotros se presenta al equipo: Yoneiker Blanco (CEO), Deiby Moreno (Director de contratos), Aarón Gutierrez (Asistente), Yael Amari (Comercial) y Sandra Haro (Contable)."
        },
        {
            claves: ["historial", "chat", "conversacion", "conversación"],
            respuesta: "Si iniciaste sesión, el historial de este chat se guarda en el almacenamiento local de esta cuenta en este navegador. Usa «Borrar historial» para eliminarlo. No se sincroniza con otros dispositivos."
        }
    ];

    function normalizarTexto(texto) {
        return texto.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/&/g, " y ")
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function leerHistorial() {
        if (!claveHistorial) return [];
        try {
            let guardado = JSON.parse(localStorage.getItem(claveHistorial) || "[]");
            if (!Array.isArray(guardado)) throw new Error("El historial no tiene el formato esperado.");
            return guardado.filter(function(mensaje) {
                return mensaje && ["user", "bot"].includes(mensaje.role) &&
                    typeof mensaje.text === "string" && mensaje.text.length <= 1000;
            }).slice(-80);
        } catch (error) {
            historialLegible = false;
            estadoChat.textContent = "No se pudo leer el historial guardado. Puedes borrarlo para iniciar uno nuevo.";
            console.error("No se pudo leer el historial del bot ChichaCook.", error);
            return [];
        }
    }

    function guardarHistorial() {
        if (!claveHistorial) {
            estadoChat.textContent = "Inicia sesión para guardar tu conversación en esta cuenta.";
            return false;
        }
        try {
            localStorage.setItem(claveHistorial, JSON.stringify(historial.slice(-80)));
            estadoChat.textContent = "Conversación guardada en esta cuenta y este navegador.";
            return true;
        } catch (error) {
            estadoChat.textContent = "No se pudo guardar el chat. Comprueba el espacio disponible del navegador.";
            console.error("No se pudo guardar el historial del bot ChichaCook.", error);
            return false;
        }
    }

    function renderizarHistorial() {
        mensajes.replaceChildren();
        let conversacion = historialInicial.concat(historial);
        conversacion.forEach(function(mensaje) {
            let burbuja = document.createElement("p");
            burbuja.className = "chat-bubble " + (mensaje.role === "user" ? "is-user" : "is-bot");
            burbuja.textContent = mensaje.text;
            mensajes.append(burbuja);
        });
        mensajes.scrollTop = mensajes.scrollHeight;
    }

    function cerrarChat() {
        chat.hidden = true;
        lanzador.setAttribute("aria-expanded", "false");
        lanzador.focus();
    }

    function responder(pregunta) {
        let texto = normalizarTexto(pregunta);
        if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey)$/.test(texto)) {
            return "¡Hola! ¿Quieres saber sobre el menú, tu pedido, los puntos, los juegos o las recompensas?";
        }
        if (/(mis puntos|mi saldo|cuantos puntos tengo|cuantos puntos me quedan|saldo de puntos)/.test(texto)) {
            let cuentaActual = obtenerCuentaSesion();
            return cuentaActual
                ? "Tu saldo actual es de " + puntosCuenta(cuentaActual).toLocaleString("es-CL") +
                    " puntos. Has ganado " + puntosGanadosCuenta(cuentaActual).toLocaleString("es-CL") +
                    " de los 15.000 permitidos por cuenta."
                : "Inicia sesión para consultar el saldo de puntos de tu cuenta.";
        }

        let tokensIgnorados = new Set([
            "como", "donde", "cuando", "cuanto", "quien", "quiero", "puedes", "tiene",
            "hay", "para", "por", "una", "uno", "los", "las", "del", "al", "con",
            "me", "es", "el", "la", "de", "y", "en", "mi", "un", "se", "si", "a",
            "que", "cual", "cuales", "sobre", "favor", "hola", "dime", "saber"
        ]);
        let tokens = texto.split(" ").filter(function(token) {
            return token.length > 2 && !tokensIgnorados.has(token);
        });
        let textoDelimitado = " " + texto + " ";
        let resultados = conocimiento.map(function(articulo) {
            let clavesNormalizadas = articulo.claves.map(normalizarTexto);
            let puntaje = clavesNormalizadas.reduce(function(total, clave) {
                return total + (textoDelimitado.includes(" " + clave + " ")
                    ? (clave.includes(" ") ? 12 : 3)
                    : 0);
            }, 0);
            tokens.forEach(function(token) {
                if (clavesNormalizadas.includes(token)) puntaje += 1;
            });
            return { puntaje: puntaje, respuesta: articulo.respuesta };
        }).filter(function(resultado) {
            return resultado.puntaje > 0;
        }).sort(function(a, b) {
            return b.puntaje - a.puntaje;
        });

        if (!resultados.length) {
            return "No encuentro ese dato en las páginas de ChichaCook y prefiero no inventarlo. Puedo ayudarte con el menú y precios, pedidos, juegos, puntos, recompensas, equipo o contacto.";
        }
        let puntajeMaximo = resultados[0].puntaje;
        return resultados.filter(function(resultado, indice) {
            return indice < 2 && resultado.puntaje >= puntajeMaximo - 1;
        }).map(function(resultado) {
            return resultado.respuesta;
        }).join("\n\n");
    }

    historial = leerHistorial();
    renderizarHistorial();
    botonBorrar.disabled = !claveHistorial;
    if (!claveHistorial) {
        estadoChat.textContent = "Inicia sesión para guardar el historial de tu cuenta.";
    } else if (historialLegible && historial.length) {
        estadoChat.textContent = "Se cargó tu conversación guardada en este navegador.";
    }

    lanzador.addEventListener("click", function() {
        chat.hidden = false;
        lanzador.setAttribute("aria-expanded", "true");
        campo.focus();
    });
    chat.querySelector(".chat-close").addEventListener("click", cerrarChat);
    botonBorrar.addEventListener("click", function() {
        if (!claveHistorial) {
            estadoChat.textContent = "Inicia sesión para administrar el historial de tu cuenta.";
            return;
        }
        try {
            localStorage.removeItem(claveHistorial);
            historial = [];
            historialLegible = true;
            renderizarHistorial();
            estadoChat.textContent = "Historial eliminado de esta cuenta en este navegador.";
        } catch (error) {
            estadoChat.textContent = "No se pudo eliminar el historial. Inténtalo nuevamente.";
            console.error("No se pudo eliminar el historial del bot ChichaCook.", error);
        }
    });
    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();
        let pregunta = campo.value.trim();
        if (!pregunta) return;
        if (!historialLegible) {
            estadoChat.textContent = "Borra el historial ilegible antes de guardar una conversación nueva.";
            return;
        }
        historial.push({ role: "user", text: pregunta });
        historial.push({ role: "bot", text: responder(pregunta) });
        historial = historial.slice(-80);
        renderizarHistorial();
        if (claveHistorial) guardarHistorial();
        campo.value = "";
        campo.focus();
    });
    document.addEventListener("keydown", function(evento) {
        if (evento.key === "Escape" && !chat.hidden) cerrarChat();
    });
}

iniciarBlackjack();
iniciarRuleta();
iniciarJuegoPenales();
iniciarChatChichaCook();
actualizarNavegacionSesion();
actualizarCantidad();
let parametrosServicios = new URLSearchParams(window.location.search);
if (document.querySelector(".services-page") && parametrosServicios.get("agregarPendiente") === "1" && obtenerCuentaSesion()) {
    let productoPendiente;
    try {
        productoPendiente = JSON.parse(sessionStorage.getItem("chichacookPendingProduct") || "null");
    } catch (error) {
        productoPendiente = null;
    }
    sessionStorage.removeItem("chichacookPendingProduct");
    let opcionesToppingValidas = ["Ninguno", "Oreo", "M&M", "Chispas de chocolate"];
    if (productoPendiente && opcionesToppingValidas.includes(productoPendiente.topping1) &&
        opcionesToppingValidas.includes(productoPendiente.topping2) &&
        opcionesToppingValidas.includes(productoPendiente.extra)) {
        let productoAgregado = {
            nombre: "Chicha venezolana",
            toppings: productoPendiente.topping1 + ", " + productoPendiente.topping2,
            extra: productoPendiente.extra,
            precio: productoPendiente.extra === "Ninguno" ? 1200 : 1400
        };
        carrito.push(productoAgregado);
        if (!guardarCarrito()) {
            carrito.pop();
            mostrarAviso("No se pudo recuperar el producto en el carrito. Vuelve a Servicios e inténtalo de nuevo.", "error");
        } else {
            actualizarCantidad();
        }
    }
}
if (document.querySelector(".services-page") && parametrosServicios.get("abrirCarrito") === "1") {
    mostrarCarrito();
}
let puntosRecompensa = document.getElementById("reward-points");
let puntosToppingRecompensa = document.getElementById("topping-reward-points");
if (puntosRecompensa || puntosToppingRecompensa) {
    let cuenta = obtenerCuentaSesion();
    let saldoRecompensas = cuenta ? puntosCuenta(cuenta).toLocaleString("es-CL") : "Inicia sesión";
    if (puntosRecompensa) puntosRecompensa.textContent = saldoRecompensas;
    if (puntosToppingRecompensa) puntosToppingRecompensa.textContent = saldoRecompensas;
    let botonRecompensa = document.getElementById("redeem-reward");
    let estadoRecompensa = document.getElementById("reward-status");
    let mensajeRecompensa = document.getElementById("redeem-message");
    if (cuenta && cuenta.recompensaChichaCanjeada) {
        if (botonRecompensa) {
            botonRecompensa.disabled = true;
            botonRecompensa.textContent = "Ya canjeada";
        }
        if (estadoRecompensa) {
            estadoRecompensa.textContent = "Recompensa canjeada";
            estadoRecompensa.classList.add("is-redeemed");
        }
        if (mensajeRecompensa) {
            mensajeRecompensa.textContent = "Esta recompensa ya fue canjeada en tu cuenta.";
        }
    } else if (cuenta && estadoRecompensa) {
        estadoRecompensa.textContent = "Disponible para canjear";
    }

    let botonToppingRecompensa = document.getElementById("redeem-topping-reward");
    let estadoToppingRecompensa = document.getElementById("topping-reward-status");
    let mensajeToppingRecompensa = document.getElementById("topping-redeem-message");
    if (cuenta && cuenta.recompensaToppingCanjeada) {
        if (botonToppingRecompensa) {
            botonToppingRecompensa.disabled = true;
            botonToppingRecompensa.textContent = "Ya canjeada";
        }
        if (estadoToppingRecompensa) {
            estadoToppingRecompensa.textContent = cuenta.toppingGratisDisponible
                ? "Canjeada: topping extra disponible"
                : "Recompensa ya utilizada";
            if (!cuenta.toppingGratisDisponible) estadoToppingRecompensa.classList.add("is-redeemed");
        }
        if (mensajeToppingRecompensa) {
            mensajeToppingRecompensa.textContent = cuenta.toppingGratisDisponible
                ? "El topping extra gratis se aplicará a una chicha con extra en tu próxima compra."
                : "Esta recompensa ya fue utilizada en una compra.";
        }
    } else if (cuenta && estadoToppingRecompensa) {
        estadoToppingRecompensa.textContent = "Disponible para canjear";
    }
}