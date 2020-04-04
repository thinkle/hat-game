<script>
 import { onMount } from 'svelte';
 import Hat from './Hat.svelte';
 import { fade, fly, crossfade, scale } from 'svelte/transition';
 import Timer from './Timer.svelte';
 import { cubicOut, elasticOut } from 'svelte/easing';

 
 import strings from './strings.js';
 let words = []
 //export let game;
 //export let step;

 import {localHat,game,player} from './stores.js';

 let newWord = '';
 let completed = 0;
 $: step  = $game.step
 $: myTurn = $game.step==strings.playStep && $game.currentPlayer == $player


 let busy = false;
 console.log('who knows...');
var wasMyTurn;
 $: if ($game.step==strings.playStep) {
     if (myTurn && !wasMyTurn) {
         console.log('yuhhuh');
         console.log('now it is my turn!... get words');
         getWords();
         wasMyTurn = myTurn;
     }
 }

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
                  session:$game.id,
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
                  session:$game.id,
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
     const response = await fetch(API_URL,{method:'post',body:JSON.stringify({mode:'reset',session:$game.id})});
     await handleNewWords(response);
 }

 async function onHatNext (event) {
     // Sync up any changes to $localHat to the DB
     var wordId;
     var response;
     await $localHat.forEach(
         async function (lhw) {
             const dbWord = words.find((dw)=>dw.data.word==lhw.word);
             if (lhw.outOfHat && !lhw.current && !dbWord.outOfHat) {
                 response = await fetch(
                     API_URL,
                     {method:'post',
                      body:JSON.stringify({
                          mode : 'outAndList',
                          id : dbWord.ref['@ref'].id,
                          session:$game.id,
                      })
                     }
                 );
             }
         }
     );
     console.log('Update words...');
     if (response) {handleNewWords(response);}
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
     console.log('getWords',$game.id);
     if ($game.id) {
         const response = await fetch(API_URL,{method:'post',
                                               body:JSON.stringify(
                                                   {mode:'list',
                                                    session:$game.id}
                                               )}
         );
         handleNewWords(response)
     }
     else {
         console.log('no game, no words');
     }
 }

 onMount(async () => {
     await getWords()
 }); 


 
</script>

<words>    
    <div class="verticalAlign">
        {#if busy}Busy busy busy...{/if}
        <div class="head" >
            {#if step==strings.addStep||step==strings.reviewStep}<h2>{words.length} added...</h2>{/if}
            {#if step==strings.playStep}<h2>PLAY! Going... <Timer/></h2>{/if}
        </div>
        <div class="middle">
            {#if step==strings.reviewStep||step==strings.addStep}        
            Add Word: <input  disabled={busy} placeholder="New Word..." bind:value={newWord}> <button on:click={submitWord}>+</button>
            {/if}
            {#if step==strings.playStep && !myTurn}
            tick, tock, tick, tock...
            <div class="big"><Timer/></div>
            {/if}
            {#if step==strings.playStep && myTurn}
            <Hat 
                on:reset={putAllBack}
                on:next={onHatNext}
            />
            {/if}
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
    </div>
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
