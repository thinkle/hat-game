import {writable, derived} from 'svelte/store';

export const localHat = writable([
    {word:'bunny',outOfHat:true},
    {word:'dog',outOfHat:false},
    {word:'snake',outOfHat:true},
    {word:'deer',outOfHat:true},
    {word:'elephant',outOfHat:true, current:true},
]);
    
export const game = writable();


const API_URL = '/.netlify/functions/game'

export async function updateCurrentGame (data) {
    let $game;
    game.subscribe((v)=>$game = v)
    updateGameDB({
        id:$game.id,
        ...data,
    });
}

export async function updateGameDB (data) {
     const postData = JSON.stringify(
         data
     );
     const response = await fetch(
         API_URL,
         {method:'POST',
          body:postData}
     );
     try {
         const json = await response.json()
         console.log('Updated!',postData,'=>',json);
         game.update(s => gameFromJson(json));
     }
     catch (err) {
         console.log('Submitted',postData);
         console.log('Unable to parse response :(');
         debugger;
     }
 }

export function gameFromJson (json) {
     if (json && json.data && json.ref) {
         return {
             ...json.data,
             id:json.ref['@ref'].id
         }
     }
     else {
         console.log('FAILED TO GET MEANINGFUL GAME');
         console.log('uh oh',json);
         return undefined;
     }
 }


const playerStore = writable(
    localStorage.getItem('defaultPlayer')
);

export async function addPlayerNameToGame (name) {
    let $game;
    game.subscribe((v)=>$game = v)
    if ($game && name) {
        if (!$game.players || $game.players.indexOf(name)==-1) {
            if (!$game.players) {
                $game.players = []
            }
            console.log('Add player to list of players!');
            $game.players.push(name)
            updateCurrentGame($game);
        }
    }
}

export const player = {
    get : playerStore.get,
    subscribe : playerStore.subscribe,
    set : async function (name) {
        localStorage.setItem('defaultPlayer',name)
        addPlayerNameToGame(name)
        playerStore.set(name);
    }
}

export async function takeTurn () {
    let $game, $player;
    game.subscribe((v)=>$game=v);
    player.subscribe((v)=>$player=v);
}
