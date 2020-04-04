<script>
 let gameId;
 let gameName;
 let currentStep;
 let editNameMode=false;
 import strings from './strings.js';
 import { game, gameFromJson, updateGameDB, player } from './stores.js';
 import { onMount } from 'svelte';

 const API_URL = '/.netlify/functions/game' 

 function takeTurn () {
     $game.currentPlayer = $player;
     updateGameDB(
         $game
     )
 }

 const unsubscribe = game.subscribe(
     value => {
         if (value) {
             gameId = value.id;
             gameName = value.title;
             currentStep = value.step||steps[0]
         }
         else {
             gameId = undefined;
             gameName = undefined;
         }
     }
 );

 let alreadyUpdating = true;
 let gameUpdater = setInterval(
     async function () {
         if (alreadyUpdating) {
             return;
         }
         alreadyUpdating = true;
         try {
             var response = await fetch(API_URL,{method:'post',body:JSON.stringify({id:$game.id})});
             var data = await response.json();
         }
         catch (err) {
             console.log('Error updating',err);
         }
         if (data) {
             game.update(oldGame => {
                 newGame = gameFromJson(data);
                 var mergedPlayers;
                 if (newGame.players && oldGame.players) {
                     mergedPlayers = [...oldGame.players];
                     for (let p of oldGame.players) {
                         if (mergedPlayers.indexOf(p)==-1) {
                             mergedPlayers.push(p);
                         }
                     }
                 }
                 else {
                     mergedPlayers = newGame.players || oldGame.players
                 }
                 return {
                     ...oldGame,
                     ...newGame,
                     players : mergedPlayers,
                 }
             });
         }
         alreadyUpdating = false;
     },
     1500
 );

 $: { if (gameId) {
     window.history.pushState(
         `game ${gameId}`,
         gameName,
         `/${gameId}`
     );
 }
 }

 async function newGame () {
     console.log('new game!');
     alreadyUpdating = true;
     const response = await fetch(`${API_URL}?mode=new`);
     const data = await response.json();
     console.log(data);
     game.update(s => gameFromJson(data))
     alreadyUpdating = false;
 }

 function leaveGame () {
     console.log('Leaving game :(');
     clearInterval(gameUpdater)
     game.update(s => undefined);
     window.history.pushState(
         `no game`,
         `no game`,
         `/`
     );
 }

 function updateName () {
     editNameMode = false;
     const formData = new FormData(document.forms.updateGameName);
     return updateGameDB({
         id : gameId,
         title : formData.get('title')
     });
 }

 const steps = strings.steps

 function updateStep (step) {
     updateGameDB(
         {id:gameId,
          step:step}
     );
 }


 onMount( async () => {
     // grab our thing...
     console.log('onMount!');
     const gameIdFromUrl = window.location.pathname.split('/')[1];
     if (gameIdFromUrl) {
         alreadyUpdating = true;
         console.log('Grab game from URL');
         const response = await fetch(API_URL,{method:'post',body:JSON.stringify({id:gameIdFromUrl})});
         const data = await response.json();
         console.log('Game data: ',data);
         game.update(s => gameFromJson(data));
         alreadyUpdating = false;
     }
 });

 function changeStep (event) {
     const sel = event.target;
     const selected = sel.options[sel.selectedIndex].value;
     console.log('Step change',selected,sel)
     updateStep(selected);
 }


</script>

<div>
    {#if !gameId}
    <div class="modal">
        <button id="new" on:click="{newGame}">Start Game?</button>
    </div>
    {:else}
      <select on:change={changeStep}>
          {#each steps as step}
          <option value={step} selected={currentStep==step}>{step}</option>
          {/each}
      </select>
      {#if editNameMode}
      <form name="updateGameName">
          <input type="hidden"  name="id" value={gameId}>
          <input type="text"  name="title" value="{gameName}">
          <button type="submit" on:click|preventDefault={updateName}>Set Name</button>
      </form>
      {:else}
      {gameName} <button on:click={()=>editNameMode=true}>✎</button>
      {/if}

      {#if currentStep==strings.playStep && !$player}
      <div>
          Player <input type="text" on:blur={(e)=>$player=e.target.value}>
      </div>
      {:else}
      <div class="name" >{$player} <button on:click={()=>$player=''}>✎</button></div>
      {/if}
      
      
      <button>
          <button on:click={takeTurn}>MY TURN!</button>
      </button>

      <button on:click="{leaveGame}">Leave Game</button>
      
    {/if}
</div>

<style>
 .modal {
     position: fixed;
     width: 100vw;
     height: 100vh;
     top: 0;
     left: 0;
     align-items: center;
     justify-content: center;
 }
 .last {
     top: 200px;
     left: 300px;
     position: relative;
 }
 div {
     display: flex;
     flex-direction: row;
 }
 form button {
     font-size: 1em;
     padding: 3px;
     border: 1px solid #777;
 }
 button#new {
     border: 3px solid #222;
     padding: 2em;
     font-size: 3em;
 }

</style>
