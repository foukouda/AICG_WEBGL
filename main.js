(function() {
    'use strict';

    // Récupérer le canvas
    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('Votre navigateur ne supporte pas WebGL');
        return;
    }

    // Définir la couleur de nettoyage (clear color)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Nettoyer le buffer de couleur
    gl.clear(gl.COLOR_BUFFER_BIT);
})();
