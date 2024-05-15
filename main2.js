const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Definir dimensiones del canvas más pequeñas
const canvas_height = window.innerHeight * 0.8;
const canvas_width = window.innerWidth * 0.8;

canvas.height = canvas_height;
canvas.width = canvas_width;

// Variable para almacenar las coordenadas del mouse
let mouseX = 0;
let mouseY = 0;

// Campo de texto para mostrar las coordenadas del mouse
const mouseCoordinatesText = document.getElementById('mouseCoordinates');

// Contador de círculos eliminados
let circlesDeleted = 0;
const circlesDeletedText = document.createElement('div');
circlesDeletedText.style.position = 'absolute';
circlesDeletedText.style.bottom = '10px';
circlesDeletedText.style.right = '10px';
document.body.appendChild(circlesDeletedText);

// Agregar evento para actualizar las coordenadas del mouse
canvas.addEventListener('mousemove', function(event) {
    mouseX = event.clientX - canvas.offsetLeft;
    mouseY = event.clientY - canvas.offsetTop;

    mouseCoordinatesText.innerText = "X: " + mouseX + " Y: " + mouseY;
});

// Agregar evento para eliminar el círculo cuando se haga clic dentro de él
canvas.addEventListener('click', function(event) {
    const clickX = event.clientX - canvas.offsetLeft;
    const clickY = event.clientY - canvas.offsetTop;

    // Verificar si el clic está dentro de algún círculo
    circles.forEach((circle, index) => {
        const distance = getDistance(clickX, circle.posX, clickY, circle.posY);
        if (distance <= circle.radius) {
            // Si el clic está dentro del círculo, elimina el círculo del arreglo
            circles.splice(index, 1);
            circlesDeleted++; // Incrementar el contador de círculos eliminados
        }
    });
});

class Circle {
    constructor(x, y, radius, color, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        
        this.dx = Math.random() * speed * (Math.random() < 0.5 ? -1 : 1); // Velocidad aleatoria en dirección X
        this.dy = -Math.abs(Math.random() * speed); // Velocidad aleatoria en dirección Y hacia arriba
    }

    draw(context) {
        context.beginPath();

        // Estilo de burbuja
        context.strokeStyle = this.color;
        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.lineWidth = 2;

        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        
        context.fill();
        context.stroke();
        context.closePath();
    }

    update(context, circles) {
        let isColliding = false;

        // Detección de colisiones con otros círculos
        for (let circle of circles) {
            if (circle !== this) {
                let distance = getDistance(this.posX, circle.posX, this.posY, circle.posY);
                if (distance < (this.radius + circle.radius)) {
                    // Si hay colisión, el círculo más pequeño rebota
                    let smallerCircle = (this.radius < circle.radius) ? this : circle;
                    let largerCircle = (this.radius < circle.radius) ? circle : this;

                    // Se calcula el ángulo de rebote
                    let angle = Math.atan2(smallerCircle.posY - largerCircle.posY, smallerCircle.posX - largerCircle.posX);

                    // Se calcula la nueva velocidad del círculo más pequeño
                    let newDX = Math.cos(angle) * smallerCircle.speed;
                    let newDY = Math.sin(angle) * smallerCircle.speed;

                    // Se actualiza la velocidad del círculo más pequeño
                    smallerCircle.dx = newDX;
                    smallerCircle.dy = -Math.abs(newDY); // Hacer que roben hacia arriba

                    // Se indica que hubo una colisión
                    isColliding = true;
                }
            }
        }

        // Actualiza la posición teniendo en cuenta el rebote en los bordes
        if ((this.posX + this.radius + this.dx) > canvas_width || (this.posX - this.radius + this.dx) < 0) {
            this.dx = -this.dx; // Cambiar dirección en X si toca los bordes horizontales
            isColliding = true; // Indica que hubo una colisión con los bordes
        }

        // Reposiciona el círculo si sale por la parte superior
        if ((this.posY - this.radius + this.dy) < 0) {
            this.posY = canvas_height + this.radius; // Reposiciona en la parte inferior
            this.posX = Math.random() * canvas_width; // Nueva posición X aleatoria
            this.dy = -Math.abs(Math.random() * this.speed); // Reinicia la velocidad hacia arriba
        }

        // Actualiza la posición
        this.posX += this.dx;
        this.posY += this.dy;

        // Asegura que los círculos no salgan de la pantalla
        this.posX = Math.max(this.radius, Math.min(this.posX, canvas_width - this.radius));

        // Cambia el color dependiendo de si hubo colisión o no
        this.color = isColliding ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)";
        
        // Dibuja el círculo
        this.draw(context);
    }
}

function getDistance(x1, x2, y1, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

let circles = [];
for (let i = 0; i < 15; i++) {
    let randomX = Math.random() * canvas_width;
    let randomY = canvas_height + Math.random() * 100; // Empieza más allá del borde inferior
    let randomRadius = Math.floor(Math.random() * 100 + 15);
    let randomSpeed = 4;
    circles.push(new Circle(randomX, randomY, randomRadius, "rgba(0, 0, 255, 0.5)", randomSpeed));
}

let updateCircles = function () {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    circles.forEach(circle => circle.update(ctx, circles));
    circlesDeletedText.innerText = "Círculos eliminados: " + circlesDeleted;
};

updateCircles();

