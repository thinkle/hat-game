<script>
 import {game,updateCurrentGame} from './stores.js';
 import {onMount} from 'svelte';
 var localStartTime
 $:start = $game && !isNaN($game.startTime) && $game.startTime || !isNaN(localStartTime) && localStartTime ;
 $:timer = $game && $game.timerLength;

 var timerLength = 60;

 let now = new Date();

 $: secondsTicked = start && Math.floor((now.getTime() - start)/1000);

 onMount(() => {
     const interval = setInterval(() => {
	 now = new Date();
     }, 1000);

     return () => {
	 clearInterval(interval);
     };
 });

 function startTimer () {
     localStartTime = new Date().getTime(),
     updateCurrentGame( {
         startTime : localStartTime,
         timerLength : timerLength
     })
 }

 function cancelTimer () {
     localStartTime = 'stop';
     updateCurrentGame({
         startTime : localStartTime,
         timerLength : 0,
     }
     )
 }
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
        <button class="lowkey" on:click="{startTimer}">Reset</button>
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
