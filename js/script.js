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

function obtenerCuentaSesion() {
    let usuarioSesion = sessionStorage.getItem("chichacookSession");
    if (!usuarioSesion) return null;

    return obtenerCuentas().find(function(cuenta) {
        return cuenta.username.toLowerCase() === usuarioSesion.toLowerCase();
    }) || null;
}

function puntosCuenta(cuenta) {
    return Number.isSafeInteger(cuenta.puntos) && cuenta.puntos >= 0 ? cuenta.puntos : 0;
}

function cambiarPuntosSesion(cambio) {
    let usuarioSesion = sessionStorage.getItem("chichacookSession");
    if (!usuarioSesion) return null;

    let cuentas = obtenerCuentas();
    let cuenta = cuentas.find(function(elemento) {
        return elemento.username.toLowerCase() === usuarioSesion.toLowerCase();
    });
    if (!cuenta) return null;

    let nuevoSaldo = puntosCuenta(cuenta) + cambio;
    if (!Number.isSafeInteger(nuevoSaldo) || nuevoSaldo < 0) return null;
    cuenta.puntos = nuevoSaldo;
    localStorage.setItem("chichacookUsers", JSON.stringify(cuentas));
    document.querySelectorAll("#blackjack-points, #roulette-points, #reward-points").forEach(function(elemento) {
        elemento.textContent = cuenta.puntos.toLocaleString("es-CL");
    });
    return cuenta.puntos;
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
    let botonPlantarse = document.getElementById("blackjack-stand");
    let botonNueva = document.getElementById("blackjack-new");
    let apuestaInput = document.getElementById("blackjack-bet");
    let puntosJugador = document.getElementById("blackjack-points");
    let apuestaActual = 0;
    let apuestaLiquidada = false;
    let repartiendo = false;
    let numeroPartida = 0;

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
        botonPedir.disabled = !partidaActiva;
        botonPlantarse.disabled = !partidaActiva;
        botonNueva.disabled = partidaActiva || repartiendo;
        apuestaInput.disabled = partidaActiva || repartiendo;
        let cuenta = obtenerCuentaSesion();
        puntosJugador.textContent = cuenta
            ? puntosCuenta(cuenta).toLocaleString("es-CL")
            : "Inicia sesión";
        document.getElementById("blackjack-wins").textContent = victorias;
        document.getElementById("blackjack-losses").textContent = derrotas;
    }

    function liquidarApuesta(resultado) {
        if (apuestaLiquidada) return;
        apuestaLiquidada = true;

        let devolucion = resultado === "win" ? apuestaActual * 2 : resultado === "tie" ? apuestaActual : 0;
        if (devolucion > 0) cambiarPuntosSesion(devolucion);
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
            mostrarMensaje("¡Te pasaste de 21! Gana la casa. Perdiste " +
                apuestaActual.toLocaleString("es-CL") + " puntos.", "loss");
        } else if (puntosCasa > 21 || puntosJugador > puntosCasa) {
            victorias++;
            liquidarApuesta("win");
            mostrarMensaje((puntosCasa > 21
                ? "¡La casa se pasó de 21! ¡Ganaste!"
                : "¡Ganaste con " + puntosJugador + " puntos!") +
                " Recibes " + (apuestaActual * 2).toLocaleString("es-CL") + " puntos.", "win");
        } else if (puntosJugador < puntosCasa) {
            derrotas++;
            liquidarApuesta("loss");
            mostrarMensaje("La casa tiene " + puntosCasa + ". Pierdes " +
                apuestaActual.toLocaleString("es-CL") + " puntos.", "loss");
        } else {
            liquidarApuesta("tie");
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
        repartiendo = true;
        partidaActiva = false;
        barajarMazo();
        manoJugador = [];
        manoCasa = [];
        cartasJugador.replaceChildren();
        cartasCasa.replaceChildren();
        actualizarMesa(false);
        mostrarMensaje("Apuesta de " + apuestaActual.toLocaleString("es-CL") +
            " puntos realizada. Barajando y repartiendo...", "");

        let reparto = [
            { mano: manoJugador, tablero: cartasJugador, oculta: false },
            { mano: manoCasa, tablero: cartasCasa, oculta: false },
            { mano: manoJugador, tablero: cartasJugador, oculta: false },
            { mano: manoCasa, tablero: cartasCasa, oculta: true }
        ];
        for (let indice = 0; indice < reparto.length; indice++) {
            await esperar(360);
            if (partida !== numeroPartida) return;
            let turno = reparto[indice];
            let carta = tomarCarta();
            turno.mano.push(carta);
            agregarCarta(turno.tablero, carta, turno.oculta);
            actualizarMesa(false);
        }

        repartiendo = false;
        partidaActiva = true;
        let blackjackJugador = calcularPuntos(manoJugador) === 21;
        let blackjackCasa = calcularPuntos(manoCasa) === 21;
        if (blackjackJugador || blackjackCasa) {
            partidaActiva = false;
            actualizarMesa(true);
            if (blackjackJugador && blackjackCasa) {
                liquidarApuesta("tie");
                mostrarMensaje("¡Blackjack para ambos! Empate; se devuelve tu apuesta.", "tie");
            } else if (blackjackJugador) {
                victorias++;
                liquidarApuesta("win");
                mostrarMensaje("¡Blackjack! Ganaste y recibes " +
                    (apuestaActual * 2).toLocaleString("es-CL") + " puntos.", "win");
            } else {
                derrotas++;
                liquidarApuesta("loss");
                mostrarMensaje("La casa tiene blackjack. Pierdes " +
                    apuestaActual.toLocaleString("es-CL") + " puntos.", "loss");
            }
        } else {
            mostrarMensaje("Tu turno: pide una carta o plántate.", "");
        }
        actualizarMesa(!partidaActiva);
    }

    botonPedir.addEventListener("click", function() {
        if (!partidaActiva || repartiendo) return;
        repartiendo = true;
        partidaActiva = false;
        let carta = tomarCarta();
        manoJugador.push(carta);
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

    botonPlantarse.addEventListener("click", function() {
        if (partidaActiva && !repartiendo) terminarMano();
    });

    botonNueva.addEventListener("click", nuevaPartida);
    actualizarMesa(false);
    mostrarMensaje("Elige tu apuesta y pulsa «Nueva partida» para repartir.", "");
}

function iniciarRuleta() {
    let tablero = document.getElementById("roulette-board");
    if (!tablero) return;

    let numerosRojos = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    let opciones = Array.from(document.querySelectorAll(".roulette-bet-choice"));
    let apuestaInput = document.getElementById("roulette-bet");
    let botonGirar = document.getElementById("roulette-spin");
    let rueda = document.getElementById("roulette-wheel");
    let resultadoElemento = document.getElementById("roulette-result");
    let mensaje = document.getElementById("roulette-message");
    let seleccion = document.getElementById("roulette-selection");
    let botonesCasilla = [];
    let tipoApuesta = "number";
    let numeroElegido = "0";
    let girando = false;

    function colorNumero(numero) {
        if (numero === "0" || numero === "00") return "green";
        return numerosRojos.has(Number(numero)) ? "red" : "black";
    }

    function crearCasilla(numero, claseColor, columna, fila, filasOcupadas) {
        let boton = document.createElement("button");
        boton.type = "button";
        boton.className = "roulette-number is-" + claseColor;
        boton.textContent = numero;
        boton.setAttribute("aria-label", numero === "00" ? "Doble cero, verde" : "Número " + numero + ", " + claseColor);
        boton.style.gridColumn = String(columna);
        boton.style.gridRow = fila + (filasOcupadas > 1 ? " / span " + filasOcupadas : "");
        boton.addEventListener("click", function() {
            numeroElegido = numero;
            tipoApuesta = "number";
            actualizarSeleccion();
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
            let coincide = tipoApuesta === "number"
                ? boton.textContent === numeroElegido
                : colorNumero(boton.textContent) === tipoApuesta;
            boton.classList.toggle("is-selected", coincide);
        });

        if (tipoApuesta === "number") {
            seleccion.textContent = "Apuesta al número " + numeroElegido + " (paga 35 a 1).";
        } else {
            seleccion.textContent = "Apuesta al " + (tipoApuesta === "red" ? "rojo" : "negro") + " (paga 1 a 1).";
        }
    }

    function mostrarMensaje(texto, resultado) {
        mensaje.classList.remove("is-win", "is-loss");
        mensaje.classList.add("is-" + resultado);
        mensaje.textContent = texto;
    }

    function actualizarSaldo() {
        let cuenta = obtenerCuentaSesion();
        document.getElementById("roulette-points").textContent = cuenta
            ? puntosCuenta(cuenta).toLocaleString("es-CL")
            : "Inicia sesión";
    }

    function cambiarEstadoControles(bloqueado) {
        botonGirar.disabled = bloqueado;
        apuestaInput.disabled = bloqueado;
        opciones.forEach(function(opcion) {
            opcion.disabled = bloqueado;
        });
        botonesCasilla.forEach(function(boton) {
            boton.disabled = bloqueado;
        });
    }

    createRouletteBoard();

    function createRouletteBoard() {
        crearCasilla("0", "green", 1, 1, 2);
        crearCasilla("00", "green", 1, 3, 1);
        for (let numero = 1; numero <= 36; numero++) {
            let fila = 3 - ((numero - 1) % 3);
            let columna = Math.floor((numero - 1) / 3) + 2;
            crearCasilla(String(numero), colorNumero(String(numero)), columna, fila, 1);
        }
    }

    opciones.forEach(function(opcion) {
        opcion.addEventListener("click", function() {
            tipoApuesta = opcion.dataset.betType;
            actualizarSeleccion();
        });
    });

    botonGirar.addEventListener("click", function() {
        if (girando) return;
        let cuenta = obtenerCuentaSesion();
        if (!cuenta) {
            mostrarMensaje("Inicia sesión para apostar tus puntos en la ruleta.", "loss");
            return;
        }

        let cantidadApuesta = Number(apuestaInput.value);
        let multiplicador = tipoApuesta === "number" ? 36 : 2;
        if (!Number.isSafeInteger(cantidadApuesta) || cantidadApuesta <= 0 ||
            cantidadApuesta > Math.floor(Number.MAX_SAFE_INTEGER / multiplicador) ||
            cantidadApuesta * multiplicador > Number.MAX_SAFE_INTEGER - puntosCuenta(cuenta) + cantidadApuesta) {
            mostrarMensaje("Ingresa una apuesta válida en puntos (mínimo 1).", "loss");
            apuestaInput.focus();
            return;
        }
        if (cantidadApuesta > puntosCuenta(cuenta)) {
            mostrarMensaje("Saldo insuficiente. Tienes " +
                puntosCuenta(cuenta).toLocaleString("es-CL") + " puntos.", "loss");
            apuestaInput.focus();
            return;
        }
        if (cambiarPuntosSesion(-cantidadApuesta) === null) {
            mostrarMensaje("No se pudo registrar la apuesta. Vuelve a iniciar sesión.", "loss");
            return;
        }

        girando = true;
        cambiarEstadoControles(true);
        resultadoElemento.textContent = "?";
        rueda.classList.remove("is-spinning");
        rueda.querySelector(".roulette-ball-track").classList.remove("is-spinning");
        void rueda.offsetWidth;
        rueda.classList.add("is-spinning");
        rueda.querySelector(".roulette-ball-track").classList.add("is-spinning");
        mensaje.classList.remove("is-win", "is-loss");
        mensaje.textContent = "Ruleta girando... Apuesta: " + cantidadApuesta.toLocaleString("es-CL") + " puntos.";

        window.setTimeout(function() {
            let resultado = Math.floor(Math.random() * 38);
            let numero = resultado === 0 ? "0" : resultado === 37 ? "00" : String(resultado);
            let color = colorNumero(numero);
            let gano = tipoApuesta === "number"
                ? numero === numeroElegido
                : tipoApuesta === color;
            let premio = gano ? cantidadApuesta * multiplicador : 0;

            resultadoElemento.textContent = numero;
            rueda.classList.remove("is-spinning");
            if (premio > 0) {
                let saldo = cambiarPuntosSesion(premio);
                if (saldo === null) {
                    mostrarMensaje("Salió " + numero + " " + color + ". No se pudo abonar el premio.", "loss");
                } else {
                    mostrarMensaje("Salió " + numero + " " + color + ": ¡ganaste! Recibes " +
                        premio.toLocaleString("es-CL") + " puntos.", "win");
                }
            } else {
                mostrarMensaje("Salió " + numero + " " + color + ". No hubo premio; perdiste " +
                    cantidadApuesta.toLocaleString("es-CL") + " puntos.", "loss");
            }
            girando = false;
            cambiarEstadoControles(false);
            actualizarSaldo();
        }, 1900);
    });

    actualizarSeleccion();
    actualizarSaldo();
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

    cuentas.push({ email, username, password, displayName, puntos: 0, bonoBienvenidaOtorgado: false });
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

    cuenta.puntos = puntosCuenta(cuenta);
    if (!cuenta.bonoBienvenidaOtorgado) {
        cuenta.puntos += 2000;
        cuenta.bonoBienvenidaOtorgado = true;
        localStorage.setItem("chichacookUsers", JSON.stringify(cuentas));
        alert("¡Bienvenido/a, " + cuenta.displayName + "! Recibiste 2.000 puntos de bienvenida.");
    } else {
        alert("¡Bienvenido/a, " + cuenta.displayName + "!");
    }
    sessionStorage.setItem("chichacookSession", cuenta.username);
    window.location.href = "index.html";
});

document.getElementById("redeem-reward")?.addEventListener("click", function(evento) {
    let boton = evento.currentTarget;
    let mensaje = document.getElementById("redeem-message");
    let cuenta = obtenerCuentaSesion();
    if (!cuenta) {
        mensaje.textContent = "Inicia sesión para consultar tus puntos y canjear la recompensa.";
        mensaje.classList.add("is-redeem-error");
        return;
    }
    if (puntosCuenta(cuenta) < 15000) {
        mensaje.textContent = "Necesitas 15.000 puntos para canjear la chicha. Tu saldo es " +
            puntosCuenta(cuenta).toLocaleString("es-CL") + " puntos.";
        mensaje.classList.add("is-redeem-error");
        return;
    }
    let saldo = cambiarPuntosSesion(-15000);
    if (saldo === null) {
        mensaje.textContent = "No se pudo completar el canje. Vuelve a iniciar sesión e inténtalo otra vez.";
        mensaje.classList.add("is-redeem-error");
        return;
    }

    mensaje.classList.remove("is-redeem-error");
    boton.disabled = true;
    boton.textContent = "Canje realizado";
    mensaje.textContent = "¡Gracias por su canjeo! Disfrute su chicha ChichaCook.";
});

iniciarBlackjack();
iniciarRuleta();
actualizarNavegacionSesion();
let puntosRecompensa = document.getElementById("reward-points");
if (puntosRecompensa) {
    let cuenta = obtenerCuentaSesion();
    puntosRecompensa.textContent = cuenta ? puntosCuenta(cuenta).toLocaleString("es-CL") : "Inicia sesión";
}