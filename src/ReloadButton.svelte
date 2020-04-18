<script>
import {createEventDispatcher} from 'svelte'
export let percentage
export let total
 export let busy

 function getStyle () {
     return `height:${32*Number(percentage)}px`
 }
 
</script>

<button class:busy={busy} disabled={busy} on:click>
    <span>⟳</span>
    <!-- <div>
         {total}
         </div> -->
    <div class="loader" style={getStyle(percentage)}>
    </div>
</button>

<style>
 button {
     overflow: hidden;
     width: 36px;
     height: 36px;
     border-radius: 50%;
     display: inline-flex;
     justify-content: center;
     align-items: center;
     position: relative;
     background-color: black;
     color: white;
 }
 div {
     color: #ddf;
     font-weight: heavy;
     position: absolute;
     width: 36px;
     height: 36px;
     display: flex;
     align-content: center;
     justify-content: center;
     top: 0;
     left: 0;
 }
 .loader {
     background-color: #a8b7ff;
 }

 .busy {
     color: #666;
     transform: rotateZ(360deg);
     transition: all 300ms;
     border: none;
     active: false;
 }

 
</style>
