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

</script>
<main>
    <div>
        Tick... 
        {#if start}
        <span>{Math.max(secondsTicked,0)} of {timerLength} seconds...</span>
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
</style>
