<?php
/**
 * Plugin Name: Gestión de Mascotas y Carrito Personalizado
 * Description: Plugin personalizado para gestionar mascotas y añadir productos al carrito según cálculos.
 * Version: 1.0
 * Author: Juan - Rotundo Grupo Creativo
 */

// Aquí va la función para encolar los scripts y estilos
function gestionar_mascotas_enqueue_scripts() {
    wp_enqueue_script('gestion-mascotas-js', plugin_dir_url(__FILE__) . 'js/gestion-mascotas.js', array('jquery'), null, true);
    wp_localize_script('gestion-mascotas-js', 'gestionMascotasAjax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('guardar_mascota_nonce'),
    ));
    
    // Encolar el archivo CSS
    wp_enqueue_style(
        'gestion-mascotas-css', // Identificador único
        plugin_dir_url(__FILE__) . 'css/gestion-mascotas.css' // Ruta del archivo CSS
    );
}
// Hook para ejecutar la encolación en el momento adecuado
add_action('wp_enqueue_scripts', 'gestionar_mascotas_enqueue_scripts');
//

// Función para mostrar el formulario de registro de mascotas
function mostrar_formulario_mascota() {
	ob_start(); // Inicia el buffer de salida
?>
<form id="formularioMascota" enctype="multipart/form-data" method="POST">

<div class="progress-bar">
    <div id="progress" style="width: 0%;"></div>
</div>
<div id="stepsContainer">
<div id="step-1" class="step">
	<label for="nombre">Nombre de la mascota:</label>
	<input type="text" id="nombre" name="nombre" required>

	<label for="tipo">Tipo de mascota:</label>
	<select id="tipo" name="tipo">
		<option value="perro">Perro</option>
		<option value="gato">Gato</option>
	</select>
</div>
<div id="step-2" class="step" style="display:none;">
	<label for="edad">Edad de la mascota:</label>
	<input type="number" id="edad" name="edad" required>

	<label for="unidad">Unidad de edad:</label>
	<select id="unidad" name="unidad">
		<option value="meses">Meses</option>
		<option value="años">Años</option>
	</select>
</div>
<div id="step-3" class="step" style="display:none;">
	<label for="peso">Peso de la mascota (kg):</label>
	<input type="number" id="peso" name="peso" required>

	<label for="actividad">Nivel de actividad física:</label>
	<select id="actividad" name="actividad">
		<option value="baja">Baja</option>
		<option value="media">Media</option>
		<option value="alta">Alta</option>
	</select>
</div>
<div id="step-4" class="step" style="display:none;">
	<label for="imagen">Subir imagen de la mascota:</label>
	<input type="file" id="imagen" name="imagen" accept="image/*">
</div>
<div id="step-5" class="step" style="display:none;">
	 <button type="button" id="calcularButton">Calcular</button>

	<div id="resultado-categoria"></div>
	<div id="resultado-gramos"></div>
	<div id="resultado-recomendacion" style="display: none;"></div>
	<a id="redirigir-carrito" href="/cart" style="display:none;">Ir al carrito</a>
</div>

    <div class="navigation-buttons">
        <button type="button" id="prevButton">Anterior</button>
        <button type="button" id="nextButton">Siguiente</button>
    </div>
</div>

</form>
<?
return ob_get_clean(); // Devuelve el contenido del buffer
}
add_shortcode('formulario_mascota', 'mostrar_formulario_mascota');

// Función para guardar los datos de la mascota
function guardar_datos_mascota() {
	if (!is_user_logged_in()) {
		wp_send_json_error('No tienes permiso para realizar esta acción.');
	}

	$user_id = get_current_user_id();
	$nombre = sanitize_text_field($_POST['nombre']);
	$tipo = sanitize_text_field($_POST['tipo']);
	$edad = sanitize_text_field($_POST['edad']);
	$unidad = sanitize_text_field($_POST['unidad']);
	$peso = sanitize_text_field($_POST['peso']);
	$actividad = sanitize_text_field($_POST['actividad']);


	// Subida de la imagen
	$imagen_id = '';
	if (!empty($_FILES['imagen']) && !empty($_FILES['imagen']['name'])) {
		require_once(ABSPATH . 'wp-admin/includes/file.php');
		$uploadedfile = $_FILES['imagen'];
		$upload_overrides = ['test_form' => false];
		$movefile = wp_handle_upload($uploadedfile, $upload_overrides);

		if ($movefile && !isset($movefile['error'])) {
			$imagen_id = $movefile['url'];
		}
	}

	// Guardar la mascota
	$mascotas = get_user_meta($user_id, 'mascotas', true) ?: [];
	$mascotas[] = [
		'imagen' => $imagen_id,
		'nombre' => $nombre,
		'tipo' => $tipo,
		'edad' => $edad,
		'unidad' => $unidad,
		'peso' => $peso,
		'actividad' => $actividad,
		
	];
	update_user_meta($user_id, 'mascotas', $mascotas);

	wp_send_json_success('Datos de la mascota guardados correctamente.');
}
add_action('wp_ajax_guardar_datos_mascota', 'guardar_datos_mascota');
add_action('wp_ajax_nopriv_guardar_datos_mascota', 'guardar_datos_mascota');
//
//
//
//	Función para mostrar las mascotas con paginación
function mostrar_mascotas_usuario($atts) {
	$atts = shortcode_atts(['por_pagina' => 5], $atts);
	$user_id = get_current_user_id();
	$mascotas = get_user_meta($user_id, 'mascotas', true) ?: [];
	$por_pagina = (int) $atts['por_pagina'];
	$pagina_actual = isset($_GET['pagina']) ? (int) $_GET['pagina'] : 1;
	$total_mascotas = count($mascotas);
	$total_paginas = ceil($total_mascotas / $por_pagina);
	$mascotas_paginadas = array_slice($mascotas, ($pagina_actual - 1) * $por_pagina, $por_pagina);

	if (!empty($mascotas_paginadas)) {
		echo '<div class="mascotas-container">';
		foreach ($mascotas_paginadas as $index => $mascota) {
			$global_index = ($pagina_actual - 1) * $por_pagina + $index;
			echo '<div class="mascota-card" data-index="' . esc_attr($global_index) . '">';
			if (!empty($mascota['imagen'])) {
				echo '<div><img src="' . esc_url($mascota['imagen']) . '" style="max-width:100%; height:auto;"></div>';
			}
			echo '<p><strong>Nombre:</strong> ' . esc_html($mascota['nombre']) . '</p>';
			echo '<p><strong>Tipo:</strong> ' . esc_html($mascota['tipo']) . '</p>';
			echo '<p><strong>Edad:</strong> ' . esc_html($mascota['edad']) . ' ' . esc_html($mascota['unidad']) . '</p>';
			echo '<p><strong>Peso:</strong> ' . esc_html($mascota['peso']) . ' kg</p>';
			echo '<p><strong>Actividad:</strong> ' . esc_html($mascota['actividad']) . '</p>';
			echo '<br/>';
			echo '<button class="btn-eliminar-mascota" data-index="' . esc_attr($global_index) . '">Eliminar</button>';
			echo '</div>';
		}
		echo '</div>';

		if ($total_paginas > 1) {
			echo '<div class="paginacion-mascotas">';
			for ($i = 1; $i <= $total_paginas; $i++) {
				$active = ($i === $pagina_actual) ? 'active' : '';
				echo '<a class="pagina ' . $active . '" href="?pagina=' . $i . '">' . $i . '</a>';
			}
			echo '</div>';
		}
	} else {
		echo '<p>No has registrado ninguna mascota.</p>';
	}
}
add_shortcode('mostrar_mascotas_usuario', 'mostrar_mascotas_usuario');

//
// 
//  
//	Función para eliminar una mascota
function eliminar_mascota() {
	if (!is_user_logged_in()) {
		wp_send_json_error('No tienes permiso para realizar esta acción.');
	}

	if (!isset($_POST['index'])) {
		wp_send_json_error('El índice no fue enviado.');
	}

	$user_id = get_current_user_id();
	$index = intval($_POST['index']);
	$mascotas = get_user_meta($user_id, 'mascotas', true);

	if (!is_array($mascotas) || !isset($mascotas[$index])) {
		wp_send_json_error('No se encontró la mascota en la posición indicada.');
	}

	// Eliminar la mascota en la posición indicada
	array_splice($mascotas, $index, 1);

	// Actualiza la meta del usuario
	update_user_meta($user_id, 'mascotas', $mascotas);

	wp_send_json_success('Mascota eliminada correctamente.');
}
add_action('wp_ajax_eliminar_mascota', 'eliminar_mascota');
//
//
//
//	Función AJAX para cargar una plantilla de Elementor
function cargar_plantilla_elementor() {
    if (isset($_POST['plantilla_id'])) {
        $plantilla_id = intval($_POST['plantilla_id']);

        // Utilizamos el shortcode para cargar la plantilla de Elementor
        $shortcode = '[elementor-template id="' . $plantilla_id . '"]';
        $contenido = do_shortcode($shortcode);

        wp_send_json_success($contenido);
    } else {
        wp_send_json_error('No se ha proporcionado un ID de plantilla.');
    }
}
add_action('wp_ajax_cargar_plantilla_elementor', 'cargar_plantilla_elementor');
add_action('wp_ajax_nopriv_cargar_plantilla_elementor', 'cargar_plantilla_elementor');
//
//
//
//
add_filter('woocommerce_add_to_cart_validation', 'prevenir_duplicado_en_carrito', 10, 3);
function prevenir_duplicado_en_carrito($passed, $product_id, $quantity) {
    // Verificar si el producto ya está en el carrito
    foreach (WC()->cart->get_cart() as $cart_item_key => $values) {
        $_product = $values['data'];
        if ($product_id == $_product->get_id()) {
            // Si el producto ya está en el carrito, no permitir que se añada de nuevo
            wc_add_notice('Este producto ya está en tu carrito.', 'error');
            return false; // Evitar que se añada de nuevo
        }
    }
    return $passed; // Permitir que el producto se añada si no está en el carrito
}
