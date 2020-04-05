<script>
 import {game,updateCurrentGame} from './stores.js';
 import {onMount} from 'svelte';

 $:start = $game && !isNaN($game.startTime) && $game.startTime;
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
     updateCurrentGame( {
         startTime : new Date().getTime(),
         timerLength : timerLength
     })
 }

 function cancelTimer () {
     updateCurrentGame({
         startTime : 'stop',
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
