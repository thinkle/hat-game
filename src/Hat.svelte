<script>
 import { crossfade, scale} from 'svelte/transition';
 import { localHat } from './stores.js';
 import {elasticOut,quintOut} from 'svelte/easing';
 import { flip } from 'svelte/animate';
 $:hat = $localHat.filter((w)=>w.word&&!w.outOfHat&&!w.current)
 $:complete = $localHat.filter((w)=>w.word&&w.outOfHat).sort((a,b)=>a.order>b.order&&1||a.order<b.order&&-1||0);
 $:current = $localHat.filter((w)=>w.word&&w.current)
 $:topOfTheOrder = Math.max(...$localHat.map((w)=>w.order||0))
 $: console.log('Top of the order is',topOfTheOrder,$localHat);
 $: console.log('localHat orders are ',$localHat.map((w)=>w.order||0))
 import { createEventDispatcher } from 'svelte';
 const dispatch = createEventDispatcher();
 

 const cachedStyles = {}

 function getRandomPosition (w) {
     if (cachedStyles[w]) {return cachedStyles[w]}
     else {
         const top = Math.random()*50;
         const left = Math.random()*25;
         const rotate = Math.floor(Math.random()*60 - 30);
         const rotateY = Math.floor(Math.random()*20 - 10);
         let s;
         //const s = `top:${top}px;left:${25+left}vw;transform:rotateZ(${rotate}deg)rotateY(${rotateY}deg);`
         const seed = Math.random();
         if (seed < 0.25) {
             s = `top:${top}%;left:${25+left}%`;
         }
         else if (seed < 0.5) {
             s = `top:${top}%;right:${25+left}%`;
         }
         else if (seed < 0.75) {
             s = `bottom:${top}%;left:${25+left}%`;
         }
         else {
             s = `bottom:${top}%;right:${25+left}%`;
         }
         cachedStyles[w] = s;
         return s;
     }
 }
 
 function next () {
     //complete = [...complete,...current]
     const wasFirst = current.length == 0;
     current.forEach(
         (w)=>{
             w.current = false
             w.outOfHat = true;
             w.order = topOfTheOrder + 1
         }
     )
     if (hat.length > 0) {
         const idx = Math.floor(Math.random()*hat.length);
         console.log('Random index',idx,'of',hat.length);
         hat[idx].current = true;
     }
     delete cachedStyles[current.word]
     $localHat = $localHat
     dispatch('next',
              {
                  current,
                  isFirst : wasFirst,
                  last : complete[complete.length-1],
                  hat, complete
              });
 }

 function swap () {
     //hat = [...hat,...current]
     const cw = current[0]
     cw.current = false;
     $localHat = $localHat;
     dispatch('return',{value:[...current]});
     setTimeout(next,300)
 }

 function reset () {
     for (var w of $localHat) {
         w.current = false;
         w.outOfHat = false;
     }
     $localHat = $localHat;
     dispatch('reset',{current,hat,complete})
 }

 const [send,receive] = crossfade({
     duration:400,
     fallback:scale,
 });


 const [sendb, receiveb] = crossfade({
     //duration: d => Math.sqrt(d * 200),
     duration: 400,
     fallback(node, params) {
	 const style = getComputedStyle(node);
	 const transform = style.transform === 'none' ? '' : style.transform;

	 return {
	     duration: 300,
	     easing: quintOut,
	     css: t => `
	     transform: ${transform} scale(${t});
	     opacity: ${t}
	     `
	 };
     }
 });


 function handleWordClick () {
     next();
 }

 function handlePileClick () {
     if (!current.length) {
         next()
     }
     else {
         swap();
     }
 }

</script>
<hat>
    <!-- <div>Hat has: {hat.length}, Current has {current.length}, Complete has {complete.length}</div>-->
    <div id="hat">
        {#each hat as w (w)}
        <div class="word" animate:flip id={w.word}
             on:click="{handlePileClick}"
             style={getRandomPosition(w.word)}
             out:send="{{key:w.word}}" in:receive="{{key:w.word}}">{w.word}</div>
        {/each}
    </div>
    <div id="current">
        <div class="placeholder">
            {#if current.length==0 && hat.length==0}
            <button class="lowkey" on:click={reset}>Reset</button>
            {/if}
            {#each current as w (w.word)}
            <div on:click="{handleWordClick}" class="word" animate:flip id={w.word} out:send="{{key:w.word}}" in:receive="{{key:w.word}}">{w.word}</div>
            {/each}
        </div>
        {#if hat.length}<button class="stop" on:click={swap}>Swap</button>{/if}
        {#if hat.length || current.length}<button class="go" on:click={next}>Next</button>{/if}
    </div>
    <div class="bottom">
        <div class="buttons">
            <b>{complete.length} complete</b> <button class="lowkey" on:click={reset}>Reset</button>
        </div>
        
        <div class="complete">
            {#each complete as w (w.word)}
            <div
                order={`complete-${w.order}`}
                style={getRandomPosition(w.word)}
                class="word" animate:flip="{{duration:200}}" id={w.word} in:receive="{{key:w.word}}" out:send="{{key:w.word}}"> {w.word}
            </div>
            {/each}
        </div>
    </div>
</hat>
<style>
 hat {
     display: flex;
     flex-direction: column;
     align-self: stretch;
     width: 100%;
     flex-grow: 2;
 }

 #current {
     padding: 1em;
     font-size: 2rem;
     font-weight: bold;
     z-index: 2;
 }

 .bottom .buttons {
     background-color: white;
     position: relative;
     z-index: 2;
 }

 .bottom {
     margin-top: auto;
     position: relative;
     width: 100%;
     flex-grow: 2;
     display: flex;
     flex-direction: column;
 }

 .complete {
     width: 100%;
     flex-grow: 2;
     position: relative;
 }
 
 .complete .word {
     position: absolute;
 }

 #hat {
     margin-bottom: auto;
     position: relative;
     flex-grow: 2;
 }

 #hat .word {
     position: absolute;
     color: white;
 }

 .go {
     background-color: #283;
     color: white;
 }

 .stop {
     background-color: #a22;
     color: white;
 }

 #current button {
     font-weight: bold;
 }

 .word {
     background-color: white;
     min-width: 8em;
     padding: 1em;
     border: 1px solid #aaa;
     margin: 3px;
     box-shadow: 2px 2px #777;
     display: inline-block;
 }

 .placeholder {
     min-height : 4em;
 }

</style>
