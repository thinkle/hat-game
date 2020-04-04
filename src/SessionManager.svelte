<script>
 let sessionId;
 let gameName;
 let currentStep;
 let editNameMode=false;
 import strings from './strings.js';
 import { session, sessionFromJson, updateSessionDB } from './stores.js';
 import { onMount } from 'svelte';

 const API_URL = '/.netlify/functions/session' 

 const unsubscribe = session.subscribe(
     value => {
         if (value) {
             sessionId = value.id;
             gameName = value.title;
             currentStep = value.step||steps[0]
         }
         else {
             sessionId = undefined;
             gameName = undefined;
         }
     }
 );

 
 $: { if (sessionId) {
     window.history.pushState(
         `session ${sessionId}`,
         gameName,
         `/${sessionId}`
     );
 }
 }

 async function newSession () {
     console.log('new session!');
     const response = await fetch(`${API_URL}?mode=new`);
     const data = await response.json();
     console.log(data);
     session.update(s => sessionFromJson(data))
 }

 function leaveSession () {
     console.log('Leaving session :(');
     session.update(s => undefined);
     window.history.pushState(
         `no session`,
         `no game`,
         `/`
     );
 }

 function updateName () {
     editNameMode = false;
     const formData = new FormData(document.forms.updateSessionName);
     return updateSessionDB({
         id : sessionId,
         title : formData.get('title')
     });
 }

 const steps = strings.steps

 function updateStep (step) {
     updateSessionDB(
         {id:sessionId,
          step:step}
     );
 }


 onMount( async () => {
     // grab our thing...
     console.log('onMount!');
     const sessionIdFromUrl = window.location.pathname.split('/')[1];
     if (sessionIdFromUrl) {
         console.log('Grab session from URL');
         const response = await fetch(API_URL,{method:'post',body:JSON.stringify({id:sessionIdFromUrl})});
         const data = await response.json();
         console.log('Session data: ',data);
         session.update(s => sessionFromJson(data));
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
    {#if !sessionId}
    <div class="modal">
        <button id="new" on:click="{newSession}">Start Session?</button>
    </div>
    {:else}
      <select on:change={changeStep}>
          {#each steps as step}
          <option value={step} selected={currentStep==step}>{step}</option>
          {/each}
      </select>
      {#if editNameMode}
      <form name="updateSessionName">
          <input type="hidden"  name="id" value={sessionId}>
          <input type="text"  name="title" value="{gameName}">
          <button type="submit" on:click|preventDefault={updateName}>Set Name</button>
      </form>
      {:else}
      {gameName} <button on:click={()=>editNameMode=true}>✎</button>
      {/if}
      <button on:click="{leaveSession}">Leave Session</button>
      
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
