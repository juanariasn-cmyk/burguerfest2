// 1. CONFIGURACIÓN DE FIREBASE (Verificada)
const firebaseConfig = {
    apiKey: "AIzaSyCwcCFXtJqWL55ExHFDti3G3Ri18mvNJuU",
    authDomain: "burguerfest.firebaseapp.com",
    projectId: "burguerfest",
    storageBucket: "burguerfest.firebasestorage.app",
    messagingSenderId: "248356951065",
    appId: "1:248356951065:web:23cae0d273c3ec27a28688",
    measurementId: "G-H183GF6X4Q",
    databaseURL: "https://burguerfest-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 2. BASE DE DATOS DE RESTAURANTES (Asegúrate de tener las carpetas logos/ y burgers/)
const restaurantes = {
    "1": { nombre: "LA OBSESION", logo: "logos/1.png", burger: "burgers/1.jpg" },
    "2": { nombre: "MISTER HONGO", logo: "logos/2.png", burger: "burgers/2.jpg" },
    "3": { nombre: "EL BARRIL DEL FERCHO", logo: "logos/3.png", burger: "burgers/3.jpg" },
    "4": { nombre: "SABOR GOURMET", logo: "logos/4.png", burger: "burgers/4.jpg" },
    "5": { nombre: "JAVAR", logo: "logos/5.png", burger: "burgers/5.jpg" },
    "6": { nombre: "CIELITO LINDO", logo: "logos/6.png", burger: "burgers/6.jpg" },
    "7": { nombre: "CAFE GORRION", logo: "logos/7.png", burger: "burgers/7.jpg" }
};

// 3. DETECTAR RESTAURANTE DESDE LA URL (Si no hay, carga el 1)
const urlParams = new URLSearchParams(window.location.search);
let restID = urlParams.get('rest') || "1";
if (!restaurantes[restID]) restID = "1";

const datosRest = restaurantes[restID];

// Inyectar datos en el HTML
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rest-name').innerText = datosRest.nombre;
    document.getElementById('rest-logo').src = datosRest.logo;
    document.getElementById('burger-img').src = datosRest.burger;
});

// 4. LÓGICA DE INTERACCIÓN
let ratingActual = 0;

// Sonido sutil al interactuar
function playSound() {
    const audio = document.getElementById('click-sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Sonido bloqueado por el navegador"));
    }
}

// Convertir código a mayúsculas automáticamente mientras escriben
document.getElementById('code').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
});

// 5. VALIDACIÓN DE INGRESO
async function validarIngreso() {
    playSound();
    const code = document.getElementById('code').value.trim().toUpperCase();
    const phone = document.getElementById('phone').value.trim();

    if(phone.length < 7 || code.length < 6) {
        alert("⚠️ Por favor ingresa un número de celular válido y el código de 6 dígitos.");
        return;
    }

    try {
        const snapshot = await database.ref('codigos_validos/' + code).once('value');
        const estado = snapshot.val();

        if (estado === "disponible") {
            // Transición suave entre secciones
            document.getElementById('login-section').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('vote-section').style.display = 'block';
                document.getElementById('vote-section').style.animation = 'fadeInUp 0.6s ease forwards';
            }, 300);
        } else if (estado === "usado") {
            alert("❌ Este código ya fue utilizado anteriormente.");
        } else {
            alert("❌ Código no válido. Revisa el ticket de compra.");
        }
    } catch (e) {
        console.error(e);
        alert("📡 Error de conexión. Revisa tu internet.");
    }
}

// 6. SISTEMA DE ESTRELLAS
function setRating(n) {
    playSound();
    ratingActual = n;
    const stars = document.querySelectorAll('.stars span');
    
    stars.forEach((s, i) => {
        if (i < n) {
            s.innerText = '★';
            s.classList.add('active');
        } else {
            s.innerText = '★'; // Mantenemos el símbolo pero quitamos el color
            s.classList.remove('active');
        }
    });

    const mensajes = [
        "¡Podría mejorar! 😅", 
        "Está bien, pero le falta algo 🤔", 
        "¡Muy rica! 👍", 
        "¡Excelente hamburguesa! 🔥", 
        "¡LA MEJOR QUE HE PROBADO! 🏆"
    ];
    
    const label = document.getElementById('rating-label');
    label.innerText = mensajes[n-1];
    label.style.color = "var(--gold)";
    label.style.fontWeight = "bold";

    // Habilitar botón de enviar
    document.getElementById('btn-votar').disabled = false;
}

// 7. ENVÍO DEL VOTO FINAL
function enviarVoto() {
    playSound();
    const phone = document.getElementById('phone').value.trim();
    const code = document.getElementById('code').value.trim().toUpperCase();
    const btn = document.getElementById('btn-votar');
    
    btn.disabled = true;
    btn.innerText = "ENVIANDO...";

    const updates = {};
    // Guardar el voto organizado por restaurante
    updates['/votos/' + restID + '/' + phone] = {
        puntos: ratingActual,
        codigo: code,
        fecha: new Date().toISOString()
    };
    // Marcar el código como quemado/usado
    updates['/codigos_validos/' + code] = "usado";

    database.ref().update(updates)
        .then(() => {
            alert("✅ ¡Voto registrado con éxito! Gracias por participar en el Burguer Fest.");
            // Redirigir o recargar para que otro pueda votar
            window.location.href = "https://juanariasn-cmyk.github.io/burguerfest2/";
        })
        .catch((error) => {
            console.error(error);
            alert("Hubo un error al guardar tu voto.");
            btn.disabled = false;
            btn.innerText = "ENVIAR MI CALIFICACIÓN";
        });
}
