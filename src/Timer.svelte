<script>
 import {session,updateSessionDB} from './stores.js';
 import {onMount} from 'svelte';

 $:start = $session && !isNaN($session.startTime) && $session.startTime;
 $:timer = $session && $session.timerLength;

 var timerLength = 60;

 let now = new Date();

 $: secondsTicked = start && Math.floor((now.getTime() - start)/1000);

 onMount(() => {
     const interval = setInterval(() => {
         console.log('Update now!')
	 now = new Date();
     }, 1000);

     return () => {
	 clearInterval(interval);
     };
 });

 function startTimer () {
     const data = {
         startTime : new Date().getTime(),
         timerLength : timerLength
     }
     updateSessionDB({
         id:$session.id,
         ...data});
 }

 function cancelTimer () {
     const data = {
         startTime : 'stop',
         timerLength : 0,
     }
     updateSessionDB({
         id:$session.id,
         ...data});
 }

</script>
<main>
    <div>
        Tick... 
        {#if start}
        <span>{secondsTicked} of {timer} seconds...</span>
        {#if secondsTicked > timerLength}
        <b>{secondsTicked - timerLength} Over!</b>
        {/if}
        <button on:click="{startTimer}">Reset</button>
        {:else}
        <button on:click={startTimer}>Start Clock</button>
        {/if}
        <button on:click="{cancelTimer}">Cancel</button>

</div>
</main>
<style>
 b {color: red}
</style>
