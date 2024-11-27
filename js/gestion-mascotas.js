// Función para la paginación de los pasos
function iniciarPaginacion() {
    let currentStep = 1;
    const totalSteps = 7;

    function showStep(step) {
        document.querySelectorAll('.step').forEach((stepDiv, index) => {
            stepDiv.style.display = (index + 1 === step) ? 'block' : 'none';
        });

        const progress = (step / totalSteps) * 100;
        document.getElementById('progress').style.width = `${progress}%`;

        document.getElementById('prevButton').style.display = step === 1 ? 'none' : 'inline';
        document.getElementById('nextButton').style.display = step === totalSteps ? 'none' : 'inline';
    }

    document.getElementById('nextButton').addEventListener('click', (event) => {
        event.preventDefault();
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    });

    document.getElementById('prevButton').addEventListener('click', (event) => {
        event.preventDefault();
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    showStep(currentStep);
}

document.addEventListener('DOMContentLoaded', iniciarPaginacion);

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

// Función para calcular gramos de alimento y categoría
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

    document.getElementById('resultado-categoria').innerText = `${categoria}`;

    // Calcular gramos recomendados basado en el peso y nivel de actividad
    if (categoria === 'Cachorro') {
        gramosRecomendados = peso * (actividad === 'baja' ? 0.06 : actividad === 'media' ? 0.08 : 0.10) * 1000;
    } else if (categoria === 'Adulto') {
        gramosRecomendados = peso * (actividad === 'baja' ? 0.03 : actividad === 'media' ? 0.04 : 0.06) * 1000;
    } else if (categoria === 'Senior') {
        gramosRecomendados = peso * (actividad === 'baja' ? 0.02 : actividad === 'media' ? 0.025 : 0.03) * 1000;
    }

    document.getElementById('resultado-gramos').innerText = `${gramosRecomendados.toFixed(0)} gramos por día`;

    // Ocultar el botón "Calcular" y mostrar el botón "Enviar"
    document.getElementById('calcularButton').style.display = 'none';
    document.getElementById('enviarButton').style.display = 'block';
}

// Guardar datos y redirigir según los gramos recomendados
function guardarDatosYRedirigir() {
    const formData = new FormData(document.getElementById('formularioMascota'));

    // Almacenar el nombre de la mascota en localStorage
    const nombreMascota = document.getElementById('nombre').value;
    localStorage.setItem('nombre', nombreMascota);

    fetch(gestionMascotasAjax.ajax_url + '?action=guardar_datos_mascota', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const gramosRecomendados = parseFloat(document.getElementById('resultado-gramos').innerText.replace(/\D/g, ''));
            if (gramosRecomendados > 1 && gramosRecomendados <= 350) {
                window.location.href = '/pruebas/resultado-350g';
            } else if (gramosRecomendados > 350 && gramosRecomendados <= 500) {
                window.location.href = '/pruebas/resultado-2700g';
            } else if (gramosRecomendados > 501) {
                window.location.href = '/pruebas/resultado-mayor-2700g';
            } else {
                alert('Error: No se pudo determinar la página de resultados.');
            }
        } else {
            alert('Error al guardar los datos de la mascota.');
        }
    })
    .catch(error => console.error('Error al enviar los datos:', error));
}


// Aplicar y eliminar descuento
function aplicarDescuento() {
    const formData = new FormData();
    formData.append('action', 'aplicar_descuento');
    formData.append('coupon_code', 'DESCUENTO10');

    fetch(gestionMascotasAjax.ajax_url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('¡Descuento del 10% aplicado en tu carrito!');
        } else {
            alert('No se pudo aplicar el descuento.');
        }
    })
    .catch(error => console.error('Error al aplicar el descuento:', error));
}

function eliminarDescuento() {
    const formData = new FormData();
    formData.append('action', 'eliminar_descuento');
    formData.append('coupon_code', 'DESCUENTO10');

    fetch(gestionMascotasAjax.ajax_url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Descuento eliminado del carrito.');
        } else {
            alert('No se pudo eliminar el descuento.');
        }
    })
    .catch(error => console.error('Error al eliminar el descuento:', error));
}

// Eventos para los botones y checkbox
document.getElementById('calcularButton').addEventListener('click', function(event) {
    event.preventDefault();
    calcularAlimento();
});

document.getElementById('enviarButton').addEventListener('click', function(event) {
    event.preventDefault();
    guardarDatosYRedirigir();
});

document.getElementById('descuentoCheckbox').addEventListener('change', function() {
    if (this.checked) {
        aplicarDescuento();
    } else {
        eliminarDescuento();
    }
});
