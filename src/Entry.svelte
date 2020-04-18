<script>
 import {createEventDispatcher} from 'svelte'
 const dispatch = createEventDispatcher();
 export let disabled;
 export let placeholder
 export let value
 export let label
 export let button = '+'



 function triggerSubmit (event) {
     dispatch(
         'submit',
         {
             value,
             event
         }
     )
 }

 function checkForEnter (event) {
     console.log('check for enter...');
     if (disabled) {
         console.log("Oops, we're busy")
         return
     }
     if (event.key=='Enter'||event.key=='Return'||event.keyCode==13) {
         dispatch(
             'submit',
             {
                 event, value
             }
         );
     }
 }
 
</script>

<div>
    {#if label}
    <label for="e">
        {label}
    </label>
    {/if}
    <div>
        <input id="e" class:disabled={disabled} bind:value={value} placeholder={placeholder} on:keypress={checkForEnter} on:message type="text" >
        {#if button}
        <button on:click={triggerSubmit}>
            {button}
        </button>
        {/if}
    </div>
</div>

<style>
 
 div {
     display: flex;
     align-items: center;
     max-width: 100%;
 }

div div:focus-within {
     outline: -webkit-focus-ring-color auto 5px;
     outline-color: blue;
     outline-color: -webkit-focus-ring-color;
     outline-style: auto;
     outline-width: 5px;
 }

 :focus {
     outline: 0;
 }
 
 label {
     margin-right: 0.5em;
 }

 button {
     margin-left: 0;
     border-radius: 0px 5px 5px 0px;
     font-size: 18px;
     align-self: stretch;
 }

 .disabled {
     color : #777;
     border-color: #777;
     cursor: busy
 }

 label {
     font-size: 16px;
 }
 
 input {
     font-size: 18px;
 }

</style>
    
