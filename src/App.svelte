<script>
 import {game} from './stores.js';
 export let name;
 let gameId;
 let step;
 import GameManager from './GameManager.svelte';
 import Hat from './Hat.svelte';
 const unsubscribe = game.subscribe(
     value => {
         gameId = value && value.id;
         step = value && value.step;
     }
 );
 
</script>

<main>
    <brand>{name}</brand>
    <div><GameManager /></div>
</main>

<style>
 brand {
     font-family: futura;
     font-size: 14pt;
     color: #aaa;
     text-align: center;
     height: 22px;
     display: flex;
     align-items: center;
     justify-content: center;
     background-color: black;
 }
 div {
     height: calc(100vh - 22px);
     display: flex;
 }
 </style>
