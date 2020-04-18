<script>
 import {game,startTimer,cancelTimer,localStartTime} from './stores.js';
 import {onMount,onDestroy,createEventDispatcher} from 'svelte';
 const dispatch = createEventDispatcher(); 
 
 $:start = $game && !isNaN($game.startTime) && $game.startTime || !isNaN(localStartTime) && localStartTime ;
 $:timer = $game && $game.timerLength;

 var timerLength = 60;

 let now = new Date();

 $: secondsTicked = start && Math.floor((now.getTime() - start)/1000);

 $: if (start) {
     dispatch('reset',{start})
 }
 

 onMount(() => {
     const interval = setInterval(() => {
	 now = new Date();
         if (secondsTicked > timerLength) {
             dispatch('over',{secondsTicked})
         }
     }, 1000);

     return () => {
	 clearInterval(interval);
     };
 });

 function getProgressStyle () {
     if (secondsTicked > timerLength) {
         return "background-color:red;width:100%"
     }
     else {
         return `background-color:green;width:${100*secondsTicked/timerLength}%`
     }
 }

 

</script>
<main>
    <div>
        {#if start}
        <span>
            <div class="total">
                <div class="progress"
                     style={getProgressStyle(secondsTicked)}
                ></div>
                <div class="text">{Math.max(secondsTicked,0)} of {timerLength} seconds...</div>
            </div>
        </span>
        {#if secondsTicked > timerLength}
        <b>{secondsTicked - timerLength} Over!</b>
        {/if}
        <button class="lowkey" on:click="{startTimer}">Restart Timer</button>
        {:else}
        <button class="lowkey" on:click={startTimer}>Start Clock</button>
        {/if}
        <button class="lowkey" on:click="{cancelTimer}">Cancel</button>

</div>
</main>
<style>
 b {color: red}
 .total {
     height: 25px;
     position: relative;
     padding: 5px;
     border: 1px solid black;
     border-radius: 5px;
     box-sizing: border-box;
 }
 .progress {
     position: absolute;
     top: 0;
     left: 0;
     height: 25px;
 }
 .text {
     color: black;
     font-family: futura;
     font-weight: bold;
     font-size: 16px;
     -webkit-text-stroke: 1px white;
     -webkit-text-fill-color: black;
     position: relative;
 }
</style>
