// Funcion para la paginacion

function iniciarPaginacion() {

    let currentStep = 1;

    const totalSteps = 5; // Ajusta según el número de pasos



    function showStep(step) {

        document.querySelectorAll('.step').forEach((stepDiv, index) => {

            stepDiv.style.display = (index + 1 === step) ? 'block' : 'none';

        });



        // Actualizar la barra de progreso

        const progress = (step / totalSteps) * 100;

        document.getElementById('progress').style.width = `${progress}%`;



        // Mostrar/ocultar botones

        document.getElementById('prevButton').style.display = step === 1 ? 'none' : 'inline';

        document.getElementById('nextButton').style.display = step === totalSteps ? 'none' : 'inline';

    }



    // Evento de botón "Siguiente"

    document.getElementById('nextButton').addEventListener('click', (event) => {

        event.preventDefault(); // Previene la validación del formulario en cada paso

        if (currentStep < totalSteps) {

            currentStep++;

            showStep(currentStep);

        }

    });



    // Evento de botón "Anterior"

    document.getElementById('prevButton').addEventListener('click', (event) => {

        event.preventDefault();

        if (currentStep > 1) {

            currentStep--;

            showStep(currentStep);

        }

    });



    // Mostrar el primer paso al iniciar

    showStep(currentStep);

}

document.addEventListener('DOMContentLoaded', iniciarPaginacion);

//

function showStep(step) {

// Mostrar el paso actual

document.querySelectorAll('.step').forEach((stepDiv, index) => {

stepDiv.style.display = (index + 1 === step) ? 'block' : 'none';

});



// Actualizar la barra de progreso

const progress = (step / totalSteps) * 100;

document.getElementById('progress').style.width = `${progress}%`;



// Mostrar/ocultar botones según el paso

document.getElementById('prevButton').style.display = step === 1 ? 'none' : 'inline';

document.getElementById('nextButton').style.display = step === totalSteps ? 'none' : 'inline';

document.getElementById('submitButton').style.display = step === totalSteps ? 'inline' : 'none';

}

// Función para eliminar mascota vía AJAX

function eliminarMascota(index) {

const formData = new FormData();

formData.append('action', 'eliminar_mascota');

formData.append('index', index);



fetch(gestionMascotasAjax.ajax_url, {

	method: 'POST',

	body: formData

})

	.then(response => response.json())

	.then(data => {

	if (data.success) {

		alert('Mascota eliminada correctamente.');

		location.reload(); // Refrescar la página

	} else {

		alert('Error al eliminar la mascota: ' + (data.data || 'Error desconocido'));

	}

})

	.catch(error => {

	console.error('Error al enviar la solicitud:', error);

	alert('Error al enviar la solicitud: ' + error.message);

});

}



// Añadir eventos de clic a los botones de eliminación de mascotas

document.querySelectorAll('.btn-eliminar-mascota').forEach(button => {

button.addEventListener('click', function() {

	const index = this.getAttribute('data-index');

	if (confirm('¿Estás seguro de que deseas eliminar esta mascota?')) {

		eliminarMascota(index);

	}

});

});



// Función para calcular gramos de alimento y mostrar la plantilla de Elementor

function calcularAlimento() {

   const peso = parseFloat(document.getElementById('peso').value);

if (!peso) {

    alert('Por favor, ingresa el peso de la mascota.');

    return;

}

const actividad = document.getElementById('actividad').value || 'media';

const edad = parseInt(document.getElementById('edad').value) || 0;

const unidad = document.getElementById('unidad').value || 'meses';

let categoria;

let gramosRecomendados;



// Determinar categoría de la mascota

if (unidad === 'meses' && edad <= 18) {

	categoria = 'Cachorro';

} else if (unidad === 'años' && edad <= 6) {

	categoria = 'Adulto';

} else {

	categoria = 'Senior';

}



document.getElementById('resultado-categoria').innerText = `Categoría: ${categoria}`;



// Calcular gramos recomendados basado en el peso y nivel de actividad

if (categoria === 'Cachorro') {

	if (actividad === 'baja') {

		gramosRecomendados = peso * 0.06 * 1000;

	} else if (actividad === 'media') {

		gramosRecomendados = peso * 0.08 * 1000;

	} else {

		gramosRecomendados = peso * 0.10 * 1000;

	}

} else if (categoria === 'Adulto') {

	if (actividad === 'baja') {

		gramosRecomendados = peso * 0.03 * 1000;

	} else if (actividad === 'media') {

		gramosRecomendados = peso * 0.04 * 1000;

	} else {

		gramosRecomendados = peso * 0.06 * 1000;

	}

} else if (categoria === 'Senior') {

	if (actividad === 'baja') {

		gramosRecomendados = peso * 0.02 * 1000;

	} else if (actividad === 'media') {

		gramosRecomendados = peso * 0.025 * 1000;

	} else {

		gramosRecomendados = peso * 0.03 * 1000;

	}

}



// Mostrar el resultado de gramos

document.getElementById('resultado-gramos').innerText = `Alimento recomendado: ${gramosRecomendados.toFixed(0)} gramos por día`;



// Llamar la plantilla de Elementor con AJAX según el cálculo

mostrarPlantillaRecomendacion(gramosRecomendados);

}



// Función para mostrar la plantilla de Elementor basada en el cálculo

function mostrarPlantillaRecomendacion(gramosRecomendados) {

let plantillaId;



if (gramosRecomendados > 1 && gramosRecomendados <= 350) {

	plantillaId = 74642; // ID de la plantilla de Elementor para consumos entre 0 y 350 gramos

} else if (gramosRecomendados > 2700) {

	plantillaId = 74647; // ID de la plantilla de Elementor para consumos mayores de 2700 gramos

} else {

	plantillaId = 74648; // ID de la plantilla de Elementor para consumos menores de 270 gramos

}



// Hacer una solicitud AJAX para cargar la plantilla de Elementor

cargarPlantillaElementor(plantillaId);

}



// Función para hacer la solicitud AJAX y cargar la plantilla de Elementor

function cargarPlantillaElementor(plantillaId) {

const formData = new FormData();

formData.append('action', 'cargar_plantilla_elementor');

formData.append('plantilla_id', plantillaId);



fetch(gestionMascotasAjax.ajax_url + '?action=guardar_datos_mascota', {

	method: 'POST',

	body: formData

})

	.then(response => response.json())

	.then(data => {

	if (data.success) {

		document.getElementById('resultado-recomendacion').innerHTML = data.data;

		document.getElementById('resultado-recomendacion').style.display = 'block';



		// Añadir eventos de clic a los enlaces "Añadir al carrito" (elementos <a>)

		document.querySelectorAll('.single_add_to_cart_button').forEach(button => {

			button.addEventListener('click', function(event) {

				event.preventDefault(); // Evitamos el comportamiento predeterminado del enlace

				const productId = this.getAttribute('data-product_id');

				guardarDatosYAnadirAlCarrito(productId);

			});

		});



	} else {

		alert('Error al cargar la plantilla.');

	}

})

	.catch(error => {

	console.error('Error en la solicitud AJAX:', error);

});

}

//

// Función para guardar los datos de la mascota y añadir el producto al carrito

let carritoActualizado = false;  // Variable para evitar duplicaciones



// Función para guardar los datos de la mascota y añadir el producto al carrito

function guardarDatosYAnadirAlCarrito(productId) {

if (carritoActualizado) return;  // Evitar duplicaciones

carritoActualizado = true;       // Marcar como carrito actualizado



const formData = new FormData(document.getElementById('formularioMascota'));



// Guardar los datos de la mascota vía AJAX

fetch(gestionMascotasAjax.ajax_url + '?action=guardar_datos_mascota', {

    method: 'POST',

    body: formData

})

.then(response => response.json())

.then(data => {

    if (data.success) {

        // Añadir el producto al carrito solo si los datos se guardan correctamente

        anadirProductoAlCarrito(productId);

    } else {

        alert('Error al guardar los datos de la mascota.');

        carritoActualizado = false;  // Permitir reintento en caso de error

    }

})

.catch(error => {

    console.error('Error al guardar los datos:', error);

    carritoActualizado = false;  // Permitir reintento en caso de error

});

}



// Función para añadir el producto al carrito

function anadirProductoAlCarrito(productId) {

    const formData = new FormData();

    formData.append('action', 'woocommerce_add_to_cart');

    formData.append('product_id', productId);



    fetch(gestionMascotasAjax.ajax_url, {

        method: 'POST',

        body: formData

    })

    .then(response => response.json())

    .then(data => {

        if (data.cart_hash && !data.error) {

            // Limpiar el almacenamiento local y evitar acumulaciones

            sessionStorage.clear();

            localStorage.clear();



            // Redirigir al carrito después de añadir el producto

            window.location.href = '/carrito'; // Cambia '/cart' si la URL del carrito es diferente

        } else if (data.product_url) {

            // Si WooCommerce devuelve la URL del producto en caso de error, redirigir al usuario

            alert('El producto no pudo añadirse al carrito. Redirigiendo al producto para más detalles.');

            window.location.href = data.product_url;  // Redirigir al producto

        } else {

            alert('Error al añadir el producto al carrito: ' + JSON.stringify(data));

            carritoActualizado = false;  // Permitir reintento en caso de error

        }

    })

    .catch(error => {

        console.error('Error al añadir el producto al carrito:', error);

        carritoActualizado = false;  // Permitir reintento en caso de error

    });

}



// Añadir eventos de clic a los botones "Añadir al carrito"

document.querySelectorAll('.single_add_to_cart_button').forEach(button => {

if (!button.classList.contains('clickeado')) {

    button.addEventListener('click', function(event) {

        event.preventDefault(); // Prevenir el comportamiento por defecto del enlace



        const productId = this.getAttribute('data-product_id');



        // Desactivar el botón para evitar múltiples clics

        this.setAttribute('disabled', 'disabled');

        this.classList.add('clickeado'); // Marcar el botón como "clickeado"



        // Guardar los datos y añadir al carrito

        guardarDatosYAnadirAlCarrito(productId);

    });

}

});

document.getElementById('calcularButton').addEventListener('click', function(event) {

    event.preventDefault(); // Esto previene que el formulario se intente enviar

    calcularAlimento(); // Llama a la función de cálculo

});
