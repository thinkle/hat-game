<script>
 import ReloadButton from './ReloadButton.svelte';
 import {createEventDispatcher,onMount} from 'svelte'
 const dispatch = createEventDispatcher();

 function close () {
     dispatch('close');
 }

 let busy;
 let now;
 let start;

 $: perc = ((now - start) % 5000) / 5000;
 
 onMount(() => {
     const interval = setInterval(() => {
	 now = new Date();
         if (!start) { start = now}
         if (busy) {busy = false}
     }, 500);

     const busyInterval = setInterval(()=>{
         busy = true;
     }, 5000);

     return () => {
	 clearInterval(interval);
         clearInterval(busyInterval);
     };
 });

 function fakeReload () {
     busy = true;
     start = new Date().getTime()
 }
 
</script>
<div class="outer">
    <div>
        <h2>About Name-in-Hat</h2>
        <p class="c" on:click="{close}"><a href="#" >(close)</a></p>
<p>
    This game was conceived of during the Covid-19 Pandemic when many of us have sought ways to be socially close while physically distant. If you're like me, one thing you like to do at parties is play silly games where you fill hats with slips of paper and pass them around. This game is a virtual "hat" that can be passed around and filled with virtual slips of paper when actual hats filled with actual slips of paper can't be passed around. That's all it aspires to be. To actually play, you'll also need to be on some kind of phone call or video call or what have you.
</p>
<p>My favorite game to play with a hat is celebrity. You can also use this hat for charades or pictionary or any number of other games.</p>
<h3>To Play</h3>
<p>Each player (or set of players in a socially isolated household) should have a phone or computer with the hat game loaded on it.</p>
<p>You have tell it your name before you start so later it can tell your friends when you're taking your turn.<a id="r1" href="#n1">*</a></p>
<p>Select <b>Add words</b> to put words into the hat. Each time you add a word you'll see the total number of words your group has added so far<a id="r2"  href="#n2" >*</a></p>
<p>Once you have enough words you want to play, one of the players (or all of them) needs to select <b>"Play"</b></p>
<h3>A note on synchronicity</h3>
<p>You are meant to be at a party playing, so everyone should be in sync.</p>
<p>That said, my game has to keep the different gadgets in sync, and doing that properly takes better server technology than I get for free from netlify<a id="r3"  href="#n3">*</a>. So my game tries to sync often enough that it's playable, but it's not great: it's easy for the timers to be out of line, or for it to feel like two people both have the hat. When you get frustrated that your reality isn't matching your friends' reality, just click the reload button in the upper right corner. It looks like this:</p>
    <blockquote><h5>Snazzy Reload Button</h5>
        <ReloadButton on:click="{fakeReload}" busy="{busy}" percentage={perc} total="{5000}" /></blockquote>
        <p>You'll see that button filling up slowly and spinning to show you when the game automatically syncs (if you stop playing it will exponentially back off so that I don't have to pay server costs to keep your game up to speed if you leave your browser open all night).</p>
        <p>Ok, at this point you should be ready to play!</p>
        <p>When someone wants to take the turn, click "My Turn."</p>
        <p>A one minute timer will start one second after you click the button.</p>
        <p>You then click on the words to take them out of the hat, and click on the word you've picked to indicate you're "done" with it, or click back on the pile to swap.</p>
        <p>The game will keep track of how many you've gotten and how many you swapped. Those numbers will disappear if you reload the browser though, and the game doesn't attempt to do any real score-keeping: that's for you, after all, because who knows what weird scoring systems you might invent for your own weird games involving words and hats.</p>
        <h3>Saving and Sharing</h3>
        <p>Your set of words and players is linked to the URL that was generated when you clicked "Start Game."</p>
        <p>Just share that URL with friends to play together, and save that URL to get back to your game in the future</p>
        <p>Happy socializing,</p>
        <p>Tom Hinkle</p>
        <br>
        <p>Questions? Shoot me <a href="mailto:tmhinkle@gmail.com" >an email</a>.</p>
<div class="notes" ><h3>Notes</h3>
<p id="n1" >
    <a href="#r1">*</a> But it really won't matter if more than one person share a name &mdash; this is really just a hat anyway, not a person.
</p>
<p id="n2" >
    <a href="#r2">*</a>
    If your word doesn't make the number of words go up, that's probably because it's a duplicate: the game's too smart to allow duplicates (unless you misspell them or something, then it turns out the game isn't smart at all).
</p>
<p id="n3" >
    <a href="#r3" >*</a> I really don't mean to complain about <a href="http://www.netlify.com" >netlify</a>: their free hosting is awesome! My only real complaint about them is that it's hard to type their URL without accidentally autocompleting netflix instead.</p>
</div>
<div class="c" ><button><b on:click="{close}">close</b></button></div>
<p class="foot"></p>
    </div>
</div>
<style>
 .c {
     text-align: center;
 }
 a {
     text-decoration: underline;
     color: white;
 }
 a:visited {
     color: white;
 }
 a:hover {
     color: #ddf;
 }
 .outer {
     z-index: 999;
     position: fixed;
     top: 0;
     overflow-y: scroll;
     background-color: #000e;
     transition: background-color 300ms;
     color: #eff;
 }
 div {
     display: block;
     height: 100%;
     width: 100%;
     box-sizing: border-box
 }
 h2 {
     text-align: center;
 }
 .outer > div {
     padding: 2em;
     text-align: left;
     max-width: 25em;
     margin: auto;
     font-size: 18px;
 }
 
 .note {
     font-size: 14px;
 }

 .foot {
     height: 5em; /* to allow us to scroll off the bottom */
 }
</style>
