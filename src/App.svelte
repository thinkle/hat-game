<script>
 import {game} from './stores.js';
 export let name;
 let gameId;
 let step;
 import GameManager from './GameManager.svelte';
 import Words from './Words.svelte';
 import Hat from './Hat.svelte';
 const unsubscribe = game.subscribe(
     value => {
         gameId = value && value.id;
         step = value && value.step;
     }
 );
 
</script>

<main>
     <div>
         <div class="centerThing" >
         {#if gameId}
         <Words game={gameId} step={step} />
         {/if}
         </div>
         <div class="bannerThing">
         <h2>{name}</h2>
         <GameManager />
         </div>
     </div>

</main>

<style>
 .bannerThing {
     position: fixed;
     bottom: 0;
     right: 0;
     height: 4em;
     width: 100vw;
     background-color: black;
     color: white;
     display: flex;
     flex-direction: row;
     align-items: center;
 }
 h2 {
     margin-right: auto;
 }
 p {
     margin-right: 1em;
 }
 .centerThing {
     position: fixed;
     top: 0;
     left: 0;
     height: 100vh;
     width: 100vw;
     display: flex;
     align-items: center;
     justify-content: center;
 }
 main {
     text-align: center;
 }

 h1 {
     color: #ff3e00;
     text-transform: uppercase;
     font-size: 4em;
     font-weight: 100;
 }


 @media (min-width: 640px) {
     main {
	 max-width: none;
     }
 }
</style>
