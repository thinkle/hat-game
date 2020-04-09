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

<div id="hat-game">
    <brand>Name-In-Hat Game</brand>
    <GameManager/>
</div>

<style>
 brand {
     font-family: futura;
     font-size: 14pt;
     color: #aaa;
     text-align: center;
     height: 22px;
     background-color: black;
     padding-top: 0.5em;
     padding-bottom: 0.5em;
 }
 div {
     height: calc(100vh - 22px);
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: stretch;
 }
 </style>
