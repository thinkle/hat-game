<script>
 import { onMount } from 'svelte';
 import Hat from './Hat.svelte';
 import { fade, fly, crossfade, scale } from 'svelte/transition';

 import { cubicOut, elasticOut } from 'svelte/easing';

 
 import strings from './strings.js';
 let words = []
 export let session;
 import {localHat} from './stores.js';

 export let step;
 let newWord = '';
 let busy = false;
 let completed = 0;

 $: wordsInHat = words.filter((w)=>w.data.outOfHat==false).map((w)=>w.data.word);
 
 const API_URL = '/.netlify/functions/words'
 function isWordValid () {
     for (var word of words) {
         if (word.data && word.data.word &&  word.data.word.toUpperCase() === newWord.toUpperCase()) {
             return false
         }
     }
     return true;
 }

 async function submitWord () {
     busy = true;
     if (!isWordValid()) {
         busy = false;
         newWord = '';
         return
     }
     try {
         const resp = await fetch(
             API_URL,
             {method:'POST',
              body:JSON.stringify({
                  session,
                  word:newWord,
                  mode:'add',
              })
             }
         );
         const data = await resp.json();
         console.log('Got me the data...',data);
         words = [...words,data]
         newWord = '';
     }
     catch (err) {
         busy = false;
         console.log('ERROR:',err);
         throw err;
     }
     busy = false;
 }

 function directAdd () {
     console.log('pushy push');
     words = [...words,{data:{word:'foo'}}]
 }

 async function deleteWord (word) {
     console.log('delete',word);
     try {
         console.log('send off delete request...');
         const resp = await fetch(
             API_URL,
             {method:'POST',
              body:JSON.stringify({
                  session,
                  mode:'remove',
                  id:word.ref['@ref'].id,
              })}
         );
         const data = await resp.json();
         console.log('Deleted word - got response',data);
     }
     catch (err) {
         console.log('Error?',err);
     }
     words.splice(words.indexOf(word),1);
     words = words;
 }

 async function editWord (word, newWord) {
     const resp = await fetch(
         API_URL,
         {method:'POST',
          body:JSON.stringify({
              id:word.ref['@ref'].id,
              word:newWord
          })
         }
     );
     Object.assign(newWord,word);
     words = words;
 }

 let currentWord;
 let completeWords = []
 let wordsLeft;
 let gettingWord = false;

 
 async function putAllBack () {
     console.log('Put them back...');
     const response = await fetch(API_URL,{method:'post',body:JSON.stringify({mode:'reset',session})});
     await handleNewWords(response);
 }

 async function onHatNext (event) {
     // Let's complete this...
     const complete = event.detail.complete
     console.log('onHatNext...',complete);
     var wordId;
     words.forEach(
         (w)=>{
             if (complete.indexOf(w.data.word)>-1) {
                 wordId = w.ref['@ref'].id
             }
         }
     );
     console.log('Got ID',wordId,'for',complete);
     const response = await fetch(
         API_URL,
         {method:'post',
          body:JSON.stringify({
              mode : 'outAndList',
              id : wordId,
              session,
          })
         }
     );
     handleNewWords(response);
 }

 function onFloor () {
     completeWords.push(currentWord)
     currentWord = ''
     completeWords = completeWords;
     pullWord();
 }


 async function handleNewWords (response) {
     const data = await response.json();
     console.log('words will be',data.data);
     words = data.data;
     console.log('Set words to',words);
     $localHat = words.map(
         (w)=>{
             const oldCopy = $localHat.find((lw)=>lw.word==w.data.word);
             if (!oldCopy) {
                 return {
                     word: w.data.word,
                     outOfHat : w.data.outOfHat
                 }
             }
             return {
                 word : w.data.word,
                 outOfHat : oldCopy.current && true || w.data.outOfHat,
                 current : oldCopy.current
             }
         }
     );


 }

 async function getWords () {
     console.log('getWords',session);
     if (session) {
         const response = await fetch(API_URL,{method:'post',
                                           body:JSON.stringify(
                                               {mode:'list',
                                                session}
                                           )}
         );
         handleNewWords(response)
     }
     else {
         console.log('no session, no words');
     }
 }

  onMount(async () => {
      await getWords()
  }); 


 
</script>

<words>    
    <h3>We got words! {words.length} [{wordsInHat}]</h3>
    {#each words as word}
    <li>{word.data.word} {#if word.data.outOfHat} Out {:else} In {/if}</li>
    {/each}
    {#if step==strings.pullStep}
    Word Thing
    <Hat 
        on:reset={putAllBack}        
    />
    {:else}
    <div class="verticalAlign">
        <div class="head" >
            {#if step==strings.addStep||strings.reviewStep}<h2>{words.length} added...</h2>{/if}
            {#if step==strings.pullStep}
            <div>
                <h1>Game On!</h1>
                {#if wordsLeft}
                <h3>{completeWords.length} done. {wordsLeft} words left in hat</h3>
                {/if}
            </div>
            {/if}

        </div>
        {#if step==strings.reviewStep||step==strings.addStep}
        <div class="middle">
            Add Word: <input  disabled={busy} placeholder="New Word..." bind:value={newWord}> <button on:click={submitWord}>+</button>
        </div>
        <div class="foot">
            {#if step==strings.reviewStep}
            <h4>the words...</h4>
            <ul>
                {#each words as word}
                <li id={word.id}>
                    {word.data.word}
                    <button on:click={()=>deleteWord(word)}>-</button>
                </li>
                {/each}
            </ul>
            {/if}
        </div>
        {/if}
        
        
        {#if step==strings.pullStep}
        <div id="theWord">
                {#if currentWord}
            <!--  style={getEnteringStyle($wordFromHat)} -->
            {#each [currentWord] as currentWord}
            <div class="throwable new"
                 in:receive="{{key:currentWord.data&&currentWord.data.word}}" 
                 out:send="{{key:currentWord.data&&currentWord.data.word}}"
                 id={currentWord.data.word}
            >
                {currentWord.data.word}
            </div>
            {/each}
            {/if}                
            {#if !currentWord && wordsLeft && !gettingWord}
            <button id="theWord" on:click={pullWord}>Pull New Word</button>
            {/if}
        </div>        
        <div class="foot">
            {#each completeWords as completeWord}
            <div class="throwable last"
                 in:receive="{{key:completeWord.data&&completeWord.data.word}}"
                 out:send="{{key:completeWord.data&&completeWord.data.word}}"
                 id={completeWord.data.word}
            >
                 {completeWord.data.word}
            </div>
            {/each}
            <div class="bigbutton" >
            {#if !wordsLeft || !currentWord}
            <button on:click={putAllBack}>Reset hat...</button>
            {/if}
            {#if currentWord}
            <button on:click={tradeOut}>Trade (Back in Hat)</button>
            <button on:click={onFloor}>Success! (Toss on the Floor)</button>
            {/if}
            </div>
        </div>
        {/if}
    </div>
    {/if}
</words>


<style>
 .container {
     position: relative;
 }
 .placeholder {
     opacity: 0.3;
 }
 
 .throwable {
     /*position: absolute;*/
     box-shadow : 3px 3px #dedede;
     font-size: 2em;
 }
 .throwable.last {
     font-size: 1em;
     color: blue;
 }
  .middle {
     margin-top: auto;
     margin-bottom: auto;
 }
 .bigbutton button {
     font-size: 2em;
     padding: 1em;
 }
 .verticalAlign {
     display: flex;
     flex-direction: column;
     height: calc(100vh - 110px);
     margin-bottom: 110px;
 }
 #theWord {
     font-size: 3em;
     font-family: Futura, sans-serif;
     margin-top: auto;
     margin-bottom: auto;
     display: flex;
     justify-content: center;
     align-items: center;
     min-height: 40vh;
 }
 .head {
     margin-bottom: auto;
 }
 .foot {
     margin-top: auto
 }
</style>
