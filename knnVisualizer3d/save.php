<?php
// Riceve dati JSON
$input = file_get_contents('php://input');
$nuovoDato = json_decode($input, true);

if ($nuovoDato) {
    $file = 'data.json';
    // Legge dati esistenti
    $currentData = file_get_contents($file);
    $arrayData = json_decode($currentData, true);
    if (!$arrayData) $arrayData = [];


    
    $arrayData[] = $nuovoDato;
    
    // Ottimizzazione: teniamo solo gli ultimi 500 punti per non appesantire
    if (count($arrayData) > 10000) {
        $arrayData = array_slice($arrayData, -10000);
    }

    file_put_contents($file, json_encode($arrayData));
}
echo json_encode(["status" => "ok"]);
?>