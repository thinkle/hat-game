<script>

 let gameId;
 let nameInput;
 let gameName;
 let currentStep;
 let editNameMode=false;
 let playerNameInputValue=$player||''
 import Entry from './Entry.svelte';
 import Words from './Words.svelte';
 import strings from './strings.js';
 import { game, gameFromJson, updateGameDB, player, startTimer, addPlayerNameToGame } from './stores.js';
 import { onMount } from 'svelte';

 const API_URL = '/.netlify/functions/game' 

 function takeTurn () {
     $game.currentPlayer = $player;
     if (!$game.players || $game.players.indexOf($player)==-1) {
         addPlayerNameToGame($player);
     }
     updateGameDB(
         $game
     )
     setTimeout(startTimer,1000);
 }


 function finishTurn () {
     $game.currentPlayer = "No man's land";
     updateGameDB(
         $game
     );
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

 async function checkForUpdates () {
     if (alreadyUpdating) {
         return;
     }
     alreadyUpdating = true;
     console.log('Checking...',new Date().getTime());
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
     let timeoutTime = lastInterval;
     if ($game.startTime && !isNaN($game.startTime)) {
         // when should we check...
         const endTime = $game.timerLength * 1000 + $game.startTime
         const now = new Date().getTime();
         if (endTime > now) {
             timeoutTime = endTime - now;
         }
         else {
             timeoutTime = -1 * (endTime - now);
         }
         if (isNaN(timeoutTime) || timeoutTime < 500) {
             timeoutTime = lastInterval;
             lastInterval *= 2;
         }
     }
     else {
         lastInterval = lastInterval * 2;
     }
     console.log('check again in',timeoutTime/1000);
     setTimeout(checkForUpdates,timeoutTime);
 }

 let lastInterval = 2000

 function checkForUpdatesInteractive () {
     lastInterval = 2000;
     checkForUpdates();
 }

 let gameUpdater = setTimeout(
     checkForUpdates,
     lastInterval
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
     console.log
     (data);
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
     return updateGameDB({
         id : gameId,
         title : nameInput.value
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

<div class="container">
    <div class="head" >
        {#if gameId}
        <div class="name left">
            {#if $player}
            {$player} <button class="lowkey" on:click={()=>$player=''}>✎</button>
            {/if}
        </div>
        <select on:change={changeStep}>
            {#each steps as step}
            <option value={step} selected={currentStep==step}>{step}</option>
            {/each}
        </select>
        <div class="right">
            {#if currentStep==strings.playStep}
            {#if $player!=$game.currentPlayer}
            <button on:click={takeTurn}>My Turn!</button>
            {:else}
            <button on:click={finishTurn}>Done</button>
            {/if}
            {/if}
            {#if alreadyUpdating}
            Updating...
            {:else}
            <button on:click={checkForUpdatesInteractive}>⟳</button>
            {/if}
        </div>
        {/if}
    </div> <!-- end head -->
    <div class="center" >
        {#if !gameId}
        <button id="new" on:click="{newGame}">Start Game?</button>
        {:else}
        {#if !$player}
        <div>
            <Entry
                label="Set Player Name"
                bind:value={playerNameInputValue}
                on:submit={()=>$player=playerNameInputValue}
                placeholder="Name..."
                />
        </div>
        {:else}
        <Words/>
        {/if}
        {/if}
    </div> <!-- end center -->
    <div class="foot" >
        {#if gameId}
        {#if editNameMode}
        <input type="text"  name="title" bind:this={nameInput} value="{gameName}">
        <button type="submit" on:click|preventDefault={updateName}>Set Name</button>
        {:else}
        {gameName} <button class="lowkey" on:click={()=>editNameMode=true}>✎</button>
        {/if}
        {#if $game.players}
        {#each $game.players as player,i}
        <span
            class:active={player==$game.currentPlayer}
        >{player}</span>{#if (i+1 < $game.players.length)},{/if}
        {/each}
        {/if}
        <button class="right" on:click="{leaveGame}">Leave Game</button>
        {/if}
    </div>
 </div>

 <style>

  span {
      font-style: italic;
  }
  span.active {
      text-decoration: underline;
      font-weight: bold;
  }
  
 .left {
     margin-right: auto;
 }
 .right {
     margin-left: auto;
 }
 .foot,.head {
     display: flex;
     flex-direction: row;
     align-items: center;
     align-self: stretch;
 }

 .center {
     text-align: center;
     flex-grow: 2;
     display: flex;
     align-self: stretch;
 }

 .center div {
     text-align: center;
     margin: auto;
 }

 .foot * {
     margin-right: 1em;
 }

 .foot button {
     background-color: black;
     color: #888;
 }

 .foot {
     background-color: black;
     min-height: 2em;
     border-top: 3px solid #777;
     color: white;
 }

 .foot button {
     border:none;
 }
 .foot button:hover {
     border: 1px solid white;
 }

 select {
     background-color: white;
     color: #222;
     min-width: 7em;
     max-width: 12em;
     font-weight: bold;
     height: 2em;
     margin: auto;
 }

 button, entry, select {
     font-size: 1.5em;
 }
 
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

 button#new {
     border: 3px solid #222;
     padding: 2em;
     font-size: 3em;
 }

 .container {
     display: flex;
     flex-direction: column;
     flex-grow: 2;
     align-items: center;
 }

 .center button {
     margin: auto;
 }
</style>
