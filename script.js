const firebaseConfig = {
    apiKey: "AIzaSyCwcCFXtJqWL55ExHFDti3G3Ri18mvNJuU",
    authDomain: "burguerfest.firebaseapp.com",
    projectId: "burguerfest",
    databaseURL: "https://burguerfest-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Imágenes temporales de la web (Unsplash)
const restaurantes = {
    "1": { nombre: "LA OBSESION", logo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100", burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
    "2": { nombre: "MISTER HONGO", logo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100", burger: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800" },
    "3": { nombre: "EL BARRIL DEL FERCHO", logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100", burger: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800", campeon: true },
    "4": { nombre: "SABOR GOURMET", logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100", burger: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800" },
    "5": { nombre: "JAVAR", logo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100", burger: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800" },
    "6": { nombre: "CIELITO LINDO", logo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100", burger: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800" },
    "7": { nombre: "CAFE GORRION", logo: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=100", burger: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800" }
};

const urlParams = new URLSearchParams(window.location.search);
let restID = urlParams.get('rest') || "1";
if (!restaurantes[restID]) restID = "1";
const datosRest = restaurantes[restID];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rest-name').innerText = datosRest.nombre;
    document.getElementById('rest-logo').src = datosRest.logo;
    document.getElementById('burger-img').src = datosRest.burger;

    if (datosRest.campeon) {
        document.getElementById('champion-badge').style.display = 'inline-flex';
        document.getElementById('rest-name').classList.add('champion-name');
    }
});

let ratingActual = 0;

function playSound() {
    const audio = document.getElementById('click-sound');
    if(audio) audio.play();
}

async function validarIngreso() {
    playSound();
    const code = document.getElementById('code').value.trim().toUpperCase();
    const phone = document.getElementById('phone').value.trim();

    if(phone.length < 7 || code.length < 6) {
        alert("⚠️ Ingresa celular y el código de 6 dígitos.");
        return;
    }

    try {
        const snapshot = await database.ref('codigos_validos/' + code).once('value');
        if (snapshot.val() === "disponible") {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('vote-section').style.display = 'block';
        } else {
            alert("❌ Código usado o inválido.");
        }
    } catch (e) { alert("📡 Error de conexión."); }
}

function setRating(n) {
    playSound();
    ratingActual = n;
    const stars = document.querySelectorAll('.stars span');
    stars.forEach((s, i) => {
        s.classList.toggle('active', i < n);
        s.innerText = i < n ? '★' : '★';
    });
    document.getElementById('rating-label').innerText = ["Mala", "Regular", "Buena", "Muy Buena", "¡LA MEJOR!"][n-1];
    document.getElementById('btn-votar').disabled = false;
}

function enviarVoto() {
    playSound();
    const phone = document.getElementById('phone').value.trim();
    const code = document.getElementById('code').value.trim().toUpperCase();
    
    database.ref('votos/' + restID + '/' + phone).set({
        puntos: ratingActual,
        codigo: code,
        fecha: new Date().toLocaleString()
    }).then(() => {
        database.ref('codigos_validos/' + code).set("usado");
        alert("✅ ¡Voto registrado!");
        location.reload();
    });
}
